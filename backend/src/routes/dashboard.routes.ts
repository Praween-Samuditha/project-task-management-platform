import { Router } from "express";
import { getDashboard } from "../controllers/dashboard.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorizeRoles } from "../middleware/rbac.middleware";

const router = Router();

router.use(authenticate);

// Only ADMIN and MANAGER can view the dashboard
router.get(
  "/",
  authorizeRoles("ADMIN", "MANAGER"),
  getDashboard
);

export default router;
