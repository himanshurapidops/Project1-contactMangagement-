import { Router } from "express";
import {
  registerUser,
  logoutUser,
  loginUser,
  refreshAccessToken,
  getCurrentUser,
  changeCurrentPassword,
  updateAccountDetails,
  setPassword

} from "../controllers/user.controller.js";
import { addRole, deleteRole, editRole, getRole } from "../controllers/role.controller.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { isAdmin } from "../middlewares/isAdmin.middlewares.js";



const router = Router();
router.route("/register").post(registerUser);

router.route("/login").post(loginUser); 

//secure route

router.route("/logout").post(verifyJWT, logoutUser);
router.route("/set-password").post(setPassword);
router.route("/refresuh-token").post(refreshAccessToken);
router.route("/change-password").post(verifyJWT, changeCurrentPassword);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/update-account").patch(verifyJWT, updateAccountDetails);



router.route("/roleAdd").post(verifyJWT,isAdmin, addRole);
router.route("/roleEdit").post(verifyJWT,isAdmin, editRole);
router.route("/roleDelete").post(verifyJWT,isAdmin, deleteRole);
router.route("/roleGet").get(verifyJWT,isAdmin, getRole);

export default router;
