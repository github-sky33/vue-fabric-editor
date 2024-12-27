/*
 * @Descripttion: useSelectListen
 * @version:
 * @Author: wuchenguang1998
 * @Date: 2024-05-04 14:36:49
 * @LastEditors: 秦少卫
 * @LastEditTime: 2024-07-06 12:15:19
 */
import Editor, { EventType } from '@kuaitu/core';
import { get } from 'lodash-es';

const { SelectEvent, SelectMode } = EventType;

export interface Selector {
  mSelectMode: (typeof SelectMode)[keyof typeof SelectMode];
  mSelectOneType: string | undefined;
  mSelectId: string | undefined;
  mSelectIds: (string | undefined)[];
  mSelectActive: unknown[];
  showSizeEditor: boolean | undefined;
}

export default function useSelectListen(canvasEditor: Editor) {
  const state = reactive<Selector>({
    mSelectMode: SelectMode.EMPTY,
    mSelectOneType: '',
    mSelectId: '', // 选择id
    mSelectIds: [], // 选择id
    mSelectActive: [],
    showSizeEditor: false, //是否显示图片大小的编辑器 attributeImageSize
  });

  const selectOne = (e: [fabric.Object]) => {
    state.mSelectMode = SelectMode.ONE;
    state.mSelectActive = e;
    if (e[0] && get(e[0], 'clip')) {
      selectCancel();
      // state.mSelectId = get(e[0], 'targetId');
      // state.mSelectOneType = get(e[0], 'targetType');
      // state.mSelectIds = e.map((item) => get(item, 'targetId'));
      return;
    }
    if (e[0]) {
      state.mSelectId = e[0].id;
      state.mSelectOneType = e[0].type;
      state.mSelectIds = e.map((item) => item.id);
      if (
        'rect' == state.mSelectOneType ||
        'image' == state.mSelectOneType ||
        'triangle' == state.mSelectOneType
      ) {
        state.showSizeEditor = true;
      } else {
        state.showSizeEditor = false;
      }
    }
  };

  const selectMulti = (e: fabric.Object[]) => {
    state.mSelectMode = SelectMode.MULTI;
    state.mSelectId = '';
    state.mSelectIds = e.map((item) => item.id);
    state.showSizeEditor = false;
  };

  const selectCancel = () => {
    state.mSelectId = '';
    state.mSelectIds = [];
    state.mSelectMode = SelectMode.EMPTY;
    state.mSelectOneType = '';
    state.showSizeEditor = false;
  };

  onMounted(() => {
    canvasEditor.on(SelectEvent.ONE, selectOne);
    canvasEditor.on(SelectEvent.MULTI, selectMulti);
    canvasEditor.on(SelectEvent.CANCEL, selectCancel);
  });

  onBeforeMount(() => {
    canvasEditor.off(SelectEvent.ONE, selectOne);
    canvasEditor.off(SelectEvent.MULTI, selectMulti);
    canvasEditor.off(SelectEvent.CANCEL, selectCancel);
  });

  return {
    mixinState: state,
  };
}
