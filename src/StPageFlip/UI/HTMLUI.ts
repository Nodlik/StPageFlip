import {UI} from "./UI";
import {App} from "../App";
import {Point} from "../BasicTypes";
import {FlipSetting} from "../Settings";

export class HTMLUI extends UI {
    private readonly canvas: HTMLCanvasElement;

    constructor(inBlock: HTMLElement, app: App, setting: FlipSetting, items: NodeListOf<HTMLElement> | HTMLElement[]) {
        super(inBlock, app, setting);

        inBlock.insertAdjacentHTML('afterbegin', '<div class="stf__block"></div>');

        this.distElement = inBlock.querySelector('.stf__block');

        for (const item of items) {
            this.distElement.appendChild(item);
        }

        window.addEventListener('resize', () => {
            this.update();
        }, false);

        this.setHandlers();
    }

    protected update(): void {
        this.app.getRender().update();
    }
}