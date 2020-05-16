import {Render} from "../Render/Render";
import {Page} from "../Page/Page";

export abstract class PageCollection {
    protected pages: Page[] = [];
    protected readonly render: Render;

    protected constructor(render: Render) {
        this.render = render;
    }

    public getPageCount(): number {
        return this.pages.length;
    }

    public async abstract load(): Promise<Page[]>;

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

        if (pageNum === (this.pages.length - 1)) {
            pageNum--;
        }

        this.render.setLeftPage(this.pages[pageNum]);
        this.render.setRightPage(this.pages[pageNum + 1]);
    }
}