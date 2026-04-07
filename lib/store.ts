import { create } from "zustand";
import { Character, Episode, Filters, Location, ResourceType } from "@/types/api";
import { fetchApi, buildUrl } from "@/lib/api";

type TabType = "ui" | "json" | "code" | "detail";

interface ExplorerState {
  // UI
  sidebarOpen: boolean;
  activeTab: TabType;
  selectedCharacter: Character | null;

  // Query params
  resource: ResourceType;
  filters: Partial<Filters>;
  page: number;
  url: string;

  // Fetch state
  loading: boolean;
  data: (Character | Location | Episode)[] | null;
  totalPages: number;
  error: string | null;

  // Actions
  setSidebarOpen: (open: boolean) => void;
  setActiveTab: (tab: TabType) => void;
  setSelectedCharacter: (c: Character | null) => void;
  setResource: (r: ResourceType) => void;
  setFilters: (updater: (f: Partial<Filters>) => Partial<Filters>) => void;
  setPage: (page: number) => void;
  fetch: () => Promise<void>;
  fetchPage: (page: number) => Promise<void>;
}

export const useExplorerStore = create<ExplorerState>((set, get) => ({
  sidebarOpen: false,
  activeTab: "ui",
  selectedCharacter: null,
  resource: "character",
  filters: {},
  page: 1,
  url: "https://rickandmortyapi.com/api/character",
  loading: false,
  data: null,
  totalPages: 1,
  error: null,

  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setSelectedCharacter: (c) => set({ selectedCharacter: c }),

  setResource: (r) => {
    set({ resource: r, page: 1, selectedCharacter: null, activeTab: "ui" });
    set({ url: buildUrl(r, 1, get().filters) });
  },

  setFilters: (updater) => {
    const filters = updater(get().filters);
    set({ filters, page: 1, url: buildUrl(get().resource, 1, filters) });
  },

  setPage: (page) => {
    set({ page, url: buildUrl(get().resource, page, get().filters) });
  },

  fetch: async () => {
    const { resource, page, filters } = get();
    set({ loading: true, error: null });
    const result = await fetchApi<{ results?: (Character | Location | Episode)[] }>(resource, page, filters);
    if (result.error) {
      set({ loading: false, error: result.error, data: null });
      return;
    }
    set({
      loading: false,
      data: (result.data?.results ?? null) as (Character | Location | Episode)[] | null,
      totalPages: result.info?.pages ?? 1,
    });
  },

  fetchPage: async (page) => {
    const { resource, filters } = get();
    set({ page, url: buildUrl(resource, page, filters), loading: true, error: null });
    const result = await fetchApi<{ results?: (Character | Location | Episode)[] }>(resource, page, filters);
    if (result.error) {
      set({ loading: false, error: result.error, data: null });
      return;
    }
    set({
      loading: false,
      data: (result.data?.results ?? null) as (Character | Location | Episode)[] | null,
      totalPages: result.info?.pages ?? 1,
    });
  },
}));
