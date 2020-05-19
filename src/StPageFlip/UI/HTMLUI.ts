import {UI} from "./UI";
import {App, FlipSetting, SizeType} from "../App";
import {Point} from "../BasicTypes";

export class HTMLUI extends UI {
    private readonly canvas: HTMLCanvasElement;

    constructor(inBlock: HTMLElement, app: App, setting: FlipSetting) {
        super(inBlock, app, setting);

        this.distElement = inBlock.querySelector('.stf__block');

        this.setHandlers();
    }
}