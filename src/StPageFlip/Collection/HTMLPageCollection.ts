import {HTMLPage} from "../Page/HTMLPage";
import {Render} from "../Render/Render";
import {Page} from "../Page/Page";
import {PageCollection} from "./PageCollection";
import {App} from "../App";

export class HTMLPageCollection extends  PageCollection {
    private readonly element: HTMLElement;
    private readonly pagesElement: NodeListOf<HTMLElement> | HTMLElement[];

    constructor(app: App, render: Render, element: HTMLElement, items: NodeListOf<HTMLElement> | HTMLElement[]) {
        super(app, render);

        this.element = element;
        this.pagesElement = items;
    }

    public load(): void {
        for (const pageElement of this.pagesElement) {
            const page = new HTMLPage(this.render, pageElement);

            page.load();
            this.pages.push(page);
        }
    }

}