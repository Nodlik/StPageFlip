import {CanvasRender} from "../Render/CanvasRender";
import {App} from "../App";
import {Helper} from "../Helper";
import {Point, Rect} from "../BasicTypes";
import {FlipCalculation} from "./FlipCalculation";
import {Page} from "../Page/Page";

export enum FlipDirection {
    FORWARD,
    BACK
}

export enum FlipCorner {
    TOP,
    BOTTOM
}

export enum FlippingState {
    USER_FOLD = 'user_fold',
    FOLD_CORNER = 'fold_corner',
    FLIPPING = 'flipping',
    READ = 'read'
}

export class Flip {
    private readonly render: CanvasRender;
    private readonly app: App;

    private flippingPage: Page = null;
    private bottomPage: Page = null;

    private calc: FlipCalculation = null;

    private state: FlippingState = FlippingState.READ;

    constructor(render: CanvasRender, app: App) {
        this.render = render;
        this.app = app;
    }

    public getCalculation(): FlipCalculation {
        return this.calc;
    }

    public start(globalPos: Point): boolean {
        this.reset();

        const bookPos = this.render.convertToBook(globalPos);
        const rect = this.getBoundsRect();

        const direction = (bookPos.x >= rect.width / 2)
            ? FlipDirection.FORWARD
            : FlipDirection.BACK;

        const flipCorner = (bookPos.y >= rect.height / 2)
            ? FlipCorner.BOTTOM
            : FlipCorner.TOP;

        if (!this.checkDirection(direction))
            return false;

        try {
            this.flippingPage = this.getFlippingPage(direction);
            this.bottomPage = this.getBottomPage(direction);

            if (!this.flippingPage || !this.bottomPage)
                return false;

            this.render.setDirection(direction);
            this.calc = new FlipCalculation(
                direction,
                flipCorner,
                rect.width / 2,
                rect.height
            );

            return true;
        }
        catch (e) {
            return false;
        }
    }

    public showCorner(globalPos: Point): void {
        if (!this.checkState(FlippingState.READ, FlippingState.FOLD_CORNER))
            return;

        const rect = this.getBoundsRect();
        const pageWidth = rect.width / 2;

        const operatingDistance = Math.sqrt( Math.pow(pageWidth, 2) + Math.pow( rect.height, 2) ) / 5;

        const bookPos = this.render.convertToBook(globalPos);

        if ( ((bookPos.x > 0) && (bookPos.y > 0)) &&
             ((bookPos.x < rect.width) && (bookPos.y < rect.height)) &&
             ((bookPos.x < operatingDistance) || (bookPos.x > (rect.width - operatingDistance))) &&
             ((bookPos.y < operatingDistance) || (bookPos.y > rect.height - operatingDistance)) )
        {
            if (this.calc === null) {
                if (!this.start(globalPos))
                    return;

                this.setState( FlippingState.FOLD_CORNER );

                this.calc.calc({x: pageWidth - 1, y: 1});

                const fixedCornerSize = 50;
                const yStart = (this.calc.getCorner() === FlipCorner.BOTTOM)
                    ? rect.height - 1
                    : 1;

                const yDest = (this.calc.getCorner() === FlipCorner.BOTTOM)
                    ? rect.height - fixedCornerSize
                    : fixedCornerSize;

                this.animateFlippingTo(
                    {x: pageWidth - 1, y: yStart},
                    {x: pageWidth - fixedCornerSize, y: yDest}, false, false);
            }
            else {
                this.do(this.render.convertToPage(globalPos));
            }
        }
        else {
            this.setState(FlippingState.READ);
            this.render.finishAnimation();

            this.stopMove();
        }
    }

    public fold(globalPos: Point): void {
        this.setState(FlippingState.USER_FOLD);

        if (this.calc === null)
            this.start(globalPos);

        this.do(this.render.convertToPage(globalPos));
    }

    public flip(globalPos: Point): void {
        if (this.calc !== null)
            this.render.finishAnimation();

        if (!this.start(globalPos))
            return;

        const rect = this.getBoundsRect();

        this.setState(FlippingState.FLIPPING);

        const topMargins = rect.height / 10;

        const yStart = (this.calc.getCorner() === FlipCorner.BOTTOM)
            ? rect.height - topMargins
            : topMargins;

        const yDest = (this.calc.getCorner() === FlipCorner.BOTTOM)
            ? rect.height
            : 0;

        this.calc.calc({x: rect.width / 2 - topMargins, y: yStart});

        this.animateFlippingTo(
            {x: rect.width / 2 - topMargins, y: yStart},
            {x: -rect.width / 2, y: yDest}, true);
    }

