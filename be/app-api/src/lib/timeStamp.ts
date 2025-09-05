export function timeStampToDate(timestamp: number): string {
    const ts = new Date(Number(timestamp))
			.toISOString()
			.replace("T", " ")
			.replace("Z", "");
    return ts;
}

