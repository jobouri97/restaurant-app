import {
  findUserByPublicCode,
} from "../models/userModel.js";

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