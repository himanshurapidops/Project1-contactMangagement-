import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js ";
import { teamModel } from "../models/team.model.js";
import {ApiResponse}  from "../utils/ApiRespons.js";
import { User } from "../models/user.model.js";


const addTeam = asyncHandler(async (req, res) => {
    const { name, members, permissions } = req.body;

    if (!name) throw new ApiError(400, "Provide team name");
    if (!members) throw new ApiError(400, "Provide team members");    
    if (!permissions) throw new ApiError(400, "Provide team permissions");

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
  const { teamId } = req.params;
  const { name, members, permissions } = req.body;

  if (!name) throw new ApiError(400, "Provide team name");
  if (!members || !Array.isArray(members)) throw new ApiError(400, "Provide valid team members");
  if (!permissions || !Array.isArray(permissions)) throw new ApiError(400, "Provide valid team permissions");
  if (!teamId) throw new ApiError(400, "Provide team ID");

  const team = await teamModel.findById(teamId);
  if (!team) return res.status(404).json({ message: "Team not found" });

  const existingUsers = await User.find({ teams: teamId });

  for (const user of existingUsers) {
    for (const perm of team.permissions) {
      const index = user.permissions.indexOf(perm);
      if (index !== -1) {
          user.permissions.splice(index, 1); 
      }
    }
      user.teams = user.teams.filter(tId => !tId.equals(teamId)); 
      await user.save();
  }

  team.name = name;
  team.members = members;
  team.permissions = permissions;
  await team.save();

  for (const memberId of members) {
      const user = await User.findById(memberId);
      if (!user) throw new ApiError(400, "User not found");

      if (!user.teams.includes(teamId)) user.teams.push(teamId);

      user.permissions.push(...permissions);  
      await user.save();
  }

  res.status(200).json(new ApiResponse(200, team, "Team updated successfully"));
});


  const deleteTeam = asyncHandler(async (req, res) => {

    const { teamId } = req.body;

    if (!teamId) throw new ApiError(400, "Provide team id");

    
  
    const team = await teamModel.findByIdAndDelete(teamId);

    if (!team) return res.status(404).json({ message: "Team not found" });
  
    const users = await User.find({ teams: teamId });
  
    for (const user of users) {
     
        for (const perm of team.permissions) {
          const index = user.permissions.indexOf(perm);
          if (index !== -1) {
              user.permissions.splice(index, 1); 
          }
        }

      user.teams = user.teams.filter((xteamId) => xteamId !== teamId);
      await user.save();
    }
  
    res.status(200).json(new ApiResponse(200, team, "Team deleted successfully"));
  });

  const getTeam = asyncHandler(async (req, res) => {
    const { teamId } = req.params;
  
    const team = await teamModel.findById(teamId);

    if (!team) return res.status(404).json({ message: "Team not found" });
  
    res.status(200).json(new ApiResponse(200, team, "Team fetched successfully"));
  });

  const getTeams = asyncHandler(async (req, res) => {


    const teams = await teamModel.find();

    if (!teams) return res.status(404).json({ message: "Teams not found" });
  
    res.status(200).json(new ApiResponse(200, teams, "Teams fetched successfully"));
  });


export {addTeam,editTeam,deleteTeam,getTeam,getTeams}