<!--
 * @Author: 秦少卫
 * @Date: 2022-09-03 19:16:55
 * @LastEditors: 秦少卫
 * @LastEditTime: 2024-05-11 15:49:01
 * @LastEditors: 秦少卫
 * @LastEditTime: 2023-04-10 14:33:18
 * @Description: 保存文件
-->

<template>
  <div class="save-box">
    <Button
      style="margin-left: 10px"
      type="primary"
      :disabled="disabled"
      @click="handleSaveToProcess"
    >
      保存
    </Button>
    <Button type="text" @click="beforeClear">
      {{ $t('save.empty') }}
    </Button>
    <Dropdown style="margin-left: 10px" @on-click="saveWith">
      <Button type="primary">
        {{ $t('save.down') }}
        <Icon type="ios-arrow-down"></Icon>
      </Button>
      <template #list>
        <DropdownMenu>
          <!-- <DropdownItem name="saveMyClould">{{ $t('save.save_my_spase') }}</DropdownItem> -->
          <DropdownItem name="saveImg" divided>{{ $t('save.save_as_picture') }}</DropdownItem>
          <DropdownItem name="saveSvg">{{ $t('save.save_as_svg') }}</DropdownItem>
          <!-- <DropdownItem name="clipboard" divided>{{ $t('save.copy_to_clipboard') }}</DropdownItem> -->
          <!-- <DropdownItem name="clipboardBase64">{{ $t('save.copy_to_clipboardstr') }}</DropdownItem> -->
          <DropdownItem name="saveJson" divided>{{ $t('save.save_as_json') }}</DropdownItem>
        </DropdownMenu>
      </template>
    </Dropdown>
  </div>
</template>

<script setup name="save-bar">
import { Modal } from 'view-ui-plus';
import useSelect from '@/hooks/select';
import useMaterial from '@/hooks/useMaterial';
import { debounce } from 'lodash-es';
import { useI18n } from 'vue-i18n';
import { Spin } from 'view-ui-plus';
import { useRoute } from 'vue-router';
import { Message } from 'view-ui-plus';
import axios from 'axios';
import { v4 as uuid } from 'uuid';
const route = useRoute();

const { createTmplByCommon, updataTemplInfo, routerToId } = useMaterial();

const { t } = useI18n();

const { canvasEditor } = useSelect();
const cbMap = {
  async clipboard() {
    try {
      await canvasEditor.clipboard();
      Message.success('复制成功');
    } catch (error) {
      Message.error('复制失败');
    }
  },
  saveJson() {
    canvasEditor.saveJson();
  },
  saveSvg() {
    canvasEditor.saveSvg();
  },
  saveImg() {
    canvasEditor.saveImg();
  },
  async clipboardBase64() {
    try {
      await canvasEditor.clipboardBase64();
      Message.success('复制成功');
    } catch (error) {
      Message.error('复制失败');
    }
  },
  async saveMyClould() {
    try {
      Spin.show();
      if (route?.query?.id) {
        await updataTemplInfo(route?.query?.id);
      } else {
        const res = await createTmplByCommon();
        routerToId(res.data.data.id);
      }
    } catch (error) {
      Message.warning('请登录');
    }
    Spin.hide();
  },
};

const saveWith = debounce(function (type) {
  cbMap[type] && typeof cbMap[type] === 'function' && cbMap[type]();
}, 300);

/**
 * @desc clear canvas 清空画布
 */
const clear = () => {
  canvasEditor.clear();
  canvasEditor.canvas.clearHistory(false);
  canvasEditor.historyUpdate();
};

const disabled = ref(true);

