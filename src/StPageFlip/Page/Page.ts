import {Render} from "../Render/Render";
import {Point, RectPoints} from "../BasicTypes";

export interface PageState {
    angle: number;
    area: Point[];
    corners: RectPoints;
    position: Point;
    spine: Point;
    hardAngle: number;
}

export const enum PageOrientation {
    LEFT,
    RIGHT
}

export const enum PageDensity {
    SOFT = 'soft',
    HARD = 'hard'
}

export abstract class Page {
    protected state: PageState;
    protected render: Render;

    protected orientation: PageOrientation;
    protected density: PageDensity;

    protected constructor(render: Render, density: PageDensity) {
        this.state = {
            angle: 0,
            area: [],
            corners: null,
            position: {x: 0, y: 0},
            spine: {x: 0, y: 0},
            hardAngle: 0
        };

        this.density = density;
        this.render = render;
    }

    public setDensity(density: PageDensity): void {
        this.density = density;
    }

    public getDensity(): PageDensity {
        return this.density;
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

    public setHardAngle(angle: number): void {
        this.state.hardAngle = angle;
    }

    public getHardAngle(): number {
        return this.state.hardAngle;
    }

    public setSpine(spine: Point): void {
        this.state.spine = spine;
    }

    public setOrientation(orientation: PageOrientation): void {
        this.orientation = orientation;
    }

    public getOrientation(): PageOrientation {
        return this.orientation;
    }

    public abstract simpleDraw(orient: PageOrientation): void;
    public abstract draw(tempDensity?: PageDensity): void;
    public abstract load(): void;
}