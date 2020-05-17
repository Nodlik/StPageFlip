import {FlipSetting, SizeType} from '../App';
import {Point, PageRect, RectPoints} from "../BasicTypes";
import {FlipDirection} from "../Flip/Flip";
import {Page} from "../Page/Page";

type AnimationAction = ( ) => void;
type AnimationSuccessAction = () => void;

type Shadow = {
    pos: Point;
    angle: number;
    width: number;
    opacity: number;
    direction: FlipDirection;
}

type Animation = {
    frames: AnimationAction[];
    duration: number;
    durationFrame: number;
    onAnimateEnd: AnimationSuccessAction;
    startedAt: number;
}

export enum Orientation {
    PORTRAIT,
    LANDSCAPE
}

export abstract class Render {
    protected leftPage: Page = null;
    protected rightPage: Page = null;

    protected flippingPage: Page = null;
    protected bottomPage: Page = null;

    protected shadow: Shadow = null;
    protected pageRect: RectPoints = null;
    protected readonly setting: FlipSetting;

    protected animation: Animation = null;

    protected timer = 0;
    protected direction: FlipDirection = null;

    protected orientation: Orientation = null;

    protected constructor(setting: FlipSetting) {
        this.setting = setting;
    }

    public abstract drawShadow(pos: Point, angle: number, t: number, direction: FlipDirection): void;

    public abstract drawFrame(timer: number): void;
    public abstract getBlockWidth(): number;
    public abstract getBlockHeight(): number;

    public setPageRect(pageRect: RectPoints): void {
        this.pageRect = this.convertRectToGlobal(pageRect);
    }

    public getOrientation(): Orientation {
        if (this.orientation === null)
            this.orientation = this.findOrientation();

        return this.orientation;
    }

    public startAnimation(frames: AnimationAction[], duration: number, onAnimateEnd: AnimationSuccessAction): void {
        this.finishAnimation();

        this.animation = {
            frames,
            duration,
            durationFrame: duration / frames.length,
            onAnimateEnd,
            startedAt: this.timer
        }
    }

    public finishAnimation(): void {
        if (this.animation !== null) {
            this.animation.frames[this.animation.frames.length - 1]();

            if (this.animation.onAnimateEnd !== null) {
                this.animation.onAnimateEnd();
            }
        }

        this.animation = null;
    }

    public render(timer: number): void {
        if (this.animation !== null) {
            const frameIndex = Math.round((timer - this.animation.startedAt) / this.animation.durationFrame);

            if (frameIndex < this.animation.frames.length) {
                this.animation.frames[frameIndex]();
            }
            else {
                this.animation.onAnimateEnd();
                this.animation = null;
            }
        }

        this.timer = timer;
        this.drawFrame(timer);
    }

    private findOrientation(): Orientation {
        return this.getBlockHeight() > this.getBlockWidth()
            ? Orientation.PORTRAIT
            : Orientation.LANDSCAPE;
    }

    public getRect(): PageRect {
        const orientation = this.findOrientation();
        const middlePoint: Point = {
            x: this.getBlockWidth() / 2, y: this.getBlockHeight() / 2
        };

        const ratio = this.setting.width / this.setting.height;

        let pageWidth = this.setting.width;
        let pageHeight = this.setting.height;
        let left = middlePoint.x - pageWidth;

        if (this.setting.size === SizeType.STRETCH) {
            pageWidth = (orientation === Orientation.LANDSCAPE)
                ? this.getBlockWidth() / 2
                : this.getBlockWidth();

            if (pageWidth > this.setting.maxWidth)
                pageWidth = this.setting.maxWidth;

            pageHeight = pageWidth / ratio;
            if (pageHeight > this.getBlockHeight()) {
                pageHeight = this.getBlockHeight();
                pageWidth = pageHeight * ratio;
            }

            left = (orientation === Orientation.LANDSCAPE)
                ? middlePoint.x - pageWidth
                : middlePoint.x - pageWidth / 2 - pageWidth;
        }

        this.orientation = orientation;

        return {
            left: left,
            top: middlePoint.y - (pageHeight / 2),
            width: pageWidth * 2,
            height: pageHeight,
            pageWidth: pageWidth
        }
    }


    public convertToBook(pos: Point): Point {
        const rect = this.getRect();

        return {
            x: pos.x - rect.left,
            y: pos.y - rect.top
        }
    }

    public convertToPage(pos: Point, direction?: FlipDirection): Point {
        if (!direction)
            direction = this.direction;

        const rect = this.getRect();
        const x = direction === FlipDirection.FORWARD
            ? (pos.x - rect.left - rect.width / 2)
            : (rect.width / 2 - pos.x + rect.left);

        return {
            x,
            y: pos.y - rect.top
        }
    }

    public convertToGlobal(pos: Point, direction?: FlipDirection): Point {
        if (!direction)
            direction = this.direction;

        if (pos == null)
            return null;

        const rect = this.getRect();

        const x = direction === FlipDirection.FORWARD
            ? (pos.x + rect.left + rect.width / 2)
            : rect.width / 2 - pos.x + rect.left;

        return {
            x,
            y: pos.y + rect.top
        }
    }

    public convertRectToGlobal(rect: RectPoints, direction?: FlipDirection): RectPoints {
        if (!direction)
            direction = this.direction;

        return {
            topLeft: this.convertToGlobal(rect.topLeft, direction),
            topRight: this.convertToGlobal(rect.topRight, direction),
            bottomLeft: this.convertToGlobal(rect.bottomLeft, direction),
            bottomRight: this.convertToGlobal(rect.bottomRight, direction)
        }
    }

    public start(): void {
        const loop = (timer: number): void => {
            this.render(timer);
            requestAnimationFrame(loop);
        };

        requestAnimationFrame(loop);
    }

    public setDirection(direction: FlipDirection): void {
        this.direction = direction;
    }

    public setLeftPage(page: Page): void {
        this.leftPage = page;
    }

    public setFlippingPage(page: Page): void {
        this.flippingPage = page;
    }

    public setBottomPage(page: Page): void {
        this.bottomPage = page;
    }

    public setRightPage(page: Page): void {
        this.rightPage = page;
    }
}