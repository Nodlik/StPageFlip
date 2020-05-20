import {PageCollection} from './Collection/PageCollection';
import {ImagePageCollection} from './Collection/ImagePageCollection';
import {HTMLPageCollection} from './Collection/HTMLPageCollection';
import {Point}  from './BasicTypes';
import {Flip, FlippingState} from './Flip/Flip';
import {Render}  from './Render/Render';
import {CanvasRender}  from './Render/CanvasRender';
import {HTMLUI}  from './UI/HTMLUI';
import {CanvasUI}  from './UI/CanvasUI';
import {Helper}  from './Helper';
import {Page}  from './Page/Page';
import {EventObject} from "./Event/EventObject";
import {Orientation} from "./Render/Render";
import {HTMLRender} from "./Render/HTMLRender";

export const enum SizeType {
    FIXED,
    STRETCH
}

export type FlipSetting = {
    startPage: number;
    size: SizeType;

    width: number;
    height: number;

    minWidth: number;
    maxWidth: number;
    minHeight: number;
    maxHeight: number;
}

export class App extends EventObject {
    private mousePosition: Point;
    private isUserTouch = false;
    private isUserMove = false;

    private pages: PageCollection = null;
    private currentPage = 0;

    private readonly setting: FlipSetting = {
        width: 600,
        height: 800,
        size: SizeType.STRETCH,
        minWidth: 150,
        maxWidth: 900,
        minHeight: 300,
        maxHeight: 2200,
        startPage: 2
    };

    private readonly block: HTMLElement;
    private flip: Flip;
    private render: Render;

    constructor(inBlock: HTMLElement, setting: FlipSetting) {
        super();

        this.block = inBlock;
    }

    public update(): void {
        this.pages.show(this.currentPage);
    }

    public turnToPrevPage(): void {
        const dp = this.render.getOrientation() === Orientation.PORTRAIT ? 1 : 2;
        if (this.currentPage < dp) return;

        this.currentPage -= dp;
        this.pages.show(this.currentPage);

        this.trigger('flip', this, this.currentPage);
    }

    public turnToNextPage(): void {
        const dp = this.render.getOrientation() === Orientation.PORTRAIT ? 1 : 2;
        if (this.currentPage > this.pages.getPageCount() - dp) return;

        this.currentPage += dp;
        this.pages.show(this.currentPage);

        this.trigger('flip', this, this.currentPage);
    }

    public turnToPage(pageNum: number): void {
        if (!this.checkPage(pageNum)) return;

        this.currentPage = pageNum;
        this.pages.show(this.currentPage);

        this.trigger('flip', this, this.currentPage);
    }

    public loadFromImages(imagesHref: string[]): void {
        const ui = new CanvasUI(this.block, this, this.setting);

        const canvas = ui.getCanvas();
        this.render = new CanvasRender(canvas, this.setting);

        this.flip = new Flip(this.render, this);

        this.render.start();

        this.pages = new ImagePageCollection(this.render, imagesHref);
        this.pages.load();

        this.pages.show(this.setting.startPage);
        this.currentPage = this.setting.startPage;

        this.trigger('flip', this, this.currentPage);
    }

    public loadFromHTML(): void {
        const ui = new HTMLUI(this.block, this, this.setting);

        this.render = new HTMLRender(ui.getDistElement(), this.setting);

        this.flip = new Flip(this.render, this);

        this.render.start();

        this.pages = new HTMLPageCollection(this.render, ui.getDistElement());
        this.pages.load();

        this.pages.show(this.setting.startPage);
        this.currentPage = this.setting.startPage;

        this.trigger('flip', this, this.currentPage);
    }

    public updateState(newState: FlippingState): void {
        this.trigger('changeState', this, newState);
    }

    public getPageCount(): number {
        return this.pages.getPageCount();
    }

    public getCurrentPageIndex(): number {
        return this.currentPage;
    }

    public getCurrentPage(): Page {
        return this.pages.getPage(this.currentPage);
    }

    public getPage(pageNum: number): Page {
        return this.pages.getPage(pageNum);
    }

    public startUserTouch(pos: Point): void {
        this.mousePosition = pos;
        this.isUserTouch = true;
        this.isUserMove = false;
    }

    public userMove(pos: Point): void {
        if (!this.isUserTouch) {
            this.flip.showCorner(pos);
        }
        else {
            if (Helper.GetDestinationFromTwoPoint(this.mousePosition, pos) > 5) {
                this.isUserMove = true;
                this.flip.fold(pos);
            }
        }
    }

    public userStop(pos: Point): void {
        if (this.isUserTouch) {
            this.isUserTouch = false;

            if (!this.isUserMove)
                this.flip.flip(pos);
            else
                this.flip.stopMove();
        }
    }

    private checkPage(page: number): boolean {
        return ((page >= 0) && (page < this.pages.getPageCount()));
    }
}