import {App} from "../App";
import {Point} from "../BasicTypes";
import {FlipSetting, SizeType} from "../Settings";
import {FlipCorner} from "../Flip/Flip";

type SwipeData = {
    point: Point;
    time: number;
}

export abstract class UI {
    protected readonly app: App;
    protected distElement: HTMLElement;

    private touchPoint: SwipeData = null;
    private readonly swipeTimeout = 250;
    private readonly swipeDistance = 80;

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