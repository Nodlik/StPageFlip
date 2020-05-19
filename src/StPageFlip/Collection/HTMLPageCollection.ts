import {HTMLPage} from "../Page/HTMLPage";
import {Render} from "../Render/Render";
import {Page} from "../Page/Page";
import {PageCollection} from "./PageCollection";

export class HTMLPageCollection extends  PageCollection {
    private readonly element: HTMLElement;
    private readonly pagesElement: NodeListOf<HTMLElement>;

    constructor(render: Render, element: HTMLElement) {
        super(render);

        this.element = element;
        this.pagesElement = element.querySelectorAll(".stf__item");
    }

    public async load(): Promise<Page[]> {
        const loadPromises: Promise<Page>[] = [];

        for (const pageElement of this.pagesElement) {
            const page = new HTMLPage(this.render, pageElement);

            loadPromises.push(page.load());

            this.pages.push(page);
        }

        return Promise.all(loadPromises);
    }

}