// 图片和JSON文件都保存到结构化工艺后端
const handleSaveToProcess = () => {
  let result = canvasEditor.saveImgAndJson();
  result.then(async (resObj) => {
    const cacheDesResult = await getCacheDescriptorServlet();
    const urlUpload = '/Windchill/' + cacheDesResult['uploadUrl'].split('/Windchill/')[1];
    const masterUrl = cacheDesResult['masterUrl'];
    const cacheStrs = cacheDesResult.cacheDescriptors[0].split(';');
    let filePrames1 = new FormData();
    let filePrames2 = new FormData();

    // 图标文件类型转换
    // const blob1 = new Blob([resObj.svgData], { type:"image/svg+xml"}); // 创建Blob对象
    // const file1 = new window.File([blob1],'illstration_image_1.svg',{type:'image/svg+xml'}); //转成文件
    const file1 = base64ToBlob(resObj.imgUrl);
    filePrames1.append('Master_URL', masterUrl);
    filePrames1.append('CacheDescriptor_array', cacheStrs[0]);
    filePrames1.append('primaryFilepathInput', file1[0]);

    // json文件类型转换
    const jsonStrings2 = JSON.stringify(resObj.dataUrl); //转成字符串
    const blob2 = new Blob([jsonStrings2], { type: 'application/json' }); // 创建Blob对象
    const file2 = new File([blob2], 'fileName.json', { type: 'application/json' }); //转成文件
    filePrames2.append('Master_URL', masterUrl);
    filePrames2.append('CacheDescriptor_array', cacheStrs[1]);
    filePrames2.append('primaryFilepathInput', file2);

    // 做第二次请求，上传图片文件内容
    const result1 = axios.post(urlUpload, filePrames1);
    const result2 = axios.post(urlUpload, filePrames2);
    Promise.all([result1, result2]).then((response) => {
      let matchReg = /(?<=value=").*?(?=.">)/gi;
      // 截取后端返回的文件序列号，填入到对应的传参中
      const imgDescriptor = response[0].data.match(matchReg)[2];
      const jsonDescriptor = response[1].data.match(matchReg)[2];
      const cacheDesUrl = '/Windchill/servlet/rest/StructuredProcessPlan/v1/UploadIllustration';
      const oid =
        route?.query?.oid || 'OR:com.ptc.windchill.mpml.processplan.MPMProcessPlan:5372333';
      if (imgDescriptor && jsonDescriptor) {
        let params = {
          objectId: oid,
          cacheDescriptor: imgDescriptor,
          jsonCacheDescriptor: jsonDescriptor,
          // filename: "illstration_image_1.svg"
        };
        axios.post(cacheDesUrl, params).then((res) => {
          const data = res.data;
          if (data.resultCode === '200') {
            Message.success('文件保存成功！');
          } else {
            Modal.error({
              title: '文件保存失败！',
              content: `<p>${data.errors.join()}</p>`,
            });
          }
        });
      }
    });

    // const str = await blobToBase64(file1[0])
    // downFile(str, 'png')
  });
};

// 获取附件上传地址
const getCacheDescriptorServlet = () => {
  let oid = route?.query?.oid || 'OR:com.ptc.windchill.mpml.processplan.MPMProcessPlan:5372333';
  oid = oid.replace('OR:', '');
  return new Promise((resolve, reject) => {
    axios
      .get(
        '/Windchill/servlet/GetCacheDescriptorServlet?fileCount=2&contentIdentities=1;;;zzz2&random=0.7997197697741049&securityLabel=&primaryOidString=' +
          oid
      )
      .then((res) => {
        resolve(eval('(' + res.data + ')'));
      });
  });
};

const base64ToBlob = (base64Data) => {
  if (!base64Data) {
    return null;
  }
  const dataArr = base64Data.split(',');
  const imageType = dataArr[0].match(/:(.*?);/)[1];
  const textData = window.atob(dataArr[1]);
  const arrayBuffer = new ArrayBuffer(textData.length);
  const uint8Array = new Uint8Array(arrayBuffer);
  for (let i = 0; i < textData.length; i++) {
    uint8Array[i] = textData.charCodeAt(i);
  }
  return [new Blob([arrayBuffer], { type: imageType }), imageType.slice(6)];
};

const getFileInfoShow = () => {
  let oid = route?.query?.oid || 'OR:com.ptc.windchill.mpml.processplan.MPMProcessPlan:5372333';
  axios
    .get(`/Windchill/servlet/rest/StructuredProcessPlan/v1/GetIllustrationInfo/${oid}`)
    .then((res) => {
      const data = res.data;
      if (data.resultCode === '200') {
        if (data.data) {
          disabled.value = data.data.workingCopy ? false : true;
        } else {
          disabled.value = false;
        }
      }
    });
};

onMounted(() => {
  getFileInfoShow();
});

const beforeClear = () => {
  Modal.confirm({
    title: t('tip'),
    content: `<p>${t('clearTip')}</p>`,
    okText: t('ok'),
    cancelText: t('cancel'),
    onOk: () => clear(),
  });
};
</script>

<style scoped lang="less">
.save-box {
  display: inline-block;
  padding-right: 10px;
}
</style>
