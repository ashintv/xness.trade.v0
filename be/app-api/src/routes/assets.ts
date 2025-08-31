import express from 'express'
const assetsRouter = express.Router();
/**
 * GET /api/v1/assets -- get all assets
 */
assetsRouter.get("/", (req, res) => {
  // Handle get all assets
});

export { assetsRouter };