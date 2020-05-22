import {Orientation, Render} from './Render';
import {App} from '../App';
import {FlipDirection} from "../Flip/Flip";
import {Page, PageOrientation} from "../Page/Page";
import {Point} from "../BasicTypes";
import {HTMLPage} from "../Page/HTMLPage";
import {Helper} from "../Helper";
import {FlipSetting} from "../Settings";

export class HTMLRender extends Render {
    private readonly element: HTMLElement;
    private readonly items: NodeListOf<HTMLElement> | HTMLElement[];

    private outerShadow: HTMLElement = null;
    private innerShadow: HTMLElement = null;

    constructor(app: App, setting: FlipSetting, element: HTMLElement, items: NodeListOf<HTMLElement> | HTMLElement[]) {
        super(app, setting);

        this.element = element;
        this.items = items;
    }

    public getBlockWidth(): number {
        return this.element.offsetWidth;
    }

    public getBlockHeight(): number {
        return this.element.offsetHeight;
    }

    public clearShadow(): void {
        super.clearShadow();

        this.outerShadow.remove();
        this.innerShadow.remove();

        this.outerShadow = null;
        this.innerShadow = null;
    }

    public drawShadow(pos: Point, angle: number, t: number, direction: FlipDirection, length: number): void {
        super.drawShadow(pos, angle, t, direction, length);

        if (this.outerShadow === null) {
            this.element.insertAdjacentHTML('beforeend', '<div class="stf__outerShadow"></div>');
            this.outerShadow = this.element.querySelector('.stf__outerShadow');
            this.outerShadow.style.zIndex =  (this.getSettings().startZIndex + 10).toString(10);
            this.outerShadow.style.left = "0px";
            this.outerShadow.style.top = "0px";
        }

        if (this.innerShadow === null) {
            this.element.insertAdjacentHTML('beforeend', '<div class="stf__innerShadow"></div>');
            this.innerShadow = this.element.querySelector('.stf__innerShadow');
            this.innerShadow.style.zIndex =  (this.getSettings().startZIndex + 10).toString(10);
            this.innerShadow.style.left = "0px";
            this.innerShadow.style.top = "0px";
        }
    }

    private drawInnerShadow(): void {
        const rect = this.getRect();

        const innerShadowSize = this.shadow.width * 3 / 4;
        const shadowTranslate = (this.getDirection() === FlipDirection.FORWARD)
            ? innerShadowSize
            : 0;

        const shadowDirection =  (this.getDirection() === FlipDirection.FORWARD)
            ? "to left"
            : "to right";

        const shadowPos = this.convertToGlobal(this.shadow.pos);

        const angle = this.shadow.angle + 3 * Math.PI / 2;

        this.innerShadow.style.width = innerShadowSize  + 'px';
        this.innerShadow.style.height = rect.height * 2 + 'px';
        this.innerShadow.style.background = "linear-gradient(" + shadowDirection + ", " +
            "rgba(0, 0, 0, " + this.shadow.opacity + ") 5%, " +
            "rgba(0, 0, 0, 0.05) 15%," +
            "rgba(0, 0, 0, " + this.shadow.opacity + ") 35%, " +
            "rgba(0, 0, 0, 0) 100% " +
            ")";

        this.innerShadow.style.transformOrigin = shadowTranslate + "px 100px";
        this.innerShadow.style.transform = "translate3d(" + (shadowPos.x - shadowTranslate) + "px, " + (shadowPos.y - 100) + "px, 0) rotate(" + angle + "rad)";

        const clip = [this.pageRect.topLeft, this.pageRect.topRight,
            this.pageRect.bottomRight, this.pageRect.bottomLeft];

        let polygon = 'polygon( ';
        for (const p of clip) {
            let g = (this.getDirection() === FlipDirection.BACK)
                ? {
                    x: -p.x + this.shadow.pos.x,
                    y: p.y - this.shadow.pos.y
                }
                : {
                    x: p.x - this.shadow.pos.x,
                    y: p.y - this.shadow.pos.y
                };

            g = Helper.GetRotatedPoint(g, {x: shadowTranslate, y: 100}, angle);

            polygon += g.x + 'px ' + g.y + 'px, ';
        }
        polygon = polygon.slice(0, -2);
        polygon += ')';

        this.innerShadow.style.clipPath = polygon;
        this.innerShadow.style.setProperty('-webkit-clip-path', polygon);
    }

