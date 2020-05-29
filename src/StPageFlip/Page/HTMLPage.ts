import {Page, PageDensity, PageOrientation} from "./Page";
import {Render} from "../Render/Render";
import {Helper} from "../Helper";
import {FlipDirection} from "../Flip/Flip";
import {Point} from "../BasicTypes";

export class HTMLPage extends Page {
    private readonly element: HTMLElement;
    private copiedElement: HTMLElement = null;

    private isLoad = false;

    constructor(render: Render, element: HTMLElement, density: PageDensity) {
        super(render, density);

        this.element = element;
        this.element.classList.add('stf__item');
        this.element.classList.add('--' + density);
    }

    public draw(tempDensity?: PageDensity): void {
        const density = tempDensity ? tempDensity : this.nowDrawingDensity;

        const pagePos = this.render.convertToGlobal(this.state.position);
        const pageWidth = this.render.getRect().pageWidth;
        const pageHeight = this.render.getRect().height;

        this.element.classList.remove('--simple');

        this.element.style.display = "block";
        this.element.style.left = "0";
        this.element.style.top = "0";

        this.element.style.width = pageWidth + "px";
        this.element.style.height = pageHeight + "px";

        if (density === PageDensity.HARD)
            this.drawHard();
        else
            this.drawSoft(pagePos);
    }

    private drawHard(): void{
        const pos = this.render.getRect().left + this.render.getRect().width / 2;
        this.element.style.backfaceVisibility = 'hidden';
        this.element.style.setProperty('-webkit-backface-visibility', "hidden");

        const angle = this.state.hardDrawingAngle;

        if (this.orientation === PageOrientation.LEFT) {
            this.element.style.transformOrigin = this.render.getRect().pageWidth + 'px 0';
            this.element.style.transform = "translate(" + 0 + "px, " + 0 + "px) rotateY(" + angle + "deg)";
        }
        else {
            this.element.style.transformOrigin = "0 0";
            this.element.style.transform = "translate3d(" + pos + "px, " + 0 + "px, 0) rotateY(" + angle + "deg)";
        }
        this.element.style.clipPath = "none";
        this.element.style.setProperty('-webkit-clip-path', "none");
    }

    private drawSoft(position: Point): void {
        this.element.style.transformOrigin = "0 0";

        let polygon = 'polygon( ';
        for (const p of this.state.area) {
            if (p !== null) {
                let g = (this.render.getDirection() === FlipDirection.BACK)
                    ? {
                        x: -p.x + this.state.position.x,
                        y: p.y - this.state.position.y
                    }
                    : {
                        x: p.x - this.state.position.x,
                        y: p.y - this.state.position.y
                    };

                g = Helper.GetRotatedPoint(g, {x: 0, y: 0}, this.state.angle);
                polygon += g.x + 'px ' + g.y + 'px, ';
            }
        }
        polygon = polygon.slice(0, -2);
        polygon += ')';

        this.element.style.clipPath = polygon;
        this.element.style.setProperty('-webkit-clip-path', polygon);

        this.element.style.transform = "translate3d(" + position.x + "px, " + position.y + "px, 0) rotate(" + this.state.angle + "rad)";

    }

    public simpleDraw(orient: PageOrientation): void {
        if (this.element.classList.contains('--simple'))
            return;

        if (this.copiedElement === null) {
            this.copiedElement = this.element.cloneNode(true) as HTMLElement;
            this.element.parentElement.appendChild(this.copiedElement);
        }

        const rect = this.render.getRect();

        const pageWidth = rect.pageWidth;
        const pageHeight = rect.height;

        const x = (orient === PageOrientation.RIGHT)
            ? rect.left + rect.pageWidth
            : rect.left;

        const y = rect.top;

        this.element.classList.add('--simple');
        this.copiedElement.style.cssText = "position: absolute; display: block; height: " + pageHeight + "px; left: " +
            x + "px; top: " + y + "px; width: " + pageWidth + "px; z-index: " + (this.render.getSettings().startZIndex + 1) + ";";

        this.element.style.cssText = "display: none";
    }

    public clearSaved(): void {
        this.element.classList.remove('--simple');

        if (this.copiedElement !== null) {
            this.copiedElement.remove();
            this.copiedElement = null;
        }
    }

    public getElement(): HTMLElement {
        return this.element;
    }

    public load(): void {
        this.isLoad = true;
    }

    public setOrientation(orientation: PageOrientation): void {
        super.setOrientation(orientation);
        this.element.classList.remove('--left', '--right');

        this.element.classList.add(
            (orientation === PageOrientation.RIGHT)
                ? '--right'
                : '--left'
        );
    }

    public setDrawingDensity(density: PageDensity): void {
        this.element.classList.remove('--soft', '--hard');
        this.element.classList.add('--' + density);

        super.setDrawingDensity(density);
    }
}
