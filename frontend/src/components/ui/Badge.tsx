type BadgeVariant = "default" | "success" | "warning" | "danger" | "info" | "purple" | "orange";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variants: Record<BadgeVariant, string> = {
  default: "bg-ink-900/6 text-ink-500",
  success: "bg-emerald-50 text-emerald-700",
  warning: "bg-amber-50 text-amber-700",
  danger: "bg-red-50 text-red-700",
  info: "bg-blue-50 text-blue-700",
  purple: "bg-violet-50 text-violet-700",
  orange: "bg-orange-50 text-orange-700",
};

export default function Badge({ children, variant = "default", className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium tracking-wide ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

// Status indicator (Linear circle style)
interface StatusDotProps {
  status: string;
  showLabel?: boolean;
}

const STATUS_CONFIG: Record<string, { color: string; label: string; icon: string }> = {
  TODO: { color: "#9a9aaa", label: "Todo", icon: "○" },
  IN_PROGRESS: { color: "#f59e0b", label: "In Progress", icon: "◑" },
  IN_REVIEW: { color: "#8b5cf6", label: "In Review", icon: "◑" },
  DONE: { color: "#10b981", label: "Done", icon: "●" },
  ACTIVE: { color: "#10b981", label: "Active", icon: "●" },
  COMPLETED: { color: "#8b5cf6", label: "Completed", icon: "●" },
  PLANNING: { color: "#f59e0b", label: "Planning", icon: "○" },
};

const PRIORITY_CONFIG: Record<string, { color: string; label: string }> = {
  LOW: { color: "#10b981", label: "Low" },
  MEDIUM: { color: "#3b82f6", label: "Medium" },
  HIGH: { color: "#f59e0b", label: "High" },
  URGENT: { color: "#ef4444", label: "Urgent" },
};

export function StatusDot({ status, showLabel = true }: StatusDotProps) {
  const cfg = STATUS_CONFIG[status] ?? { color: "#9a9aaa", label: status, icon: "○" };
  return (
    <span className="inline-flex items-center gap-1.5 text-[12px] font-medium" style={{ color: cfg.color }}>
      <span className="text-base leading-none">{cfg.icon}</span>
      {showLabel && <span className="text-ink-700">{cfg.label}</span>}
    </span>
  );
}

export function PriorityIcon({ priority }: { priority: string }) {
  const cfg = PRIORITY_CONFIG[priority] ?? { color: "#9a9aaa", label: priority };
  return (
    <span className="inline-flex items-center gap-1.5 text-[12px] font-medium">
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: cfg.color }} />
      <span className="text-ink-700">{cfg.label}</span>
    </span>
  );
}

export function RoleBadge({ role }: { role: string }) {
  const map: Record<string, BadgeVariant> = {
    ADMIN: "danger",
    MANAGER: "purple",
    MEMBER: "info",
  };
  return <Badge variant={map[role] ?? "default"}>{role}</Badge>;
}

// Legacy helpers (still used in some places)
export function statusBadge(status: string) {
  return <StatusDot status={status} />;
}

export function priorityBadge(priority: string) {
  return <PriorityIcon priority={priority} />;
}

export function roleBadge(role: string) {
  return <RoleBadge role={role} />;
}
