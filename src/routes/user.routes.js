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
import { addRole, deleteRole, editRole, getRole , getRoles} from "../controllers/role.controller.js";
import { addTeam, deleteTeam, editTeam, getTeam , getTeams} from "../controllers/team.controller.js";
import { addContact, deleteContact, editContact, getContact, getContacts } from "../controllers/contact.controller.js";
import  {hasPermission} from "../middlewares/hasPermission.middlewares.js"
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { isAdmin } from "../middlewares/isAdmin.middlewares.js"

// import { loginLimiter } from "../app.js";


const router = Router();
router.route("/register").post(verifyJWT,isAdmin,registerUser);
router.route("/login").post(loginUser); 

//secure route

router.route("/logout").post(verifyJWT, logoutUser);
router.route("/set-password").post(setPassword); // do i need to protect it ??
router.route("/refresh-token").post(refreshAccessToken);
router.route("/change-password").post(verifyJWT, changeCurrentPassword);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/update-account").patch(verifyJWT, updateAccountDetails);

//role route

router.route("/roleAdd").post(verifyJWT,isAdmin, addRole);
router.route("/roleEdit").put(verifyJWT,isAdmin, editRole);
router.route("/roleDelete").delete(verifyJWT,isAdmin, deleteRole);
router.route("/roleGet").get(verifyJWT,isAdmin, getRole);
router.route("/rolesGet").get(verifyJWT,isAdmin, getRoles);

// team route 

router.route("/teamAdd").post(verifyJWT,isAdmin, addTeam);
router.route("/teamEdit").put(verifyJWT,isAdmin, editTeam);
router.route("/teamDelete").delete(verifyJWT,isAdmin, deleteTeam);
router.route("/teamGet").get(verifyJWT,isAdmin, getTeam);
router.route("/teamsGet").get(verifyJWT,isAdmin, getTeams);

//contact route

router.route("/contactAdd").post(verifyJWT,hasPermission('CREATE_CONTACT'), addContact);
router.route("/contactEdit").put(verifyJWT,hasPermission('UPDATE_CONTACT'), editContact);
router.route("/contactDelete").delete(verifyJWT,hasPermission('DELETE_CONTACT'), deleteContact);
router.route("/contactsGet").get(verifyJWT, getContacts);
router.route("/contactGet/:contactId").get(verifyJWT, getContact);

export default router;
