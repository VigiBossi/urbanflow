import { localStorageAdapter } from "./localStorageAdapter";
import type { StorageAdapter } from "./StorageAdapter";

// Swap this for a Supabase adapter later.
export const storage: StorageAdapter = localStorageAdapter;
export type { StorageAdapter };
