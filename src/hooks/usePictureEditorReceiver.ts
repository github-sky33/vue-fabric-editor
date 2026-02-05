// src/hooks/usePictureEditorReceiver.ts
import { onUnmounted } from 'vue';
import { useRoute } from 'vue-router';

// 接收方Hook
export function usePictureEditorReceiver() {
  console.log('usePictureEditorReceiver');
  const route = useRoute(); // 使用 Vue Router
  const channel = new BroadcastChannel('picture-editor');

  // 从路由参数获取参数
  const sessionId = route.query.session as string;
  const oid = route.query.oid as string;
  const businessType = route.query.businessType as string;
  console.log('接收参数:', { sessionId, oid, businessType });

  let imageDataUrl: {
    oid: string;
    businessType: string;
    graphPngUrl: string;
    graphJsonUrl: string;
  } | null = null;

  // 加载数据
  if (sessionId) {
    const dataStr = localStorage.getItem(sessionId);

    if (dataStr) {
      imageDataUrl = JSON.parse(dataStr);
      console.log('加载数据:', imageDataUrl);
      // localStorage.removeItem(sessionId);
    }
  }

  // 发送保存成功消息
  const notifySaveSuccess = (data: any) => {
    if (sessionId) {
      console.log('发送保存成功消息:', data);
      channel.postMessage({
        type: 'save-success',
        sessionId,
        data,
      });
    }
  };

  // 清理
  onUnmounted(() => channel.close());

  return { sessionId, oid, businessType, notifySaveSuccess, imageDataUrl };
}