    public stopMove(): void {
        if (this.calc === null)
            return;

        const pos = this.calc.getPosition();
        const rect = this.getBoundsRect();

        const y = this.calc.getCorner() === FlipCorner.BOTTOM
            ? rect.height
            : 0;

        if (pos.x <= 0)
            this.animateFlippingTo(pos, {x: -rect.width / 2, y }, true);
        else
            this.animateFlippingTo(pos, {x: rect.width / 2, y }, false);
    }

    private do(pagePos: Point): void {
        if (this.calc === null)
            return;

        this.calc.calc(pagePos);

        this.flippingPage.setArea(this.calc.getFlippingClipArea());
        this.flippingPage.setPosition(this.calc.getActiveCorner());
        this.flippingPage.setAngle(this.calc.getAngle());

        this.bottomPage.setArea(this.calc.getBottomClipArea());
        this.bottomPage.setPosition(this.calc.getBottomPagePosition());
        this.bottomPage.setAngle(0);

        this.render.setPageRect(this.calc.getRect());

        this.render.setBottomPage(this.bottomPage);
        this.render.setFlippingPage(this.flippingPage);

        this.render.drawShadow(
            this.calc.getShadowStartPoint(),
            this.calc.getShadowAngle(),
            this.calc.getFlippingProgress(),
            this.calc.getDirection()
        );
    }

    private animateFlippingTo(start: Point, dest: Point, isTurned: boolean, needReset = true): void {
        const points = Helper.GetCordsFromTwoPoint(start, dest);

        const frames = [];
        for (const p of points)
            frames.push(() => this.do(p));

        const duration = this.getAnimationDuration(points.length);

        this.render.startAnimation(frames, duration, () => {
            if (isTurned) {
                if (this.calc.getDirection() === FlipDirection.BACK)
                    this.app.turnToPrevPage();
                else
                    this.app.turnToNextPage();
            }

            if (needReset) {
                this.render.setBottomPage(null);
                this.render.setFlippingPage(null);
                this.render.clearShadow();

                this.state = FlippingState.READ;
                this.reset();
            }
        });
    }

    private getAnimationDuration(size: number): number {
        if (size < 200)
            return 400;

        if (size < 500)
            return 470;

        return 1000;
    }

    private getFlippingPage(direction: FlipDirection): Page {
        const current = this.app.getCurrentPageIndex();

        if ( (current < (this.app.getPageCount() - 1)) && (current >= 0) ) {
            if (direction === FlipDirection.FORWARD)
                return this.app.getPage(current + 2);
            else
                if (current > 0)
                    return this.app.getPage(current - 1);
        }

        return null;
    }

    private getNextPage(): Page {
        const current = this.app.getCurrentPageIndex();

        if (current < (this.app.getPageCount() - 2))
            return this.app.getPage(current + 3);

        return null;
    }

    private getPrevPage(): Page {
        const current = this.app.getCurrentPageIndex();

        if (current > 1)
            return this.app.getPage(current - 2);

        return null;
    }

    private getBottomPage(direction: FlipDirection): Page {
        if (direction === FlipDirection.FORWARD)
            return this.getNextPage();

        return this.getPrevPage();
    }

    private checkDirection(direction: FlipDirection): boolean {
        if (direction === FlipDirection.FORWARD)
            return (this.app.getCurrentPageIndex() <= (this.app.getPageCount() - 1));

        return (this.app.getCurrentPageIndex() > 1);
    }

    private reset(): void {
        this.calc = null;
        this.flippingPage = null;
        this.bottomPage = null;
    }

    private getBoundsRect(): Rect {
        return this.render.getRect();
    }

    private getPageWidth(): number {
        return this.getBoundsRect().width / 2;
    }

    private getPageHeight(): number {
        return this.getBoundsRect().height;
    }

    private setState(newState: FlippingState): void {
        this.app.updateState(newState);
        this.state = newState;
    }

    private checkState(...states: FlippingState[]): boolean {
        for (const state of states)
            if (this.state === state)
                return true;

        return false;
    }
}