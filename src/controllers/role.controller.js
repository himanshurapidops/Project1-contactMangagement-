
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js ";
import { roleModel } from "../models/role.model.js";
import {ApiResponse}  from "../utils/ApiRespons.js";
import { User } from "../models/user.model.js";

const addRole = asyncHandler(async (req, res) => {
  const { name, permissions } = req.body;

  if (!name) throw new ApiError(400, "Provide role name");
  if (!permissions || permissions.length === 0) throw new ApiError(400, "Provide role permissions");

  const existingRole = await roleModel.findOne({ name });
  if (existingRole) throw new ApiError(400, "Role already exists");

  const newRole = await roleModel.create({ name, permissions });

  if (!newRole) throw new ApiError(500, "Something went wrong");

  res.status(201).json(new ApiResponse(200, newRole, "Role added successfully"));
});

const editRole= asyncHandler(async (req, res) => {
    const { name, permissions } = req.body;
    const { roleId } = req.params;

    if (!name) throw new ApiError(400, "Provide role name");
    if (!permissions || permissions.length === 0) throw new ApiError(400, "Provide role permissions");
    if (!roleId) throw new ApiError(400, "Provide role id");

    const role = await roleModel.findById(roleId);
    if (!role) return res.status(404).json({ message: "Role not found" });
  
    const users = await User.find({ roles: roleId });

    for (const user of users) {
      user.permissions = user.permissions.filter(
        (perm) => !role.permissions.includes(perm));
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

    const role = await roleModel.findByIdAndDelete(roleId);
    if (!role) return res.status(404).json({ message: "Role not found" });
  
    res.status(200).json(new ApiResponse(200, null, "Role deleted successfully"));
  });
  
  const getRole = asyncHandler(async (req, res) => {

    const { roleId } = req.params;
  
    const role = await roleModel.findById(roleId);

    if (!role) return res.status(404).json({ message: "Role not found" });

    res.status(200).json(new ApiResponse(200, role, "Role fetched successfully"));
  });

  const getRoles = asyncHandler(async (req, res, _) => {
    const roles = await roleModel.find();
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