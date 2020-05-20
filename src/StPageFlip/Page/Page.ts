import {Render} from "../Render/Render";
import {Point, RectPoints} from "../BasicTypes";

export interface PageState {
    angle: number;
    area: Point[];
    corners: RectPoints;
    position: Point;
}

export const enum PageOrientation {
    Left,
    Right
}

export abstract class Page {
    protected state: PageState;
    protected render: Render;

    protected constructor(render: Render) {
        this.state = {
            angle: 0,
            area: [],
            corners: null,
            position: {x: 0, y: 0}
        };

        this.render = render;
    }

    public setPosition(pagePos: Point): void {
        this.state.position = pagePos;
    }

    public setAngle(angle: number): void {
        this.state.angle = angle;
    }

    public setArea(area: Point[]): void {
        this.state.area = area;
    }

    public setCorners(corners: RectPoints): void {
        this.state.corners = corners;
    }

    public getAngle(): number {
        return this.state.angle;
    }

    public abstract simpleDraw(orient: PageOrientation): void;
    public abstract draw(): void;
    public abstract async load(): Promise<Page>;
}