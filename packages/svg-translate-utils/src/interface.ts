export interface Point {
  x: number;
  y: number;
}

export type EventStore = {
  pageX: number;
  pageY: number;
}

export interface TransAction {
  scale?: number;
  x?: number;
  y?: number;
  origin?: Point;
  svgOrigin?: Point;
}

export type ViewBoxState = `${number} ${number} ${number} ${number}` | `${number},${number},${number},${number}`;

export interface TransStateOptions {
  originState?: ViewBoxState;
  svgPos?: DOMRect;
  initViewBoxWidth?: number;
  maxScale?: number;
  minScale?: number;
  joinChar?: ',' | ' ';
}


export interface TouchStore {
  event1?: EventStore;
  event2?: EventStore;
}