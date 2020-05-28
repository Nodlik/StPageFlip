import {Orientation, Render} from "../Render/Render";
import {Page} from "../Page/Page";
import {PageFlip, ViewMode} from "../PageFlip";

export abstract class PageCollection {
    protected pages: Page[] = [];
    protected readonly app: PageFlip;
    protected readonly render: Render;

    protected constructor(app: PageFlip, render: Render) {
        this.render = render;
        this.app = app;
    }

    public getPageCount(): number {
        return this.pages.length;
    }

    public abstract load(): void;

    public getPages(): Page[] {
        return this.pages;
    }

    public getPage(pageIndex: number): Page {
        if ((pageIndex >= 0) && (pageIndex < this.pages.length)) {
            return this.pages[pageIndex];
        }

        throw new Error('Invalid page number');
    }

    public next(current: Page): Page {
        const idx = this.pages.indexOf(current);

        if (idx < this.pages.length - 1) {
            return this.pages[idx + 1];
        }

        return null;
    }

    public prev(current: Page): Page {
        const idx = this.pages.indexOf(current);

        if (idx > 0) {
            return this.pages[idx - 1];
        }

        return null;
    }

    public show(pageNum: number): void {
        if ((pageNum < 0) || (pageNum >= this.pages.length)) {
            return;
        }

        this.app.updatePage(pageNum);

        if ((this.render.getOrientation() === Orientation.PORTRAIT) || (this.app.getMode() === ViewMode.ONE_PAGE)) {
            this.render.setLeftPage(null);
            this.render.setRightPage(this.pages[pageNum]);
        }
        else {
            if (pageNum === (this.pages.length - 1)) {
                pageNum--;
            }

            this.render.setLeftPage(this.pages[pageNum]);
            this.render.setRightPage(this.pages[pageNum + 1]);
        }

        this.render.setMode(this.app.getMode());
    }
}