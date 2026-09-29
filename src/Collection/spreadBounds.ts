export function canAdvanceSpread(currentIndex: number, spreadCount: number): boolean {
    return currentIndex < spreadCount - 1;
}

export function canRewindSpread(currentIndex: number): boolean {
    return currentIndex > 0;
}
