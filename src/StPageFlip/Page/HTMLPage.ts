import {Page, PageOrientation} from "./Page";
import {Render} from "../Render/Render";
import {Helper} from "../Helper";
import {FlipDirection} from "../Flip/Flip";

export class HTMLPage extends Page {
    private readonly element: HTMLElement;
    private copiedElement: HTMLElement = null;

    private isLoad = false;

    constructor(render: Render, element: HTMLElement) {
        super(render);

        this.element = element;
    }

    public draw(): void {
        const pagePos = this.render.convertToGlobal(this.state.position);
        const pageWidth = this.render.getRect().pageWidth;
        const pageHeight = this.render.getRect().height;

        this.copiedElement = null;
        this.element.classList.remove('--simple');
        this.element.style.display = "block";
        this.element.style.transformOrigin = "0 0";
        this.element.style.left = "0";
        this.element.style.top = "0";
        this.element.style.width = pageWidth + "px";
        this.element.style.height = pageHeight + "px";

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

        this.element.style.transform = "translate(" + pagePos.x + "px, " + pagePos.y + "px) rotate(" + this.state.angle + "rad)";
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

        const x = (orient === PageOrientation.Right)
            ? rect.left + rect.pageWidth
            : rect.left;

        const y = rect.top;

        this.element.classList.add('--simple');
        this.copiedElement.style.cssText = "position: absolute; display: block; height: " + pageHeight + "px; left: " +
            x + "px; top: " + y + "px; width: " + pageWidth + "px; z-index: 2";
        this.element.style.cssText = "display: none";
    }

    public getElement(): HTMLElement {
        return this.element;
    }

    public async load(): Promise<Page> {
        this.isLoad = true;

        return this;
    }
}
