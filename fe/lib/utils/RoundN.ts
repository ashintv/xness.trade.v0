export function roundTo(value: number, decimals: number = 4): number {
    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
}
