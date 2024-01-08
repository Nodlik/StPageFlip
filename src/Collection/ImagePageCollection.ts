import { ImagePage } from '../Page/ImagePage';
import { Render } from '../Render/Render';
import { PageCollection } from './PageCollection';
import { PageFlip } from '../PageFlip';
import { PageDensity } from '../Page/Page';
import { ImageWithTrimData } from '../BasicTypes';

/**
 * Сlass representing a collection of pages as images on the canvas
 */
export class ImagePageCollection extends PageCollection {
    private readonly imagesWithTrimData: ImageWithTrimData[];

    constructor(app: PageFlip, render: Render, images: ImageWithTrimData[]) {
        super(app, render);

        this.imagesWithTrimData = images;
    }

    public load(): void {
        for (const imageWithTrimData of this.imagesWithTrimData) {
            const page = new ImagePage(this.render, imageWithTrimData, PageDensity.SOFT);

            page.load();
            this.pages.push(page);
        }

        this.createSpread();
    }
}
