import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js ";
import { teamModel } from "../models/team.model.js";
import {ApiResponse}  from "../utils/ApiRespons.js";
import { User } from "../models/user.model.js";


const addTeam = asyncHandler(async (req, res) => {
    const { name, members, permissions } = req.body;

    if (!name) throw new ApiError(400, "Provide team name");
    if (!members || members.length === 0) throw new ApiError(400, "Provide team members");    
    if (!permissions || permissions.length === 0) throw new ApiError(400, "Provide team permissions");

    const existingTeam = await teamModel.findOne({ name });
    if (existingTeam) throw new ApiError(400, "Team already exists");

    const newTeam = await teamModel.create({ name, members, permissions });

    for (const member of members) {
      const user = await User.findById(member);
      if (!user) throw new ApiError(400, "User not found");
      user.teams.push(newTeam._id);
      await user.save();
    }

    if (!newTeam) throw new ApiError(500, "Something went wrong");

    res.status(201).json(new ApiResponse(200, newTeam, "Team added successfully"));
});


const editTeam = asyncHandler(async (req, res) => {
    const { name, members, permissions, teamId } = req.body;

    const team = await teamModel.findById(teamId);
    if (!team) return res.status(404).json({ message: "Team not found" });

    const users = await User.find({ teams: teamId });

    for (const user of users) {
      user.permissions = user.permissions.filter(
        (perm) => !team.permissions.includes(perm)
      );
      await user.save();
    }

    for (const user of users) {
      user.teams = user.teams.filter((xTeamId) => teamId !== xTeamId);
      await user.save();
    }


    for (const member of members) {
      const user = await User.findById(member);
      if (!user) throw new ApiError(400, "User not found");
      user.teams.push(teamId);
      await user.save();
    }

    for (const permission of permissions) {
      team.permissions.push(permission);
    }

    for (const member of members) {
      team.members.push(member);
    }

    for(const member of team.members){
      const user = await User.findById(member);
      for(const permission of team.permissions){
        member.permissions.push(permission);
        await user.save();
      }
    }
  
    team.name = name;
    await team.save();

    res.status(200).json(new ApiResponse(200, team, "Team updated successfully"));
  });


  const deleteTeam = asyncHandler(async (req, res) => {
    const { teamId } = req.body;
  
    const team = await teamModel.findByIdAndDelete(teamId);

    if (!team) return res.status(404).json({ message: "Team not found" });
  
    const users = await User.find({ teams: teamId });
  
    for (const user of users) {
        user.permissions = user.permissions.filter(
          (perm) => !team.permissions.includes(perm)
        )
      user.teams = user.teams.filter((xteamId) => xteamId !== teamId);
      await user.save();
    }
  
    res.status(200).json(new ApiResponse(200, team, "Team deleted successfully"));
  });

  const getTeam = asyncHandler(async (req, res) => {
    const { teamId } = req.body;
  
    const team = await teamModel.findById(teamId);
    if (!team) return res.status(404).json({ message: "Team not found" });
  
    res.status(200).json(new ApiResponse(200, team, "Team fetched successfully"));
  });


export {addTeam,editTeam,deleteTeam,getTeam}