import {Render} from "../Render/Render";
import {Point, RectPoints} from "../BasicTypes";

export interface PageState {
    angle: number;
    area: Point[];
    corners: RectPoints;
    position: Point;
    spine: Point;
    hardAngle: number;
    hardDrawingAngle: number;
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
    protected createdDensity: PageDensity;
    protected nowDrawingDensity: PageDensity;

    protected constructor(render: Render, density: PageDensity) {
        this.state = {
            angle: 0,
            area: [],
            corners: null,
            position: {x: 0, y: 0},
            spine: {x: 0, y: 0},
            hardAngle: 0,
            hardDrawingAngle: 0
        };

        this.createdDensity = density;
        this.nowDrawingDensity = this.createdDensity;

        this.render = render;
    }

    public setDrawingDensity(density: PageDensity): void {
        this.nowDrawingDensity = density;
    }

    public getDrawingDensity(): PageDensity {
        return this.nowDrawingDensity;
    }

    public setDensity(density: PageDensity): void {
        this.createdDensity = density;
        this.nowDrawingDensity = density;
    }

    public getDensity(): PageDensity {
        return this.createdDensity;
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
        this.state.hardDrawingAngle = angle;
    }

    public setHardDrawingAngle(angle: number): void {
        this.state.hardDrawingAngle = angle;
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