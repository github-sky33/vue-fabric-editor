// src/hooks/usePictureEditorReceiver.ts
import { onUnmounted } from 'vue';

// 接收方Hook
export function usePictureEditorReceiver() {
  const channel = new BroadcastChannel('picture-editor');

  // 从URL获取参数
  const params = new URLSearchParams(location.search);
  const sessionId = params.get('session');
  const oid = params.get('oid');
  const type = params.get('type');
  let data = null;
  // 加载数据
  if (sessionId) {
    const dataStr = localStorage.getItem(sessionId);
    if (dataStr) {
      data = JSON.parse(dataStr);
      console.log('加载数据:', data);
      localStorage.removeItem(sessionId);
    }
  }

  // 发送保存成功消息
  const notifySaveSuccess = (data: any) => {
    if (sessionId) {
      channel.postMessage({
        type: 'save-success',
        id: sessionId,
        data,
      });
    }
  };

  // 清理
  onUnmounted(() => channel.close());

  return { sessionId, oid, type, notifySaveSuccess, data };
}
