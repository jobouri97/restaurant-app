import {
  findProfitDetailsById,
  findProfitsByUserId,
} from "../models/profitModel.js";

export const getProfits = async (req, res, next) => {
  try {
    const profits = await findProfitsByUserId(req.auth.userId);
    return res.json({ profits });
  } catch (error) {
    next(error);
  }
};

export const getProfitDetails = async (req, res, next) => {
  try {
    if (!/^\d+$/.test(req.params.id)) {
      return res.status(400).json({ message: "Invalid profit id" });
    }

    const profit = await findProfitDetailsById(
      req.params.id,
      req.auth.userId,
    );

    if (!profit) {
      return res.status(404).json({ message: "Completed request not found" });
    }

    return res.json({ profit });
  } catch (error) {
    next(error);
  }
};
