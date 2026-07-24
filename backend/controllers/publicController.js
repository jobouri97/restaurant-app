import {
  findUserByPublicCode,
} from "../models/userModel.js";
import { findTableByQrCode } from "../models/tableModel.js";

export const getPublicRestaurant = async (req, res, next) => {
  try {
    const { publicCode } = req.params;

    const restaurant = await findUserByPublicCode(publicCode);

    if (!restaurant) {
      return res.status(404).json({
        message: "Restaurant not found",
      });
    }

    return res.json({
      restaurant: {
        name: restaurant.name,
        publicCode: restaurant.public_code,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getPublicTable = async (req, res, next) => {
  try {
    const table = await findTableByQrCode(req.params.qrCode);

    if (!table) {
      return res.status(404).json({
        message: "Table QR code is invalid",
      });
    }

    return res.json({
      table: {
        id: table.id,
        number: table.number,
      },
      restaurant: {
        name: table.restaurant_name,
        publicCode: table.public_code,
      },
    });
  } catch (error) {
    next(error);
  }
};
