import { emptyUserState, type UserState } from "@/lib/types";
import type { StorageAdapter } from "./StorageAdapter";

const KEY = "intro-java-2026:user-state";

export const localStorageAdapter: StorageAdapter = {
  async load() {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (!raw) return emptyUserState();
      const parsed = JSON.parse(raw) as Partial<UserState>;
      const base = emptyUserState();
      return {
        ...base,
        ...parsed,
        progress: { ...base.progress, ...(parsed.progress ?? {}) },
      } as UserState;
    } catch {
      return emptyUserState();
    }
  },
  async save(state) {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      // storage full or blocked (private mode) – app keeps working in memory
    }
  },
  async clear() {
    try {
      window.localStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
  },
};
