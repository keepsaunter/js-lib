import { ViewBoxState } from './interface';
import { getNewViewBoxState, updateViewBox } from './utils';

enum Platform {
  online = 'online',
  h5 = 'h5',
  all = 'all',
}

export function addScrollToSvgElement(svgElement: SVGElement, platform: `${Platform}` = Platform.all) {
  if (!svgElement) return;
  let lastState: ViewBoxState;
  const eventAbortController = new AbortController();

  if (platform !== Platform.h5) {
    const wheelHandle = (e: WheelEvent)=> {
      e.preventDefault();

      // 直接触发wheel事件不会触发touchstart事件，所以需要处理 lastState 为空
      const newState = getNewViewBoxState(
        svgElement,
        {
          scale: 1 - e.deltaY * 0.002,
          origin: {
            x: e.pageX,
            y: e.pageY,
          },
        }
      );

      if (newState) {
        updateViewBox(svgElement, lastState = newState);
      }
    };

    svgElement.addEventListener('wheel', wheelHandle, {
      signal: eventAbortController.signal,
    });
  }

  return function clearEventListener() {
    eventAbortController.abort();
  }
}