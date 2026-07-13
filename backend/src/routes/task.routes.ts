import { Router } from "express";
import * as taskController from "../controllers/task.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorizeRoles } from "../middleware/rbac.middleware";

const router = Router();

router.use(authenticate);

router.post(
  "/",
  authorizeRoles("ADMIN", "MANAGER"),
  taskController.createTask
);

router.get(
  "/",
  authorizeRoles("ADMIN", "MANAGER", "MEMBER"),
  taskController.getAllTasks
);

router.get(
  "/:id",
  authorizeRoles("ADMIN", "MANAGER", "MEMBER"),
  taskController.getTaskById
);

router.put(
  "/:id",
  authorizeRoles("ADMIN", "MANAGER", "MEMBER"),
  taskController.updateTask
);

router.delete(
  "/:id",
  authorizeRoles("ADMIN"),
  taskController.deleteTask
);

export default router;
