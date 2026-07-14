"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export interface Workspace {
  id: string;
  name: string;
  color: string;
  memberCount: number;
  createdAt: string;
}

interface WorkspaceContextValue {
  workspaces: Workspace[];
  current: Workspace | null;
  switchWorkspace: (id: string) => void;
  createWorkspace: (name: string) => void;
  editWorkspace: (id: string, name: string) => void;
  deleteWorkspace: (id: string) => void;
  /** project IDs that belong to the current workspace */
  currentProjectIds: number[];
  addProjectToWorkspace: (projectId: number) => void;
  removeProjectFromWorkspace: (projectId: number) => void;
}

const WorkspaceContext = createContext<WorkspaceContextValue>({
  workspaces: [], current: null,
  switchWorkspace: () => {}, createWorkspace: () => {},
  editWorkspace: () => {}, deleteWorkspace: () => {},
  currentProjectIds: [],
  addProjectToWorkspace: () => {}, removeProjectFromWorkspace: () => {},
});

const WS_KEY = "fp_workspaces";
const CUR_KEY = "fp_current_workspace";
const PROJ_KEY = "fp_workspace_projects"; // Record<wsId, number[]>

const PALETTE = ["#0052CC", "#36B37E", "#FF5630", "#6554C0", "#FFAB00", "#00B8D9"];

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  // map of wsId -> project id array
  const [wsProjects, setWsProjects] = useState<Record<string, number[]>>({});

  useEffect(() => {
    // load workspaces
    let stored: Workspace[] = [];
    try { stored = JSON.parse(localStorage.getItem(WS_KEY) ?? "[]"); } catch {}
    if (stored.length === 0) {
      const def: Workspace = { id: "default", name: "My Workspace", color: PALETTE[0], memberCount: 1, createdAt: new Date().toISOString() };
      stored = [def];
      localStorage.setItem(WS_KEY, JSON.stringify(stored));
    }
    setWorkspaces(stored);

    const cur = localStorage.getItem(CUR_KEY) ?? stored[0].id;
    setCurrentId(cur);

    // load project map
    let projMap: Record<string, number[]> = {};
    try { projMap = JSON.parse(localStorage.getItem(PROJ_KEY) ?? "{}"); } catch {}
    setWsProjects(projMap);
  }, []);

  const saveWsProjects = (map: Record<string, number[]>) => {
    setWsProjects(map);
    localStorage.setItem(PROJ_KEY, JSON.stringify(map));
  };

  const switchWorkspace = (id: string) => {
    setCurrentId(id);
    localStorage.setItem(CUR_KEY, id);
  };

  const createWorkspace = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const ws: Workspace = {
      id: `ws_${Date.now()}`,
      name: trimmed,
      color: PALETTE[workspaces.length % PALETTE.length],
      memberCount: 1,
      createdAt: new Date().toISOString(),
    };
    const next = [...workspaces, ws];
    setWorkspaces(next);
    localStorage.setItem(WS_KEY, JSON.stringify(next));
    switchWorkspace(ws.id);
  };

  const editWorkspace = (id: string, name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const next = workspaces.map(w => w.id === id ? { ...w, name: trimmed } : w);
    setWorkspaces(next);
    localStorage.setItem(WS_KEY, JSON.stringify(next));
  };

  const deleteWorkspace = (id: string) => {
    // must keep at least one workspace
    if (workspaces.length <= 1) return;
    const next = workspaces.filter(w => w.id !== id);
    setWorkspaces(next);
    localStorage.setItem(WS_KEY, JSON.stringify(next));
    // remove its project map
    const { [id]: _, ...restProj } = wsProjects;
    saveWsProjects(restProj);
    // if deleting current, switch to first remaining
    if (currentId === id) switchWorkspace(next[0].id);
  };

  const addProjectToWorkspace = (projectId: number) => {
    if (!currentId) return;
    const existing = wsProjects[currentId] ?? [];
    if (existing.includes(projectId)) return;
    saveWsProjects({ ...wsProjects, [currentId]: [...existing, projectId] });
  };

  const removeProjectFromWorkspace = (projectId: number) => {
    if (!currentId) return;
    const existing = wsProjects[currentId] ?? [];
    saveWsProjects({ ...wsProjects, [currentId]: existing.filter(id => id !== projectId) });
  };

  const current = workspaces.find(w => w.id === currentId) ?? workspaces[0] ?? null;
  const currentProjectIds = currentId ? (wsProjects[currentId] ?? []) : [];

  return (
    <WorkspaceContext.Provider value={{
      workspaces, current, switchWorkspace, createWorkspace,
      editWorkspace, deleteWorkspace,
      currentProjectIds, addProjectToWorkspace, removeProjectFromWorkspace,
    }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() { return useContext(WorkspaceContext); }
