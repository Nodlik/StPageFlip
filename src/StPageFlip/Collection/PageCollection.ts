import {Orientation, Render} from "../Render/Render";
import {Page} from "../Page/Page";
import {App} from "../App";

export abstract class PageCollection {
    protected pages: Page[] = [];
    protected readonly app: App;
    protected readonly render: Render;

    protected constructor(app: App, render: Render) {
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

    /**
     * Render page at pageNum without transform
     *
     * @param pageNum
     */
    public show(pageNum: number): void {
        if ((pageNum < 0) || (pageNum >= this.pages.length)) {
            return;
        }

        this.app.updatePage(pageNum);

        if (this.render.getOrientation() === Orientation.PORTRAIT) {
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
    }
}