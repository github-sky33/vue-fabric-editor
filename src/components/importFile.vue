<!--
 * @Author: 秦少卫
 * @Date: 2022-09-03 19:16:55
 * @LastEditors: 秦少卫
 * @LastEditTime: 2024-07-06 17:23:50
 * @Description: 插入SVG元素
-->

<template>
  <div style="display: inline-block">
    <Dropdown transfer-class-name="fix" @on-click="insertTypeHand">
      <a href="javascript:void(0)">
        {{ $t('insertFile.insert') }}
        <Icon type="ios-arrow-down"></Icon>
      </a>
      <template #list>
        <DropdownMenu>
          <!-- 图片 -->
          <DropdownItem name="insertImg">{{ $t('insertFile.insert_picture') }}</DropdownItem>
          <!-- SVG -->
          <DropdownItem name="insertSvg">{{ $t('insertFile.insert_SVG') }}</DropdownItem>
          <!-- SVG 字符串 -->
          <DropdownItem name="insertSvgStrModal">{{ $t('insertFile.insert_SVGStr') }}</DropdownItem>
        </DropdownMenu>
      </template>
    </Dropdown>
    <!-- 插入字符串svg元素 -->
    <Modal v-model="state.showModal" :title="$t('insertFile.modal_tittle')" @on-ok="insertTypeHand('insertSvgStr')"
      @on-cancel="showModal = false">
      <Input v-model="state.svgStr" show-word-limit type="textarea"
        :placeholder="$t('insertFile.insert_SVGStr_placeholder')" />
    </Modal>
  </div>
</template>

<script name="ImportFile" setup>
import { Utils } from '@kuaitu/core';
const { getImgStr, selectFiles, blobToBase64, base64ToBlob } = Utils;

import useSelect from '@/hooks/select';
import { v4 as uuid } from 'uuid';
import { useRoute } from 'vue-router';
import axios from 'axios';

const { fabric, canvasEditor } = useSelect();
const state = reactive({
  showModal: false,
  svgStr: '',
});
const route = useRoute();
const HANDLEMAP = {
  // 插入图片
  insertImg: function () {
    selectFiles({ accept: 'image/*', multiple: true }).then((fileList) => {
      Array.from(fileList).forEach((item) => {
        getImgStr(item).then((file) => {
          insertImgFile(file);
        });
      });
    });
  },
  // 插入Svg
  insertSvg: function () {
    selectFiles({ accept: '.svg', multiple: true }).then((fileList) => {
      Array.from(fileList).forEach((item) => {
        getImgStr(item).then((file) => {
          insertSvgFile(file);
        });
      });
    });
  },
  // 插入SVG元素
  insertSvgStrModal: function () {
    state.svgStr = '';
    state.showModal = true;
  },
  // 插入字符串元素
  insertSvgStr: function () {
    fabric.loadSVGFromString(state.svgStr, (objects, options) => {
      const item = fabric.util.groupSVGElements(objects, {
        ...options,
        name: 'defaultSVG',
      });
      canvasEditor.addBaseType(item, {
        scale: true,
      });
    });
  },
};

const insertTypeHand = (type) => {
  const cb = HANDLEMAP[type];
  cb && typeof cb === 'function' && cb();
};
// 插入图片文件
function insertImgFile(file) {
  if (!file) throw new Error('file is undefined');
  const imgEl = document.createElement('img');
  imgEl.src = file;
  // 插入页面
  document.body.appendChild(imgEl);
  imgEl.onload = async () => {
    const imgItem = await canvasEditor.createImgByElement(imgEl);
    canvasEditor.addBaseType(imgItem, {
      scale: true,
    });
    imgEl.remove();
  };
}

// 插入文件元素
function insertSvgFile(svgFile) {
  if (!svgFile) throw new Error('file is undefined');
  fabric.loadSVGFromURL(svgFile, (objects, options) => {
    const item = fabric.util.groupSVGElements(objects, {
      ...options,
      name: 'defaultSVG',
      id: uuid(),
    });
    canvasEditor.addBaseType(item, {
      scale: true,
    });
  });
}

// 从后端读取JSON文件下载路径，并进行转换后直接展示
async function jsonFileConversion(url) {
  const response = await axios.get(url, {
    responseType: 'blob' // 确保响应类型为blob
  });
  const str = await blobToBase64(response.data)
  const file = base64ToBlob(str)
  canvasEditor.initJsonFile(file)
}

// 从后端读取图片文件下载路径，并进行转换后直接展示
async function pngFileConversion(url) {
  const response = await axios.get(url, {
    responseType: 'blob' // 确保响应类型为blob
  });
  let str = await blobToBase64(response.data)
  str = str.replace('text/xml', 'image/png')
  insertImgFile(str)
}

// 获取文件信息并展示
const getFileInfoShow = () => {
  let oid = route?.query?.oid || 'OR:com.ptc.windchill.mpml.processplan.MPMProcessPlan:5372333'
  axios.get(`/Windchill/servlet/rest/StructuredProcessPlan/v1/GetIllustrationInfo/${oid}`).then(res => {
    const data = res.data
    if (data.resultCode === '200') {
      const filePath = data.data
      if (filePath) {
        if (filePath.jsonUrl) {
          jsonFileConversion(filePath.jsonUrl)
        } else {
          pngFileConversion(filePath.url)
        }
      }
    }
  })
}

onMounted(() => {
  getFileInfoShow()
})

</script>

<style scoped lang="less">
:deep(.ivu-select-dropdown) {
  z-index: 999;
}
</style>
