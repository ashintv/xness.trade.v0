import { roundTo } from "./RoundN";

/* Converts a value to a percentage of a total. */
export function convertToPercentage(value: number, total: number): number {
	if (total === 0) return 0;
	const res = (value / total) * 100;
	return roundTo(res);
}

/* Converts a percentage to value. */
export function convertFromPercentage(
	percentage: number,
	total: number
): number {
	if (total === 0) return 0;
	return roundTo((percentage / 100) * total);
}
