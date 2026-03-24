import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Swords, Loader2, Trophy, Home, RotateCcw,
  Wifi, WifiOff, Shield, Clock, Handshake, Zap, ChevronRight, Lightbulb
} from "lucide-react";
import { matchmaking, createMatchSocket } from "@/api/client";
import {
  getHintAtIndex, getTotalHintCount, calculatePoints,
  type MPHint,
} from "@/app/data/multiplayerHints";
import { useCountryData } from "@/app/hooks/useCountryData";
import WorldMap from "@/app/components/WorldMap";
import type { StoredUser, MatchEndPlayer } from "@/api/client";
import { addXP } from "@/app/utils/xpSystem";
import { soundEffects } from "@/app/utils/soundEffects";
import { NewHintModal } from "./NewHintModal";

// ── Types ────────────────────────────────────────────────────────────────────
interface MultiplayerGameProps {
  onBackToMenu: () => void;
  user: StoredUser | null;
  initialMatchId?: string | null;
}

type Phase = "lobby" | "queuing" | "connecting" | "waiting" | "playing" | "finished";

interface Question {
  round: number;
  country_name: string;
  mode: string;
  started_at: string;
}

interface RoundResult {
  round: number;
  myCorrect: boolean;
  myPoints: number;
}

const ROUND_SECONDS = 30;
// Points table: 1 hint=100, 2=80, 3=60, 4=40, 5=20, 6=10 (from calculatePoints in multiplayerHints.ts)

const SESSION_MATCH_KEY = "mp_active_match_id";
const saveActiveMatch  = (id: string) => sessionStorage.setItem(SESSION_MATCH_KEY, id);
const clearActiveMatch = ()           => sessionStorage.removeItem(SESSION_MATCH_KEY);
const getActiveMatch   = ()           => sessionStorage.getItem(SESSION_MATCH_KEY);

