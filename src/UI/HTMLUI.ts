import { UI } from './UI';
import { PageFlip } from '../PageFlip';
import { FlipSetting } from '../Settings';
import { Orientation } from '../Render/Render';

/**
 * UI for HTML mode
 */
export class HTMLUI extends UI {
    private items: NodeListOf<HTMLElement> | HTMLElement[];

    constructor(
        inBlock: HTMLElement,
        app: PageFlip,
        setting: FlipSetting,
        items: NodeListOf<HTMLElement> | HTMLElement[]
    ) {
        super(inBlock, app, setting);

        // Second wrapper to HTML page
        this.wrapper.insertAdjacentHTML('afterbegin', '<div class="stf__block"></div>');

        this.distElement = inBlock.querySelector('.stf__block');

        this.items = items;
        for (const item of items) {
            this.distElement.appendChild(item);
        }

        this.setHandlers();
    }

    public clear(): void {
        for (const item of this.items) {
            this.parentElement.appendChild(item);
        }
    }

    /**
     * Update page list from HTMLElements
     *
     * @param {(NodeListOf<HTMLElement>|HTMLElement[])} items - List of pages as HTML Element
     */
    public updateItems(items: NodeListOf<HTMLElement> | HTMLElement[]): void {
        this.removeHandlers();

        this.distElement.innerHTML = '';

        for (const item of items) {
            this.distElement.appendChild(item);
        }
        this.items = items;

        this.setHandlers();
    }

    public update(): void {
        this.app.getRender().update();
        if(this.app.getOrientation() === Orientation.LANDSCAPE && this.app.getPageCollection().getCurrentPageIndex() === 0) {
            this.firstPageCenter();
        } else if(this.app.getOrientation() === Orientation.LANDSCAPE && this.app.getPageCollection().getCurrentPageIndex() === this.app.getPageCollection().getPages().length - 1) {
            this.firstPageEndCenter();
        }else {
            this.firstPageCenterReverse();
        }
    }

    public firstPageCenter(): void {
        const width = this.distElement.clientWidth;
        this.distElement.style.transform = `translateX(-${width/4}px)`;
    }
    public firstPageEndCenter(): void {
        const width = this.distElement.clientWidth;
        this.distElement.style.transform = `translateX(${width/4}px)`;
    }
    public firstPageCenterReverse(): void {
        this.distElement.style.transition = 'transform 0.5s';
        this.distElement.style.transform = `translateX(0px)`;
    }
}
