import {App} from "../App";
import {Point} from "../BasicTypes";
import {FlipSetting, SizeType} from "../Settings";

export abstract class UI {
    protected readonly app: App;
    protected distElement: HTMLElement;

    protected constructor(inBlock: HTMLElement, app: App, setting: FlipSetting) {
        inBlock.classList.add('stf__wrapper');

        inBlock.setAttribute("style", "min-width: " + setting.minWidth +
            'px; min-height: ' + setting.minHeight + 'px');

        if (setting.size === SizeType.FIXED) {
            inBlock.setAttribute("style", "min-width: " + setting.width +
                'px; min-height: ' + setting.height + 'px');
        }

        this.app = app;
    }

    protected setHandlers(): void {
        this.distElement.onmousedown = (e: MouseEvent) => {
            const pos = this.getMousePos(e.clientX, e.clientY);

            this.app.startUserTouch(pos);
            return false;
        };

        this.distElement.ontouchstart = (e: TouchEvent) => {
            if (e.changedTouches.length > 0) {
                const t = e.changedTouches[0];

                this.app.startUserTouch(this.getMousePos(t.clientX, t.clientY));
                return false;
            }
        };

        window.onmousemove = (e: MouseEvent) => {
            const pos = this.getMousePos(e.clientX, e.clientY);

            this.app.userMove(pos);

            return false;
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

            return false;
        };

        window.ontouchend = (e: TouchEvent) => {
            if (e.changedTouches.length > 0) {
                const t = e.changedTouches[0];

                this.app.userStop(this.getMousePos(t.clientX, t.clientY));
            }
        };
    }

    public getDistElement(): HTMLElement {
        return this.distElement;
    }

    private getMousePos(x: number, y: number): Point {
        const rect = this.distElement.getBoundingClientRect();

        return {
            x: x - rect.left,
            y: y - rect.top
        };
    }
}