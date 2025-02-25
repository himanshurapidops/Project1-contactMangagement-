
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js ";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiRespons.js";



const addRole = asyncHandlers(async (req, res, next) => {
    const { name, permissions } = req.body;
    if (!name) {
    throw new ApiError(400, "provide role");
    }
    if (permissions.length <= 0) {
        throw new ApiError(400, "provide permissions of role");
    }
    const des = new designationModel({ name, permissions });
    await des.save();
   return res.status(201).json(

      new ApiResponse(200, des, "Role added Successfully")
    ); 
  });

  
  const editRole = asyncHandler(async (req, res, next) => {
    const { name, permissions, roleId } = req.body;
    const role = await roleModel.findById(roleId);
    const users = await User.find({
      roles: roleId,
    });
    users.forEach((user) => {
      role.permissions.forEach((per) => {
        const index = user.permissions.indexOf(per);
        user.permissions.splice(index, 1);
      });
    });
    role.name = name;
    role.permissions = permissions;
    users.forEach(async (user) => {
      user.permissions.concat(permissions);
      await user.save();
    });
    await role.save();
    res.status(200).json(
      new ApiResponse(200, role, "Role updated Successfully")
    );
  });
  
  const deleteRole = asyncHandler(async (req, res, next) => {
    const { roleId } = req.body;
    const role = await roleModel.findById(roleId);
    role.is_active = 0;
    await role.save();
    res.status(200).json(
      new ApiResponse(200, role, "Role deleted Successfully")
    );
  });
  
  const getRole = asyncHandler(async (req, res, next) => {
    const roles = await roleModel.find({ is_active: 1 });
    res.status(200).json(
      new ApiResponse(200, roles, "Roles fetched Successfully")
    );
  });


  module.exports = {
    addRole,
    editRole,
    deleteRole,
    getRole
  };