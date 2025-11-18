/*
 * @Description:
 * @version:
 * @Author: JasonChen
 * @Date: 2025-11-14 08:00:00
 * @LastEditors: 陈建新
 * @LastEditTime: 2025-11-18 18:00:00
 */
import { fabric } from 'fabric';

fabric.BorderedTextbox = fabric.util.createClass(fabric.Textbox, {
  type: 'borderedTextbox', // 这个就是类型标识

  initialize: function (text, options) {
    // 设置默认边框属性
    options = options || {};

    // border边框相关属性
    this.borderColor = options.borderColor || '#007bff';
    this.borderWidth = options.borderWidth || 1;
    this.borderDash = options.borderDash || [];

    this.callSuper('initialize', text, options);
  },

  _render: function (ctx) {
    // 然后渲染边框
    this._renderBorder(ctx);
    // 先渲染文本
    this.callSuper('_render', ctx);
  },

  _renderBorder: function (ctx) {
    // 如果没有边框颜色或宽度，则不渲染边框
    if (!this.borderColor && !this.borderWidth) return;
    ctx.save();

    // 考虑非均匀缩放
    const scaleX = this.scaleX || 1;
    const scaleY = this.scaleY || 1;

    // 计算实际尺寸（考虑padding）
    const width = (this.width + (this.padding || 0) * 2) * scaleX;
    const height = (this.height + (this.padding || 0) * 2) * scaleY;

    // 缩放修正
    ctx.scale(1 / scaleX, 1 / scaleY);

    ctx.strokeStyle = this.borderColor;
    ctx.lineWidth = this.borderWidth;

    if (this.borderDash?.length > 0) {
      ctx.setLineDash(this.borderDash);
    } else {
      ctx.setLineDash([]);
    }

    ctx.strokeRect(-width / 2, -height / 2, width, height);
    ctx.restore();
  },

  // 重写 toObject 方法，确保序列化时包含自定义属性
  toObject: function (propertiesToInclude) {
    const originalToObject = this.callSuper('toObject', propertiesToInclude);

    // 添加自定义属性到序列化对象
    return fabric.util.object.extend(originalToObject, {
      borderColor: this.borderColor,
      borderWidth: this.borderWidth,
      borderDash: this.borderDash,
    });
  },
});

// 注册自定义类（重要：用于序列化/反序列化）
fabric.BorderedTextbox.fromObject = function (object, callback) {
  return fabric.Object._fromObject('BorderedTextbox', object, callback);
};

export default fabric.BorderedTextbox;
