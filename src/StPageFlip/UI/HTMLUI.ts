import {UI} from "./UI";
import {PageFlip} from "../PageFlip";
import {FlipSetting} from "../Settings";

export class HTMLUI extends UI {
    constructor(inBlock: HTMLElement, app: PageFlip, setting: FlipSetting, items: NodeListOf<HTMLElement> | HTMLElement[]) {
        super(inBlock, app, setting);

        this.wrapper.insertAdjacentHTML('afterbegin', '<div class="stf__block"></div>');

        this.distElement = inBlock.querySelector('.stf__block');

        for (const item of items) {
            this.distElement.appendChild(item);
        }

        window.addEventListener('resize', () => {
            this.update();
        }, false);

        this.setHandlers();
    }

    public update(): void {
        this.app.getRender().update();
    }
}