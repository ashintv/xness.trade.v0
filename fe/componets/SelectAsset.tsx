export function SelectAsset({ value, onChange }:{ value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; }){
    return (
        <div>
            <select value={value} onChange={onChange}>
                <option value="BTCUSDT">BTC/USDT</option>
                <option value="ETHUSDT">ETH/USDT</option>
                <option value="BNBUSDT">BNB/USDT</option>
                <option value="XRPUSDT">XRP/USDT</option>
                <option value="ADAUSDT">ADA/USDT</option>
            </select>
        </div>
    )
}