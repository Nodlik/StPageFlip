
export type Point = {
    x: number;
    y: number;
}

export type RectPoints = {
    topLeft: Point;
    topRight: Point;
    bottomLeft: Point;
    bottomRight: Point;
}

export type Rect = {
    left: number;
    top: number;
    width: number;
    height: number;
}

export type Segment = Point[];