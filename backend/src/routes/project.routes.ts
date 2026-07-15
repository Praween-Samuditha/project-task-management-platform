import { Router } from "express";
import * as projectController from "../controllers/project.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorizeRoles } from "../middleware/rbac.middleware";

const router = Router();

// Secure all routes in this router
router.use(authenticate);

router.post(
  "/",
  authorizeRoles("ADMIN", "MANAGER"),
  projectController.createProject
);

router.get(
  "/",
  projectController.getProjects
);

router.get(
  "/:id",
  projectController.getProjectById
);

router.put(
  "/:id",
  authorizeRoles("ADMIN"),
  projectController.updateProject
);

router.delete(
  "/:id",
  authorizeRoles("ADMIN"),
  projectController.deleteProject
);

export default router;

