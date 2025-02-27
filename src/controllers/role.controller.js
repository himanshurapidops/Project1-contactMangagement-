
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


// const addRole = asyncHandler(async (req, res, next) => {
//     const { name, permissions } = req.body;

//     const role = await roleModel.findOne({ name });
    
//     if (!name) {
//     throw new ApiError(400, "provide role");
//     }
//     if (permissions.length <= 0) {
//         throw new ApiError(400, "provide permissions of role");
//     }
//     if (role) {
//         throw new ApiError(400, "Role already exists");
//     }
//     const des = new roleModel({ name, permissions });
//     await des.save();
//    return res.status(201).json(

//       new ApiResponse(200, des, "Role added Successfully")
//     ); 
//   });

  
  // const editRole = asyncHandler(async (req, res, next) => {
  //   const { name, permissions, roleId } = req.body;
  //   const role = await roleModel.findById(roleId);
  //   const users = await User.find({
  //     roles: roleId,
  //   });
  //   users.forEach((user) => {
  //     role.permissions.forEach((per) => {
  //       const index = user.permissions.indexOf(per);
  //       user.permissions.splice(index, 1);
  //     });
  //   });
  //   role.name = name;
  //   role.permissions = permissions;
  //   users.forEach(async (user) => {
  //     user.permissions.concat(permissions);
  //     await user.save();
  //   });
  //   await role.save();
  //   res.status(200).json(
  //     new ApiResponse(200, role, "Role updated Successfully")
  //   );
  // });
  





//changed the logic look one time
 

const editRole= asyncHandler(async (req, res) => {
    const { name, permissions, roleId } = req.body;

    const role = await roleModel.findById(roleId);
    if (!role) return res.status(404).json({ message: "Role not found" });
  
    const users = await User.find({ roles: roleId });
  
    for (const user of users) {
      user.permissions = user.permissions.filter(
        (perm) => !role.permissions.includes(perm)
      );
  
      user.permissions.push(...permissions);
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