import {PageCollection} from './Collection/PageCollection';
import {ImagePageCollection} from './Collection/ImagePageCollection';
import {HTMLPageCollection} from './Collection/HTMLPageCollection';
import {PageRect, Point} from './BasicTypes';
import {Flip, FlipCorner, FlipDirection, FlippingState} from './Flip/Flip';
import {Orientation, Render} from './Render/Render';
import {CanvasRender} from './Render/CanvasRender';
import {HTMLUI} from './UI/HTMLUI';
import {CanvasUI} from './UI/CanvasUI';
import {Helper} from './Helper';
import {Page} from './Page/Page';
import {EventObject} from "./Event/EventObject";
import {HTMLRender} from "./Render/HTMLRender";
import {FlipSetting, Settings} from "./Settings";
import {UI} from "./UI/UI";

import './Style/stPagePlip.css';

export const enum ViewMode {
    ONE_PAGE = 'one_page',
    TWO_PAGE = 'two_page'
}

export class PageFlip extends EventObject {
    private mousePosition: Point;
    private isUserTouch = false;
    private isUserMove = false;

    private pages: PageCollection = null;
    private currentPage = 0;

    private readonly setting: FlipSetting = null;

    private readonly block: HTMLElement;
    private flip: Flip;
    private render: Render;

    private ui: UI;
    private mode: ViewMode;

    constructor(inBlock: HTMLElement, setting: Record<string, number | string | boolean>) {
        super();

        try {
            this.setting = Settings.GetSettings(setting);

            this.block = inBlock;
        }
        catch (e) {
            //
        }
    }

    public update(): void {
        this.render.update();
        this.pages.show(this.currentPage);
    }

    public turnToPrevPage(): void {
        let dp = (this.render.getOrientation() === Orientation.PORTRAIT) ? 1 : 2;
        if ((this.getOrientation() === Orientation.LANDSCAPE) && (this.currentPage === 1)) {
            dp = 1;
        }

        if (this.currentPage < dp) return;

        this.currentPage -= dp;
        this.pages.show(this.currentPage);
    }

    public turnToNextPage(): void {
        let dp = this.render.getOrientation() === Orientation.PORTRAIT ? 1 : 2;
        if (this.mode === ViewMode.ONE_PAGE) {
            dp = 1;
            this.updateViewMode(ViewMode.TWO_PAGE);
        }
        if (this.currentPage > this.pages.getPageCount() - dp) return;

        this.currentPage += dp;
        this.pages.show(this.currentPage);
    }

    public turnToPage(pageNum: number): void {
        if (!this.checkPage(pageNum)) return;

        this.currentPage = pageNum;
        this.pages.show(this.currentPage);
    }

    public flipNext(corner: FlipCorner = FlipCorner.TOP): void {
        this.flip.flipNext(corner);
    }

    public flipPrev(corner: FlipCorner = FlipCorner.TOP): void {
        this.flip.flipPrev(corner);
    }

    public loadFromImages(imagesHref: string[]): void {
        this.ui = new CanvasUI(this.block, this, this.setting);

        const canvas = (this.ui as CanvasUI).getCanvas();
        this.render = new CanvasRender(this, this.setting, canvas);

        this.flip = new Flip(this.render, this);

        this.pages = new ImagePageCollection(this, this.render, imagesHref);
        this.pages.load();

        this.render.start();

        this.currentPage = this.setting.startPage;
        this.pages.show(this.setting.startPage);
    }

    public loadFromHTML(items: NodeListOf<HTMLElement> | HTMLElement[]): void {
        this.ui = new HTMLUI(this.block, this, this.setting, items);

        this.render = new HTMLRender(this, this.setting, this.ui.getDistElement(), items);

        this.flip = new Flip(this.render, this);

        this.pages = new HTMLPageCollection(this, this.render, this.ui.getDistElement(), items);
        this.pages.load();

        this.render.start();

        this.currentPage = this.setting.startPage;
        this.pages.show(this.setting.startPage);
    }

    public updateState(newState: FlippingState): void {
        this.trigger('changeState', this, newState);
    }

    public updatePage(newPage: number): void {
        this.trigger('flip', this, newPage);
    }

    public updateViewMode(mode: ViewMode): void {
        this.mode = mode;
        console.log(this.mode);
    }

    public updateOrientation(newOrientation: Orientation): void {
        if (newOrientation === Orientation.LANDSCAPE) {
            if ((this.currentPage % 2) !== 0)
                this.currentPage--;

            this.update();
        }
        else {
            this.currentPage++;
            this.update();
        }

        this.ui.setOrientationStyle(newOrientation);
        this.trigger('changeOrientation', this, newOrientation);
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

    public getRender(): Render {
        return this.render;
    }

    public getFlipObject(): Flip {
        return this.flip;
    }

    public getOrientation(): Orientation {
        return this.render.getOrientation();
    }

    public getBoundsRect(): PageRect {
        return this.render.getRect();
    }

    public getSettings(): FlipSetting {
        return this.setting;
    }

    public getUI(): UI {
        return this.ui;
    }

    public getMode(): ViewMode {
        return this.mode;
    }

    public getPageCollection(): PageCollection {
        return this.pages;
    }

    public startUserTouch(pos: Point): void {
        this.mousePosition = pos;
        this.isUserTouch = true;
        this.isUserMove = false;
    }

    public userMove(pos: Point, isTouch: boolean): void {
        if ((!this.isUserTouch) && (!isTouch)) {
            this.flip.showCorner(pos);
        }
        else if (this.isUserTouch) {
            if (Helper.GetDestinationFromTwoPoint(this.mousePosition, pos) > 5) {
                this.isUserMove = true;
                this.flip.fold(pos);
            }
        }
    }

    public userStop(pos: Point, isSwipe = false): void {
        if (this.isUserTouch) {
            this.isUserTouch = false;

            if (!isSwipe) {
                if (!this.isUserMove)
                    this.flip.flip(pos);
                else
                    this.flip.stopMove();
            }
        }
    }

    private checkPage(page: number): boolean {
        return ((page >= 0) && (page < this.pages.getPageCount()));
    }
}