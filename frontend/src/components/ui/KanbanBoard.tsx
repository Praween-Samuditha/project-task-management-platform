"use client";

import React, { useState } from "react";
import { Task } from "@/types";
import KanbanCard from "./KanbanCard";
import Loader from "./Loader";

interface KanbanBoardProps {
  tasks: Task[];
  isLoading?: boolean;
  onTaskUpdate?: (task: Task) => void;
  onTaskDelete?: (id: number) => void;
}

const COLUMNS = [
  { id: "TODO", title: "TO DO", color: "bg-blue-900" },
  { id: "IN_PROGRESS", title: "IN PROGRESS", color: "bg-yellow-900" },
  { id: "IN_REVIEW", title: "IN REVIEW", color: "bg-purple-900" },
  { id: "DONE", title: "DONE", color: "bg-green-900" },
];

export default function KanbanBoard({
  tasks,
  isLoading = false,
  onTaskUpdate,
  onTaskDelete,
}: KanbanBoardProps) {
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);

  // Group tasks by status
  const groupedTasks = COLUMNS.reduce(
    (acc, column) => {
      acc[column.id] = tasks.filter((task) => task.status === column.id);
      return acc;
    },
    {} as Record<string, Task[]>
  );

  const handleDragStart = (task: Task) => {
    setDraggedTask(task);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add("bg-gray-700");
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove("bg-gray-700");
  };

  const handleDrop = (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    e.currentTarget.classList.remove("bg-gray-700");

    if (draggedTask) {
      const updatedTask = { ...draggedTask, status: newStatus as any };
      onTaskUpdate?.(updatedTask);
      setDraggedTask(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6 bg-gray-900 rounded-lg">
      {COLUMNS.map((column) => (
        <div
          key={column.id}
          className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700"
        >
          {/* Column Header */}
          <div className={`${column.color} px-4 py-3 border-b border-gray-700`}>
            <h2 className="font-semibold text-white text-sm">
              {column.title}
            </h2>
            <p className="text-xs text-gray-300 mt-1">
              {groupedTasks[column.id]?.length || 0} tasks
            </p>
          </div>

          {/* Cards Container */}
          <div
            className="p-4 min-h-96 transition-colors"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            {groupedTasks[column.id] && groupedTasks[column.id].length > 0 ? (
              groupedTasks[column.id].map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={() => handleDragStart(task)}
                  className={draggedTask?.id === task.id ? "opacity-50" : ""}
                >
                  <KanbanCard
                    task={task}
                    onUpdate={onTaskUpdate}
                    onDelete={onTaskDelete}
                  />
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center h-96 text-gray-500">
                <p className="text-sm">No tasks</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
