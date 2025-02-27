import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js ";
import { User } from "../models/user.model.js";
import {ApiResponse}  from "../utils/ApiRespons.js";
import jwt from "jsonwebtoken";
import { sendEmail } from "../utils/email.js";

const generateAccessAndRefreshToken = async (userId) => {
  try {

    const user = await User.findById(userId);
    
    if (!user) {
      throw new ApiError(404, "User not found while generating access token and refresh token");
    }

    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access token"
    );
  }
};


/// only admin has right to do this
const registerUser = asyncHandler(async (req, res) => {

  const { name, email, password, roles, permissions} = req.body;

  if(roles?.length == 0 || permissions?.length == 0){
    throw new ApiError(400,"Roles or  permissions are required")
  }

  if (
    [email, name, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({
    $or: [{ name }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or name already exists");
  }

  const user = await User.create({
    email,
    password,
    name,
    roles,
    permissions

  });


  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  const link = `http://localhost:3000/change-password?user=${createdUser._id}`;
  const message = `Please set your password by clicking upon this link: \n\n ${link}`;
  await sendEmail({
    email,
    subject: "Complete signup process",
    message,
  });

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered Successfully"));
});

const loginUser = asyncHandler(async (req, res) => {

  const { email, password } = req.body;

  if (!email) {
    throw new ApiError(400, "email is required");
  }

  if (!password) {
    throw new ApiError(400, "password is required");
  }

  const user = await User.findOne({
    $or: [{ email }],
  });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  // giving Access and refresh Token

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  // user details without refreshtoken  and password
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!loggedInUser) {
    throw new ApiError(500, "Something went wrong while logging in the user");
  }

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged In Successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {

  if (!req.user) {
    throw new ApiError(401, "Unauthorized request");
  }

  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"));
});



const refreshAccessToken = asyncHandler(async (req, res) => {

  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "unauthorized request");
  }


  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    if (!decodedToken) {
      throw new ApiError(401, "Invalid refresh token");
    }

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }

    const options = {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    };

    const {
      accessToken,
      newRefreshToken,
    } = await generateAccessAndRefreshToken(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

const setPassword = asyncHandler(async (req, res) => {
  const { password, conformPassword } = req.body;

  if (!password || !conformPassword) {
    throw new ApiError(400, "All fields are required");
  }

  if (password !== conformPassword) {
    throw new ApiError(400, "conform password and new password are not same");
  }

  await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        password,
      },
    },
    {
      new: true,
    }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});


const changeCurrentPassword = asyncHandler(async (req, res) => {

  
  const { oldPassword, newPassword, conformPassword } = req.body;

  if (!oldPassword || !newPassword || !conformPassword) {
    throw new ApiError(400, "All fields are required");
  }

  if (newPassword !== conformPassword) {
    throw new ApiError(400, "conform password and newpassword are not same   ");
  }

  const user = await User.findById(req.user?._id);

  const isPasswordCorrected = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrected) {
    throw new ApiError(400, "Old password is invalid ");
  }

  await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        password: newPassword,
      },
    },
    {
      new: true,
    }
  ).select("-password");

  //   user.password = newPassword;
    await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {

  const user = await User.findById(req.user?._id);

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      user, 
      "User fetched successfully"
    )
  );
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    throw new ApiError(400, "All field are required");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        name,
        email,
      },
    },
    {
      new: true,
    }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "account details updated successfully"));
});


export {
  registerUser,
  logoutUser,
  loginUser,
  refreshAccessToken,
  getCurrentUser,
  changeCurrentPassword,
  updateAccountDetails,
  setPassword
  
};
