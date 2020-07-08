import { Point, Rect, Segment } from './BasicTypes';

/**
 * A class containing helping mathematical methods
 */
export class Helper {
    /**
     * Get the distance between two points
     *
     * @param {Point} point1
     * @param {Point} point2
     */
    public static GetDistanceBetweenTwoPoint(point1: Point, point2: Point): number {
        if (point1 === null || point2 === null) {
            return Infinity;
        }

        return Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
    }

    /**
     * Get the length of the line segment
     *
     * @param {Segment} segment
     */
    public static GetSegmentLength(segment: Segment): number {
        return Helper.GetDistanceBetweenTwoPoint(segment[0], segment[1]);
    }

    /**
     * Get the angle between two lines
     *
     * @param {Segment} line1
     * @param {Segment} line2
     */
    public static GetAngleBetweenTwoLine(line1: Segment, line2: Segment): number {
        const A1 = line1[0].y - line1[1].y;
        const A2 = line2[0].y - line2[1].y;

        const B1 = line1[1].x - line1[0].x;
        const B2 = line2[1].x - line2[0].x;

        return Math.acos((A1 * A2 + B1 * B2) / (Math.sqrt(A1 * A1 + B1 * B1) * Math.sqrt(A2 * A2 + B2 * B2)));
    }

    /**
     * Check for a point in a rectangle
     *
     * @param {Rect} rect
     * @param {Point} pos
     *
     * @returns {Point} If the point enters the rectangle its coordinates will be returned, otherwise - null
     */
    public static PointInRect(rect: Rect, pos: Point): Point {
        if (pos === null) {
            return null;
        }

        if (
            pos.x >= rect.left &&
            pos.x <= rect.width + rect.left &&
            pos.y >= rect.top &&
            pos.y <= rect.top + rect.height
        ) {
            return pos;
        }
        return null;
    }

    /**
     * Transform point coordinates to a given angle
     *
     * @param {Point} transformedPoint - Point to rotate
     * @param {Point} startPoint - Transformation reference point
     * @param {number} angle - Rotation angle (in radians)
     *
     * @returns {Point} Point coordinates after rotation
     */
    public static GetRotatedPoint(transformedPoint: Point, startPoint: Point, angle: number): Point {
        return {
            x: transformedPoint.x * Math.cos(angle) + transformedPoint.y * Math.sin(angle) + startPoint.x,
            y: transformedPoint.y * Math.cos(angle) - transformedPoint.x * Math.sin(angle) + startPoint.y,
        };
    }

    /**
     * Limit a point "linePoint" to a given circle centered at point "startPoint" and a given radius
     *
     * @param {Point} startPoint - Circle center
     * @param {number} radius - Circle radius
     * @param {Point} limitedPoint - Сhecked point
     *
     * @returns {Point} If "linePoint" enters the circle, then its coordinates are returned.
     * Else will be returned the intersection point between the line ([startPoint, linePoint]) and the circle
     */
    public static LimitPointToCircle(startPoint: Point, radius: number, limitedPoint: Point): Point {
        // If "linePoint" enters the circle, do nothing
        if (Helper.GetDistanceBetweenTwoPoint(startPoint, limitedPoint) <= radius) {
            return limitedPoint;
        }

        const a = startPoint.x;
        const b = startPoint.y;
        const n = limitedPoint.x;
        const m = limitedPoint.y;

        // Find the intersection between the line at two points: (startPoint and limitedPoint) and the circle.
        let x = Math.sqrt((Math.pow(radius, 2) * Math.pow(a - n, 2)) / (Math.pow(a - n, 2) + Math.pow(b - m, 2))) + a;
        if (limitedPoint.x < 0) {
            x *= -1;
        }

        let y = ((x - a) * (b - m)) / (a - n) + b;
        if (a - n + b === 0) {
            y = radius;
        }

        return { x, y };
    }

    /**
     * Find the intersection of two lines bounded by a rectangle "rectBorder"
     *
     * @param {Rect} rectBorder
     * @param {Segment} one
     * @param {Segment} two
     *
     * @returns {Point} The intersection point, or "null" if it does not exist, or it lies outside the rectangle "rectBorder"
     */
    public static GetIntersectBetweenTwoSegment(rectBorder: Rect, one: Segment, two: Segment): Point {
        return Helper.PointInRect(rectBorder, Helper.GetIntersectBeetwenTwoLine(one, two));
    }

    /**
     * Find the intersection point of two lines
     *
     * @param one
     * @param two
     *
     * @returns {Point} The intersection point, or "null" if it does not exist
     * @throws Error if the segments are on the same line
     */
    public static GetIntersectBeetwenTwoLine(one: Segment, two: Segment): Point {
        const A1 = one[0].y - one[1].y;
        const A2 = two[0].y - two[1].y;

        const B1 = one[1].x - one[0].x;
        const B2 = two[1].x - two[0].x;

        const C1 = one[0].x * one[1].y - one[1].x * one[0].y;
        const C2 = two[0].x * two[1].y - two[1].x * two[0].y;

        const det1 = A1 * C2 - A2 * C1;
        const det2 = B1 * C2 - B2 * C1;

        const x = -((C1 * B2 - C2 * B1) / (A1 * B2 - A2 * B1));
        const y = -((A1 * C2 - A2 * C1) / (A1 * B2 - A2 * B1));

        if (isFinite(x) && isFinite(y)) {
            return { x, y };
        } else {
            if (Math.abs(det1 - det2) < 0.1) throw new Error('Segment included');
        }

        return null;
    }

    /**
     * Get a list of coordinates (step: 1px) between two points
     *
     * @param pointOne
     * @param pointTwo
     *
     * @returns {Point[]}
     */
    public static GetCordsFromTwoPoint(pointOne: Point, pointTwo: Point): Point[] {
        const sizeX = Math.abs(pointOne.x - pointTwo.x);
        const sizeY = Math.abs(pointOne.y - pointTwo.y);

        const lengthLine = Math.max(sizeX, sizeY);

        const result: Point[] = [pointOne];

        function getCord(c1: number, c2: number, size: number, length: number, index: number): number {
            if (c2 > c1) {
                return c1 + index * (size / length);
            } else if (c2 < c1) {
                return c1 - index * (size / length);
            }

            return c1;
        }

        for (let i = 1; i <= lengthLine; i += 1) {
            result.push({
                x: getCord(pointOne.x, pointTwo.x, sizeX, lengthLine, i),
                y: getCord(pointOne.y, pointTwo.y, sizeY, lengthLine, i),
            });
        }

        return result;
    }
}
