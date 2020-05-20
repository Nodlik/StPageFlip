import {UI} from "./UI";
import {App} from "../App";
import {Point} from "../BasicTypes";
import {FlipSetting} from "../Settings";

export class CanvasUI extends UI {
    private readonly canvas: HTMLCanvasElement;

    constructor(inBlock: HTMLElement, app: App, setting: FlipSetting) {
        super(inBlock, app, setting);

        inBlock.innerHTML = '<canvas></canvas>';

        this.canvas = inBlock.querySelectorAll('canvas')[0];

        window.addEventListener('resize', () => {
            this.resizeCanvas();
            this.app.getRender().update();
        }, false);

        this.distElement = this.canvas;

        this.resizeCanvas();
        this.setHandlers();
    }

    private resizeCanvas(): void {
        const cs = getComputedStyle(this.canvas);
        const width = parseInt(cs.getPropertyValue('width'), 10);
        const height = parseInt(cs.getPropertyValue('height'), 10);

        this.canvas.width = width;
        this.canvas.height = height;
    }

    public getCanvas(): HTMLCanvasElement {
        return this.canvas;
    }
}