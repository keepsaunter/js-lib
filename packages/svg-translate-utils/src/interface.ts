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