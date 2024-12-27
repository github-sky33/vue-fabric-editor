<template>
  <!-- <div class="box attr-item-box" v-show="mixinState.showSizeEditor"> -->
  <div class="box attr-item-box" v-show="showAble(mixinState)">
    <Divider plain orientation="left">
      <h4>图片大小</h4>
    </Divider>

    <Row :gutter="10">
      <Col flex="1">
        <InputNumber
            v-model="baseAttr.displayHeight"
            @on-change="(value) => changeSize('displayHeight', value)"
            :append="'长度'"
        ></InputNumber>
      </Col>
      <Col flex="1">
        <InputNumber
            v-model="baseAttr.displayWidth"
            @on-change="(value) => changeSize('displayWidth', value)"
            :append="'宽度'"
        ></InputNumber>
      </Col>
    </Row>
  </div>
</template>

<script setup name="AttrBute">
import useSelect from '@/hooks/select';
import InputNumber from '@/components/inputNumber';

const update = getCurrentInstance();
const { mixinState, canvasEditor } = useSelect();

// 属性值
const baseAttr = reactive({
  scaleX: 0,
  scaleY: 0,
  height: 0,
  width: 0,
  displayHeight: 0,
  displayWidth: 0,
});

const showAble = (mixinState)=>{
  if (!mixinState || mixinState.mSelectMode != "one") {
    return false;
  }else if ( 'rect' == mixinState.mSelectOneType || 'image' == mixinState.mSelectOneType || 
    'triangle' == mixinState.mSelectOneType) {
    return true;
  } else {
    return false;
  };

};

// 属性获取
const getObjectAttr = (e) => {
  const activeObject = canvasEditor.canvas.getActiveObject();
  // 不是当前obj，跳过
  if (e && e.target && e.target !== activeObject) return;
  if (activeObject) {
    baseAttr.scaleX = activeObject.get('scaleX');
    baseAttr.scaleY = activeObject.get('scaleY');
    baseAttr.height = activeObject.get('height');
    baseAttr.width = activeObject.get('width');
    baseAttr.displayHeight = baseAttr.scaleY * baseAttr.height;
    baseAttr.displayWidth = baseAttr.scaleX * baseAttr.width;

  }
};

// 通用属性改变
const changeSize = (key, value) => {
  const activeObject = canvasEditor.canvas.getActiveObjects()[0];
  let key1, key2, value1, value2;
  // 仅修改图片大小
  if (activeObject && !activeObject.text ) {
    // 图片： image
    // 基本要素：i-text、textbox、rect、circle、triangle、polygon
    // 绘制元素：line、arrow、thinTailArrow、polygon、path
    let type = activeObject.type;
    if (!(type==='image' || type==='rect' || type==='triangle')) {
      return;
    }

    if ('displayHeight'==key) {
      key1 = 'scaleY';
      key2 = 'height';
      if (activeObject.type=='image') {
        // 图片调整比例
        value1 = value / baseAttr.height;
        value2 = baseAttr.height;
      } else {
        // 其余调整长宽
        value1 = baseAttr.scaleY;
        value2 = value / baseAttr.scaleY;
      }
    } else if ('displayWidth'==key) {
      key1 = 'scaleX';
      key2 = 'width';
      if (activeObject.type=='image') {
        // 图片调整比例
        value1 = value / baseAttr.width;
        value2 = baseAttr.width;
      } else {
        // 其余调整长宽
        value1 = baseAttr.scaleX;
        value2 = value / baseAttr.scaleX;
      }
    }
    if (key1) {
      activeObject && activeObject.set(key1, value1);
      baseAttr[key1]=value1;
    }
    if (key2) {
      activeObject && activeObject.set(key2, value2);
      baseAttr[key2]=value2;
    }
    baseAttr[key]=value;
    canvasEditor.canvas.renderAll();
  }
};

const selectCancel = () => {
  update?.proxy?.$forceUpdate();
};

onMounted(() => {
  // 获取字体数据
  getObjectAttr();
  canvasEditor.on('selectCancel', selectCancel);
  canvasEditor.on('selectOne', getObjectAttr);
  canvasEditor.canvas.on('object:modified', getObjectAttr);
});

onBeforeUnmount(() => {
  console.log("onBeforeUnmount");
  canvasEditor.off('selectCancel', selectCancel);
  canvasEditor.off('selectOne', getObjectAttr);
  canvasEditor.canvas.off('object:modified', getObjectAttr);
});
</script>

<style scoped lang="less">
:deep(.ivu-input-number) {
  display: block;
  width: 100%;
}

.ivu-form-item {
  background: #f6f7f9;
  border-radius: 5px;
  padding: 0 5px;
  margin-bottom: 10px;
}

.ivu-row {
  margin-bottom: 10px;
}
</style>
