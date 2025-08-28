export function Balance({Tradable, Actual}:{Tradable: number, Actual: number}) {
	return (
        <div className="flex flex-col w-fit text-xs">
            Tradable: {Math.round(Tradable * 1000) / 1000}
            <br />
            Actual: {Actual}
        </div>
    )
}
