<!--
 * @Author: 秦少卫
 * @Date: 2022-09-03 19:16:55
 * @LastEditors: 秦少卫
 * @LastEditTime: 2024-05-21 15:38:38
 * @Description: 尺寸设置
-->

<template>
  <div v-if="!mixinState.mSelectMode" class="attr-item-box">
    <!-- <h3>{{ $t('bgSeting.size') }}</h3> -->
    <Divider plain orientation="left">
      <h4>{{ $t('bgSeting.size') }}</h4>
    </Divider>
    <!-- <Form :label-width="40" inline class="form-wrap">
      <FormItem :label="$t('bgSeting.width')" prop="name">
        <InputNumber disabled v-model="width" readonly @on-change="setSize"></InputNumber>
      </FormItem>
      <FormItem :label="$t('bgSeting.height')" prop="name">
        <InputNumber disabled v-model="height" readonly @on-change="setSize"></InputNumber>
      </FormItem>
      <FormItem :label-width="0">
        <Button type="text" @click="showSetSize">
          <Icon type="md-create" />
        </Button>
      </FormItem>
    </Form> -->
    <RadioGroup v-model="pageSize" @on-change="setSize">
      <Radio label="A3" v-if="businessType === 'work'"></Radio>
      <Radio label="A4"></Radio>
    </RadioGroup>

    <!-- <Divider plain></Divider> -->
    <!-- 修改尺寸 -->
    <!-- <modalSzie :title="$t('setSizeTip')" ref="modalSizeRef" @set="handleConfirm"></modalSzie> -->
  </div>
</template>

<script setup name="CanvasSize">
import useSelect from '@/hooks/select';
// import modalSzie from '@/components/common/modalSzie';

const pageSize = inject('pageSize', 'A3');
const sizeMap = {
  A3: { width: 2040, height: 1800 },
  A4: { width: 1020, height: 1800 },
};
const setSize = (val) => {
  if (val && sizeMap[val]) {
    width.value = sizeMap[val].width;
    height.value = sizeMap[val].height;
  }
  canvasEditor.setSize(width.value, height.value);
};
const businessType = ref('work');

const { mixinState, canvasEditor } = useSelect();

const modalSizeRef = ref(null);

let width = ref();
let height = ref();

onMounted(() => {
  businessType.value = localStorage.getItem('businessType');
  if (businessType.value === 'work') {
    pageSize.value = 'A3';
  } else {
    pageSize.value = 'A4';
  }
  setSize(pageSize.value);
  // canvasEditor.on('sizeChange', (w, h) => {
  //   width.value = w;
  //   height.value = h;
  // });
});

// const showSetSize = () => {
//   modalSizeRef.value.showSetSize(width.value, height.value);
// };
const handleConfirm = (w, h) => {
  width.value = w;
  height.value = h;
  setSize();
};
</script>

<style scoped lang="less">
:deep(.ivu-form-item) {
  margin-bottom: 0;
}

:deep(.ivu-input-number) {
  width: 70px;
}
.form-wrap {
  display: flex;
}
</style>
