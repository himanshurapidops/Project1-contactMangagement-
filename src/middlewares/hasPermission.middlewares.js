import {User} from "../models/user.model.js";
import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";

 const hasPermission = (requiredPermission) =>
    asyncHandler(async (req,_, next) => {
      const user = await User.findById(req.user._id);
  
      if (!user) {
        throw new ApiError(404, "User not found");
      }
  
      if (!user.permissions.includes(requiredPermission)) {
        throw new ApiError(403, "Access denied");
      }

      next();
    });
  
    export {hasPermission};