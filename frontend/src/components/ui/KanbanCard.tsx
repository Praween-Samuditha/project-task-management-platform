"use client";

import React from "react";
import { Task } from "@/types";
import Badge from "./Badge";
import { format } from "date-fns";

interface KanbanCardProps {
  task: Task;
  onUpdate?: (task: Task) => void;
  onDelete?: (id: number) => void;
}

const priorityConfig = {
  LOW: { color: "info", label: "Low" },
  MEDIUM: { color: "warning", label: "Medium" },
  HIGH: { color: "danger", label: "High" },
  URGENT: { color: "danger", label: "Urgent" },
};

export default function KanbanCard({
  task,
  onUpdate,
  onDelete,
}: KanbanCardProps) {
  const priority = priorityConfig[task.priority];
  const dueDate = task.dueDate ? new Date(task.dueDate) : null;
  const isOverdue = dueDate && dueDate < new Date() && task.status !== "DONE";

  return (
    <div className="bg-gray-800 rounded-lg p-4 mb-3 border border-gray-700 hover:border-gray-600 cursor-move transition-colors">
      {/* Task ID */}
      <div className="text-xs text-gray-400 mb-2">#{task.id}</div>

      {/* Title */}
      <h3 className="font-semibold text-white mb-3 text-sm line-clamp-2">
        {task.title}
      </h3>

      {/* Project */}
      {task.project && (
        <div className="text-xs text-gray-400 mb-2">{task.project.name}</div>
      )}

      {/* Priority Badge */}
      <div className="mb-3">
        <Badge variant={priority.color as any} size="sm">
          {priority.label}
        </Badge>
      </div>

      {/* Due Date */}
      {dueDate && (
        <div
          className={`text-xs mb-3 ${
            isOverdue ? "text-red-400" : "text-gray-400"
          }`}
        >
          Due: {format(dueDate, "MMM d, yyyy")}
        </div>
      )}

      {/* Assignee */}
      {task.assignee && (
        <div className="text-xs text-gray-300 mb-3">
          Assigned to: {task.assignee.firstName} {task.assignee.lastName}
        </div>
      )}

      {/* Created By */}
      <div className="text-xs text-gray-500 border-t border-gray-700 pt-2">
        by {task.createdBy.firstName} {task.createdBy.lastName}
      </div>
    </div>
  );
}
