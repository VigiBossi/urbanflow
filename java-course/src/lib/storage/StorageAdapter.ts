import type { UserState } from "@/lib/types";

/**
 * The only boundary between the app and persistence.
 * To move to Supabase: implement this interface (e.g. a `user_state` table
 * with a jsonb column keyed by auth.uid()) and swap it in ./index.ts.
 */
export interface StorageAdapter {
  load(): Promise<UserState>;
  save(state: UserState): Promise<void>;
  clear(): Promise<void>;
}
