import {User} from "../models/user.model.js";
import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";


export const isAdmin = asyncHandler(async (req, _, next) => {
    const user = await User.findById(req.user._id);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    if (!user.roles.includes(process.env.ADMIN_ROLE_ID))  {
      throw new ApiError(403, "Access denied");
    }

    next();
  });