class Page {
    constructor(render) {
        this.state = {
            angle: 0,
            area: [],
            corners: null,
            position: { x: 0, y: 0 }
        };
        this.render = render;
    }
    setPosition(pagePos) {
        this.state.position = pagePos;
    }
    setAngle(angle) {
        this.state.angle = angle;
    }
    setArea(area) {
        this.state.area = area;
    }
    setCorners(corners) {
        this.state.corners = corners;
    }
    getAngle() {
        return this.state.angle;
    }
}

class ImagePage extends Page {
    constructor(render, href) {
        super(render);
        this.image = null;
        this.isLoad = false;
        this.loadingAngle = 0;
        this.image = new Image();
        this.image.src = href;
    }
    draw() {
        const ctx = this.render.getContext();
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
            ctx.rect(1, 1, pageWidth - 1, pageHeight - 1);
            ctx.stroke();
            ctx.fill();
            const middlePoint = {
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
    simpleDraw(orient) {
        const rect = this.render.getRect();
        const ctx = this.render.getContext();
        const pageWidth = rect.pageWidth;
        const pageHeight = rect.height;
        const x = (orient === 1 /* Right */)
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
            const middlePoint = {
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
    load() {
        if (!this.isLoad)
            this.image.onload = () => {
                this.isLoad = true;
            };
    }
}

class PageCollection {
    constructor(app, render) {
        this.pages = [];
        this.render = render;
        this.app = app;
    }
    getPageCount() {
        return this.pages.length;
    }
    getPages() {
        return this.pages;
    }
    getPage(pageIndex) {
        if ((pageIndex >= 0) && (pageIndex < this.pages.length)) {
            return this.pages[pageIndex];
        }
        throw new Error('Invalid page number');
    }
    /**
     * Render page at pageNum without transform
     *
     * @param pageNum
     */
    show(pageNum) {
        if ((pageNum < 0) || (pageNum >= this.pages.length)) {
            return;
        }
        this.app.updatePage(pageNum);
        if (this.render.getOrientation() === "portrait" /* PORTRAIT */) {
            this.render.setLeftPage(null);
            this.render.setRightPage(this.pages[pageNum]);
        }
        else {
            if (pageNum === (this.pages.length - 1)) {
                pageNum--;
            }
            this.render.setLeftPage(this.pages[pageNum]);
            this.render.setRightPage(this.pages[pageNum + 1]);
        }
    }
}

class ImagePageCollection extends PageCollection {
    constructor(app, render, imagesHref) {
        super(app, render);
        this.imagesHref = imagesHref;
    }
    load() {
        for (const href of this.imagesHref) {
            const page = new ImagePage(this.render, href);
            page.load();
            this.pages.push(page);
        }
    }
}

class Helper {
    static GetDestinationFromTwoPoint(point1, point2) {
        if ((point1 === null) || (point2 === null)) {
            return Infinity;
        }
        return Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
    }
    static GetSegmentLength(line) {
        return Helper.GetDestinationFromTwoPoint(line[0], line[1]);
    }
    static GetAngleFromTwoLine(line1, line2) {
        const A1 = line1[0].y - line1[1].y;
        const A2 = line2[0].y - line2[1].y;
        const B1 = line1[1].x - line1[0].x;
        const B2 = line2[1].x - line2[0].x;
        return Math.acos((A1 * A2 + B1 * B2) / (Math.sqrt(A1 * A1 + B1 * B1) * Math.sqrt(A2 * A2 + B2 * B2)));
    }
    static PointInRect(rect, pos) {
        if (pos === null) {
            return null;
        }
        if ((pos.x >= rect.left) && (pos.x <= rect.width + rect.left) &&
            (pos.y >= rect.top) && (pos.y <= rect.top + rect.height)) {
            return pos;
        }
        return null;
    }
    static GetRotatedPoint(transformedPoint, startPoint, angle) {
        return {
            x: transformedPoint.x * Math.cos(angle) + transformedPoint.y * Math.sin(angle) + startPoint.x,
            y: transformedPoint.y * Math.cos(angle) - transformedPoint.x * Math.sin(angle) + startPoint.y
        };
    }
    static GetIntersectByLineAndCircle(startPoint, radius, linePoint) {
        if (Helper.GetDestinationFromTwoPoint(startPoint, linePoint) <= radius) {
            return linePoint;
        }
        const a = startPoint.x;
        const b = startPoint.y;
        const n = linePoint.x;
        const m = linePoint.y;
        let x = Math.sqrt((Math.pow(radius, 2) * Math.pow(a - n, 2)) / (Math.pow(a - n, 2) + Math.pow(b - m, 2))) + a;
        if (linePoint.x < 0) {
            x *= -1;
        }
        let y = ((x - a) * (b - m)) / (a - n) + b;
        if (((a - n) + b) === 0) {
            y = radius;
        }
        return {
            x,
            y
        };
    }
    static GetIntersectByTwoSegment(rectBorder, one, two) {
        return Helper.PointInRect(rectBorder, Helper.GetIntersectByTwoLine(one, two));
    }
    static GetIntersectByTwoLine(one, two) {
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
        }
        else {
            if (Math.abs(det1 - det2) < 0.1)
                throw new Error('Segment included');
        }
        return null;
    }
    static GetCordsFromTwoPoint(pointOne, pointTwo) {
        const sizeX = Math.abs(pointOne.x - pointTwo.x);
        const sizeY = Math.abs(pointOne.y - pointTwo.y);
        const lengthLine = Math.max(sizeX, sizeY);
        const result = [pointOne];
        function getCord(c1, c2, size, length, index) {
            if (c2 > c1) {
                return c1 + (index * (size / length));
            }
            else if (c2 < c1) {
                return c1 - (index * (size / length));
            }
            return c1;
        }
        for (let i = 1; i <= lengthLine; i++) {
            result.push({
                x: getCord(pointOne.x, pointTwo.x, sizeX, lengthLine, i),
                y: getCord(pointOne.y, pointTwo.y, sizeY, lengthLine, i)
            });
        }
        return result;
    }
}

class HTMLPage extends Page {
    constructor(render, element) {
        super(render);
        this.copiedElement = null;
        this.isLoad = false;
        this.element = element;
        this.element.classList.add('stf__item');
        this.element.style.position = 'absolute';
        this.element.style.left = '0';
        this.element.style.top = '0';
        this.element.style.boxSizing = 'border-box';
    }
    draw() {
        const pagePos = this.render.convertToGlobal(this.state.position);
        const pageWidth = this.render.getRect().pageWidth;
        const pageHeight = this.render.getRect().height;
        this.element.classList.remove('--simple');
        this.element.style.display = "block";
        this.element.style.left = "0";
        this.element.style.top = "0";
        this.element.style.transformOrigin = "0 0";
        this.element.style.width = pageWidth + "px";
        this.element.style.height = pageHeight + "px";
        let polygon = 'polygon( ';
        for (const p of this.state.area) {
            if (p !== null) {
                let g = (this.render.getDirection() === 1 /* BACK */)
                    ? {
                        x: -p.x + this.state.position.x,
                        y: p.y - this.state.position.y
                    }
                    : {
                        x: p.x - this.state.position.x,
                        y: p.y - this.state.position.y
                    };
                g = Helper.GetRotatedPoint(g, { x: 0, y: 0 }, this.state.angle);
                polygon += g.x + 'px ' + g.y + 'px, ';
            }
        }
        polygon = polygon.slice(0, -2);
        polygon += ')';
        this.element.style.clipPath = polygon;
        this.element.style.setProperty('-webkit-clip-path', polygon);
        this.element.style.transform = "translate3d(" + pagePos.x + "px, " + pagePos.y + "px, 0) rotate(" + this.state.angle + "rad)";
    }
    simpleDraw(orient) {
        if (this.element.classList.contains('--simple'))
            return;
        if (this.copiedElement === null) {
            this.copiedElement = this.element.cloneNode(true);
            this.element.parentElement.appendChild(this.copiedElement);
        }
        const rect = this.render.getRect();
        const pageWidth = rect.pageWidth;
        const pageHeight = rect.height;
        const x = (orient === 1 /* Right */)
            ? rect.left + rect.pageWidth
            : rect.left;
        const y = rect.top;
        this.element.classList.add('--simple');
        this.copiedElement.style.cssText = "position: absolute; display: block; height: " + pageHeight + "px; left: " +
            x + "px; top: " + y + "px; width: " + pageWidth + "px; z-index: " + (this.render.getSettings().startZIndex + 1) + ";";
        this.element.style.cssText = "display: none";
    }
    clearSaved() {
        this.element.classList.remove('--simple');
        if (this.copiedElement !== null) {
            this.copiedElement.remove();
            this.copiedElement = null;
        }
    }
    getElement() {
        return this.element;
    }
    load() {
        this.isLoad = true;
    }
}

class HTMLPageCollection extends PageCollection {
    constructor(app, render, element, items) {
        super(app, render);
        this.element = element;
        this.pagesElement = items;
    }
    load() {
        for (const pageElement of this.pagesElement) {
            const page = new HTMLPage(this.render, pageElement);
            page.load();
            this.pages.push(page);
        }
    }
}

class FlipCalculation {
    constructor(direction, corner, pageWidth, pageHeight) {
        this.direction = direction;
        this.corner = corner;
        this.pageWidth = pageWidth;
        this.pageHeight = pageHeight;
        this.topIntersectPoint = null;
        this.sideIntersectPoint = null;
        this.bottomIntersectPoint = null;
    }
    calc(localPos) {
        try {
            this.position = this.preparePosition(localPos);
            this.calculateIntersectPoint(this.position);
        }
        catch (e) {
            //console.log(e);
        }
    }
    getPageRect(localPos) {
        if (this.corner === "top" /* TOP */) {
            return this.getRectFromBasePoint([
                { x: 0, y: 0 },
                { x: this.pageWidth, y: 0 },
                { x: 0, y: this.pageHeight },
                { x: this.pageWidth, y: this.pageHeight }
            ], localPos);
        }
        return this.getRectFromBasePoint([
            { x: 0, y: -this.pageHeight },
            { x: this.pageWidth, y: -this.pageHeight },
            { x: 0, y: 0 },
            { x: this.pageWidth, y: 0 }
        ], localPos);
    }
    getRectFromBasePoint(points, localPos) {
        return {
            topLeft: this.getRotatedPoint(points[0], localPos),
            topRight: this.getRotatedPoint(points[1], localPos),
            bottomLeft: this.getRotatedPoint(points[2], localPos),
            bottomRight: this.getRotatedPoint(points[3], localPos)
        };
    }
    getRotatedPoint(transformedPoint, startPoint) {
        return {
            x: transformedPoint.x * Math.cos(this.angle) + transformedPoint.y * Math.sin(this.angle) + startPoint.x,
            y: transformedPoint.y * Math.cos(this.angle) - transformedPoint.x * Math.sin(this.angle) + startPoint.y
        };
    }
    updateAngleAndGeometry(pos) {
        this.angle = this.calculateAngle(pos);
        this.rect = this.getPageRect(pos);
    }
    calculateIntersectPoint(pos) {
        const boundRect = {
            left: -1,
            top: -1,
            width: this.pageWidth + 2,
            height: this.pageHeight + 2
        };
        if (this.corner === "top" /* TOP */) {
            this.topIntersectPoint = Helper.GetIntersectByTwoSegment(boundRect, [pos, this.rect.topRight], [{ x: 0, y: 0 }, { x: this.pageWidth, y: 0 }]);
            this.sideIntersectPoint = Helper.GetIntersectByTwoSegment(boundRect, [pos, this.rect.bottomLeft], [{ x: this.pageWidth, y: 0 }, { x: this.pageWidth, y: this.pageHeight }]);
            this.bottomIntersectPoint = Helper.GetIntersectByTwoSegment(boundRect, [this.rect.bottomLeft, this.rect.bottomRight], [{ x: 0, y: this.pageHeight }, { x: this.pageWidth, y: this.pageHeight }]);
        }
        else {
            this.topIntersectPoint = Helper.GetIntersectByTwoSegment(boundRect, [this.rect.topLeft, this.rect.topRight], [{ x: 0, y: 0 }, { x: this.pageWidth, y: 0 }]);
            this.sideIntersectPoint = Helper.GetIntersectByTwoSegment(boundRect, [pos, this.rect.topLeft], [{ x: this.pageWidth, y: 0 }, { x: this.pageWidth, y: this.pageHeight }]);
            this.bottomIntersectPoint = Helper.GetIntersectByTwoSegment(boundRect, [this.rect.bottomLeft, this.rect.bottomRight], [{ x: 0, y: this.pageHeight }, { x: this.pageWidth, y: this.pageHeight }]);
        }
    }
    checkPositionAtCenterLine(checkedPos, centerOne, centerTwo) {
        let result = checkedPos;
        const tmp = Helper.GetIntersectByLineAndCircle(centerOne, this.pageWidth, result);
        if (result !== tmp) {
            result = tmp;
            this.updateAngleAndGeometry(result);
        }
        const rad = Math.sqrt(Math.pow(this.pageWidth, 2) + Math.pow(this.pageHeight, 2));
        let checkPointOne = this.rect.bottomRight;
        let checkPointTwo = this.rect.topLeft;
        if (this.corner === "bottom" /* BOTTOM */) {
            checkPointOne = this.rect.topRight;
            checkPointTwo = this.rect.bottomLeft;
        }
        if (checkPointOne.x <= 0) {
            const bottomPoint = Helper.GetIntersectByLineAndCircle(centerTwo, rad, checkPointTwo);
            if (bottomPoint !== result) {
                result = bottomPoint;
                this.updateAngleAndGeometry(result);
            }
        }
        return result;
    }
    preparePosition(pos) {
        let result = pos;
        this.updateAngleAndGeometry(result);
        if (this.corner === "top" /* TOP */) {
            result = this.checkPositionAtCenterLine(result, { x: 0, y: 0 }, { x: 0, y: this.pageHeight });
        }
        else {
            result = this.checkPositionAtCenterLine(result, { x: 0, y: this.pageHeight }, { x: 0, y: 0 });
        }
        if ((Math.abs(result.x - this.pageWidth) < 1) && (Math.abs(result.y) < 1)) {
            throw new Error('Point is too small');
        }
        return result;
    }
    calculateAngle(pos) {
        const left = this.pageWidth - pos.x;
        const top = (this.corner === "bottom" /* BOTTOM */)
            ? this.pageHeight - pos.y
            : pos.y;
        let angle = 2 * Math.acos(left / Math.sqrt(top * top + left * left));
        if (top < 0)
            angle = -angle;
        const da = Math.PI - angle;
        if (!isFinite(angle) || ((da >= 0) && (da < 0.003)))
            throw new Error('The G point is too small');
        if (this.corner === "bottom" /* BOTTOM */)
            angle = -angle;
        return angle;
    }
    getAngle() {
        if (this.direction === 0 /* FORWARD */) {
            return -this.angle;
        }
        return this.angle;
    }
    getRect() {
        return this.rect;
    }
    getPosition() {
        return this.position;
    }
    getActiveCorner() {
        if (this.direction === 0 /* FORWARD */) {
            return this.rect.topLeft;
        }
        return this.rect.topRight;
    }
    getDirection() {
        return this.direction;
    }
    getIntersectPoint() {
        return {
            top: this.topIntersectPoint,
            bottom: this.bottomIntersectPoint,
            side: this.sideIntersectPoint
        };
    }
    getSegmentToShadowLine() {
        const first = this.getShadowStartPoint();
        const second = ((first !== this.sideIntersectPoint) && (this.sideIntersectPoint !== null))
            ? this.sideIntersectPoint
            : this.bottomIntersectPoint;
        return [first, second];
    }
    getShadowStartPoint() {
        if (this.corner === "top" /* TOP */) {
            return this.topIntersectPoint;
        }
        else {
            if (this.sideIntersectPoint !== null)
                return this.sideIntersectPoint;
            return this.topIntersectPoint;
        }
    }
    getShadowAngle() {
        const angle = Helper.GetAngleFromTwoLine(this.getSegmentToShadowLine(), [{ x: 0, y: 0 }, { x: this.pageWidth, y: 0 }]);
        if (this.direction === 0 /* FORWARD */) {
            return angle;
        }
        return Math.PI - angle;
    }
    getShadowLength() {
        return Helper.GetSegmentLength(this.getSegmentToShadowLine());
    }
    getFlippingProgress() {
        return Math.abs((this.position.x - this.pageWidth) / (2 * this.pageWidth) * 100);
    }
    getFlippingClipArea() {
        const result = [];
        let clipBottom = false;
        result.push(this.rect.topLeft);
        result.push(this.topIntersectPoint);
        if (this.sideIntersectPoint === null) {
            clipBottom = true;
        }
        else {
            result.push(this.sideIntersectPoint);
            if (this.bottomIntersectPoint === null)
                clipBottom = false;
        }
        result.push(this.bottomIntersectPoint);
        if ((clipBottom) || (this.corner === "bottom" /* BOTTOM */)) {
            result.push(this.rect.bottomLeft);
        }
        return result;
    }
    getCorner() {
        return this.corner;
    }
    getBottomClipArea() {
        const result = [];
        result.push(this.topIntersectPoint);
        if (this.corner === "top" /* TOP */) {
            result.push({ x: this.pageWidth, y: 0 });
        }
        else {
            if (this.topIntersectPoint !== null) {
                result.push({ x: this.pageWidth, y: 0 });
            }
            result.push({ x: this.pageWidth, y: this.pageHeight });
        }
        if (this.sideIntersectPoint !== null) {
            if (Helper.GetDestinationFromTwoPoint(this.sideIntersectPoint, this.topIntersectPoint) >= 10)
                result.push(this.sideIntersectPoint);
        }
        else {
            if (this.corner === "top" /* TOP */) {
                result.push({ x: this.pageWidth, y: this.pageHeight });
            }
        }
        result.push(this.bottomIntersectPoint);
        result.push(this.topIntersectPoint);
        return result;
    }
    getBottomPagePosition() {
        if (this.direction === 1 /* BACK */) {
            return { x: this.pageWidth, y: 0 };
        }
        return { x: 0, y: 0 };
    }
}

class Flip {
    constructor(render, app) {
        this.flippingPage = null;
        this.bottomPage = null;
        this.calc = null;
        this.state = "read" /* READ */;
        this.render = render;
        this.app = app;
    }
    getCalculation() {
        return this.calc;
    }
    start(globalPos) {
        this.reset();
        const bookPos = this.render.convertToBook(globalPos);
        const rect = this.getBoundsRect();
        let direction = 0 /* FORWARD */;
        if (this.render.getOrientation() === "portrait" /* PORTRAIT */) {
            if ((bookPos.x - rect.pageWidth) <= rect.width / 5)
                direction = 1 /* BACK */;
        }
        else if (bookPos.x < rect.width / 2) {
            direction = 1 /* BACK */;
        }
        const flipCorner = (bookPos.y >= rect.height / 2)
            ? "bottom" /* BOTTOM */
            : "top" /* TOP */;
        if (!this.checkDirection(direction))
            return false;
        try {
            this.flippingPage = this.getFlippingPage(direction);
            this.bottomPage = this.getBottomPage(direction);
            if (!this.flippingPage || !this.bottomPage)
                return false;
            this.render.setDirection(direction);
            this.calc = new FlipCalculation(direction, flipCorner, rect.pageWidth, rect.height);
            return true;
        }
        catch (e) {
            return false;
        }
    }
    showCorner(globalPos) {
        if (!this.checkState("read" /* READ */, "fold_corner" /* FOLD_CORNER */))
            return;
        const rect = this.getBoundsRect();
        const pageWidth = rect.pageWidth;
        const operatingDistance = Math.sqrt(Math.pow(pageWidth, 2) + Math.pow(rect.height, 2)) / 5;
        const bookPos = this.render.convertToBook(globalPos);
        if (((bookPos.x > 0) && (bookPos.y > 0)) &&
            ((bookPos.x < rect.width) && (bookPos.y < rect.height)) &&
            ((bookPos.x < operatingDistance) || (bookPos.x > (rect.width - operatingDistance))) &&
            ((bookPos.y < operatingDistance) || (bookPos.y > rect.height - operatingDistance))) {
            if (this.calc === null) {
                if (!this.start(globalPos))
                    return;
                this.setState("fold_corner" /* FOLD_CORNER */);
                this.calc.calc({ x: pageWidth - 1, y: 1 });
                const fixedCornerSize = 50;
                const yStart = (this.calc.getCorner() === "bottom" /* BOTTOM */)
                    ? rect.height - 1
                    : 1;
                const yDest = (this.calc.getCorner() === "bottom" /* BOTTOM */)
                    ? rect.height - fixedCornerSize
                    : fixedCornerSize;
                this.animateFlippingTo({ x: pageWidth - 1, y: yStart }, { x: pageWidth - fixedCornerSize, y: yDest }, false, false);
            }
            else {
                this.do(this.render.convertToPage(globalPos));
            }
        }
        else {
            this.setState("read" /* READ */);
            this.render.finishAnimation();
            this.stopMove();
        }
    }
    fold(globalPos) {
        this.setState("user_fold" /* USER_FOLD */);
        if (this.calc === null)
            this.start(globalPos);
        this.do(this.render.convertToPage(globalPos));
    }
    flip(globalPos) {
        if (this.calc !== null)
            this.render.finishAnimation();
        if (!this.start(globalPos))
            return;
        const rect = this.getBoundsRect();
        this.setState("flipping" /* FLIPPING */);
        const topMargins = rect.height / 10;
        const yStart = (this.calc.getCorner() === "bottom" /* BOTTOM */)
            ? rect.height - topMargins
            : topMargins;
        const yDest = (this.calc.getCorner() === "bottom" /* BOTTOM */)
            ? rect.height
            : 0;
        this.calc.calc({ x: rect.pageWidth - topMargins, y: yStart });
        this.animateFlippingTo({ x: rect.pageWidth - topMargins, y: yStart }, { x: -rect.pageWidth, y: yDest }, true);
    }
    flipNext(corner) {
        this.flip({
            x: this.render.getRect().left + this.render.getRect().pageWidth * 2,
            y: (corner === "top" /* TOP */) ? 1 : this.render.getRect().height - 2
        });
    }
    flipPrev(corner) {
        this.flip({
            x: 10,
            y: (corner === "top" /* TOP */) ? 1 : this.render.getRect().height - 2
        });
    }
    stopMove() {
        if (this.calc === null)
            return;
        const pos = this.calc.getPosition();
        const rect = this.getBoundsRect();
        const y = this.calc.getCorner() === "bottom" /* BOTTOM */
            ? rect.height
            : 0;
        if (pos.x <= 0)
            this.animateFlippingTo(pos, { x: -rect.pageWidth, y }, true);
        else
            this.animateFlippingTo(pos, { x: rect.pageWidth, y }, false);
    }
    do(pagePos) {
        if (this.calc === null)
            return;
        this.calc.calc(pagePos);
        this.flippingPage.setArea(this.calc.getFlippingClipArea());
        this.flippingPage.setPosition(this.calc.getActiveCorner());
        this.flippingPage.setAngle(this.calc.getAngle());
        this.bottomPage.setArea(this.calc.getBottomClipArea());
        this.bottomPage.setPosition(this.calc.getBottomPagePosition());
        this.bottomPage.setAngle(0);
        this.render.setPageRect(this.calc.getRect());
        this.render.setBottomPage(this.bottomPage);
        this.render.setFlippingPage(this.flippingPage);
        this.render.drawShadow(this.calc.getShadowStartPoint(), this.calc.getShadowAngle(), this.calc.getFlippingProgress(), this.calc.getDirection(), this.calc.getShadowLength());
    }
    animateFlippingTo(start, dest, isTurned, needReset = true) {
        const points = Helper.GetCordsFromTwoPoint(start, dest);
        const frames = [];
        for (const p of points)
            frames.push(() => this.do(p));
        const duration = this.getAnimationDuration(points.length);
        this.render.startAnimation(frames, duration, () => {
            if (!this.calc)
                return;
            if (isTurned) {
                if (this.calc.getDirection() === 1 /* BACK */)
                    this.app.turnToPrevPage();
                else
                    this.app.turnToNextPage();
            }
            if (needReset) {
                this.render.setBottomPage(null);
                this.render.setFlippingPage(null);
                this.render.clearShadow();
                this.state = "read" /* READ */;
                this.reset();
            }
        });
    }
    getAnimationDuration(size) {
        const defaultTime = this.app.getSettings().flippingTime;
        if (size >= 1000)
            return defaultTime;
        return (size / 1000) * defaultTime;
    }
    getFlippingPage(direction) {
        const current = this.app.getCurrentPageIndex();
        if (this.render.getOrientation() === "portrait" /* PORTRAIT */) {
            return (direction === 0 /* FORWARD */)
                ? this.app.getPage(current)
                : this.app.getPage(current - 1);
        }
        else {
            if ((current < (this.app.getPageCount() - 1)) && (current >= 0)) {
                return (direction === 0 /* FORWARD */)
                    ? this.app.getPage(current + 2)
                    : this.app.getPage(current - 1);
            }
        }
        return null;
    }
    getNextPage() {
        const current = this.app.getCurrentPageIndex();
        const dp = this.render.getOrientation() === "portrait" /* PORTRAIT */ ? 0 : 2;
        if (current < (this.app.getPageCount() - dp))
            return this.app.getPage(current + dp + 1);
        return null;
    }
    getPrevPage() {
        const current = this.app.getCurrentPageIndex();
        const dp = this.render.getOrientation() === "portrait" /* PORTRAIT */ ? 0 : 2;
        if (current - dp >= 0)
            return this.app.getPage(current - dp);
        return null;
    }
    getBottomPage(direction) {
        if (direction === 0 /* FORWARD */)
            return this.getNextPage();
        return this.getPrevPage();
    }
    checkDirection(direction) {
        if (direction === 0 /* FORWARD */)
            return (this.app.getCurrentPageIndex() <= (this.app.getPageCount() - 1));
        return (this.app.getCurrentPageIndex() >= 1);
    }
    reset() {
        this.calc = null;
        this.flippingPage = null;
        this.bottomPage = null;
    }
    getBoundsRect() {
        return this.render.getRect();
    }
    getPageWidth() {
        return this.getBoundsRect().width / 2;
    }
    getPageHeight() {
        return this.getBoundsRect().height;
    }
    setState(newState) {
        this.app.updateState(newState);
        this.state = newState;
    }
    checkState(...states) {
        for (const state of states)
            if (this.state === state)
                return true;
        return false;
    }
}

class Render {
    constructor(app, setting) {
        this.leftPage = null;
        this.rightPage = null;
        this.flippingPage = null;
        this.bottomPage = null;
        this.shadow = null;
        this.pageRect = null;
        this.animation = null;
        this.timer = 0;
        this.direction = null;
        this.orientation = null;
        this.boundsRect = null;
        this.setting = setting;
        this.app = app;
    }
    drawShadow(pos, angle, t, direction, length) {
        if (!this.app.getSettings().drawShadow)
            return;
        const maxShadowOpacity = 100 * this.getSettings().maxShadowOpacity;
        this.shadow = {
            pos,
            angle,
            width: (this.getRect().pageWidth * 3 / 4) * t / 100,
            opacity: (100 - t) * maxShadowOpacity / 100 / 100,
            direction,
            length
        };
    }
    clearShadow() {
        this.shadow = null;
    }
    setPageRect(pageRect) {
        this.pageRect = pageRect;
    }
    getOrientation() {
        return this.orientation;
    }
    startAnimation(frames, duration, onAnimateEnd) {
        this.finishAnimation();
        this.animation = {
            frames,
            duration,
            durationFrame: duration / frames.length,
            onAnimateEnd,
            startedAt: this.timer
        };
    }
    finishAnimation() {
        if (this.animation !== null) {
            this.animation.frames[this.animation.frames.length - 1]();
            if (this.animation.onAnimateEnd !== null) {
                this.animation.onAnimateEnd();
            }
        }
        this.animation = null;
    }
    render(timer) {
        if (this.animation !== null) {
            const frameIndex = Math.round((timer - this.animation.startedAt) / this.animation.durationFrame);
            if (frameIndex < this.animation.frames.length) {
                this.animation.frames[frameIndex]();
            }
            else {
                this.animation.onAnimateEnd();
                this.animation = null;
            }
        }
        this.timer = timer;
        this.drawFrame(timer);
    }
    getRect() {
        if (this.boundsRect === null)
            this.calculateBoundsRect();
        return this.boundsRect;
    }
    calculateBoundsRect() {
        let orientation = "landscape" /* LANDSCAPE */;
        const blockWidth = this.getBlockWidth();
        const middlePoint = {
            x: blockWidth / 2, y: this.getBlockHeight() / 2
        };
        const ratio = this.setting.width / this.setting.height;
        let pageWidth = this.setting.width;
        let pageHeight = this.setting.height;
        let left = middlePoint.x - pageWidth;
        if (this.setting.size === "stretch" /* STRETCH */) {
            if (blockWidth < this.setting.minWidth * 2)
                if (this.app.getSettings().usePortrait)
                    orientation = "portrait" /* PORTRAIT */;
            pageWidth = (orientation === "landscape" /* LANDSCAPE */)
                ? this.getBlockWidth() / 2
                : this.getBlockWidth();
            if (pageWidth > this.setting.maxWidth)
                pageWidth = this.setting.maxWidth;
            pageHeight = pageWidth / ratio;
            if (pageHeight > this.getBlockHeight()) {
                pageHeight = this.getBlockHeight();
                pageWidth = pageHeight * ratio;
            }
            left = (orientation === "landscape" /* LANDSCAPE */)
                ? middlePoint.x - pageWidth
                : middlePoint.x - pageWidth / 2 - pageWidth;
        }
        else {
            if (blockWidth < pageWidth * 2) {
                if (this.app.getSettings().usePortrait) {
                    orientation = "portrait" /* PORTRAIT */;
                    left = middlePoint.x - pageWidth / 2 - pageWidth;
                }
            }
        }
        this.boundsRect = {
            left: left,
            top: middlePoint.y - (pageHeight / 2),
            width: pageWidth * 2,
            height: pageHeight,
            pageWidth: pageWidth
        };
        return orientation;
    }
    update() {
        this.boundsRect = null;
        const orientation = this.calculateBoundsRect();
        if (this.orientation !== orientation) {
            this.orientation = orientation;
            this.app.updateOrientation(orientation);
        }
    }
    convertToBook(pos) {
        const rect = this.getRect();
        return {
            x: pos.x - rect.left,
            y: pos.y - rect.top
        };
    }
    convertToPage(pos, direction) {
        if (!direction)
            direction = this.direction;
        const rect = this.getRect();
        const x = direction === 0 /* FORWARD */
            ? (pos.x - rect.left - rect.width / 2)
            : (rect.width / 2 - pos.x + rect.left);
        return {
            x,
            y: pos.y - rect.top
        };
    }
    convertToGlobal(pos, direction) {
        if (!direction)
            direction = this.direction;
        if (pos == null)
            return null;
        const rect = this.getRect();
        const x = direction === 0 /* FORWARD */
            ? (pos.x + rect.left + rect.width / 2)
            : rect.width / 2 - pos.x + rect.left;
        return {
            x,
            y: pos.y + rect.top
        };
    }
    convertRectToGlobal(rect, direction) {
        if (!direction)
            direction = this.direction;
        return {
            topLeft: this.convertToGlobal(rect.topLeft, direction),
            topRight: this.convertToGlobal(rect.topRight, direction),
            bottomLeft: this.convertToGlobal(rect.bottomLeft, direction),
            bottomRight: this.convertToGlobal(rect.bottomRight, direction)
        };
    }
    start() {
        this.update();
        const loop = (timer) => {
            this.render(timer);
            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }
    setDirection(direction) {
        this.direction = direction;
    }
    getDirection() {
        return this.direction;
    }
    setFlippingPage(page) {
        this.flippingPage = page;
    }
    setBottomPage(page) {
        this.bottomPage = page;
    }
    setRightPage(page) {
        this.rightPage = page;
    }
    setLeftPage(page) {
        this.leftPage = page;
    }
    getSettings() {
        return this.app.getSettings();
    }
}

class CanvasRender extends Render {
    constructor(app, setting, inCanvas) {
        super(app, setting);
        this.canvas = inCanvas;
        this.ctx = inCanvas.getContext('2d');
    }
    getBlockWidth() {
        return this.canvas.offsetWidth;
    }
    getBlockHeight() {
        return this.canvas.offsetHeight;
    }
    getContext() {
        return this.ctx;
    }
    drawFrame(timer) {
        this.clear();
        if (this.orientation !== "portrait" /* PORTRAIT */)
            if (this.leftPage != null)
                this.leftPage.simpleDraw(0 /* Left */);
        if (this.rightPage != null)
            this.rightPage.simpleDraw(1 /* Right */);
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
        if (this.orientation === "portrait" /* PORTRAIT */) {
            this.ctx.beginPath();
            this.ctx.rect(rect.left + rect.pageWidth, rect.top, rect.width, rect.height);
            this.ctx.clip();
        }
    }
    drawBookShadow() {
        const rect = this.getRect();
        this.ctx.save();
        this.ctx.beginPath();
        const shadowSize = rect.width / 20;
        this.ctx.rect(rect.left, rect.top, rect.width, rect.height);
        const shadowPos = { x: (rect.left + rect.width / 2) - shadowSize / 2, y: 0 };
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
    drawOuterShadow() {
        const rect = this.getRect();
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.rect(rect.left, rect.top, rect.width, rect.height);
        const shadowPos = this.convertToGlobal({ x: this.shadow.pos.x, y: this.shadow.pos.y });
        this.ctx.translate(shadowPos.x, shadowPos.y);
        this.ctx.rotate(Math.PI + this.shadow.angle + Math.PI / 2);
        const outerGradient = this.ctx.createLinearGradient(0, 0, this.shadow.width, 0);
        if (this.shadow.direction === 0 /* FORWARD */) {
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
    drawInnerShadow() {
        const rect = this.getRect();
        this.ctx.save();
        this.ctx.beginPath();
        const shadowPos = this.convertToGlobal({ x: this.shadow.pos.x, y: this.shadow.pos.y });
        const pageRect = this.convertRectToGlobal(this.pageRect);
        this.ctx.moveTo(pageRect.topLeft.x, pageRect.topLeft.y);
        this.ctx.lineTo(pageRect.topRight.x, pageRect.topRight.y);
        this.ctx.lineTo(pageRect.bottomRight.x, pageRect.bottomRight.y);
        this.ctx.lineTo(pageRect.bottomLeft.x, pageRect.bottomLeft.y);
        this.ctx.translate(shadowPos.x, shadowPos.y);
        this.ctx.rotate(Math.PI + this.shadow.angle + Math.PI / 2);
        const isw = this.shadow.width * 3 / 4;
        const innerGradient = this.ctx.createLinearGradient(0, 0, isw, 0);
        if (this.shadow.direction === 0 /* FORWARD */) {
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
    clear() {
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

class UI {
    constructor(inBlock, app, setting) {
        this.touchPoint = null;
        this.swipeTimeout = 250;
        this.swipeDistance = 80;
        inBlock.classList.add('stf__parent');
        inBlock.insertAdjacentHTML('afterbegin', '<div class="stf__wrapper"></div>');
        this.wrapper = inBlock.querySelector('.stf__wrapper');
        this.app = app;
        const k = this.app.getSettings().usePortrait ? 1 : 2;
        inBlock.style.minWidth = setting.minWidth * k + 'px';
        inBlock.style.minHeight = setting.minHeight * k + 'px';
        if (setting.size === "fixed" /* FIXED */) {
            inBlock.style.minWidth = setting.width * k + 'px';
            inBlock.style.minHeight = setting.height * k + 'px';
        }
        if (setting.autoSize) {
            inBlock.style.width = '100%';
            inBlock.style.maxWidth = setting.maxWidth * 2 + 'px';
        }
        inBlock.style.display = 'block';
    }
    getDistElement() {
        return this.distElement;
    }
    getWrapper() {
        return this.wrapper;
    }
    setOrientationStyle(orientation) {
        this.wrapper.classList.remove('--portrait', '--landscape');
        if (orientation === "portrait" /* PORTRAIT */) {
            if (this.app.getSettings().autoSize)
                this.wrapper.style.paddingBottom = (this.app.getSettings().height / this.app.getSettings().width) * 100 + '%';
            this.wrapper.classList.add('--portrait');
        }
        else {
            if (this.app.getSettings().autoSize)
                this.wrapper.style.paddingBottom = (this.app.getSettings().height / (this.app.getSettings().width * 2)) * 100 + '%';
            this.wrapper.classList.add('--landscape');
        }
        this.update();
    }
    setHandlers() {
        this.distElement.addEventListener('mousedown', (e) => {
            const pos = this.getMousePos(e.clientX, e.clientY);
            this.app.startUserTouch(pos);
            e.preventDefault();
        });
        this.distElement.addEventListener('touchstart', (e) => {
            if (e.changedTouches.length > 0) {
                const t = e.changedTouches[0];
                const pos = this.getMousePos(t.clientX, t.clientY);
                this.touchPoint = {
                    point: pos,
                    time: Date.now()
                };
                setTimeout(() => {
                    if (this.touchPoint !== null)
                        this.app.startUserTouch(pos);
                }, this.swipeTimeout);
                e.preventDefault();
            }
        });
        window.addEventListener('mousemove', (e) => {
            const pos = this.getMousePos(e.clientX, e.clientY);
            this.app.userMove(pos, false);
        });
        window.addEventListener('touchmove', (e) => {
            if (e.changedTouches.length > 0) {
                const t = e.changedTouches[0];
                this.app.userMove(this.getMousePos(t.clientX, t.clientY), true);
            }
        });
        window.addEventListener('mouseup', (e) => {
            const pos = this.getMousePos(e.clientX, e.clientY);
            this.app.userStop(pos);
        });
        window.addEventListener('touchend', (e) => {
            if (e.changedTouches.length > 0) {
                const t = e.changedTouches[0];
                const pos = this.getMousePos(t.clientX, t.clientY);
                let isSwipe = false;
                if (this.touchPoint !== null) {
                    const dx = pos.x - this.touchPoint.point.x;
                    const distY = Math.abs(pos.y - this.touchPoint.point.y);
                    if ((Math.abs(dx) > this.swipeDistance) &&
                        (distY < this.swipeDistance * 2) &&
                        ((Date.now() - this.touchPoint.time) < this.swipeTimeout)) {
                        if (dx > 0) {
                            this.app.flipPrev((this.touchPoint.point.y < this.app.getRender().getRect().height / 2)
                                ? "top" /* TOP */
                                : "bottom" /* BOTTOM */);
                        }
                        else {
                            this.app.flipNext((this.touchPoint.point.y < this.app.getRender().getRect().height / 2)
                                ? "top" /* TOP */
                                : "bottom" /* BOTTOM */);
                        }
                        isSwipe = true;
                    }
                    this.touchPoint = null;
                }
                this.app.userStop(pos, isSwipe);
            }
        });
    }
    getMousePos(x, y) {
        const rect = this.distElement.getBoundingClientRect();
        return {
            x: x - rect.left,
            y: y - rect.top
        };
    }
}

class HTMLUI extends UI {
    constructor(inBlock, app, setting, items) {
        super(inBlock, app, setting);
        this.wrapper.insertAdjacentHTML('afterbegin', '<div class="stf__block"></div>');
        this.distElement = inBlock.querySelector('.stf__block');
        for (const item of items) {
            this.distElement.appendChild(item);
        }
        window.addEventListener('resize', () => {
            this.update();
        }, false);
        this.setHandlers();
    }
    update() {
        this.app.getRender().update();
    }
}

class CanvasUI extends UI {
    constructor(inBlock, app, setting) {
        super(inBlock, app, setting);
        this.wrapper.innerHTML = '<canvas class="stf__canvas"></canvas>';
        this.canvas = inBlock.querySelectorAll('canvas')[0];
        window.addEventListener('resize', () => {
            this.update();
        }, false);
        this.distElement = this.canvas;
        this.resizeCanvas();
        this.setHandlers();
    }
    resizeCanvas() {
        const cs = getComputedStyle(this.canvas);
        const width = parseInt(cs.getPropertyValue('width'), 10);
        const height = parseInt(cs.getPropertyValue('height'), 10);
        this.canvas.width = width;
        this.canvas.height = height;
    }
    getCanvas() {
        return this.canvas;
    }
    update() {
        this.resizeCanvas();
        this.app.getRender().update();
    }
}

class EventObject {
    constructor() {
        this.events = {};
    }
    on(eventName, callback) {
        if (!(eventName in this.events)) {
            this.events[eventName] = [callback];
        }
        else {
            this.events[eventName].push(callback);
        }
        return this;
    }
    off(event) {
        delete this.events[event];
    }
    trigger(eventName, app, data = null) {
        if (eventName in this.events) {
            this.events[eventName].forEach((callback) => {
                callback({
                    data: data,
                    object: app
                });
            });
        }
    }
}

class HTMLRender extends Render {
    constructor(app, setting, element, items) {
        super(app, setting);
        this.outerShadow = null;
        this.innerShadow = null;
        this.element = element;
        this.items = items;
    }
    getBlockWidth() {
        return this.element.offsetWidth;
    }
    getBlockHeight() {
        return this.element.offsetHeight;
    }
    clearShadow() {
        super.clearShadow();
        this.outerShadow.remove();
        this.innerShadow.remove();
        this.outerShadow = null;
        this.innerShadow = null;
    }
    drawShadow(pos, angle, t, direction, length) {
        super.drawShadow(pos, angle, t, direction, length);
        if (this.outerShadow === null) {
            this.element.insertAdjacentHTML('beforeend', '<div class="stf__outerShadow"></div>');
            this.outerShadow = this.element.querySelector('.stf__outerShadow');
            this.outerShadow.style.zIndex = (this.getSettings().startZIndex + 10).toString(10);
            this.outerShadow.style.left = "0px";
            this.outerShadow.style.top = "0px";
        }
        if (this.innerShadow === null) {
            this.element.insertAdjacentHTML('beforeend', '<div class="stf__innerShadow"></div>');
            this.innerShadow = this.element.querySelector('.stf__innerShadow');
            this.innerShadow.style.zIndex = (this.getSettings().startZIndex + 10).toString(10);
            this.innerShadow.style.left = "0px";
            this.innerShadow.style.top = "0px";
        }
    }
    drawInnerShadow() {
        const rect = this.getRect();
        const innerShadowSize = this.shadow.width * 3 / 4;
        const shadowTranslate = (this.getDirection() === 0 /* FORWARD */)
            ? innerShadowSize
            : 0;
        const shadowDirection = (this.getDirection() === 0 /* FORWARD */)
            ? "to left"
            : "to right";
        const shadowPos = this.convertToGlobal(this.shadow.pos);
        const angle = this.shadow.angle + 3 * Math.PI / 2;
        this.innerShadow.style.width = innerShadowSize + 'px';
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
            let g = (this.getDirection() === 1 /* BACK */)
                ? {
                    x: -p.x + this.shadow.pos.x,
                    y: p.y - this.shadow.pos.y
                }
                : {
                    x: p.x - this.shadow.pos.x,
                    y: p.y - this.shadow.pos.y
                };
            g = Helper.GetRotatedPoint(g, { x: shadowTranslate, y: 100 }, angle);
            polygon += g.x + 'px ' + g.y + 'px, ';
        }
        polygon = polygon.slice(0, -2);
        polygon += ')';
        this.innerShadow.style.clipPath = polygon;
        this.innerShadow.style.setProperty('-webkit-clip-path', polygon);
    }
    drawOuterShadow() {
        const rect = this.getRect();
        const shadowPos = this.convertToGlobal({ x: this.shadow.pos.x, y: this.shadow.pos.y });
        const angle = this.shadow.angle + 3 * Math.PI / 2;
        const shadowTranslate = (this.getDirection() === 1 /* BACK */)
            ? this.shadow.width
            : 0;
        const shadowDirection = (this.getDirection() === 0 /* FORWARD */)
            ? "to right"
            : "to left";
        this.outerShadow.style.width = this.shadow.width + 'px';
        this.outerShadow.style.height = rect.height * 2 + 'px';
        this.outerShadow.style.background = "linear-gradient(" + shadowDirection + ", rgba(0, 0, 0, " + this.shadow.opacity + "), rgba(0, 0, 0, 0))";
        this.outerShadow.style.transformOrigin = shadowTranslate + "px 100px"; //
        this.outerShadow.style.transform = "translate3d(" + (shadowPos.x - shadowTranslate) + "px, " + (shadowPos.y - 100) + "px, 0) rotate(" + angle + "rad)";
        const clip = [];
        clip.push({ x: 0, y: 0 }, { x: rect.pageWidth, y: 0 }, { x: rect.pageWidth, y: rect.height }, { x: 0, y: rect.height });
        let polygon = 'polygon( ';
        for (const p of clip) {
            if (p !== null) {
                let g = (this.getDirection() === 1 /* BACK */)
                    ? {
                        x: -p.x + this.shadow.pos.x,
                        y: p.y - this.shadow.pos.y
                    }
                    : {
                        x: p.x - this.shadow.pos.x,
                        y: p.y - this.shadow.pos.y
                    };
                g = Helper.GetRotatedPoint(g, { x: shadowTranslate, y: 100 }, angle);
                polygon += g.x + 'px ' + g.y + 'px, ';
            }
        }
        polygon = polygon.slice(0, -2);
        polygon += ')';
        this.outerShadow.style.clipPath = polygon;
        this.outerShadow.style.setProperty('-webkit-clip-path', polygon);
    }
    drawFrame(timer) {
        this.clear();
        if (this.orientation !== "portrait" /* PORTRAIT */) {
            if (this.leftPage != null)
                this.leftPage.simpleDraw(0 /* Left */);
        }
        else {
            if (this.leftPage != null)
                this.leftPage.clearSaved();
        }
        if (this.rightPage != null)
            this.rightPage.simpleDraw(1 /* Right */);
        if (this.bottomPage != null) {
            if (!((this.orientation === "portrait" /* PORTRAIT */) && (this.direction === 1 /* BACK */))) {
                this.bottomPage.getElement().style.zIndex =
                    (this.getSettings().startZIndex + 3).toString(10);
                this.bottomPage.draw();
            }
        }
        if (this.flippingPage != null) {
            this.flippingPage.getElement().style.zIndex =
                (this.getSettings().startZIndex + 4).toString(10);
            this.flippingPage.draw();
        }
        if (this.shadow != null) {
            this.drawOuterShadow();
            this.drawInnerShadow();
        }
    }
    clear() {
        const workedPages = [];
        if (this.leftPage)
            workedPages.push(this.leftPage.getElement());
        if (this.rightPage)
            workedPages.push(this.rightPage.getElement());
        if (this.flippingPage)
            workedPages.push(this.flippingPage.getElement());
        if (this.bottomPage)
            workedPages.push(this.bottomPage.getElement());
        for (const item of this.items) {
            if (!workedPages.includes(item)) {
                item.style.display = "none";
                item.style.zIndex = (this.getSettings().startZIndex + 1).toString(10);
                item.style.transform = "";
            }
        }
    }
    clearClass(page) {
        if (page !== null) {
            page.getElement().classList.remove('--left', '--right');
        }
    }
    setRightPage(page) {
        this.clearClass(this.rightPage);
        if ((this.rightPage !== null) && (page !== this.rightPage))
            this.rightPage.clearSaved();
        if (page !== null)
            page.getElement().classList.add('--right');
        super.setRightPage(page);
    }
    setLeftPage(page) {
        this.clearClass(this.leftPage);
        if ((this.leftPage !== null) && (page !== this.rightPage))
            this.leftPage.clearSaved();
        if (page !== null)
            page.getElement().classList.add('--left');
        super.setLeftPage(page);
    }
    setBottomPage(page) {
        if (page !== null)
            page.getElement().classList.add((this.direction === 1 /* BACK */)
                ? '--left'
                : '--right');
        super.setBottomPage(page);
    }
    setFlippingPage(page) {
        if (page !== null)
            page.getElement().classList.add((this.direction === 1 /* BACK */)
                ? '--right'
                : '--left');
        super.setFlippingPage(page);
    }
    update() {
        super.update();
        if (this.rightPage !== null) {
            this.rightPage.getElement().classList.add('--right');
            this.rightPage.clearSaved();
        }
        if (this.leftPage !== null) {
            this.leftPage.getElement().classList.add('--left');
            this.leftPage.clearSaved();
        }
    }
}

let Settings = /** @class */ (() => {
    class Settings {
        static GetSettings(userSetting) {
            const result = this._default;
            Object.assign(result, userSetting);
            if ((result.size !== "stretch" /* STRETCH */) && (result.size !== "fixed" /* FIXED */))
                throw new Error('Invalid size type. Available only "fixed" and "stretch" value');
            if ((result.width <= 0) || (result.height <= 0))
                throw new Error('Invalid width or height');
            if (result.flippingTime <= 0)
                throw new Error('Invalid flipping time');
            if (result.minWidth <= 0)
                result.minWidth = result.width;
            if (result.maxWidth < result.minWidth)
                result.maxWidth = result.minWidth;
            if (result.minHeight <= 0)
                result.minHeight = result.height;
            if (result.maxHeight < result.minHeight)
                result.maxHeight = result.minHeight;
            return result;
        }
    }
    Settings._default = {
        startPage: 0,
        size: "fixed" /* FIXED */,
        width: 0,
        height: 0,
        minWidth: 0,
        maxWidth: 0,
        minHeight: 0,
        maxHeight: 0,
        drawShadow: true,
        flippingTime: 1000,
        usePortrait: true,
        startZIndex: 0,
        autoSize: true,
        maxShadowOpacity: 1
    };
    return Settings;
})();

function styleInject(css, ref) {
  if ( ref === void 0 ) ref = {};
  var insertAt = ref.insertAt;

  if (!css || typeof document === 'undefined') { return; }

  var head = document.head || document.getElementsByTagName('head')[0];
  var style = document.createElement('style');
  style.type = 'text/css';

  if (insertAt === 'top') {
    if (head.firstChild) {
      head.insertBefore(style, head.firstChild);
    } else {
      head.appendChild(style);
    }
  } else {
    head.appendChild(style);
  }

  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }
}

var css_248z = ".stf__parent {\n  position: relative;\n  display: block;\n  box-sizing: border-box;\n  transform: translateZ(0);\n}\n\n.sft__wrapper {\n  position: relative;\n  width: 100%;\n  box-sizing: border-box;\n}\n\n.stf__parent canvas {\n  position: absolute;\n  width: 100%;\n  height: 100%;\n  left: 0;\n  top: 0;\n}\n\n.stf__block {\n  position: absolute;\n  width: 100%;\n  height: 100%;\n  box-sizing: border-box;\n}\n\n.stf__item {\n  display: none;\n  position: absolute;\n}\n\n.stf__outerShadow {\n  position: absolute;\n}\n\n.stf__innerShadow {\n  position: absolute;\n}";
styleInject(css_248z);

class PageFlip extends EventObject {
    constructor(inBlock, setting) {
        super();
        this.isUserTouch = false;
        this.isUserMove = false;
        this.pages = null;
        this.currentPage = 0;
        this.setting = null;
        try {
            this.setting = Settings.GetSettings(setting);
            this.block = inBlock;
        }
        catch (e) {
            //
        }
    }
    update() {
        this.render.update();
        this.pages.show(this.currentPage);
    }
    turnToPrevPage() {
        const dp = this.render.getOrientation() === "portrait" /* PORTRAIT */ ? 1 : 2;
        if (this.currentPage < dp)
            return;
        this.currentPage -= dp;
        this.pages.show(this.currentPage);
    }
    turnToNextPage() {
        const dp = this.render.getOrientation() === "portrait" /* PORTRAIT */ ? 1 : 2;
        if (this.currentPage > this.pages.getPageCount() - dp)
            return;
        this.currentPage += dp;
        this.pages.show(this.currentPage);
    }
    turnToPage(pageNum) {
        if (!this.checkPage(pageNum))
            return;
        this.currentPage = pageNum;
        this.pages.show(this.currentPage);
    }
    flipNext(corner = "top" /* TOP */) {
        this.flip.flipNext(corner);
    }
    flipPrev(corner = "top" /* TOP */) {
        this.flip.flipPrev(corner);
    }
    loadFromImages(imagesHref) {
        this.ui = new CanvasUI(this.block, this, this.setting);
        const canvas = this.ui.getCanvas();
        this.render = new CanvasRender(this, this.setting, canvas);
        this.flip = new Flip(this.render, this);
        this.pages = new ImagePageCollection(this, this.render, imagesHref);
        this.pages.load();
        this.render.start();
        this.currentPage = this.setting.startPage;
        this.pages.show(this.setting.startPage);
    }
    loadFromHTML(items) {
        this.ui = new HTMLUI(this.block, this, this.setting, items);
        this.render = new HTMLRender(this, this.setting, this.ui.getDistElement(), items);
        this.flip = new Flip(this.render, this);
        this.pages = new HTMLPageCollection(this, this.render, this.ui.getDistElement(), items);
        this.pages.load();
        this.render.start();
        this.currentPage = this.setting.startPage;
        this.pages.show(this.setting.startPage);
    }
    updateState(newState) {
        this.trigger('changeState', this, newState);
    }
    updatePage(newPage) {
        this.trigger('flip', this, newPage);
    }
    updateOrientation(newOrientation) {
        if (newOrientation === "landscape" /* LANDSCAPE */) {
            if ((this.currentPage % 2) !== 0)
                this.currentPage--;
            this.update();
        }
        else {
            this.currentPage++;
            this.update();
        }
        this.ui.setOrientationStyle(newOrientation);
        this.trigger('changeOrientation', this, newOrientation);
    }
    getPageCount() {
        return this.pages.getPageCount();
    }
    getCurrentPageIndex() {
        return this.currentPage;
    }
    getCurrentPage() {
        return this.pages.getPage(this.currentPage);
    }
    getPage(pageNum) {
        return this.pages.getPage(pageNum);
    }
    getRender() {
        return this.render;
    }
    getFlipObject() {
        return this.flip;
    }
    getOrientation() {
        return this.render.getOrientation();
    }
    getBoundsRect() {
        return this.render.getRect();
    }
    getSettings() {
        return this.setting;
    }
    getUI() {
        return this.ui;
    }
    startUserTouch(pos) {
        this.mousePosition = pos;
        this.isUserTouch = true;
        this.isUserMove = false;
    }
    userMove(pos, isTouch) {
        if ((!this.isUserTouch) && (!isTouch)) {
            this.flip.showCorner(pos);
        }
        else if (this.isUserTouch) {
            if (Helper.GetDestinationFromTwoPoint(this.mousePosition, pos) > 5) {
                this.isUserMove = true;
                this.flip.fold(pos);
            }
        }
    }
    userStop(pos, isSwipe = false) {
        if (this.isUserTouch) {
            this.isUserTouch = false;
            if (!isSwipe) {
                if (!this.isUserMove)
                    this.flip.flip(pos);
                else
                    this.flip.stopMove();
            }
        }
    }
    checkPage(page) {
        return ((page >= 0) && (page < this.pages.getPageCount()));
    }
}

export { PageFlip };
