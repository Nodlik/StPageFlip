import {App, FlipSetting, SizeType} from "../App";
import {Point} from "../BasicTypes";

export class UI {
    private readonly canvas: HTMLCanvasElement;
    private readonly app: App;

    constructor(inBlock: HTMLElement, app: App, setting: FlipSetting) {
        inBlock.classList.add('stf__wrapper');

        inBlock.setAttribute("style", "min-width: " + setting.minWidth * 2 +
            'px; min-height: ' + setting.minHeight + 'px');
        if (setting.size === SizeType.FIXED) {
            inBlock.setAttribute("style", "min-width: " + setting.width * 2 +
                'px; min-height: ' + setting.height + 'px');
        }

        inBlock.innerHTML = '<canvas></canvas>';

        this.canvas = inBlock.querySelectorAll('canvas')[0];

        window.addEventListener('resize', () => {
            this.resizeCanvas();
        }, false);

        this.resizeCanvas();
        this.app = app;
        this.setHandlers();
    }

    private resizeCanvas(): void {
        const cs = getComputedStyle(this.canvas);
        const width = parseInt(cs.getPropertyValue('width'), 10);
        const height = parseInt(cs.getPropertyValue('height'), 10);

        this.canvas.width = width;
        this.canvas.height = height;
    }

    private setHandlers(): void {
        this.canvas.onmousedown = (e: MouseEvent) => {
            const pos = this.getMousePos(e.clientX, e.clientY);

            this.app.startUserTouch(pos);
        };

        this.canvas.ontouchstart = (e: TouchEvent) => {
            if (e.changedTouches.length > 0) {
                const t = e.changedTouches[0];

                this.app.startUserTouch(this.getMousePos(t.clientX, t.clientY));
            }

            return false;
        };

        window.onmousemove = (e: MouseEvent) => {
            const pos = this.getMousePos(e.clientX, e.clientY);

            this.app.userMove(pos);
        };

        window.ontouchmove = (e: TouchEvent) => {
            if (e.changedTouches.length > 0) {
                const t = e.changedTouches[0];

                this.app.userMove(this.getMousePos(t.clientX, t.clientY));
            }
        };

        window.onmouseup = (e: MouseEvent) => {
            const pos = this.getMousePos(e.clientX, e.clientY);

            this.app.userStop(pos);
        };

        window.ontouchend = (e: TouchEvent) => {
            if (e.changedTouches.length > 0) {
                const t = e.changedTouches[0];

                this.app.userStop(this.getMousePos(t.clientX, t.clientY));
            }
        };
    }

    public getCanvas(): HTMLCanvasElement {
        return this.canvas;
    }

    private getMousePos(x: number, y: number): Point {
        const rect = this.canvas.getBoundingClientRect();

        return {
            x: x - rect.left,
            y: y - rect.top
        };
    }
}