import { FlipDirection } from './Flip';

export function getFlipDirectionByPoint(x: number, width: number, rtl: boolean): FlipDirection {
    const onLeft = x < width / 2;

    if (rtl) {
        return onLeft ? FlipDirection.FORWARD : FlipDirection.BACK;
    }

    return onLeft ? FlipDirection.BACK : FlipDirection.FORWARD;
}
