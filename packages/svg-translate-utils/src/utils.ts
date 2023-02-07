import { TransAction, ViewBoxState, Point, EventStore, TransStateOptions, } from './interface';


export function getNewViewBoxState(svgElement: SVGElement, trans: TransAction, options?: TransStateOptions) {
  const { initViewBoxWidth, svgPos = getBoundingClientRect(svgElement), maxScale, minScale, joinChar = ' ', originState = getViewBox(svgElement) } = options || {};

  if (!(originState && svgPos)) return;

  // 获取之前的viewBox属性
  const [offsetX, offsetY, viewBoxWidth, viewBoxHeight ] = originState.split(/[, ]/).map(item => Number(item));
  const { scale = 1, x = 0, y = 0, svgX = 0, svgY = 0,origin: { x: pageX = 0, y: pageY = 0 } = {}, svgOrigin = {} as Point } = trans;
  // 获取svg的可视尺寸和位置
  const { left = 0, top = 0, width: svgWidth = 0, height: svgHeight = 0 } = svgPos;
  // 最小比例（svg的preserveAspectRatio默认值为meet会根据最小比例来缩放）
  const minRate = Math.min(svgWidth / viewBoxWidth, svgHeight / viewBoxHeight);

  // 变化的origin在原始的svg上的坐标
  const originSvgX = svgOrigin.x ?  svgOrigin.x : ((pageX - left) - (svgWidth - viewBoxWidth * minRate) / 2) / minRate + offsetX;
  const originSvgY = svgOrigin.y ?  svgOrigin.y : ((pageY - top) - (svgHeight - viewBoxHeight * minRate) / 2) / minRate + offsetY;

  let finalScale = scale;
  // 计算缩放时的比例限制
  if (initViewBoxWidth && scale !== 1 && (maxScale || maxScale)) {
    const isBigger = scale > 1;
    // 根据初始时状态计算已经缩放的比例
    const currentScaleRate = initViewBoxWidth / viewBoxWidth;
    // 应用最新的缩放
    const newScaleRate = currentScaleRate * scale;
    // 根据限制计算出最终的缩放比例
    finalScale = isBigger && maxScale && newScaleRate > maxScale
      ? maxScale / currentScaleRate
      : ((!isBigger && minScale && newScaleRate < minScale)
        ? minScale / currentScaleRate
        : scale);
  }

  let newViewBoxWidth = viewBoxWidth / finalScale;
  let newViewBoxHeight = viewBoxHeight / finalScale;
  const newMinRate = minRate * finalScale;

  // 缩放后viewBox的偏移量（之后再考虑平移）
  const newOffsetX = originSvgX - ((pageX - left) - (svgWidth - newViewBoxWidth * newMinRate) / 2) / newMinRate;
  const newOffsetY = originSvgY - ((pageY - top) - (svgHeight - newViewBoxHeight * newMinRate) / 2) / newMinRate;

  return [newOffsetX - (svgX || x / newMinRate), newOffsetY - (svgY || y / newMinRate), newViewBoxWidth, newViewBoxHeight].join(joinChar) as ViewBoxState;
}

/**
 * @description: 获取两点间的距离
 * @param {EventStore} start
 * @param {EventStore} stop
 * @return {number}
 */
export function getDistance(start: EventStore, stop: EventStore) {
  return Math.hypot(stop.pageX - start.pageX, stop.pageY - start.pageY);
};

export function getViewBox(svgElement: SVGElement) {
  return svgElement.getAttribute('viewBox') as ViewBoxState;
}

export function getBoundingClientRect(svgElement: SVGElement) {
  return svgElement.getBoundingClientRect();
}

export function updateViewBox(svgElement: SVGElement, viewBoxState: ViewBoxState) {
  svgElement.setAttribute('viewBox', viewBoxState);
  return viewBoxState;
}

export function updateNewViewBox(svgElement: SVGElement, trans: TransAction, options?: TransStateOptions) {
  const newState = getNewViewBoxState(svgElement, trans, options);

  if (newState) {
    return updateViewBox(svgElement, newState);
  }

  return null;
}

function transformPoint(
  svgElement: SVGElement,
  point: Point,
  isToSvg: boolean,
  viewBoxState: ViewBoxState = getViewBox(svgElement),
  svgPos: DOMRect = getBoundingClientRect(svgElement),
): Point {
  const [offsetX, offsetY, viewBoxWidth, viewBoxHeight ] = viewBoxState.split(/[, ]/).map(item => Number(item));
  const { left = 0, top = 0, width: svgWidth = 0, height: svgHeight = 0 } = svgPos;

  const minRate = Math.min(svgWidth / viewBoxWidth, svgHeight / viewBoxHeight);

  return isToSvg? {
    x: ((point.x - left) - (svgWidth - viewBoxWidth * minRate) / 2) / minRate + offsetX,
    y: ((point.y - top) - (svgHeight - viewBoxHeight * minRate) / 2) / minRate + offsetY,
  } : {
    x: left + (svgWidth - viewBoxWidth * minRate) / 2 + (point.x - offsetX) * minRate,
    y: top + (svgHeight - viewBoxHeight * minRate) / 2 + (point.y - offsetY) * minRate,
  }
}

export function transformToSvgPoint(
  svgElement: SVGElement,
  pagePoint: Point,
  viewBoxState: ViewBoxState = getViewBox(svgElement),
  svgPos: DOMRect = getBoundingClientRect(svgElement),
): Point {
  return transformPoint(svgElement, pagePoint, true, viewBoxState, svgPos);
}

export function transformToPagePoint(
  svgElement: SVGElement,
  svgPoint: Point,
  viewBoxState?: ViewBoxState,
  svgPos?: DOMRect,
): Point {
  return transformPoint(svgElement, svgPoint, false, viewBoxState, svgPos);
}

export function calcDistanceOfSvgPointToCenter(svgElement: SVGElement, svgPoint: Point) {

}