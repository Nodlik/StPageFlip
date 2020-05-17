import {Orientation, Render} from './Render';
import {FlipSetting} from '../App';
import {FlipDirection} from "../Flip/Flip";
import {PageOrientation} from "../Page/Page";
import {Point} from "../BasicTypes";


export class CanvasRender extends Render {
    private readonly canvas: HTMLCanvasElement;
    private readonly ctx: CanvasRenderingContext2D;

    constructor(inCanvas: HTMLCanvasElement, setting: FlipSetting) {
        super(setting);

        this.canvas = inCanvas;
        this.ctx = inCanvas.getContext('2d');
    }

    public getBlockWidth(): number {
        return this.canvas.width;
    }

    public getBlockHeight(): number {
        return this.canvas.height;
    }

    public getContext(): CanvasRenderingContext2D {
        return this.ctx;
    }

    public drawShadow(pos: Point, angle: number, t: number, direction: FlipDirection): void {
        this.shadow = {
            pos,
            angle,
            width: (this.getRect().pageWidth * 3 / 4) * t / 100,
            opacity: (100 - t) / 100,
            direction
        };
    }

    public clearShadow(): void {
        this.shadow = null;
    }

    public drawFrame(timer: number): void {
        this.clear();


        if (this.orientation !== Orientation.PORTRAIT)
            if (this.leftPage != null)
                this.leftPage.simpleDraw(PageOrientation.Left);

        if (this.rightPage != null)
            this.rightPage.simpleDraw(PageOrientation.Right);

        if (this.bottomPage != null)
            this.bottomPage.draw();

        this.drawBookShadow();

        if (this.flippingPage != null)
            this.flippingPage.draw();

        if (this.shadow != null) {
            this.drawOuterShadow();
            this.drawInnerShadow();
        }

        const rect = this.getRect();

        if (this.orientation === Orientation.PORTRAIT) {
            this.ctx.beginPath();
            this.ctx.rect(rect.left + rect.pageWidth, rect.top, rect.width, rect.height);
            this.ctx.clip();
        }
    }

    private drawBookShadow(): void {
        const rect = this.getRect();

        this.ctx.save();
        this.ctx.beginPath();

        const shadowSize = rect.width / 20;
        this.ctx.rect(rect.left, rect.top, rect.width, rect.height);

        const shadowPos = {x: (rect.left + rect.width / 2) - shadowSize / 2, y: 0};
        this.ctx.translate(shadowPos.x, shadowPos.y);

        const outerGradient = this.ctx.createLinearGradient(0, 0, shadowSize, 0);

        outerGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        outerGradient.addColorStop(0.4, 'rgba(0, 0, 0, 0.2)');
        outerGradient.addColorStop(0.49, 'rgba(0, 0, 0, 0.1)');
        outerGradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.5)');
        outerGradient.addColorStop(0.51, 'rgba(0, 0, 0, 0.4)');
        outerGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        this.ctx.clip();

        this.ctx.fillStyle = outerGradient;
        this.ctx.fillRect(0, 0, shadowSize, rect.height * 2);

        this.ctx.restore();

    }

    private drawOuterShadow(): void {
        const rect = this.getRect();

        this.ctx.save();
        this.ctx.beginPath();

        this.ctx.rect(rect.left, rect.top, rect.width, rect.height);

        const shadowPos = this.convertToGlobal({x: this.shadow.pos.x, y: this.shadow.pos.y});
        this.ctx.translate(shadowPos.x, shadowPos.y);

        this.ctx.rotate(Math.PI + this.shadow.angle + Math.PI / 2);

        const outerGradient = this.ctx.createLinearGradient(0, 0, this.shadow.width, 0);

        if (this.shadow.direction === FlipDirection.FORWARD) {
            this.ctx.translate(0, -100);
            outerGradient.addColorStop(0, 'rgba(0, 0, 0, ' + (this.shadow.opacity) + ')');
            outerGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        }
        else {
            this.ctx.translate(-this.shadow.width, -100);
            outerGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
            outerGradient.addColorStop(1, 'rgba(0, 0, 0, ' + (this.shadow.opacity) + ')');
        }

        this.ctx.clip();

        this.ctx.fillStyle = outerGradient;
        this.ctx.fillRect(0, 0, this.shadow.width, rect.height * 2);

        this.ctx.restore();
    }


    private drawInnerShadow(): void {
        const rect = this.getRect();

        this.ctx.save();
        this.ctx.beginPath();

        const shadowPos = this.convertToGlobal({x: this.shadow.pos.x, y: this.shadow.pos.y});

        this.ctx.moveTo(this.pageRect.topLeft.x, this.pageRect.topLeft.y);
        this.ctx.lineTo(this.pageRect.topRight.x, this.pageRect.topRight.y);
        this.ctx.lineTo(this.pageRect.bottomRight.x, this.pageRect.bottomRight.y);
        this.ctx.lineTo(this.pageRect.bottomLeft.x, this.pageRect.bottomLeft.y);
        this.ctx.translate(shadowPos.x, shadowPos.y);

        this.ctx.rotate(Math.PI + this.shadow.angle + Math.PI / 2);

        const isw = this.shadow.width * 3 / 4;
        const innerGradient = this.ctx.createLinearGradient(0, 0, isw, 0);

        if (this.shadow.direction === FlipDirection.FORWARD) {
            this.ctx.translate(-isw, -100);

            innerGradient.addColorStop(1, 'rgba(0, 0, 0, ' + (this.shadow.opacity) + ')');
            innerGradient.addColorStop(0.9, 'rgba(0, 0, 0, 0.05)');
            innerGradient.addColorStop(0.7, 'rgba(0, 0, 0, ' + (this.shadow.opacity) + ')');
            innerGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        }
        else {
            this.ctx.translate(0, -100);

            innerGradient.addColorStop(0, 'rgba(0, 0, 0, ' + (this.shadow.opacity) + ')');
            innerGradient.addColorStop(0.1, 'rgba(0, 0, 0, 0.05)');
            innerGradient.addColorStop(0.3, 'rgba(0, 0, 0, ' + (this.shadow.opacity) + ')');
            innerGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        }

        this.ctx.clip();

        this.ctx.fillStyle = innerGradient;
        this.ctx.fillRect(0, 0, isw, rect.height * 2);

        this.ctx.restore();
    }


    private clear(): void {
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
}