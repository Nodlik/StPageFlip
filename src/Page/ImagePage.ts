import { CanvasRender } from '../Render/CanvasRender';
import { Page, PageDensity, PageOrientation } from './Page';
import { Render } from '../Render/Render';
import { Box, ImageWithTrimData, Point } from '../BasicTypes';
import { BindingEdge } from '../Settings';

/**
 * Class representing a book page as an image on Canvas
 */
export class ImagePage extends Page {
    private readonly image: HTMLImageElement = null;
    private readonly imageWithTrimData: ImageWithTrimData = null;
    private isLoad = false;

    private loadingAngle = 0;

    constructor(render: Render, image: ImageWithTrimData, density: PageDensity) {
        super(render, density);
        
        this.imageWithTrimData = image;
        
        this.image = new Image();
        if (!image.href || image.href.trim() === '') {
            this.image.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=';
        } else {
            this.image.src = image.href;
        }
    }

    public draw(tempDensity?: PageDensity, bindingEdge?: BindingEdge): void {
        const ctx = (this.render as CanvasRender).getContext();

        const pagePos = this.render.convertToGlobal(this.state.position);
        
        const pageWidth = this.render.getRect().pageWidth;
        const pageHeight = this.render.getRect().pageHeight;

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

        if (!this.isLoad) {
            this.drawLoader(ctx, { x: 0, y: 0 }, pageWidth, pageHeight);
        } else {
            
            if(this.imageWithTrimData.cropBox && this.imageWithTrimData.trimBox) {
                const ratios = this.calculateCropToTrimRatios(this.imageWithTrimData.cropBox, this.imageWithTrimData.trimBox);

                const trimWidth = this.imageWithTrimData.trimBox.right - this.imageWithTrimData.trimBox.left;
                const trimHeight = this.imageWithTrimData.trimBox.bottom - this.imageWithTrimData.trimBox.top;
                const isPortrait = trimHeight > trimWidth;
                const aspectRatio = isPortrait ? trimWidth / trimHeight : trimHeight / trimWidth; // keep aspect ratio between 0-1 otherwise canvas gets stretched

                const srcX = ratios.left * this.image.naturalWidth;
                const srcY = ratios.top * this.image.naturalHeight;
                const srcWidth = ratios.width * this.image.naturalWidth;
                const srcHeight = ratios.height * this.image.naturalHeight;

                ctx.drawImage(this.image,
                    srcX, srcY, srcWidth, srcHeight,
                    0, 0, pageWidth, pageHeight
                );
            } else {
                ctx.drawImage(this.image, 0, 0, pageWidth, pageHeight);
            }
        }

        ctx.restore();
    }

    public simpleDraw(orient: PageOrientation): void {
        const rect = this.render.getRect();
        const ctx = (this.render as CanvasRender).getContext();

        const pageWidth = orient === PageOrientation.RIGHT || orient === PageOrientation.LEFT ? rect.pageWidth : rect.width;
        const pageHeight = orient === PageOrientation.RIGHT || orient === PageOrientation.LEFT ? rect.height : rect.pageHeight;

        //console.log(rect, orient);

        let x = orient === PageOrientation.RIGHT ? rect.left + rect.pageWidth : rect.left;
        let y = rect.top;

        if(orient === PageOrientation.TOP) {
            x = rect.left;
            y = rect.top;
        }

        if(orient === PageOrientation.BOTTOM) {
            x = rect.left;
            y = rect.top + rect.pageHeight;
        }

        if (!this.isLoad) {
            this.drawLoader(ctx, { x, y }, pageWidth, pageHeight);
        } else {

            if(this.imageWithTrimData.cropBox && this.imageWithTrimData.trimBox) {
                const ratios = this.calculateCropToTrimRatios(this.imageWithTrimData.cropBox, this.imageWithTrimData.trimBox);

                const trimWidth = this.imageWithTrimData.trimBox.right - this.imageWithTrimData.trimBox.left;
                const trimHeight = this.imageWithTrimData.trimBox.bottom - this.imageWithTrimData.trimBox.top;
                const isPortrait = trimHeight > trimWidth;
                const aspectRatio = isPortrait ? trimWidth / trimHeight : trimHeight / trimWidth; // keep aspect ratio between 0-1 otherwise canvas gets stretched

                const srcX = ratios.left * this.image.naturalWidth;
                const srcY = ratios.top * this.image.naturalHeight;
                const srcWidth = ratios.width * this.image.naturalWidth;
                const srcHeight = ratios.height * this.image.naturalHeight;

                ctx.drawImage(this.image,
                    srcX, srcY, srcWidth, srcHeight,
                    x, y, pageWidth, pageHeight);
            } else {
                ctx.drawImage(this.image, x, y, pageWidth, pageHeight);
            }
        }
    }

    private drawLoader(
        ctx: CanvasRenderingContext2D,
        shiftPos: Point,
        pageWidth: number,
        pageHeight: number
    ): void {
        ctx.beginPath();
        ctx.strokeStyle = 'rgb(200, 200, 200)';
        ctx.fillStyle = 'rgb(255, 255, 255)';
        ctx.lineWidth = 1;
        ctx.rect(shiftPos.x + 1, shiftPos.y + 1, pageWidth - 1, pageHeight - 1);
        ctx.stroke();
        ctx.fill();

        const middlePoint: Point = {
            x: shiftPos.x + pageWidth / 2,
            y: shiftPos.y + pageHeight / 2,
        };

        ctx.beginPath();
        ctx.lineWidth = 10;
        ctx.arc(
            middlePoint.x,
            middlePoint.y,
            20,
            this.loadingAngle,
            (3 * Math.PI) / 2 + this.loadingAngle
        );
        ctx.stroke();
        ctx.closePath();

        this.loadingAngle += 0.07;
        if (this.loadingAngle >= 2 * Math.PI) {
            this.loadingAngle = 0;
        }
    }

    public load(): void {
        if (!this.isLoad)
            this.image.onload = (): void => {
                this.isLoad = true;
            };
    }

    public newTemporaryCopy(): Page {
        return this;
    }

    public getTemporaryCopy(): Page {
        return this;
    }

    public hideTemporaryCopy(): void {
        return;
    }

    public calculateCropToTrimRatios(cropBox: Box, trimBox: Box): any {
        const cropWidth = cropBox.right - cropBox.left;
        const cropHeight = cropBox.bottom - cropBox.top;
        const trimWidth = trimBox.right - trimBox.left;
        const trimHeight = trimBox.bottom - trimBox.top;
    
        return {
            top: (trimBox.top - cropBox.top) / cropHeight,
            left: (trimBox.left - cropBox.left) / cropWidth,
            width: trimWidth / cropWidth,
            height: trimHeight / cropHeight
        };
    }
}