// ── Component ─────────────────────────────────────────────────────────────────
export function MultiplayerGame({ onBackToMenu, user, initialMatchId }: MultiplayerGameProps) {
  const { countries, loading: mapLoading } = useCountryData();

  const [phase, setPhase]               = useState<Phase>("lobby");
  const [question, setQuestion]         = useState<Question | null>(null);
  const [scores, setScores]             = useState<Record<string, number>>({});
  const [opponentId, setOpponentId]     = useState<string | null>(null);
  const [roundResults, setRoundResults] = useState<RoundResult[]>([]);
  const [matchEnd, setMatchEnd]         = useState<{ winner_id: string | null; is_draw: boolean; forfeit?: boolean; players: MatchEndPlayer[] } | null>(null);
  const [connectedCount, setConnected]  = useState(0);
  const [error, setError]               = useState<string | null>(null);
  const [timeLeft, setTimeLeft]         = useState(ROUND_SECONDS);
  const [lastResult, setLastResult]     = useState<{ correct: boolean; points: number; correctAnswer?: string } | null>(null);
  const [opponentAnswered, setOpponentAnswered] = useState(false);
  const [opponentCorrect, setOpponentCorrect]   = useState<boolean | null>(null);
  const [graceCountdown, setGraceCountdown]     = useState<number | null>(null); // null = no grace period active
  const graceTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Map interaction
  const [selectedCountryName, setSelectedCountryName] = useState<string | null>(null);
  const [correctCountries, setCorrectCountries]       = useState<string[]>([]);
  const [wrongCountries, setWrongCountries]           = useState<string[]>([]);

  // Hints state — ordered by index, not random
  const [nextHintIndex, setNextHintIndex] = useState(0);      // next hint to reveal
  const [shownHints, setShownHints]       = useState<MPHint[]>([]);
  const [isMapLocked, setIsMapLocked]     = useState(false);
  const [newHintModal, setNewHintModal]   = useState<{ text: string; type: any; countryName: string; flagUrl?: string } | null>(null);

  const socketRef      = useRef<WebSocket | null>(null);
  const timerRef       = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollRef        = useRef<ReturnType<typeof setInterval> | null>(null);
  const phaseRef       = useRef<Phase>("lobby");
  const questionRef    = useRef<Question | null>(null); // always current question, safe in closures
  // activeMatch is stored in sessionStorage so it survives component unmount/navigate
  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { questionRef.current = question; }, [question]);

  // NOTE: We do NOT auto-connect on mount. The lobby screen detects sessionStorage
  // and shows a reconnect card — user explicitly clicks Reconnect.

  const myScore  = scores[user?.id ?? ""] ?? 0;
  const oppScore = opponentId ? (scores[opponentId] ?? 0) : 0;
  const hintsUsed          = shownHints.length;                                             // 1-based count of revealed hints
  const totalHintsAvail    = question ? getTotalHintCount(question.country_name) : 0;
  const remainingHintCount = totalHintsAvail - hintsUsed;
  const expectedPoints     = selectedCountryName ? calculatePoints(hintsUsed) : null;

  // ── Timer ─────────────────────────────────────────────────────────────────
  const startTimer = useCallback((startedAt: string) => {
    if (timerRef.current) clearInterval(timerRef.current);
    const tick = () => {
      const elapsed = (Date.now() - new Date(startedAt).getTime()) / 1000;
      const remaining = Math.max(0, ROUND_SECONDS - elapsed);
      setTimeLeft(Math.ceil(remaining));
      if (remaining <= 0) clearInterval(timerRef.current!);
    };
    tick();
    timerRef.current = setInterval(tick, 500);
  }, []);

  // Timer hits 0 — backend auto-advances via _auto_advance task
  // No frontend auto-submit needed

  const cleanup = useCallback(() => {
    if (timerRef.current)      clearInterval(timerRef.current);
    if (pollRef.current)       clearInterval(pollRef.current);
    if (graceTimerRef.current) clearInterval(graceTimerRef.current);
    if (socketRef.current) { socketRef.current.onclose = null; socketRef.current.close(); }
    socketRef.current = null; timerRef.current = null; pollRef.current = null; graceTimerRef.current = null;
  }, []);

  useEffect(() => () => cleanup(), [cleanup]);

  const resetState = useCallback(() => {
    cleanup();
    setMatchEnd(null); setQuestion(null); setScores({});
    setOpponentId(null); setRoundResults([]);
    setLastResult(null); setConnected(0);
    setTimeLeft(ROUND_SECONDS); setError(null);
    setSelectedCountryName(null); setCorrectCountries([]); setWrongCountries([]);
    setNextHintIndex(0); setShownHints([]);
    setOpponentAnswered(false); setOpponentCorrect(null); setIsMapLocked(false);
    setGraceCountdown(null);
    clearActiveMatch();
  }, [cleanup]);

  // ── Init a new round question ─────────────────────────────────────────────
  const initQuestion = useCallback((q: Question) => {
    // When a new question arrives, the previous round is over.
    // If we had no answer_result yet (opponent answered first and advanced the round),
    // mark the previous country as wrong so it turns red on the map.
    setQuestion(prev => {
      if (prev && prev.round !== q.round) {
        setLastResult(lr => {
          // Reveal target country as red if player didn't answer correctly:
          // - lr is null (never submitted) → reveal
          // - lr.correct is false (submitted wrong) → reveal
          // - lr.correct is true → already colored green, don't add to wrong
          if (!lr || !lr.correct) {
            setWrongCountries(wc => [...wc, prev.country_name]);
          }
          return lr;
        });
      }
      return q;
    });
    setLastResult(null);
    setSelectedCountryName(null);
    setOpponentAnswered(false);
    setOpponentCorrect(null);
    setIsMapLocked(false);

    soundEffects.playRoundStart();

    // Hint 0 is always shown automatically (continent hint)
    const firstHint = getHintAtIndex(q.country_name, 0);
    if (firstHint) {
      setNextHintIndex(1);
      setShownHints([firstHint]);
      setNewHintModal({ text: firstHint.text, type: firstHint.type, countryName: q.country_name, flagUrl: firstHint.flagUrl });
      setIsMapLocked(true);
    } else {
      setNextHintIndex(0);
      setShownHints([]);
    }

    startTimer(q.started_at ?? new Date().toISOString());
  }, [startTimer]);

  // ── Request next hint (ordered by index) ─────────────────────────────────
  const handleGetHint = useCallback(() => {
    // Allow getting hints unless player already answered correctly
    if (!question || (lastResult && lastResult.correct) || remainingHintCount === 0) return;
    const hint = getHintAtIndex(question.country_name, nextHintIndex);
    if (!hint) return;
    soundEffects.playHint();
    setNextHintIndex(prev => prev + 1);
    setShownHints(prev => [...prev, hint]);
    setNewHintModal({ text: hint.text, type: hint.type, countryName: question.country_name, flagUrl: hint.flagUrl });
    setIsMapLocked(true);
  }, [question, lastResult, remainingHintCount, nextHintIndex]);

  // ── Map click ─────────────────────────────────────────────────────────────
  const handleCountryClick = useCallback((geo: any) => {
    // Only block clicks if map is locked (hint modal) or player already got it CORRECT
    // Wrong answer: player can keep trying until round ends
    if (isMapLocked || (lastResult && lastResult.correct)) return;
    const name = geo.properties?.name || geo.name;
    soundEffects.playClick();
    setSelectedCountryName(name);
  }, [isMapLocked, lastResult]);

  // ── Submit answer ─────────────────────────────────────────────────────────
  const handleSubmit = useCallback(() => {
    // Allow submit if no result yet, OR if last result was wrong (can keep guessing)
    if (!selectedCountryName || !socketRef.current) return;
    if (lastResult && lastResult.correct) return; // already got it right, wait for next round
    socketRef.current.send(JSON.stringify({ event: "answer", data: { answer: selectedCountryName, hints_used: hintsUsed } }));
  }, [selectedCountryName, lastResult, hintsUsed]);

  // ── Stable hint-complete callback (must not be inline or timer restarts) ───
  const handleHintComplete = useCallback(() => {
    setNewHintModal(null);
    setIsMapLocked(false);
  }, []);

  // ── WebSocket connection ──────────────────────────────────────────────────
  const connectToMatch = useCallback((mid: string) => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    // NOTE: we save to sessionStorage only when match_start fires, not here
    setPhase("connecting");
    setConnected(0);

    const ws = createMatchSocket(mid);
    socketRef.current = ws;
    ws.onopen = () => setPhase("waiting");

    ws.onmessage = (evt) => {
      const { event, data } = JSON.parse(evt.data);
      switch (event) {
        case "player_connected":
          setConnected(c => c + 1);
          if (data.user_id !== user?.id) setOpponentId(data.user_id);
          break;
        case "match_start":
          setPhase("playing");
          setGraceCountdown(null);
          if (data.reconnect) {
            // Reconnect: preserve existing scores/results, just resume
            // match_id is already in sessionStorage
          } else {
            // Fresh start: save match id now (confirmed active) and reset state
            saveActiveMatch(data.match_id ?? "");
            setScores({}); setRoundResults([]);
            setCorrectCountries([]); setWrongCountries([]);
          }
          break;
        case "question":
          initQuestion(data as Question);
          break;
        case "answer_result":
          setLastResult({ correct: data.correct, points: data.points_earned, correctAnswer: data.correct_answer });
          // Only stop timer if correct — wrong answer keeps timer running so player can keep guessing
          if (data.correct && timerRef.current) clearInterval(timerRef.current);
          if (data.correct) {
            soundEffects.playCorrect();
          } else {
            // Wrong answer: clear selection so player can pick a new country
            setSelectedCountryName(null);
            soundEffects.playWrong();
          }
          setRoundResults(prev => [...prev, {
            round: data.round ?? 0,
            myCorrect: data.correct,
            myPoints: data.points_earned
          }]);
          if (data.correct && questionRef.current?.country_name) {
            setCorrectCountries(prev => [...prev, questionRef.current!.country_name]);
          }
          // Note: do NOT color target country red on wrong answer —
          // that would reveal the answer. It only gets revealed at round_end.
          break;
        case "player_answered":
          setScores(prev => ({
            ...prev,
            [data.user_id]: (prev[data.user_id] ?? 0) + (data.points_earned ?? 0)
          }));
          if (data.user_id !== user?.id) {
            setOpponentId(data.user_id);
            setOpponentAnswered(true);
            setOpponentCorrect(data.correct ?? null);
          }
          break;
        case "match_end":
          cleanup();
          clearActiveMatch();
          if (user?.id && Array.isArray(data.players)) {
            const me = data.players.find((p: any) => p.user_id === user.id);
            if (me?.xp_earned > 0) {
              addXP(me.xp_earned);
              window.dispatchEvent(new Event("xp-updated"));
            }
          }
          // Play outcome sound
          if (data.is_draw) {
            soundEffects.playAchievement();
          } else if (data.winner_id === user?.id) {
            soundEffects.playVictory();
          } else {
            soundEffects.playDefeat();
          }
          setMatchEnd({ winner_id: data.winner_id, is_draw: data.is_draw, forfeit: data.forfeit ?? false, players: data.players });
          setPhase("finished");
          break;
        case "player_disconnected":
          if (data.user_id !== user?.id) {
            const graceSecs = data.grace_seconds ?? 0;
            if (graceSecs > 0) {
              // Start grace countdown — don't go to lobby yet
              setGraceCountdown(graceSecs);
              if (graceTimerRef.current) clearInterval(graceTimerRef.current);
              graceTimerRef.current = setInterval(() => {
                setGraceCountdown(prev => {
                  if (prev === null || prev <= 1) {
                    clearInterval(graceTimerRef.current!);
                    graceTimerRef.current = null;
                    return null;
                  }
                  return prev - 1;
                });
              }, 1000);
            } else {
              setError("Opponent disconnected.");
              cleanup();
              setPhase("lobby");
            }
          }
          break;
        case "opponent_reconnected":
          if (data.user_id !== user?.id) {
            if (graceTimerRef.current) { clearInterval(graceTimerRef.current); graceTimerRef.current = null; }
            setGraceCountdown(null);
          }
          break;
        case "error":
          setError(data.message ?? "An error occurred");
          break;
      }
    };

    ws.onerror = () => setError("Connection error.");
    ws.onclose = (e) => {
      if (e.code !== 1000 && phaseRef.current === "playing") {
        // Preserve match id so user can reconnect
        setError("__reconnectable__");
        setPhase("lobby");
      } else if (e.code !== 1000 && phaseRef.current !== "finished") {
        setError("Disconnected from match.");
        setPhase("lobby");
      }
    };
  }, [cleanup, initQuestion, user?.id, question?.country_name]);

  const handleJoinQueue = useCallback(async () => {
    if (!user) { setError("You need an account to play ranked multiplayer."); return; }
    setError(null); setPhase("queuing");
    try {
      const res = await matchmaking.joinQueue("classic");
      if (res.status === "match_found" && res.match_id) {
        connectToMatch(res.match_id);
      } else {
        pollRef.current = setInterval(async () => {
          try {
            const status = await matchmaking.getStatus();
            if (status.status === "match_found" && status.match_id) {
              if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
              connectToMatch(status.match_id);
            } else if (status.status === "not_in_queue") {
              if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
              setError("Lost queue position. Please try again."); setPhase("lobby");
            }
          } catch {
            if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
            setError("Lost connection to matchmaking."); setPhase("lobby");
          }
        }, 2000);
      }
    } catch (e: any) { setError(e.message ?? "Failed to join queue"); setPhase("lobby"); }
  }, [connectToMatch, user]);

  const handleLeaveQueue = async () => {
    try { await matchmaking.leaveQueue(); } catch {}
    resetState(); setPhase("lobby");
  };

  const handlePlayAgain = useCallback(() => {
    resetState(); setTimeout(() => handleJoinQueue(), 50);
  }, [resetState, handleJoinQueue]);

  // ── Reconnect to the same match after own disconnect ──────────────────────
  const handleReconnect = useCallback(() => {
    const mid = getActiveMatch();
    if (!mid) return;
    if (timerRef.current)      clearInterval(timerRef.current);
    if (pollRef.current)       clearInterval(pollRef.current);
    if (graceTimerRef.current) clearInterval(graceTimerRef.current);
    if (socketRef.current)     { socketRef.current.onclose = null; socketRef.current.close(); }
    socketRef.current = null; timerRef.current = null; pollRef.current = null; graceTimerRef.current = null;
    setMatchEnd(null); setError(null); setGraceCountdown(null);
    setOpponentAnswered(false); setOpponentCorrect(null);
    connectToMatch(mid);
  }, [connectToMatch]);

  // ── Finish screen data ────────────────────────────────────────────────────
  const myData  = matchEnd?.players.find(p => p.user_id === user?.id);
  const oppData = matchEnd?.players.find(p => p.user_id !== user?.id);
  const iWon    = !matchEnd?.is_draw && matchEnd?.winner_id === user?.id;
  const isDraw  = matchEnd?.is_draw ?? false;

  // ═══════════════════════════════════════════════════════════════════════════
  // LOBBY
  // ═══════════════════════════════════════════════════════════════════════════
  if (phase === "lobby") {
    const storedMatchId = getActiveMatch();

    // ── RECONNECT MODE: player has an unfinished match ────────────────────────
    if (storedMatchId) {
      return (
        <div className="w-screen h-screen fixed inset-0 flex items-center justify-center bg-slate-950 p-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 20 }}
            className="bg-slate-900 rounded-3xl shadow-2xl p-8 w-full max-w-md border border-slate-700/50">
            <div className="text-center mb-6">
              <motion.div
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 1.6, repeat: Infinity }}
                className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl shadow-lg mb-4">
                <WifiOff className="w-9 h-9 text-white" />
              </motion.div>
              <h1 className="text-2xl font-black text-white mb-1">Match in Progress</h1>
              <p className="text-slate-400 text-sm">You left an active match. Reconnect to continue.</p>
            </div>

            <div className="bg-yellow-900/20 border border-yellow-700/40 rounded-2xl p-4 mb-6">
              <p className="text-yellow-300 text-sm font-semibold mb-1">⚠️ Your opponent is waiting</p>
              <p className="text-yellow-200/60 text-xs leading-relaxed">
                If you don't reconnect in time, you'll automatically lose the match and your opponent will receive the win.
                You cannot start a new match until this one ends.
              </p>
            </div>

            {error && (
              <div className="bg-red-900/30 border border-red-700/50 rounded-xl px-4 py-3 mb-4">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <button onClick={handleReconnect}
                className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-white rounded-xl font-bold shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 text-base">
                <Wifi className="w-5 h-5" /> Reconnect to Match
              </button>
              <button onClick={async () => {
                  const mid = getActiveMatch();
                  if (mid) {
                    try {
                      await matchmaking.forfeitMatch(mid);
                      addXP(20); // XP_LOSS=20 from rank.py
                      window.dispatchEvent(new Event("xp-updated")); // signal FAB to re-render
                    } catch {}
                  }
                  clearActiveMatch();
                  onBackToMenu();
                }}
                className="w-full py-2.5 bg-slate-700/50 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded-xl font-semibold text-sm transition-all active:scale-95">
                Abandon match (lose RP)
              </button>
            </div>
          </motion.div>
        </div>
      );
    }

    // ── NORMAL LOBBY ──────────────────────────────────────────────────────────
    return (
      <div className="w-screen h-screen fixed inset-0 flex items-center justify-center bg-slate-950 p-4">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 20 }}
          className="bg-slate-900 rounded-3xl shadow-2xl p-8 w-full max-w-md border border-slate-700/50">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl shadow-lg mb-4">
              <Swords className="w-9 h-9 text-white" />
            </div>
            <h1 className="text-3xl font-black text-white mb-1">Multiplayer</h1>
            <p className="text-slate-400 text-sm">Real-time map race — click the right country first</p>
          </div>
          <div className="bg-slate-800 rounded-2xl p-4 mb-6 space-y-2">
            {["⚔️  Race against a real opponent on the world map",
              "💡  Hint 1 (continent) is free — each extra hint costs points",
              "🗺️  Click the country on the map, then press Submit",
              "⚡  1 hint = 100pts  ·  2 = 80  ·  3 = 60  ·  4 = 40  ·  5 = 20  ·  6 = 10"].map(line => (
              <p key={line} className="text-xs text-slate-300">{line}</p>
            ))}
          </div>
          {user ? (
            <div className="flex items-center gap-3 bg-slate-800 rounded-xl px-4 py-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-black text-sm">{user.username.charAt(0).toUpperCase()}</span>
              </div>
              <div>
                <p className="text-white font-bold text-sm">{user.username}</p>
                <p className="text-slate-400 text-xs">Ready to compete</p>
              </div>
            </div>
          ) : (
            <div className="bg-amber-900/30 border border-amber-700/50 rounded-xl px-4 py-3 mb-6">
              <p className="text-amber-400 text-sm font-semibold">Guest mode</p>
              <p className="text-amber-300/70 text-xs mt-0.5">Sign in to play ranked matches and earn RP</p>
            </div>
          )}
          {error && (
            <div className="bg-red-900/30 border border-red-700/50 rounded-xl px-4 py-3 mb-4">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
          <div className="flex gap-3">
            <button onClick={onBackToMenu} className="flex-none px-4 py-3 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl font-semibold transition-all active:scale-95 flex items-center gap-2">
              <Home className="w-4 h-4" /> Menu
            </button>
            <button onClick={handleJoinQueue} disabled={!user}
              className="flex-1 py-3 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-bold shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2">
              <Swords className="w-5 h-5" /> {user ? "Find Match" : "Sign in to play"}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // QUEUING / CONNECTING / WAITING
  // ═══════════════════════════════════════════════════════════════════════════
  if (phase === "queuing" || phase === "connecting" || phase === "waiting") {
    const statusText = {
      queuing: "Finding an opponent...",
      connecting: "Connecting to match...",
      waiting: "Waiting for opponent..."
    }[phase];
    return (
      <div className="w-screen h-screen fixed inset-0 flex items-center justify-center bg-slate-950 p-4">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="bg-slate-900 rounded-3xl shadow-2xl p-8 w-full max-w-sm border border-slate-700/50 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl shadow-lg mb-5">
            {phase === "waiting"
              ? <Wifi className="w-9 h-9 text-white" />
              : <Loader2 className="w-9 h-9 text-white animate-spin" />}
          </div>
          <h2 className="text-xl font-black text-white mb-2">{statusText}</h2>
          <p className="text-slate-400 text-sm mb-6">
            {phase === "waiting" ? `${connectedCount}/2 players connected` : "This usually takes a few seconds"}
          </p>
          <div className="flex justify-center gap-2 mb-6">
            {[0,1,2].map(i => (
              <motion.div key={i} animate={{ scale:[1,1.4,1], opacity:[0.4,1,0.4] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i*0.2 }}
                className="w-2.5 h-2.5 bg-rose-500 rounded-full" />
            ))}
          </div>
          <button onClick={handleLeaveQueue} className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl font-semibold text-sm transition-all active:scale-95">
            Cancel
          </button>
        </motion.div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // FINISHED
  // ═══════════════════════════════════════════════════════════════════════════
  if (phase === "finished" && matchEnd) {
    const outcomeColor = isDraw ? "from-blue-400 to-cyan-500" : iWon ? "from-yellow-400 to-orange-500" : "from-slate-600 to-slate-700";
    const OutcomeIcon  = isDraw ? Handshake : iWon ? Trophy : Shield;
    const isForfeit    = matchEnd?.forfeit ?? false;
    const outcomeTitle = isDraw ? "It's a Draw! 🤝" : iWon ? (isForfeit ? "Opponent Forfeited 🏳️" : "Victory! 🎉") : (isForfeit ? "You Forfeited" : "Defeated");

    return (
      <div className="w-screen h-screen fixed inset-0 flex items-center justify-center bg-slate-950 p-4">
        <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 18 }}
          className="bg-slate-900 rounded-3xl shadow-2xl p-8 w-full max-w-md border border-slate-700/50">
          <div className="text-center mb-6">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }}
              className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl shadow-lg mb-3 bg-gradient-to-br ${outcomeColor}`}>
              <OutcomeIcon className="w-9 h-9 text-white" />
            </motion.div>
            <h2 className="text-2xl font-black text-white">{outcomeTitle}</h2>
            {isDraw && <p className="text-slate-400 text-sm mt-1">Both players earn +15 RP</p>}
            {isForfeit && !isDraw && <p className="text-slate-400 text-sm mt-1">{iWon ? "Opponent disconnected — you win" : "Match ended by disconnect"}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3 mb-5">
            {[
              { label: "You", data: myData, win: iWon && !isDraw },
              { label: "Opponent", data: oppData, win: false },
            ].map(({ label, data, win }) => (
              <div key={label} className={`rounded-2xl p-4 text-center border-2 ${win ? "border-yellow-500/50 bg-yellow-500/10" : isDraw ? "border-blue-500/30 bg-blue-500/5" : "border-slate-700 bg-slate-800"}`}>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
                <p className="text-3xl font-black text-white">{data?.score ?? 0}</p>
                <p className="text-xs text-slate-400 mt-1">{data?.correct_answers ?? 0} correct</p>
                <div className="mt-2 space-y-0.5">
                  <p className="text-xs text-emerald-400 font-semibold">+{data?.xp_earned ?? 0} XP</p>
                  <p className={`text-xs font-semibold ${(data?.rank_points_delta ?? 0) >= 0 ? "text-blue-400" : "text-red-400"}`}>
                    {(data?.rank_points_delta ?? 0) >= 0 ? "+" : ""}{data?.rank_points_delta ?? 0} RP
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2 mb-6">
            {[
              { v: myData?.best_streak ?? 0, label: "Best Streak" },
              { v: myData?.wrong_answers ?? 0, label: "Wrong" },
              { v: myData && (myData.correct_answers + myData.wrong_answers) > 0
                  ? `${Math.round(myData.correct_answers / (myData.correct_answers + myData.wrong_answers) * 100)}%`
                  : "0%", label: "Accuracy" },
            ].map(({ v, label }) => (
              <div key={label} className="bg-slate-800 rounded-xl p-3 text-center">
                <p className="text-lg font-black text-white">{v}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={onBackToMenu} className="flex-none px-4 py-3 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl font-semibold transition-all active:scale-95 flex items-center gap-2">
              <Home className="w-4 h-4" /> Menu
            </button>
            <button onClick={handlePlayAgain} className="flex-1 py-3 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white rounded-xl font-bold shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2">
              <RotateCcw className="w-4 h-4" /> Play Again
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PLAYING — full-screen map with overlay HUD
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="w-screen h-screen fixed inset-0 overflow-hidden">

      {/* ── World Map (full background) ── */}
      {mapLoading ? (
        <div className="w-full h-full flex items-center justify-center bg-slate-950">
          <Loader2 className="w-10 h-10 text-blue-400 animate-spin" />
        </div>
      ) : (
        <div className="absolute inset-0 z-0">
          <WorldMap
            countries={countries}
            onCountryClick={handleCountryClick}
            selectedCountryName={selectedCountryName}
            correctCountries={correctCountries}
            wrongCountries={wrongCountries}
          />
        </div>
      )}

      {/* ── Top HUD ── */}
      <div className="absolute top-0 left-0 right-0 z-20 px-3 pt-3">
        <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-md rounded-2xl px-3 py-2 border border-slate-700/50 shadow-xl">
          {/* My score */}
          <div className="text-center min-w-[52px]">
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider leading-none">You</p>
            <p className="text-xl font-black text-white leading-tight">{myScore}</p>
          </div>

          {/* Timer */}
          <div className="flex-1 text-center">
            <p className="text-[10px] text-slate-400 font-semibold">Round {question?.round ?? "—"} / 10</p>
            <div className={`flex items-center justify-center gap-1 ${timeLeft <= 10 ? "text-red-400" : "text-white"}`}>
              <Clock className="w-3 h-3" />
              <span className="text-base font-black tabular-nums">{timeLeft}s</span>
            </div>
            <div className="w-full h-1 bg-slate-700 rounded-full overflow-hidden mt-0.5">
              <motion.div
                animate={{ width: `${(timeLeft / ROUND_SECONDS) * 100}%` }}
                transition={{ duration: 0.5, ease: "linear" }}
                className={`h-full rounded-full ${timeLeft <= 10 ? "bg-red-500" : timeLeft <= 20 ? "bg-yellow-400" : "bg-emerald-400"}`}
              />
            </div>
          </div>

          {/* Opponent score */}
          <div className="text-center min-w-[52px]">
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider leading-none">Opp</p>
            <p className="text-xl font-black text-white leading-tight">{oppScore}</p>
            {opponentAnswered && (
              <p className={`text-[9px] font-black leading-none ${opponentCorrect ? "text-emerald-400" : "text-red-400"}`}>
                {opponentCorrect ? "✓" : "✗"}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Hints panel (left) ── */}
      <div className="absolute top-20 left-3 z-20 w-64 max-w-[calc(50vw-12px)]">
        <div className="bg-slate-900/92 backdrop-blur-md rounded-2xl border border-slate-700/50 shadow-xl overflow-hidden">
          <div className="px-3 py-2 border-b border-slate-700/50 flex items-center gap-2">
            <Lightbulb className="w-3.5 h-3.5 text-yellow-400" />
            <span className="text-xs font-bold text-white">Hints</span>
            <span className="ml-auto text-[10px] text-slate-400">{shownHints.length} / {totalHintsAvail}</span>
          </div>
          <div className="p-2 space-y-1.5 max-h-52 overflow-y-auto">
            <AnimatePresence>
              {shownHints.map((hint, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                  className={`flex items-start gap-2 px-2.5 py-2 rounded-xl text-xs ${
                    i === 0
                      ? "bg-indigo-500/15 border border-indigo-500/25"
                      : "bg-slate-800/80 border border-slate-700/30"
                  }`}>
                  <span className={`mt-0.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                    hint.type === "capital" ? "bg-purple-400"
                    : hint.type === "continent" ? "bg-blue-400"
                    : hint.type === "flag" ? "bg-red-400"
                    : "bg-yellow-400"
                  }`} />
                  <div className="flex-1 min-w-0">
                    {hint.type === "flag" && hint.flagUrl ? (
                      <img src={hint.flagUrl} alt={hint.text} className="w-full h-12 object-cover rounded-lg" />
                    ) : (
                      <p className="text-slate-200 leading-snug">{hint.text}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          {!(lastResult && lastResult.correct) && remainingHintCount > 0 && (
            <div className="px-2 pb-2">
              <button onClick={handleGetHint}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 rounded-xl text-[11px] font-semibold text-yellow-400 transition-all active:scale-95">
                <ChevronRight className="w-3.5 h-3.5" />
                Get hint ({calculatePoints(hintsUsed + 1)} pts if correct)
              </button>
            </div>
          )}
          {!(lastResult && lastResult.correct) && remainingHintCount === 0 && shownHints.length > 0 && (
            <p className="text-[10px] text-slate-500 text-center pb-2">No more hints available</p>
          )}
        </div>
      </div>

      {/* ── Submit panel (bottom-left) ── */}
      <div className="absolute bottom-24 left-3 z-20 w-56">
        <div className="bg-slate-900/92 backdrop-blur-md rounded-2xl border border-slate-700/50 shadow-xl p-3">
          <AnimatePresence mode="wait">
            {lastResult && lastResult.correct ? (
              // Correct answer — show result and wait for next round
              <motion.div key="result-correct" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="text-center py-1 text-emerald-400">
                <Zap className="w-5 h-5 mx-auto mb-1" />
                <p className="font-black text-sm">+{lastResult.points} pts!</p>
                <p className="text-[10px] opacity-70">Correct! Next round soon...</p>
              </motion.div>
            ) : (
              <motion.div key="submit" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <p className="text-[10px] text-slate-400 font-semibold mb-1.5 text-center">
                  {selectedCountryName ? `Selected: ${selectedCountryName}` : "Click a country on the map"}
                </p>
                {selectedCountryName && expectedPoints !== null && (
                  <p className="text-[10px] text-yellow-400 text-center mb-2">
                    Worth ~{expectedPoints} pts · {hintsUsed} hint{hintsUsed !== 1 ? "s" : ""} used
                  </p>
                )}
                <button onClick={handleSubmit} disabled={!selectedCountryName}
                  className="w-full py-2.5 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-xl font-bold text-sm transition-all active:scale-95">
                  Submit Answer
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Round history dots ── */}
      {roundResults.length > 0 && (
        <div className="absolute bottom-7 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
          {roundResults.slice(-10).map((r, i) => (
            <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }}
              className={`w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-black ${
                r.myCorrect
                  ? "bg-emerald-500/30 border border-emerald-500/50 text-emerald-400"
                  : "bg-red-500/30 border border-red-500/50 text-red-400"
              }`}>
              {r.myCorrect ? "✓" : "✗"}
            </motion.div>
          ))}
        </div>
      )}

      {/* ── Leave button ── */}
      <div className="absolute bottom-12 left-3 z-20">
        <button onClick={() => { if (window.confirm("Leave match? You will forfeit.\n\nYou can reconnect within 15 seconds from the Multiplayer screen.")) { cleanup(); onBackToMenu(); } }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-xl text-xs font-semibold transition-all border border-slate-700/50">
          <WifiOff className="w-3.5 h-3.5" /> Leave
        </button>
      </div>

      {/* ── NewHintModal (locks map) ── */}
      <NewHintModal
        hint={newHintModal}
        onComplete={handleHintComplete}
        lockDuration={3}
      />

      {/* ── Map lock overlay ── */}
      {isMapLocked && (
        <div className="absolute inset-0 z-10 bg-black/15 pointer-events-none" />
      )}

      {/* ── Opponent grace period overlay ── */}
      <AnimatePresence>
        {graceCountdown !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 260 }}
              className="bg-slate-900 border border-slate-700 rounded-3xl p-8 max-w-sm w-full mx-4 text-center shadow-2xl"
            >
              {/* Icon */}
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-yellow-500/20 border-2 border-yellow-500/40 flex items-center justify-center">
                  <Wifi className="w-8 h-8 text-yellow-400" />
                </div>
              </div>

              <h3 className="text-lg font-bold text-slate-100 mb-1">Checking connection...</h3>
              <p className="text-sm text-slate-400 mb-6">Opponent disconnected. Waiting for them to reconnect.</p>

              {/* Animated countdown ring */}
              <div className="relative flex items-center justify-center mb-6">
                <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
                  <circle cx="48" cy="48" r="40" fill="none" stroke="#334155" strokeWidth="6" />
                  <motion.circle
                    cx="48" cy="48" r="40"
                    fill="none"
                    stroke="#eab308"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    animate={{
                      strokeDashoffset: `${2 * Math.PI * 40 * (1 - graceCountdown / 15)}`
                    }}
                    transition={{ duration: 0.8, ease: "linear" }}
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-3xl font-black text-yellow-400">{graceCountdown}</span>
                  <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">sec</span>
                </div>
              </div>

              <p className="text-xs text-slate-500">
                If they don't reconnect, you'll be awarded the win.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}