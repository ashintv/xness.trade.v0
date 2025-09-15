export function roundTo(value: number, decimals: number = 4): number {
    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
}



/**
 * Store a floating-point number as an integer with a specified number of decimal places.
 * @param value The floating-point number to store.
 * @param decimals The number of decimal places to use.
 * @returns The stored integer value.
 */
export function storeValue(value: number, decimals: number): number {
	return Math.round(value * 10 ** decimals);
}

/**
 * Restore a stored integer value to its original floating-point representation.
 * @param stored The stored integer value.
 * @param decimals The number of decimal places that were used during storage.
 * @returns The original floating-point value.
 */
export function restoreValue(stored: number, decimals: number): number {
	return stored / 10 ** decimals;
}


