"use client";

import React from "react";
import { Project } from "@/types";
import Loader from "./Loader";

interface ProjectKanbanCardProps {
  project: Project;
  onEdit?: (project: Project) => void;
  onMembers?: (project: Project) => void;
  onDelete?: (id: number) => void;
}

function ProjectKanbanCard({ project, onEdit, onMembers, onDelete }: ProjectKanbanCardProps) {
  return (
    <div className="bg-gray-800 rounded-lg p-4 mb-3 border border-gray-700 hover:border-gray-600 cursor-default transition-colors">
      {/* Project ID */}
      <div className="text-xs text-gray-400 mb-2">#{project.id}</div>

      {/* Title */}
      <h3 className="font-semibold text-white mb-2 text-sm line-clamp-2">
        {project.name}
      </h3>

      {/* Description */}
      {project.description && (
        <p className="text-xs text-gray-400 mb-3 line-clamp-2">
          {project.description}
        </p>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 mb-3 text-xs text-gray-300">
        <div>Tasks: {project._count?.tasks || 0}</div>
        <div>Members: {project._count?.members || 0}</div>
      </div>

      {project.members && project.members.length > 0 && (
        <div className="mb-3 text-xs text-gray-300">
          <div className="font-semibold text-white text-[11px] uppercase tracking-[0.2em] mb-1">Members</div>
          <div className="leading-5">
            {project.members.slice(0, 2).map((member, index) => (
              <span key={member.user.id}>
                {member.user.firstName} {member.user.lastName}{index < Math.min(project.members.length, 2) - 1 ? ", " : ""}
              </span>
            ))}
            {project.members.length > 2 && (
              <span className="text-gray-400"> +{project.members.length - 2} more</span>
            )}
          </div>
        </div>
      )}

      {/* Owner */}
      <div className="text-xs text-gray-500 border-t border-gray-700 pt-2">
        Owner: {project.owner.firstName} {project.owner.lastName}
      </div>

      {/* Actions */}
      {(onEdit || onMembers || onDelete) && (
        <div className="flex gap-2 mt-3">
          {onEdit && (
            <button
              onClick={() => onEdit(project)}
              className="flex-1 text-xs bg-blue-900 hover:bg-blue-800 text-white py-1 rounded transition-colors"
            >
              Edit
            </button>
          )}
          {onMembers && (
            <button
              onClick={() => onMembers(project)}
              className="flex-1 text-xs bg-slate-900 hover:bg-slate-800 text-white py-1 rounded transition-colors"
            >
              Members
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(project.id)}
              className="flex-1 text-xs bg-red-900 hover:bg-red-800 text-white py-1 rounded transition-colors"
            >
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}

interface ProjectKanbanBoardProps {
  projects: Project[];
  isLoading?: boolean;
  onProjectEdit?: (project: Project) => void;
  onProjectMembers?: (project: Project) => void;
  onProjectDelete?: (id: number) => void;
}

const COLUMNS = [
  { id: "PLANNING", title: "PLANNING", color: "bg-blue-900" },
  { id: "ACTIVE", title: "ACTIVE", color: "bg-green-900" },
  { id: "COMPLETED", title: "COMPLETED", color: "bg-gray-700" },
];

export default function ProjectKanbanBoard({
  projects,
  isLoading = false,
  onProjectEdit,
  onProjectMembers,
  onProjectDelete,
}: ProjectKanbanBoardProps) {
  // Group projects by status
  const groupedProjects = COLUMNS.reduce(
    (acc, column) => {
      acc[column.id] = projects.filter((project) => project.status === column.id);
      return acc;
    },
    {} as Record<string, Project[]>
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-gray-900 rounded-lg">
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
              {groupedProjects[column.id]?.length || 0} projects
            </p>
          </div>

          {/* Cards Container */}
          <div className="p-4 min-h-96">
            {groupedProjects[column.id] && groupedProjects[column.id].length > 0 ? (
              groupedProjects[column.id].map((project) => (
                <ProjectKanbanCard
                  key={project.id}
                  project={project}
                  onEdit={onProjectEdit}
                  onMembers={onProjectMembers}
                  onDelete={onProjectDelete}
                />
              ))
            ) : (
              <div className="flex items-center justify-center h-96 text-gray-500">
                <p className="text-sm">No projects</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
