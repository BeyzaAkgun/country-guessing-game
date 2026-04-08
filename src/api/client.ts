//client.ts
const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api/v1";
const WS_BASE  = import.meta.env.VITE_WS_URL ?? "ws://localhost:8000/ws";

export function getToken(): string | null {
  try { return localStorage.getItem("geo_token"); } catch { return null; }
}
export function setToken(token: string): void {
  try { localStorage.setItem("geo_token", token); } catch {}
}
export function clearToken(): void {
  try { localStorage.removeItem("geo_token"); } catch {}
}
export function getStoredUser(): StoredUser | null {
  try {
    const raw = localStorage.getItem("geo_user");
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
export function setStoredUser(user: StoredUser): void {
  try { localStorage.setItem("geo_user", JSON.stringify(user)); } catch {}
}
export function clearStoredUser(): void {
  try { localStorage.removeItem("geo_user"); } catch {}
}

export interface StoredUser {
  id: string;
  username: string;
  email: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface UserProfile {
  user_id: string;
  username: string;
  rank_tier: string;
  rank_points: number;
  wins: number;
  losses: number;
  win_rate: number;
  best_streak: number;
  avatar_url: string | null;
  xp: number;
  level: number;
}

export interface MatchFoundResponse {
  status:
    | "in_queue"
    | "match_found"
    | "already_in_queue"
    | "not_in_queue"
    | "already_in_match";
  match_id?: string;
  opponent_id?: string;
  position?: number;
}

export interface MatchEndPlayer {
  user_id: string;
  score: number;
  correct_answers: number;
  wrong_answers: number;
  best_streak: number;
  xp_earned: number;
  rank_points_delta: number;
}

export interface MatchResultPayload {
  winner_id: string | null;
  is_draw: boolean;
  forfeit?: boolean;
  players: MatchEndPlayer[];
}

export interface MatchStatusResponse {
  status: "waiting" | "in_progress" | "finished" | "not_found" | "not_participant";
  match_id?: string;
  started_at?: string | null;
  current_round?: number | null;
  total_rounds?: number | null;
  result?: MatchResultPayload | null;
}

export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  username: string;
  rank_tier: string;
  rank_points: number;
  wins: number;
  losses: number;
  win_rate: number;
  best_streak: number;
  avatar_url: string | null;
}

export interface MyRank {
  rank: number | null;
  total_players: number;
  rank_points: number;
  rank_tier: string;
  wins: number;
  losses: number;
  win_rate: number;
  message?: string;
}

export interface MatchPlayerResponse {
  id: string;
  user_id: string | null;
  guest_session_id: string | null;
  score: number;
  correct_answers: number;
  wrong_answers: number;
  best_streak: number;
  avg_response_time_ms: number;
  xp_earned: number;
  rank_points_delta: number;
  accuracy: number;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> ?? {}),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const err = await res.json();
      if (typeof err.detail === "string") {
        message = err.detail;
      } else if (Array.isArray(err.detail)) {
        message = err.detail.map((e: any) => e.msg ?? e.message ?? JSON.stringify(e)).join(", ");
      } else if (err.message) {
        message = err.message;
      }
    } catch {}
    throw new Error(message);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export const auth = {
  register: (username: string, email: string, password: string) =>
    request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ username, email, password }),
    }),

  login: (email: string, password: string) =>
    request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  me: () =>
    request<{ id: string; username: string; email: string; is_active: boolean }>("/users/me"),
};

export const users = {
  getProfile: (userId?: string) =>
    request<UserProfile>(
      userId ? `/users/${userId}/profile` : "/users/me/profile"
    ),

  updateProfile: (data: Partial<{ avatar_url: string }>) =>
    request<UserProfile>("/users/me/profile", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
};

export const matchmaking = {
  joinQueue: (questionMode: string = "classic") =>
    request<MatchFoundResponse>("/matchmaking/queue", {
      method: "POST",
      body: JSON.stringify({ question_mode: questionMode }),
    }),

  leaveQueue: () =>
    request<void>("/matchmaking/queue", { method: "DELETE" }),

  getStatus: () =>
    request<MatchFoundResponse>("/matchmaking/queue/status"),

  getMatchStatus: (matchId: string) =>
    request<MatchStatusResponse>(`/matchmaking/match/${matchId}/status`),

  forfeitMatch: (matchId: string) =>
    request<{ status: string; xp_earned: number; rank_points_delta: number }>(
      `/matchmaking/match/${matchId}/forfeit`,
      { method: "POST" }
    ),
};

export const leaderboard = {
  global: (limit = 50) =>
    request<LeaderboardEntry[]>(`/leaderboard/global?limit=${limit}`),

  me: () => request<MyRank>("/leaderboard/me"),

  aroundMe: () => request<LeaderboardEntry[]>("/leaderboard/around-me"),
};

export function createMatchSocket(matchId: string): WebSocket {
  const token = getToken();
  if (!token) throw new Error("No token found");
  return new WebSocket(`${WS_BASE}/match/${matchId}?token=${token}`);
}

export function createPartyHostSocket(roomCode: string, hostToken: string): WebSocket {
  return new WebSocket(`${WS_BASE}/party/${roomCode}?role=host&token=${hostToken}`);
}

export function createPartyPlayerSocket(roomCode: string, playerToken: string): WebSocket {
  return new WebSocket(`${WS_BASE}/party/${roomCode}?role=player&token=${playerToken}`);
}