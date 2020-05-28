import {Orientation, Render} from "../Render/Render";
import {PageFlip, ViewMode} from "../PageFlip";
import {Helper} from "../Helper";
import {PageRect, Point} from "../BasicTypes";
import {FlipCalculation} from "./FlipCalculation";
import {Page, PageDensity} from "../Page/Page";

export const enum FlipDirection {
    FORWARD,
    BACK
}

export const enum FlipCorner {
    TOP = 'top',
    BOTTOM = 'bottom'
}

export const enum FlippingState {
    USER_FOLD = 'user_fold',
    FOLD_CORNER = 'fold_corner',
    FLIPPING = 'flipping',
    READ = 'read'
}

export class Flip {
    private readonly render: Render;
    private readonly app: PageFlip;

    private flippingPage: Page = null;
    private bottomPage: Page = null;

    private calc: FlipCalculation = null;

    private state: FlippingState = FlippingState.READ;

    constructor(render: Render, app: PageFlip) {
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

        let direction = FlipDirection.FORWARD;
        if (this.render.getOrientation() === Orientation.PORTRAIT) {
            if ((bookPos.x - rect.pageWidth) <=  rect.width / 5)
                direction = FlipDirection.BACK;
        }
        else if (bookPos.x < rect.width / 2) {
            direction = FlipDirection.BACK;
        }

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

            if (this.app.getMode() === ViewMode.ONE_PAGE) {
            //    this.flippingPage.setDensity(PageDensity.HARD);
            }

            if (this.render.getOrientation() === Orientation.LANDSCAPE) {
                if (direction === FlipDirection.BACK) {
                    const nextPage = this.app.getPageCollection().next(this.flippingPage);

                    if (nextPage !== null) {
                        if (this.flippingPage.getDensity() !== nextPage.getDensity()) {
                            this.flippingPage.setDrawingDensity(PageDensity.HARD);
                            nextPage.setDrawingDensity(PageDensity.HARD);
                        }
                    }
                }
                else {
                    const prevPage = this.app.getPageCollection().prev(this.flippingPage);

                    if (prevPage !== null) {
                        if (this.flippingPage.getDensity() !== prevPage.getDensity()) {
                            this.flippingPage.setDrawingDensity(PageDensity.HARD);
                            prevPage.setDrawingDensity(PageDensity.HARD);
                        }
                    }
                }
            }

            this.render.setDirection(direction);
            this.calc = new FlipCalculation(
                direction,
                flipCorner,
                rect.pageWidth,
                rect.height
            );

            return true;
        }
        catch (e) {
            console.log(e);

            return false;
        }
    }

    public showCorner(globalPos: Point): void {
        if (!this.checkState(FlippingState.READ, FlippingState.FOLD_CORNER))
            return;

        const rect = this.getBoundsRect();
        const pageWidth = rect.pageWidth;

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

        this.calc.calc({x: rect.pageWidth - topMargins, y: yStart});

        this.animateFlippingTo(
            {x: rect.pageWidth - topMargins, y: yStart},
            {x: -rect.pageWidth, y: yDest}, true);
    }

    public flipNext(corner: FlipCorner): void {
        this.flip({
            x: this.render.getRect().left + this.render.getRect().pageWidth * 2,
            y: (corner === FlipCorner.TOP) ? 1 : this.render.getRect().height - 2
        });
    }

    public flipPrev(corner: FlipCorner): void {
        this.flip({
            x: 10,
            y: (corner === FlipCorner.TOP) ? 1 : this.render.getRect().height - 2
        });
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
            this.animateFlippingTo(pos, {x: -rect.pageWidth, y }, true);
        else
            this.animateFlippingTo(pos, {x: rect.pageWidth, y }, false);
    }

    private do(pagePos: Point): void {
        if (this.calc === null)
            return;

        this.calc.calc(pagePos);
        const progress = this.calc.getFlippingProgress();
        this.bottomPage.setArea(this.calc.getBottomClipArea());
        this.bottomPage.setPosition(this.calc.getBottomPagePosition());
        this.bottomPage.setAngle(0);
        this.bottomPage.setHardAngle(0);

        this.flippingPage.setArea(this.calc.getFlippingClipArea());
        this.flippingPage.setPosition(this.calc.getActiveCorner());
        this.flippingPage.setAngle(this.calc.getAngle());

        this.flippingPage.setHardAngle(-90 * (200 - (progress * 2)) / 100);

        if (this.calc.getDirection() === FlipDirection.FORWARD) {
            this.flippingPage.setHardAngle(90 * (200 - (progress * 2)) / 100);
        }
        else {
            this.flippingPage.setHardAngle(-90 * (200 - (progress * 2)) / 100);
        }

        this.render.setPageRect(this.calc.getRect());

        this.render.setBottomPage(this.bottomPage);
        this.render.setFlippingPage(this.flippingPage);

        this.render.drawShadow(
            this.calc.getShadowStartPoint(),
            this.calc.getShadowAngle(),
            progress,
            this.calc.getDirection(),
            this.calc.getShadowLength()
        );
    }

    private animateFlippingTo(start: Point, dest: Point, isTurned: boolean, needReset = true): void {
        const points = Helper.GetCordsFromTwoPoint(start, dest);

        const frames = [];
        for (const p of points)
            frames.push(() => this.do(p));

        const duration = this.getAnimationDuration(points.length);

        this.render.startAnimation(frames, duration, () => {
            if (!this.calc)
                return;

            if (isTurned) {
                if (this.calc.getDirection() === FlipDirection.BACK) {
                    this.app.turnToPrevPage();
                }
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
        const defaultTime = this.app.getSettings().flippingTime;

        if (size >= 1000)
            return defaultTime;

        return (size / 1000) * defaultTime;
    }

    private getFlippingPage(direction: FlipDirection): Page {
        const current = this.app.getCurrentPageIndex();

        if (this.render.getOrientation() === Orientation.PORTRAIT) {
            return (direction === FlipDirection.FORWARD)
                ? this.app.getPage(current)
                : this.app.getPage(current - 1);
        }
        else {
            if ((current < (this.app.getPageCount() - 1)) && (current >= 0)) {
                const dp = (this.app.getMode() === ViewMode.ONE_PAGE) ? 1 : 2;

                return (direction === FlipDirection.FORWARD)
                    ? this.app.getPage(current + dp)
                    : this.app.getPage(current - 1);
            }
        }

        return null;
    }

    private getNextPage(): Page {
        const current = this.app.getCurrentPageIndex();

        let dp = this.render.getOrientation() === Orientation.PORTRAIT ? 0 : 2;
        if (this.app.getMode() === ViewMode.ONE_PAGE) dp = 1;
        if (current >= 1) {
            this.app.updateViewMode(ViewMode.TWO_PAGE);
        }

        if (current < (this.app.getPageCount() - dp))
            return this.app.getPage(current + dp + 1);

        return null;
    }

    private getPrevPage(): Page {
        const current = this.app.getCurrentPageIndex();

        let dp = this.render.getOrientation() === Orientation.PORTRAIT ? 0 : 2;

        if (current === 1) {
            this.app.updateViewMode(ViewMode.ONE_PAGE);
            dp = 1;
        }
        else {
            this.app.updateViewMode(ViewMode.TWO_PAGE);
        }

        if (current - dp >= 0)
            return this.app.getPage(current - dp);

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

        return (this.app.getCurrentPageIndex() >= 1);
    }

    private reset(): void {
        this.calc = null;
        this.flippingPage = null;
        this.bottomPage = null;
    }

    private getBoundsRect(): PageRect {
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