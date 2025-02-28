
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js ";
import { roleModel } from "../models/role.model.js";
import {ApiResponse}  from "../utils/ApiRespons.js";
import { User } from "../models/user.model.js";
import mongoose from "mongoose";

const addRole = asyncHandler(async (req, res) => {
  const { name, permissions } = req.body;

  if (!name) throw new ApiError(400, "Provide role name");
  if (!permissions) throw new ApiError(400, "Provide role permissions");

  const existingRole = await roleModel.findOne({ name });
  if (existingRole) throw new ApiError(400, "Role already exists");

  const newRole = await roleModel.create({ name, permissions });

  if (!newRole) throw new ApiError(500, "Something went wrong");

  res.status(201).json(new ApiResponse(200, newRole, "Role added successfully"));
});

const editRole= asyncHandler(async (req, res) => {
    const { name, permissions,roleId } = req.body;

    if (!name) throw new ApiError(400, "Provide role name");
    if (!permissions ) throw new ApiError(400, "Provide role permissions");
    if (!roleId) throw new ApiError(400, "Provide role id");

    const role = await roleModel.findById(roleId);
    if (!role) return res.status(404).json({ message: "Role not found" });
  
    const users = await User.find({ roles: roleId });

    for (const user of users) {
      for (const rolePerm of role.permissions) {
          const index = user.permissions.findIndex((perm) => perm === rolePerm);
          if (index !== -1) {
              user.permissions.splice(index, 1); 
          }
      }
      await user.save();
  }
  

    for(const user of users){
      for(const permission of permissions){
        user.permissions.push(permission);
        await user.save();
      }
    }

    for(const user of users){
      user.roles = user.roles.filter((role) => role !== roleId);
      user.roles.push(roleId);
      await user.save();
    }

    role.name = name;
    role.permissions = permissions;

    await role.save();
  
    res.status(200).json(new ApiResponse(200, role, "Role updated successfully"));
  });

  
  const deleteRole = asyncHandler(async (req, res) => {
    const { roleId } = req.body;

    if (!roleId) throw new ApiError(400, "Provide role id");

    const roleIdObject = new mongoose.Types.ObjectId(roleId);
    const role = await roleModel.findById(roleIdObject);
    if (!role) return res.status(404).json({ message: "Role not found" });

    const users = await User.find({ roles: roleIdObject });

    for (const user of users) {
        console.log(`Updating user: ${user._id}`);

        user.roles = user.roles.filter((r) => !r.equals(roleIdObject));

        if (Array.isArray(role.permissions)) {
          for (const rolePerm of role.permissions) {
              const index = user.permissions.findIndex((perm) => perm === rolePerm);
              if (index !== -1) {
                  user.permissions.splice(index, 1);
              }
          }
      }
      
        await user.save();
    }

    await roleModel.findByIdAndDelete(roleIdObject);

    res.status(200).json(new ApiResponse(200, null, "Role deleted successfully"));
});
  
  const getRole = asyncHandler(async (req, res) => {

    const { roleId } = req.body;
  
    const role = await roleModel.findById({roleId}, '-__v ,-createdAt -updatedAt');

    if (!role) return res.status(404).json({ message: "Role not found" });

    res.status(200).json(new ApiResponse(200, role, "Role fetched successfully"));
  });

  const getRoles = asyncHandler(async (req, res, _) => {
    const roles = await roleModel.find({}, '-__v -_id, -permissions -roles -createdAt -updatedAt');
    res.status(200).json(
      new ApiResponse(200, roles, "Roles fetched Successfully")
    );
  });

  export  {
    addRole,
    editRole,
    deleteRole,
    getRole,
    getRoles
  };