import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Tool,
  StorageLocation,
  ScanLog,
  Page,
  ToolStatus,
  ToolCondition,
} from '../types';
import { SAMPLE_TOOLS, LOCATIONS, SAMPLE_SCAN_LOGS } from '../data/sampleData';

interface AppState {
  tools: Tool[];
  locations: StorageLocation[];
  scanLogs: ScanLog[];

  // Navigation
  currentPage: Page;
  selectedToolId: string | null;

  // Actions: Navigation
  navigate: (page: Page, toolId?: string) => void;

  // Actions: Tools
  addTool: (tool: Omit<Tool, 'id' | 'addedDate' | 'checkoutHistory' | 'maintenanceHistory'>) => void;
  updateTool: (id: string, updates: Partial<Tool>) => void;
  deleteTool: (id: string) => void;
  checkoutTool: (toolId: string, checkedOutBy: string, purpose?: string) => void;
  returnTool: (toolId: string, returnedBy: string) => void;
  updateToolStatus: (toolId: string, status: ToolStatus) => void;
  updateToolCondition: (toolId: string, condition: ToolCondition) => void;

  // Actions: Locations
  addLocation: (location: Omit<StorageLocation, 'id'>) => void;
  updateLocation: (id: string, updates: Partial<StorageLocation>) => void;
  deleteLocation: (id: string) => void;

  // Actions: Scan Logs
  addScanLog: (log: Omit<ScanLog, 'id'>) => void;

  // Selectors (derived)
  getToolById: (id: string) => Tool | undefined;
  getLocationById: (id: string) => StorageLocation | undefined;
  getToolsAtLocation: (locationId: string) => Tool[];
  getLowStockTools: () => Tool[];
  getToolsByCategory: () => Record<string, number>;
  getStatusCounts: () => Record<string, number>;
}

function genId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      tools: SAMPLE_TOOLS,
      locations: LOCATIONS,
      scanLogs: SAMPLE_SCAN_LOGS,
      currentPage: 'dashboard',
      selectedToolId: null,

      navigate(page, toolId) {
        set({ currentPage: page, selectedToolId: toolId ?? null });
      },

      addTool(toolData) {
        const tool: Tool = {
          ...toolData,
          id: genId('tool'),
          addedDate: new Date().toISOString(),
          checkoutHistory: [],
          maintenanceHistory: [],
        };
        set((s) => ({ tools: [...s.tools, tool] }));
      },

      updateTool(id, updates) {
        set((s) => ({
          tools: s.tools.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        }));
      },

      deleteTool(id) {
        set((s) => ({ tools: s.tools.filter((t) => t.id !== id) }));
      },

      checkoutTool(toolId, checkedOutBy, purpose) {
        const entry = {
          id: genId('co'),
          toolId,
          checkedOutBy,
          checkedOutAt: new Date().toISOString(),
          purpose,
        };
        set((s) => ({
          tools: s.tools.map((t) =>
            t.id === toolId
              ? {
                  ...t,
                  status: 'checked-out' as ToolStatus,
                  lastUsed: new Date().toISOString(),
                  checkoutHistory: [...t.checkoutHistory, entry],
                }
              : t
          ),
          scanLogs: [
            {
              id: genId('sl'),
              toolId,
              toolName: s.tools.find((t) => t.id === toolId)?.name ?? '',
              action: 'checkout',
              timestamp: new Date().toISOString(),
              performedBy: checkedOutBy,
              notes: purpose,
            },
            ...s.scanLogs,
          ],
        }));
      },

      returnTool(toolId, returnedBy) {
        set((s) => ({
          tools: s.tools.map((t) => {
            if (t.id !== toolId) return t;
            const now = new Date().toISOString();
            const history = t.checkoutHistory.map((e) =>
              !e.returnedAt ? { ...e, returnedAt: now } : e
            );
            return { ...t, status: 'available' as ToolStatus, checkoutHistory: history };
          }),
          scanLogs: [
            {
              id: genId('sl'),
              toolId,
              toolName: s.tools.find((t) => t.id === toolId)?.name ?? '',
              action: 'return',
              timestamp: new Date().toISOString(),
              performedBy: returnedBy,
            },
            ...s.scanLogs,
          ],
        }));
      },

      updateToolStatus(toolId, status) {
        set((s) => ({
          tools: s.tools.map((t) => (t.id === toolId ? { ...t, status } : t)),
        }));
      },

      updateToolCondition(toolId, condition) {
        set((s) => ({
          tools: s.tools.map((t) => (t.id === toolId ? { ...t, condition } : t)),
        }));
      },

      addLocation(locationData) {
        set((s) => ({
          locations: [...s.locations, { ...locationData, id: genId('loc') }],
        }));
      },

      updateLocation(id, updates) {
        set((s) => ({
          locations: s.locations.map((l) => (l.id === id ? { ...l, ...updates } : l)),
        }));
      },

      deleteLocation(id) {
        set((s) => ({ locations: s.locations.filter((l) => l.id !== id) }));
      },

      addScanLog(log) {
        set((s) => ({ scanLogs: [{ ...log, id: genId('sl') }, ...s.scanLogs] }));
      },

      getToolById: (id) => get().tools.find((t) => t.id === id),
      getLocationById: (id) => get().locations.find((l) => l.id === id),
      getToolsAtLocation: (locationId) => get().tools.filter((t) => t.locationId === locationId),

      getLowStockTools() {
        return get().tools.filter((t) => t.quantity <= t.minQuantity && t.status !== 'retired');
      },

      getToolsByCategory() {
        return get().tools.reduce<Record<string, number>>((acc, t) => {
          acc[t.category] = (acc[t.category] ?? 0) + 1;
          return acc;
        }, {});
      },

      getStatusCounts() {
        return get().tools.reduce<Record<string, number>>((acc, t) => {
          acc[t.status] = (acc[t.status] ?? 0) + 1;
          return acc;
        }, {});
      },
    }),
    {
      name: 'toolvault-storage',
      partialize: (s) => ({
        tools: s.tools,
        locations: s.locations,
        scanLogs: s.scanLogs,
      }),
    }
  )
);
