import { findProfitsByUserId } from "../models/profitModel.js";

export const getProfits = async (req, res, next) => {
  try {
    const profits = await findProfitsByUserId(req.auth.userId);
    return res.json({ profits });
  } catch (error) {
    next(error);
  }
};
