import {Orientation, Render} from './Render';
import {FlipSetting} from '../App';
import {FlipDirection} from "../Flip/Flip";
import {Page, PageOrientation} from "../Page/Page";
import {Point} from "../BasicTypes";
import {HTMLPage} from "../Page/HTMLPage";
import {Helper} from "../Helper";

export class HTMLRender extends Render {
    private readonly element: HTMLElement;
    private readonly items: NodeListOf<HTMLElement>;

    private outerShadow: HTMLElement = null;
    private innerShadow: HTMLElement = null;

    constructor(element: HTMLElement, setting: FlipSetting) {
        super(setting);

        this.element = element;
        this.items = element.querySelectorAll('.stf__item');
    }

    public getBlockWidth(): number {
        return this.element.offsetWidth;
    }

    public getBlockHeight(): number {
        return this.element.offsetHeight;
    }

    public clearShadow(): void {
        super.clearShadow();

        this.element.querySelector('.stf__outerShadow').remove();
        this.element.querySelector('.stf__innerShadow').remove();

        this.outerShadow = null;
        this.innerShadow = null;
    }

    public drawShadow(pos: Point, angle: number, t: number, direction: FlipDirection, length: number): void {
        super.drawShadow(pos, angle, t, direction, length);

        if (this.outerShadow === null) {
            this.element.insertAdjacentHTML('beforeend', '<div class="stf__outerShadow"></div>');
            this.outerShadow = this.element.querySelector('.stf__outerShadow');
        }

        if (this.innerShadow === null) {
            this.element.insertAdjacentHTML('beforeend', '<div class="stf__innerShadow"></div>');
            this.innerShadow = this.element.querySelector('.stf__innerShadow');
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

        this.innerShadow.style.left = shadowPos.x + 'px';
        this.innerShadow.style.top = shadowPos.y + 'px';
        this.innerShadow.style.width = innerShadowSize  + 'px';
        this.innerShadow.style.height = rect.height * 2 + 'px';
        this.innerShadow.style.background = "linear-gradient(" + shadowDirection + ", " +
            "rgba(0, 0, 0, " + this.shadow.opacity + ") 5%, " +
            "rgba(0, 0, 0, 0.05) 15%," +
            "rgba(0, 0, 0, " + this.shadow.opacity + ") 35%, " +
            "rgba(0, 0, 0, 0) 100% " +
            ")";

        this.innerShadow.style.transformOrigin = shadowTranslate + "px 100px";
        this.innerShadow.style.transform = "translate(" + (-shadowTranslate) + "px, -100px) rotate(" + angle + "rad)";

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

        this.outerShadow.style.left = shadowPos.x + 'px';
        this.outerShadow.style.top = shadowPos.y + 'px';
        this.outerShadow.style.width = this.shadow.width + 'px';
        this.outerShadow.style.height = rect.height * 2 + 'px';
        this.outerShadow.style.background = "linear-gradient(" + shadowDirection + ", rgba(0, 0, 0, " + this.shadow.opacity + "), rgba(0, 0, 0, 0))";
        this.outerShadow.style.transformOrigin = shadowTranslate + "px 100px"; //
        this.outerShadow.style.transform = "translate(" + (-shadowTranslate) + "px, -100px) rotate(" + angle + "rad)";

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
    }

    public drawFrame(timer: number): void {
        this.clear();

        if (this.orientation !== Orientation.PORTRAIT)
            if (this.leftPage != null)
                this.leftPage.simpleDraw(PageOrientation.Left);

        if (this.rightPage != null)
            this.rightPage.simpleDraw(PageOrientation.Right);

        if (this.bottomPage != null) {
            (this.bottomPage as HTMLPage).getElement().style.zIndex = "3";
            this.bottomPage.draw();
        }

        if (this.flippingPage != null) {
            (this.flippingPage as HTMLPage).getElement().style.zIndex = "4";
            this.flippingPage.draw();
        }

        if (this.shadow != null) {
            this.drawOuterShadow();
            this.drawInnerShadow();
        }
    }

    private clear(): void {
        for (const item of this.items) {
            if ((item !== (this.leftPage as HTMLPage).getElement()) && (item !== (this.rightPage as HTMLPage).getElement())) {
                item.style.display = "none";
                item.style.zIndex = "1";
                item.style.transform = "";
            }
        }
    }


    public setFlippingPage(page: Page): void {
        super.setFlippingPage(page);
    }
}