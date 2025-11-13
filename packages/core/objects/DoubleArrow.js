/*
 * @Author: 陈建新
 * @Date: 2025-11-12 16:34:50
 * @LastEditors: 陈建新
 * @LastEditTime: 2025-11-13 16:34:50
 * @Description: 双向箭头元素
 */
import { fabric } from 'fabric';

fabric.DoubleArrow = fabric.util.createClass(fabric.Line, {
  type: 'doubleArrow',
  superType: 'drawing',
  initialize(points, options) {
    if (!points) {
      const { x1, x2, y1, y2 } = options;
      points = [x1, y1, x2, y2];
    }
    options = options || {};
    this.callSuper('initialize', points, options);
  },
  _render(ctx) {
    // 先绘制线段
    this.callSuper('_render', ctx);
    ctx.save();

    // 乘或除对应的scaleX(Y)，抵消元素放缩造成的影响，使箭头不会变形
    ctx.scale(1 / this.scaleX, 1 / this.scaleY);
    const xDiff = (this.x2 - this.x1) * this.scaleX;
    const yDiff = (this.y2 - this.y1) * this.scaleY;
    const angle = Math.atan2(yDiff, xDiff);

    // 绘制起点箭头（在x1,y1位置）
    ctx.save();
    // ctx.translate(0, 0); // 线段的中点位置
    ctx.translate(
      -((this.x2 - this.x1) / 2) * this.scaleX,
      -((this.y2 - this.y1) / 2) * this.scaleY
    );
    ctx.rotate(angle + Math.PI);
    this._drawArrowhead(ctx);
    ctx.restore();

    // 绘制终点箭头（在x2,y2位置）
    ctx.save();
    ctx.translate(((this.x2 - this.x1) / 2) * this.scaleX, ((this.y2 - this.y1) / 2) * this.scaleY);
    ctx.rotate(angle);
    this._drawArrowhead(ctx);
    ctx.restore();

    ctx.restore();
  },

  _drawArrowhead(ctx) {
    ctx.beginPath();

    ctx.moveTo(5, 0);
    ctx.lineTo(-5, 5);
    ctx.lineTo(-5, -5);
    ctx.closePath();
    ctx.lineWidth = this.lineWidth;
    ctx.strokeStyle = this.stroke;
    ctx.fillStyle = this.fill;
    ctx.stroke();
    ctx.fill();
  },
});

fabric.DoubleArrow.fromObject = (options, callback) => {
  const { x1, x2, y1, y2 } = options;
  return callback(new fabric.DoubleArrow([x1, y1, x2, y2], options));
};

export default fabric.DoubleArrow;
