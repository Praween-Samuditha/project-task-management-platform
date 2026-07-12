import { Router } from "express";
import * as projectMemberController from "../controllers/projectMember.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorizeRoles } from "../middleware/rbac.middleware";

const router = Router({ mergeParams: true });

router.post(
  "/:id/members",
  authenticate,
  authorizeRoles("ADMIN", "MANAGER"),
  projectMemberController.addMember
);

router.get(
  "/:id/members",
  authenticate,
  projectMemberController.getMembers
);

router.delete(
  "/:id/members/:userId",
  authenticate,
  authorizeRoles("ADMIN", "MANAGER"),
  projectMemberController.removeMember
);

export default router;
