import express from "express";
import { tradeManager } from "..";
import { AssetMeddata } from "../config";
export const assetsRouter = express.Router();
/**
 * GET /api/v1/assets -- get all assets
 */
assetsRouter.get("/", (req, res) => {
	const asset_prices = tradeManager.getAssets();
	const assets = [];
	for (const symbol in asset_prices) {
		assets.push({
			name: AssetMeddata[symbol as keyof typeof AssetMeddata].name,
			symbol: symbol,
			buyPrice: asset_prices[symbol as keyof typeof asset_prices].ask,
			sellPrice: asset_prices[symbol as keyof typeof asset_prices].bid,
			decimals: AssetMeddata[symbol as keyof typeof AssetMeddata].decimals,
			imageUrl: AssetMeddata[symbol as keyof typeof AssetMeddata].imageUrl,
		});
	}
	res.json({assets});
});
