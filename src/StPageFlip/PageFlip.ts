import {PageCollection} from './Collection/PageCollection';
import {ImagePageCollection} from './Collection/ImagePageCollection';
import {HTMLPageCollection} from './Collection/HTMLPageCollection';
import {PageRect, Point} from './BasicTypes';
import {Flip, FlipCorner, FlippingState} from './Flip/Flip';
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

export class PageFlip extends EventObject {
    private mousePosition: Point;
    private isUserTouch = false;
    private isUserMove = false;

    private readonly setting: FlipSetting = null;
    private readonly block: HTMLElement;

    private pages: PageCollection = null;
    private flipController: Flip;
    private render: Render;

    private ui: UI;

    constructor(inBlock: HTMLElement, setting: Record<string, number | string | boolean>) {
        super();

        try {
            this.setting = (new Settings()).getSettings(setting);

            this.block = inBlock;
        }
        catch (e) {
            console.log(e);
            //
        }
    }

    public destroy(): void {
        this.ui.destroy();
        this.block.remove();
    }

    public update(): void {
        this.render.update();
        this.pages.show();
    }

    public turnToPrevPage(): void {
        this.pages.showPrev();
    }

    public turnToNextPage(): void {
        this.pages.showNext();
    }

    public turnToPage(pageNum: number): void {
        this.pages.show(pageNum);
    }

    public flipNext(corner: FlipCorner = FlipCorner.TOP): void {
        this.flipController.flipNext(corner);
    }

    public flipPrev(corner: FlipCorner = FlipCorner.TOP): void {
        this.flipController.flipPrev(corner);
    }

    public flip(page: number, corner: FlipCorner = FlipCorner.TOP): void {
        this.flipController.flipToPage(page, corner);
    }

    public loadFromImages(imagesHref: string[]): void {
        this.ui = new CanvasUI(this.block, this, this.setting);

        const canvas = (this.ui as CanvasUI).getCanvas();
        this.render = new CanvasRender(this, this.setting, canvas);

        this.flipController = new Flip(this.render, this);

        this.pages = new ImagePageCollection(this, this.render, imagesHref);
        this.pages.load();

        this.render.start();

        this.pages.show(this.setting.startPage);

        // safari fix
        setTimeout(() => this.ui.update(), 1);
    }

    public updateFromImages(imagesHref: string[]): void {
        const current = this.pages.getCurrentPageIndex();

        this.pages.destroy();
        this.pages = new ImagePageCollection(this, this.render, imagesHref);
        this.pages.load();

        this.pages.show(current);
    }

    public loadFromHTML(items: NodeListOf<HTMLElement> | HTMLElement[]): void {
        this.ui = new HTMLUI(this.block, this, this.setting, items);

        this.render = new HTMLRender(this, this.setting, this.ui.getDistElement(), items);

        this.flipController = new Flip(this.render, this);

        this.pages = new HTMLPageCollection(this, this.render, this.ui.getDistElement(), items);
        this.pages.load();

        this.render.start();

        this.pages.show(this.setting.startPage);

        // safari fix
        setTimeout(() => this.ui.update(), 1);
    }

    public updateFromHtml(items: NodeListOf<HTMLElement> | HTMLElement[]): void {
        const current = this.pages.getCurrentPageIndex();

        this.pages.destroy();
        this.pages = new HTMLPageCollection(this, this.render, this.ui.getDistElement(), items);
        this.pages.load();

        this.pages.show(current);
    }

    public updateState(newState: FlippingState): void {
        this.trigger('changeState', this, newState);
    }

    public updatePageIndex(newPage: number): void {
        this.trigger('flip', this, newPage);
    }

    public updateOrientation(newOrientation: Orientation): void {
        this.ui.setOrientationStyle(newOrientation);
        this.update();
        this.trigger('changeOrientation', this, newOrientation);
    }

    public getPageCount(): number {
        return this.pages.getPageCount();
    }

    public getCurrentPageIndex(): number {
        return this.pages.getCurrentPageIndex();
    }

    public getPage(pageNum: number): Page {
        return this.pages.getPage(pageNum);
    }

    public getRender(): Render {
        return this.render;
    }

    public getFlipController(): Flip {
        return this.flipController;
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

    public getState(): FlippingState {
        return this.flipController.getState();
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
            this.flipController.showCorner(pos);
        }
        else if (this.isUserTouch) {
            if (Helper.GetDestinationFromTwoPoint(this.mousePosition, pos) > 5) {
                this.isUserMove = true;
                this.flipController.fold(pos);
            }
        }
    }

    public userStop(pos: Point, isSwipe = false): void {
        if (this.isUserTouch) {
            this.isUserTouch = false;

            if (!isSwipe) {
                if (!this.isUserMove)
                    this.flipController.flip(pos);
                else
                    this.flipController.stopMove();
            }
        }
    }
}