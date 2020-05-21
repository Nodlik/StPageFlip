import {App} from "../App";
import {Point} from "../BasicTypes";
import {FlipSetting, SizeType} from "../Settings";
import {FlipCorner} from "../Flip/Flip";
import {Orientation} from "../Render/Render";

type SwipeData = {
    point: Point;
    time: number;
}

export abstract class UI {
    protected readonly app: App;
    protected readonly wrapper: HTMLElement;
    protected distElement: HTMLElement;

    private touchPoint: SwipeData = null;
    private readonly swipeTimeout = 250;
    private readonly swipeDistance = 80;

    protected constructor(inBlock: HTMLElement, app: App, setting: FlipSetting) {
        this.wrapper = inBlock;
        this.wrapper.classList.add('stf__wrapper');

        this.app = app;

        const k = this.app.getSettings().usePortrait
            ? 1
            : 2;

        this.wrapper.setAttribute("style", "min-width: " + setting.minWidth * k +
            'px; min-height: ' + setting.minHeight + 'px');

        if (setting.size === SizeType.FIXED) {
            this.wrapper.setAttribute("style", "min-width: " + setting.width * k +
                'px; min-height: ' + setting.height + 'px');
        }
    }

    protected abstract update(): void;

    public getDistElement(): HTMLElement {
        return this.distElement;
    }

    public setOrientationStyle(orientation: Orientation): void {
        this.wrapper.classList.remove('--portrait', '--landscape');

        if (orientation === Orientation.PORTRAIT)
            this.wrapper.classList.add('--portrait');
        else
            this.wrapper.classList.add('--landscape');

        this.update();
    }

    protected setHandlers(): void {
        this.distElement.onmousedown = (e: MouseEvent) => {
            const pos = this.getMousePos(e.clientX, e.clientY);

            this.app.startUserTouch(pos);

            e.preventDefault();
        };

        this.distElement.addEventListener('touchstart',(e: TouchEvent) => {
            if (e.changedTouches.length > 0) {
                const t = e.changedTouches[0];
                const pos = this.getMousePos(t.clientX, t.clientY);

                this.touchPoint = {
                    point: pos,
                    time: Date.now()
                };

                setTimeout(() => {
                    if (this.touchPoint !== null)
                        this.app.startUserTouch(pos);

                }, this.swipeTimeout);

                e.preventDefault();
            }
        });

        window.addEventListener('mousemove', (e: MouseEvent) => {
            const pos = this.getMousePos(e.clientX, e.clientY);

            this.app.userMove(pos, false);

            e.preventDefault();
        });

        window.addEventListener('touchmove', (e: TouchEvent) => {
            if (e.changedTouches.length > 0) {
                const t = e.changedTouches[0];

                this.app.userMove(this.getMousePos(t.clientX, t.clientY), true);
            }
        });

        window.addEventListener('mouseup', (e: MouseEvent) => {
            const pos = this.getMousePos(e.clientX, e.clientY);

            this.app.userStop(pos);

            e.preventDefault();
        });

        window.addEventListener('touchend', (e: TouchEvent) => {
            if (e.changedTouches.length > 0) {
                const t = e.changedTouches[0];
                const pos = this.getMousePos(t.clientX, t.clientY);
                let isSwipe = false;

                if (this.touchPoint !== null) {
                    const dx = pos.x - this.touchPoint.point.x;
                    const distY = Math.abs(pos.y - this.touchPoint.point.y);

                    if ( (Math.abs(dx) > this.swipeDistance) &&
                         (distY < this.swipeDistance * 2) &&
                         ((Date.now() - this.touchPoint.time) < this.swipeTimeout) )
                    {
                        if (dx > 0) {
                            this.app.flipPrev( (this.touchPoint.point.y < this.app.getRender().getRect().height / 2)
                                ? FlipCorner.TOP
                                : FlipCorner.BOTTOM );
                        }
                        else {
                            this.app.flipNext((this.touchPoint.point.y < this.app.getRender().getRect().height / 2)
                                ? FlipCorner.TOP
                                : FlipCorner.BOTTOM );
                        }
                        isSwipe = true;
                    }

                    this.touchPoint = null;
                }

                this.app.userStop(pos, isSwipe);
            }
        });
    }

    private getMousePos(x: number, y: number): Point {
        const rect = this.distElement.getBoundingClientRect();

        return {
            x: x - rect.left,
            y: y - rect.top
        };
    }
}