    private drawOuterShadow(): void {
        const rect = this.getRect();

        const shadowPos = this.convertToGlobal({x: this.shadow.pos.x, y: this.shadow.pos.y});

        const angle = this.shadow.angle + 3 * Math.PI / 2;
        const shadowTranslate = (this.getDirection() === FlipDirection.BACK)
            ? this.shadow.width
            : 0;

        const shadowDirection =  (this.getDirection() === FlipDirection.FORWARD)
            ? "to right"
            : "to left";

        this.outerShadow.style.width = this.shadow.width + 'px';
        this.outerShadow.style.height = rect.height * 2 + 'px';
        this.outerShadow.style.background = "linear-gradient(" + shadowDirection + ", rgba(0, 0, 0, " + this.shadow.opacity + "), rgba(0, 0, 0, 0))";
        this.outerShadow.style.transformOrigin = shadowTranslate + "px 100px"; //
        this.outerShadow.style.transform = "translate3d(" + (shadowPos.x -shadowTranslate) + "px, " + (shadowPos.y -100) + "px, 0) rotate(" + angle + "rad)";

        const clip = [];
        clip.push(
            {x: 0, y: 0 },
            {x: rect.pageWidth, y: 0 },
            {x: rect.pageWidth, y: rect.height },
            {x: 0, y: rect.height }
        );

        let polygon = 'polygon( ';
        for (const p of clip) {
            if (p !== null) {
                let g = (this.getDirection() === FlipDirection.BACK)
                    ? {
                        x: -p.x + this.shadow.pos.x,
                        y: p.y - this.shadow.pos.y
                    }
                    : {
                        x: p.x - this.shadow.pos.x,
                        y: p.y - this.shadow.pos.y
                    };

                g = Helper.GetRotatedPoint(g, {x: shadowTranslate, y: 100}, angle);

                polygon += g.x + 'px ' + g.y + 'px, ';
            }
        }

        polygon = polygon.slice(0, -2);
        polygon += ')';
        this.outerShadow.style.clipPath = polygon;
        this.outerShadow.style.setProperty('-webkit-clip-path', polygon);
    }

    public drawFrame(timer: number): void {
        this.clear();

        if (this.orientation !== Orientation.PORTRAIT) {
            if (this.leftPage != null)
                this.leftPage.simpleDraw(PageOrientation.Left);
        }
        else {
            if (this.leftPage != null)
                (this.leftPage as HTMLPage).clearSaved();
        }

        if (this.rightPage != null)
            this.rightPage.simpleDraw(PageOrientation.Right);

        if (this.bottomPage != null) {
            if ( !((this.orientation === Orientation.PORTRAIT) && (this.direction === FlipDirection.BACK)) ) {
                (this.bottomPage as HTMLPage).getElement().style.zIndex =
                    (this.getSettings().startZIndex + 3).toString(10);

                this.bottomPage.draw();
            }
        }

        if (this.flippingPage != null) {
            (this.flippingPage as HTMLPage).getElement().style.zIndex =
                (this.getSettings().startZIndex + 4).toString(10);

            this.flippingPage.draw();
        }

        if (this.shadow != null) {
            this.drawOuterShadow();
            this.drawInnerShadow();
        }
    }

    private clear(): void {
        const workedPages = [];
        if (this.leftPage)
            workedPages.push((this.leftPage as HTMLPage).getElement());

        if (this.rightPage)
            workedPages.push((this.rightPage as HTMLPage).getElement());

        if (this.flippingPage)
            workedPages.push((this.flippingPage as HTMLPage).getElement());

        if (this.bottomPage)
            workedPages.push((this.bottomPage as HTMLPage).getElement());

        for (const item of this.items) {
            if (!workedPages.includes(item)) {
                item.style.display = "none";
                item.style.zIndex =  (this.getSettings().startZIndex + 1).toString(10);
                item.style.transform = "";
            }
        }
    }

    private clearClass(page: HTMLPage) {
        if (page !== null) {
            page.getElement().classList.remove('--left', '--right');
        }
    }

    public setRightPage(page: Page): void {
        this.clearClass(this.rightPage as HTMLPage);

        if ((this.rightPage !== null) && (page !== this.rightPage))
            (this.rightPage as HTMLPage).clearSaved();

        if (page !== null)
            (page as HTMLPage).getElement().classList.add('--right');

        super.setRightPage(page);
    }

    public setLeftPage(page: Page): void {
        this.clearClass(this.leftPage as HTMLPage);

        if ((this.leftPage !== null) && (page !== this.rightPage))
            (this.leftPage as HTMLPage).clearSaved();

        if (page !== null)
            (page as HTMLPage).getElement().classList.add('--left');

        super.setLeftPage(page);
    }

    public setBottomPage(page: Page): void {
        if (page !== null)
            (page as HTMLPage).getElement().classList.add(
                (this.direction === FlipDirection.BACK)
                    ? '--left'
                    : '--right'
            );

        super.setBottomPage(page);
    }

    public setFlippingPage(page: Page): void {
        if (page !== null)
            (page as HTMLPage).getElement().classList.add(
                (this.direction === FlipDirection.BACK)
                    ? '--right'
                    : '--left'
            );

        super.setFlippingPage(page);
    }

    public update(): void {
        super.update();

        if (this.rightPage !== null)
            (this.rightPage as HTMLPage).clearSaved();

        if (this.leftPage !== null)
            (this.leftPage as HTMLPage).clearSaved();
    }
}