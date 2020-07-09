import { Helper } from '../Helper';
import { Point, Rect, RectPoints, Segment } from '../BasicTypes';
import { FlipCorner, FlipDirection } from './Flip';

/**
 * Class representing mathematical methods for calculating page position (rotation angle, clip area ...)
 */
export class FlipCalculation {
    /** Calculated rotation angle to flipping page */
    private angle: number;
    /** Calculated position to flipping page */
    private position: Point;

    private rect: RectPoints;

    /** The point of intersection of the page with the borders of the book */
    private topIntersectPoint: Point = null; // With top border
    private sideIntersectPoint: Point = null; // With side border
    private bottomIntersectPoint: Point = null; // With bottom border

    private readonly pageWidth: number;
    private readonly pageHeight: number;

    /**
     * @constructor
     *
     * @param {FlipDirection} direction - Flipping direction
     * @param {FlipCorner} corner - Flipping corner
     * @param pageWidth - Current page width
     * @param pageHeight - Current page height
     */
    constructor(
        private direction: FlipDirection,
        private corner: FlipCorner,

        pageWidth: string,
        pageHeight: string
    ) {
        this.pageWidth = parseInt(pageWidth, 10);
        this.pageHeight = parseInt(pageHeight, 10);
    }

    /**
     * The main calculation method
     * 
     * @param {Point} localPos - Touch Point Coordinates (relative active page!)
     * 
     * @returns {boolean} True - if the calculations were successful, false if errors occurred
     */
    public calc(localPos: Point): boolean {
        try {
            // Find: page rotation angle and active corner position
            this.position = this.calcAngleAndPosition(localPos);
            // Find the intersection points of the scrolling page and the book
            this.calculateIntersectPoint(this.position);

            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * Get the crop area for the flipping page
     * 
     * @returns {Point[]} Polygon page
     */
    public getFlippingClipArea(): Point[] {
        const result = [];
        let clipBottom = false;

        result.push(this.rect.topLeft);
        result.push(this.topIntersectPoint);

        if (this.sideIntersectPoint === null) {
            clipBottom = true;
        } else {
            result.push(this.sideIntersectPoint);

            if (this.bottomIntersectPoint === null) clipBottom = false;
        }

        result.push(this.bottomIntersectPoint);

        if (clipBottom || this.corner === FlipCorner.BOTTOM) {
            result.push(this.rect.bottomLeft);
        }

        return result;
    }

    /**
     * Get the crop area for the page that is below the page to be flipped
     * 
     * @returns {Point[]} Polygon page
     */
    public getBottomClipArea(): Point[] {
        const result = [];

        result.push(this.topIntersectPoint);

        if (this.corner === FlipCorner.TOP) {
            result.push({ x: this.pageWidth, y: 0 });
        } else {
            if (this.topIntersectPoint !== null) {
                result.push({ x: this.pageWidth, y: 0 });
            }
            result.push({ x: this.pageWidth, y: this.pageHeight });
        }

        if (this.sideIntersectPoint !== null) {
            if (
                Helper.GetDistanceBetweenTwoPoint(
                    this.sideIntersectPoint,
                    this.topIntersectPoint
                ) >= 10
            )
                result.push(this.sideIntersectPoint);
        } else {
            if (this.corner === FlipCorner.TOP) {
                result.push({ x: this.pageWidth, y: this.pageHeight });
            }
        }

        result.push(this.bottomIntersectPoint);
        result.push(this.topIntersectPoint);

        return result;
    }

    /**
     * Get page rotation angle
     */
    public getAngle(): number {
        if (this.direction === FlipDirection.FORWARD) {
            return -this.angle;
        }

        return this.angle;
    }

    /**
     * Get page area while flipping
     */
    public getRect(): RectPoints {
        return this.rect;
    }

    /**
     * Get the position of the active angle when turning
     */
    public getPosition(): Point {
        return this.position;
    }

    /**
     * Get the active corner of the page (which pull)
     */
    public getActiveCorner(): Point {
        if (this.direction === FlipDirection.FORWARD) {
            return this.rect.topLeft;
        }

        return this.rect.topRight;
    }

    /**
     * Get flipping direction
     */
    public getDirection(): FlipDirection {
        return this.direction;
    }

    /**
     * Get flipping progress (0-100)
     */
    public getFlippingProgress(): number {
        return Math.abs(((this.position.x - this.pageWidth) / (2 * this.pageWidth)) * 100);
    }
    
    /**
     * Get flipping corner position (top, bottom)
     */
    public getCorner(): FlipCorner {
        return this.corner;
    }

    /**
     * Get start position for the page that is below the page to be flipped
     */
    public getBottomPagePosition(): Point {
        if (this.direction === FlipDirection.BACK) {
            return { x: this.pageWidth, y: 0 };
        }

        return { x: 0, y: 0 };
    }

    /**
     * Get the starting position of the shadow
     */
    public getShadowStartPoint(): Point {
        if (this.corner === FlipCorner.TOP) {
            return this.topIntersectPoint;
        } else {
            if (this.sideIntersectPoint !== null) return this.sideIntersectPoint;

            return this.topIntersectPoint;
        }
    }

    /**
     * Get the rotate angle of the shadow
     */
    public getShadowAngle(): number {
        const angle = Helper.GetAngleBetweenTwoLine(this.getSegmentToShadowLine(), [
            { x: 0, y: 0 },
            { x: this.pageWidth, y: 0 },
        ]);

        if (this.direction === FlipDirection.FORWARD) {
            return angle;
        }

        return Math.PI - angle;
    }

    private calcAngleAndPosition(pos: Point): Point {
        let result = pos;

        this.updateAngleAndGeometry(result);

        if (this.corner === FlipCorner.TOP) {
            result = this.checkPositionAtCenterLine(
                result,
                { x: 0, y: 0 },
                { x: 0, y: this.pageHeight }
            );
        } else {
            result = this.checkPositionAtCenterLine(
                result,
                { x: 0, y: this.pageHeight },
                { x: 0, y: 0 }
            );
        }

        if (Math.abs(result.x - this.pageWidth) < 1 && Math.abs(result.y) < 1) {
            throw new Error('Point is too small');
        }

        return result;
    }

    private updateAngleAndGeometry(pos: Point): void {
        this.angle = this.calculateAngle(pos);
        this.rect = this.getPageRect(pos);
    }

    private calculateAngle(pos: Point): number {
        const left = this.pageWidth - pos.x + 1;
        const top = this.corner === FlipCorner.BOTTOM ? this.pageHeight - pos.y : pos.y;

        let angle = 2 * Math.acos(left / Math.sqrt(top * top + left * left));

        if (top < 0) angle = -angle;

        const da = Math.PI - angle;
        if (!isFinite(angle) || (da >= 0 && da < 0.003))
            throw new Error('The G point is too small');

        if (this.corner === FlipCorner.BOTTOM) angle = -angle;

        return angle;
    }


    private getPageRect(localPos: Point): RectPoints {
        if (this.corner === FlipCorner.TOP) {
            return this.getRectFromBasePoint(
                [
                    { x: 0, y: 0 },
                    { x: this.pageWidth, y: 0 },
                    { x: 0, y: this.pageHeight },
                    { x: this.pageWidth, y: this.pageHeight },
                ],
                localPos
            );
        }

        return this.getRectFromBasePoint(
            [
                { x: 0, y: -this.pageHeight },
                { x: this.pageWidth, y: -this.pageHeight },
                { x: 0, y: 0 },
                { x: this.pageWidth, y: 0 },
            ],
            localPos
        );
    }

    private getRectFromBasePoint(points: Point[], localPos: Point): RectPoints {
        return {
            topLeft: this.getRotatedPoint(points[0], localPos),
            topRight: this.getRotatedPoint(points[1], localPos),
            bottomLeft: this.getRotatedPoint(points[2], localPos),
            bottomRight: this.getRotatedPoint(points[3], localPos),
        };
    }

    private getRotatedPoint(transformedPoint: Point, startPoint: Point): Point {
        return {
            x:
                transformedPoint.x * Math.cos(this.angle) +
                transformedPoint.y * Math.sin(this.angle) +
                startPoint.x,
            y:
                transformedPoint.y * Math.cos(this.angle) -
                transformedPoint.x * Math.sin(this.angle) +
                startPoint.y,
        };
    }

    private calculateIntersectPoint(pos: Point): void {
        const boundRect: Rect = {
            left: -1,
            top: -1,
            width: this.pageWidth + 2,
            height: this.pageHeight + 2,
        };

        if (this.corner === FlipCorner.TOP) {
            this.topIntersectPoint = Helper.GetIntersectBetweenTwoSegment(
                boundRect,
                [pos, this.rect.topRight],
                [
                    { x: 0, y: 0 },
                    { x: this.pageWidth, y: 0 },
                ]
            );

            this.sideIntersectPoint = Helper.GetIntersectBetweenTwoSegment(
                boundRect,
                [pos, this.rect.bottomLeft],
                [
                    { x: this.pageWidth, y: 0 },
                    { x: this.pageWidth, y: this.pageHeight },
                ]
            );

            this.bottomIntersectPoint = Helper.GetIntersectBetweenTwoSegment(
                boundRect,
                [this.rect.bottomLeft, this.rect.bottomRight],
                [
                    { x: 0, y: this.pageHeight },
                    { x: this.pageWidth, y: this.pageHeight },
                ]
            );
        } else {
            this.topIntersectPoint = Helper.GetIntersectBetweenTwoSegment(
                boundRect,
                [this.rect.topLeft, this.rect.topRight],
                [
                    { x: 0, y: 0 },
                    { x: this.pageWidth, y: 0 },
                ]
            );

            this.sideIntersectPoint = Helper.GetIntersectBetweenTwoSegment(
                boundRect,
                [pos, this.rect.topLeft],
                [
                    { x: this.pageWidth, y: 0 },
                    { x: this.pageWidth, y: this.pageHeight },
                ]
            );

            this.bottomIntersectPoint = Helper.GetIntersectBetweenTwoSegment(
                boundRect,
                [this.rect.bottomLeft, this.rect.bottomRight],
                [
                    { x: 0, y: this.pageHeight },
                    { x: this.pageWidth, y: this.pageHeight },
                ]
            );
        }
    }

    private checkPositionAtCenterLine(
        checkedPos: Point,
        centerOne: Point,
        centerTwo: Point
    ): Point {
        let result = checkedPos;

        const tmp = Helper.LimitPointToCircle(centerOne, this.pageWidth, result);
        if (result !== tmp) {
            result = tmp;
            this.updateAngleAndGeometry(result);
        }

        const rad = Math.sqrt(Math.pow(this.pageWidth, 2) + Math.pow(this.pageHeight, 2));

        let checkPointOne = this.rect.bottomRight;
        let checkPointTwo = this.rect.topLeft;

        if (this.corner === FlipCorner.BOTTOM) {
            checkPointOne = this.rect.topRight;
            checkPointTwo = this.rect.bottomLeft;
        }

        if (checkPointOne.x <= 0) {
            const bottomPoint = Helper.LimitPointToCircle(centerTwo, rad, checkPointTwo);

            if (bottomPoint !== result) {
                result = bottomPoint;
                this.updateAngleAndGeometry(result);
            }
        }

        return result;
    }

    private getSegmentToShadowLine(): Segment {
        const first = this.getShadowStartPoint();

        const second =
            first !== this.sideIntersectPoint && this.sideIntersectPoint !== null
                ? this.sideIntersectPoint
                : this.bottomIntersectPoint;

        return [first, second];
    }
}
