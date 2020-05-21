import {ImagePage} from "../Page/ImagePage";
import {Render} from "../Render/Render";
import {Page} from "../Page/Page";
import {PageCollection} from "./PageCollection";
import {App} from "../App";

export class ImagePageCollection extends  PageCollection {
    private readonly imagesHref: string[];

    constructor(app: App, render: Render, imagesHref: string[]) {
        super(app, render);

        this.imagesHref = imagesHref;
    }

    public load(): void {
        for (const href of this.imagesHref) {
            const page = new ImagePage(this.render, href);

            page.load();
            this.pages.push(page);
        }
    }

}