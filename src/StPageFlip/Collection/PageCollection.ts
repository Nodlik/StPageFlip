import {Orientation, Render} from "../Render/Render";
import {Page, PageDensity} from "../Page/Page";
import {PageFlip} from "../PageFlip";
import {FlipDirection} from "../Flip/Flip";

type numberArray = number[];

export abstract class PageCollection {
    protected pages: Page[] = [];
    protected readonly app: PageFlip;
    protected readonly render: Render;

    protected currentPageIndex = 0;
    protected currentSpreadIndex = 0;

    protected isShowCover = false;

    protected landscapeSpread: numberArray[] = [];
    protected portraitSpread: numberArray[] = [];

    protected constructor(app: PageFlip, render: Render) {
        this.render = render;
        this.app = app;

        this.currentPageIndex = 0;
        this.isShowCover = this.app.getSettings().showCover;
    }

    public abstract load(): void;

    protected createSpread(): void {
        this.landscapeSpread = [];
        this.portraitSpread = [];

        for (let i = 0; i < this.pages.length; i++)
            this.portraitSpread.push([i]);

        let start = 0;
        if (this.isShowCover) {
            this.pages[0].setDensity(PageDensity.HARD);
            this.landscapeSpread.push([start]);
            start++;
        }

        for (let i = start; i < this.pages.length; i += 2) {
            if (i < this.pages.length - 1)
                this.landscapeSpread.push([i, i + 1]);
            else {
                this.landscapeSpread.push([i]);
                this.pages[i].setDensity(PageDensity.HARD);
            }
        }
    }

    protected getSpread(): numberArray[] {
        return this.render.getOrientation() === Orientation.LANDSCAPE
            ? this.landscapeSpread
            : this.portraitSpread;
    }

    protected getPageSpreadIndex(pageNum: number): number {
        const spread = this.getSpread();

        for (let i = 0; i < spread.length; i++)
            if ((pageNum === spread[i][0]) || ((spread.length > 1) && (pageNum === spread[i][1])))
                return i;

        return null;
    }

    public getPageCount(): number {
        return this.pages.length;
    }

    public getPages(): Page[] {
        return this.pages;
    }

    public getPage(pageIndex: number): Page {
        if ((pageIndex >= 0) && (pageIndex < this.pages.length)) {
            return this.pages[pageIndex];
        }

        throw new Error('Invalid page number');
    }

    public nextBy(current: Page): Page {
        const idx = this.pages.indexOf(current);

        if (idx < this.pages.length - 1)
            return this.pages[idx + 1];

        return null;
    }

    public prevBy(current: Page): Page {
        const idx = this.pages.indexOf(current);

        if (idx > 0)
            return this.pages[idx - 1];

        return null;
    }

    public getFlippingPage(direction: FlipDirection): Page {
        const current = this.currentSpreadIndex;

        if (this.render.getOrientation() === Orientation.PORTRAIT) {
            return (direction === FlipDirection.FORWARD)
                ? this.pages[current]
                : this.pages[current - 1]
        }
        else {
            const spread = (direction === FlipDirection.FORWARD)
                ? this.getSpread()[current + 1]
                : this.getSpread()[current - 1];

            if (spread.length === 1)
                return this.pages[spread[0]];

            return (direction === FlipDirection.FORWARD)
                ? this.pages[spread[0]]
                : this.pages[spread[1]];
        }
    }

    public getBottomPage(direction: FlipDirection): Page {
        const current = this.currentSpreadIndex;

        if (this.render.getOrientation() === Orientation.PORTRAIT) {
            return (direction === FlipDirection.FORWARD)
                ? this.pages[current + 1]
                : this.pages[current - 1]
        }
        else {
            const spread = (direction === FlipDirection.FORWARD)
                ? this.getSpread()[current + 1]
                : this.getSpread()[current - 1];

            if (spread.length === 1)
                return this.pages[spread[0]];

            return (direction === FlipDirection.FORWARD)
                ? this.pages[spread[1]]
                : this.pages[spread[0]];
        }
    }

    public showNext(): void {
        if (this.currentSpreadIndex < this.getSpread().length) {
            this.currentSpreadIndex++;
            this.showSpread();
        }
    }

    public showPrev(): void {
        if (this.currentSpreadIndex > 0) {
            this.currentSpreadIndex--;
            this.showSpread();
        }
    }

    public getCurrentPageIndex(): number {
        return this.currentPageIndex;
    }

    public show(pageNum: number = null): void {
        if (pageNum === null) pageNum = this.currentPageIndex;

        if ((pageNum < 0) || (pageNum >= this.pages.length)) return;

        const spreadIndex = this.getPageSpreadIndex(pageNum);
        if (spreadIndex !== null) {
            this.currentSpreadIndex = spreadIndex;
            this.showSpread();
        }
    }

    private showSpread(): number[] {
        const spread = this.getSpread()[this.currentSpreadIndex];

        if (spread.length === 2) {
            this.render.setLeftPage(this.pages[spread[0]]);
            this.render.setRightPage(this.pages[spread[1]]);
        }
        else {
            if (this.render.getOrientation() === Orientation.LANDSCAPE) {

                if (spread[0] === this.pages.length - 1) {
                    this.render.setLeftPage(this.pages[spread[0]]);
                    this.render.setRightPage(null);
                }
                else {
                    this.render.setLeftPage(null);
                    this.render.setRightPage(this.pages[spread[0]]);
                }
            }
            else {
                this.render.setLeftPage(null);
                this.render.setRightPage(this.pages[spread[0]]);
            }
        }

        this.currentPageIndex = spread[0];
        this.app.updatePageIndex(this.currentPageIndex);

        return spread;
    }
}