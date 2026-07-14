import { Router } from "express";
import * as userController from "../controllers/user.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorizeRoles } from "../middleware/rbac.middleware";

const router = Router();

router.get("/profile", authenticate, userController.getProfile);

router.post("/", authenticate, authorizeRoles("ADMIN"), userController.createUser);
router.get("/", authenticate, authorizeRoles("ADMIN", "MANAGER"), userController.getAllUsers);
router.get("/:id", authenticate, authorizeRoles("ADMIN"), userController.getUserById);
router.put("/:id/role", authenticate, authorizeRoles("ADMIN"), userController.updateUserRole);
router.put("/:id/deactivate", authenticate, authorizeRoles("ADMIN"), userController.deactivateUser);
router.put("/:id/activate", authenticate, authorizeRoles("ADMIN"), userController.activateUser);

export default router;
