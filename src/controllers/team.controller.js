

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js ";
import { roleModel } from "../models/role.model.js";
import {ApiResponse}  from "../utils/ApiRespons.js";
import { User } from "../models/user.model.js";


const addTeam = asyncHandler(async (req, res) => {
    const { name, members, permissions } = req.body;

    if (!name) throw new ApiError(400, "Provide team name");
    if (!members || members.length === 0) throw new ApiError(400, "Provide team members");
    if (!permissions || permissions.length === 0) throw new ApiError(400, "Provide team permissions");

    const existingTeam = await roleModel.findOne({ name });
    if (existingTeam) throw new ApiError(400, "Team already exists");

    const newTeam = await roleModel.create({ name, members, permissions });

    if (!newTeam) throw new ApiError(500, "Something went wrong");

    res.status(201).json(new ApiResponse(200, newTeam, "Team added successfully"));
});


const editTeam = asyncHandler(async (req, res) => {
    const { name, members, permissions, teamId } = req.body;

    const team = await roleModel.findById(teamId);
    if (!team) return res.status(404).json({ message: "Team not found" });

    const users = await User.find({ teams: teamId });

    for (const user of users) {
      user.permissions = user.permissions.filter(
        (perm) => !team.permissions.includes(perm)
      );

      user.permissions.push(...permissions);
      await user.save();
    }

    team.name = name;
    team.members = members;
    team.permissions = permissions;
    await team.save();

    res.status(200).json(new ApiResponse(200, team, "Team updated successfully"));
  });


  const deleteTeam = asyncHandler(async (req, res) => {
    const { teamId } = req.body;
  
    const team = await roleModel.findByIdAndDelete(teamId);
    if (!team) return res.status(404).json({ message: "Team not found" });
  
    const users = await User.find({ teams: teamId });
  
    for (const user of users) {
        user.permissions = user.permissions.filter(
          (perm) => !team.permissions.includes(perm)
        )
      user.teams = user.teams.filter((teamId) => teamId !== teamId);
      await user.save();
    }
  
    res.status(200).json(new ApiResponse(200, team, "Team deleted successfully"));
  });

  const getTeam = asyncHandler(async (req, res) => {
    const { teamId } = req.body;
  
    const team = await roleModel.findById(teamId);
    if (!team) return res.status(404).json({ message: "Team not found" });
  
    res.status(200).json(new ApiResponse(200, team, "Team fetched successfully"));
  });


export {addTeam,editTeam,deleteTeam,getTeam}