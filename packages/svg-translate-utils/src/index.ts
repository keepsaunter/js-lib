import { getNewViewBoxState, getViewBox, getDistance, updateNewViewBox } from './utils';
import { ViewBoxState, TouchStore, Point } from './interface';

enum Platform {
  online = 'online',
  h5 = 'h5',
  all = 'all',
  none = 'none',
}

let lastState: ViewBoxState | null;
let initViewBox: ViewBoxState | null;;

function scrollToPoint(svgElement: SVGElement, point: Point, scale?: number) {
  const { x, y } = point;
  const bBox = svgElement.getBBox();
  lastState = updateNewViewBox(
    svgElement,
    {
      svgX: bBox.width / 2 - x,
      svgY: bBox.height / 2 - y,
    },
    scale ? {
      originState: initViewBox!,
    } : undefined
  );
}

export function addScrollToSvgElement(svgElement: SVGElement, platform: `${Platform}` = Platform.all) {
  if (!svgElement) return;
  initViewBox = getViewBox(svgElement);
  if (!initViewBox) return;

  let touchStore: TouchStore;
  const eventAbortController = new AbortController();
  
  if (platform !== Platform.h5) {
    const wheelHandle = (e: WheelEvent)=> {
      e.preventDefault();

      // 直接触发wheel事件不会触发touchstart事件，所以需要处理 lastState 为空
      lastState = updateNewViewBox(
        svgElement,
        {
          scale: 1 - e.deltaY * 0.002,
          origin: {
            x: e.pageX,
            y: e.pageY,
          },
        },
      );
    };

    svgElement.addEventListener('wheel', wheelHandle, {
      signal: eventAbortController.signal,
    });
  }

  if (platform !== Platform.online) {
    /**** touch 开始时记录开始坐标，以及初始化 lastState */
    const touchStartHandle = (e: TouchEvent) => {
      const { 0: event1, 1: event2 } = e.touches;

      if (event1) {
        touchStore = {
          event1,
          ...(event2 && { event2 }),
        };
        lastState = getViewBox(svgElement);
      }
    };

    svgElement.addEventListener('touchstart', touchStartHandle, {
      signal: eventAbortController.signal,
    });
    /**** touch start */

    const touchMoveHandle = (e: TouchEvent) => {
      e.preventDefault();
      const { 0: moveEvent1, 1: moveEvent2 } = e.touches;
      const { event1, event2 = moveEvent2 && { pageX: moveEvent2.pageX, pageY: moveEvent2.pageY } } = touchStore || {};
      // console.log(event1?.pageX, event1?.pageY, event2?.pageX, event2?.pageY);
      if (svgElement && lastState && event1 && moveEvent1) {
        if (moveEvent2) {
          // 双指移动
          // 根据移动距离计算比例
          const zoom = getDistance(moveEvent1, moveEvent2) / getDistance(event1, event2);

          lastState = updateNewViewBox(
            svgElement,
            {
              scale: zoom,
              origin: {
                // 以中点坐标作为定位
                x: (event1.pageX + event2.pageX) / 2,
                y: (event1.pageY + event2.pageY) / 2,
              },
            },
            {
              originState: lastState,
            }
          );
        } else {
          console.log('1', lastState);
          lastState = updateNewViewBox(
            svgElement,
            {
              x: moveEvent1.pageX - event1.pageX,
              y: moveEvent1.pageY - event1.pageY,
            },
            {
              originState: lastState,
            }
          );
          console.log('3', lastState);
        }
      }

      // 更新事件坐标
      touchStore.event1 = moveEvent1;
      touchStore.event2 = moveEvent2;
    };

    svgElement.addEventListener('touchmove', touchMoveHandle, {
      signal: eventAbortController.signal,
    });

    /**** touch结束后重置 */
    const touchCancelHandle = () => {
      if (touchStore) {
        delete touchStore.event1;
        delete touchStore.event2;
      }
    };

    svgElement.addEventListener('touchend', touchCancelHandle, {
      signal: eventAbortController.signal,
    });
  }
  /***** touchend */

  return {
    clearEventListener() {
      eventAbortController.abort();
    },
    scrollToPoint: scrollToPoint.bind(null, svgElement),
  }
}