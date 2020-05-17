import {CanvasRender} from "../Render/CanvasRender";
import {Page, PageOrientation} from "./Page";
import {Orientation, Render} from "../Render/Render";
import {Point} from "../BasicTypes";

export class ImagePage extends Page {
    private readonly href: string;

    private image: HTMLImageElement = null;
    private isLoad = false;

    private loadingAngle = 0;

    constructor(render: Render, href: string) {
        super(render);

        this.href = href;
    }

    public draw(): void {
        const ctx = (this.render as CanvasRender).getContext();

        const pagePos = this.render.convertToGlobal(this.state.position);
        const pageWidth = this.render.getRect().pageWidth;
        const pageHeight = this.render.getRect().height;

        ctx.save();
        ctx.translate(pagePos.x, pagePos.y);
        ctx.beginPath();

        for (let p of this.state.area) {
            if (p !== null) {
                p = this.render.convertToGlobal(p);
                ctx.lineTo(p.x - pagePos.x, p.y - pagePos.y);
            }
        }

        ctx.rotate(this.state.angle);

        ctx.clip();

        //ctx.imageSmoothingQuality = 'high';

        if (!this.isLoad) {
            ctx.beginPath();
            ctx.strokeStyle = 'rgb(200, 200, 200)';
            ctx.fillStyle = 'rgb(255, 255, 255)';
            ctx.lineWidth = 1;
            ctx.rect( 1, 1, pageWidth - 1, pageHeight - 1);
            ctx.stroke();
            ctx.fill();

            const middlePoint: Point = {
                x: pageWidth / 2,
                y: pageHeight / 2
            };

            ctx.beginPath();
            ctx.lineWidth = 10;
            ctx.arc(middlePoint.x, middlePoint.y, 20, this.loadingAngle, 3 * Math.PI / 2 + this.loadingAngle);
            ctx.stroke();
            ctx.closePath();

            this.loadingAngle += 0.07;
            if (this.loadingAngle >= 2 * Math.PI) {
                this.loadingAngle = 0;
            }
        }
        else {
            ctx.drawImage(this.image, 0, 0, pageWidth, pageHeight);
        }

        ctx.restore();
    }

    public simpleDraw(orient: PageOrientation): void {
        const rect = this.render.getRect();
        const ctx = (this.render as CanvasRender).getContext();

        const pageWidth = rect.pageWidth;
        const pageHeight = rect.height;

        const x = (orient === PageOrientation.Right)
            ? rect.left + rect.pageWidth
            : rect.left;

        const y = rect.top;

        if (!this.isLoad) {
            ctx.beginPath();
            ctx.strokeStyle = 'rgb(200, 200, 200)';
            ctx.fillStyle = 'rgb(255, 255, 255)';
            ctx.lineWidth = 1;
            ctx.rect(x + 1, y + 1, pageWidth - 1, pageHeight - 1);
            ctx.stroke();
            ctx.fill();

            const middlePoint: Point = {
                x: x + pageWidth / 2,
                y: y + pageHeight / 2
            };

            ctx.beginPath();
            ctx.lineWidth = 10;
            ctx.arc(middlePoint.x, middlePoint.y, 20, this.loadingAngle, 3 * Math.PI / 2 + this.loadingAngle);
            ctx.stroke();
            ctx.closePath();

            this.loadingAngle += 0.07;
            if (this.loadingAngle >= 2 * Math.PI) {
                this.loadingAngle = 0;
            }
        }
        else {
            ctx.drawImage(this.image, x, y, pageWidth, pageHeight);
        }
    }

    public async load(): Promise<Page> {
        if (this.image == null) {
            this.image = new Image();
            this.image.src = this.href;
        }

        if (this.isLoad) {
            return Promise.resolve(this);
        }

        return new Promise<Page>((resolve) => {
            /*setTimeout(() => {
                this.isLoad = true;
                resolve(this);
            }, 5000); */

            this.image.onload = () => {
                this.isLoad = true;
                resolve(this);
            };
        });
    }
}
