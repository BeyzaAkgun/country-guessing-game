// //MultiplayerGame.tsx
// import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
// import { motion, AnimatePresence } from "motion/react";
// import {
//   Swords, Loader2, Trophy, Home, RotateCcw,
//   Wifi, WifiOff, Shield, Clock, Handshake, Zap, ChevronRight, Lightbulb
// } from "lucide-react";
// import { matchmaking, createMatchSocket } from "@/api/client";
// import {
//   getHintAtIndex, getTotalHintCount, calculatePoints,
//   type MPHint,
// } from "@/app/data/multiplayerHints";
// import { useCountryData } from "@/app/hooks/useCountryData";
// import WorldMap from "@/app/components/WorldMap";
// import type { StoredUser, MatchEndPlayer } from "@/api/client";
// import { addXP } from "@/app/utils/xpSystem";
// import { soundEffects } from "@/app/utils/soundEffects";
// import { NewHintModal } from "./NewHintModal";

// // ── Types ────────────────────────────────────────────────────────────────────
// interface MultiplayerGameProps {
//   onBackToMenu: () => void;
//   user: StoredUser | null;
//   initialMatchId?: string | null;
// }

// type Phase = "lobby" | "queuing" | "connecting" | "waiting" | "playing" | "finished";

// interface Question {
//   round: number;
//   country_name: string;
//   mode: string;
//   started_at: string;
// }

// interface RoundResult {
//   round: number;
//   myCorrect: boolean;
//   myPoints: number;
// }

// const ROUND_SECONDS = 30;

// const SESSION_MATCH_KEY = "mp_active_match_id";
// const saveActiveMatch  = (id: string) => sessionStorage.setItem(SESSION_MATCH_KEY, id);
// const clearActiveMatch = ()           => sessionStorage.removeItem(SESSION_MATCH_KEY);
// const getActiveMatch   = ()           => sessionStorage.getItem(SESSION_MATCH_KEY);

// // ── Component ─────────────────────────────────────────────────────────────────
// export function MultiplayerGame({ onBackToMenu, user, initialMatchId }: MultiplayerGameProps) {
//   const { countries, loading: mapLoading } = useCountryData();

//   const [phase, setPhase]               = useState<Phase>("lobby");
//   const [question, setQuestion]         = useState<Question | null>(null);
//   const [scores, setScores]             = useState<Record<string, number>>({});
//   const [opponentId, setOpponentId]     = useState<string | null>(null);
//   const [roundResults, setRoundResults] = useState<RoundResult[]>([]);
//   const [matchEnd, setMatchEnd]         = useState<{ winner_id: string | null; is_draw: boolean; forfeit?: boolean; players: MatchEndPlayer[] } | null>(null);
//   const [connectedCount, setConnected]  = useState(0);
//   const [error, setError]               = useState<string | null>(null);
//   const [timeLeft, setTimeLeft]         = useState(ROUND_SECONDS);
//   const [lastResult, setLastResult]     = useState<{ correct: boolean; points: number; correctAnswer?: string } | null>(null);
//   const [opponentAnswered, setOpponentAnswered] = useState(false);
//   const [opponentCorrect, setOpponentCorrect]   = useState<boolean | null>(null);
//   const [graceCountdown, setGraceCountdown]     = useState<number | null>(null);
//   const graceTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

//   // storedMatchCheck drives the "Match in Progress" reconnect card.
//   // We only ever show it when the match is genuinely active (waiting/in_progress).
//   const [storedMatchCheck, setStoredMatchCheck] = useState<{
//     loading: boolean;
//     status: "waiting" | "in_progress" | "finished" | null;
//     result: any | null;
//   }>({
//     loading: false,
//     status: null,
//     result: null,
//   });

//   // Map interaction
//   const [selectedCountryName, setSelectedCountryName] = useState<string | null>(null);
//   const [correctCountries, setCorrectCountries]       = useState<string[]>([]);
//   const [wrongCountries, setWrongCountries]           = useState<string[]>([]);

//   // Hints state
//   const [nextHintIndex, setNextHintIndex] = useState(0);
//   const [shownHints, setShownHints]       = useState<MPHint[]>([]);
//   const [isMapLocked, setIsMapLocked]     = useState(false);
//   const [newHintModal, setNewHintModal]   = useState<{ text: string; type: any; countryName: string; flagUrl?: string } | null>(null);

//   const socketRef      = useRef<WebSocket | null>(null);
//   const xpAwardedRef   = useRef<string | null>(null);
//   const timerRef       = useRef<ReturnType<typeof setInterval> | null>(null);
//   const pollRef        = useRef<ReturnType<typeof setInterval> | null>(null);
//   const phaseRef       = useRef<Phase>("lobby");
//   const questionRef    = useRef<Question | null>(null);
//   const matchEndingRef = useRef(false);
//   const restartingRef  = useRef(false);
//   const intentionalCloseRef = useRef(false);

//   useEffect(() => { phaseRef.current = phase; }, [phase]);
//   useEffect(() => { questionRef.current = question; }, [question]);

//   // ── Stored match check — runs only when in lobby with a stored match ID ──
//   useEffect(() => {
//     const mid = getActiveMatch();

//     if (phase !== "lobby" || !mid) {
//       setStoredMatchCheck({ loading: false, status: null, result: null });
//       return;
//     }

//     let cancelled = false;
//     setStoredMatchCheck({ loading: true, status: null, result: null });

//     (async () => {
//       try {
//         const status = await matchmaking.getMatchStatus(mid);
//         if (cancelled) return;

//         if (status.status === "finished") {
//           // Match is over — clear it and show results instead of reconnect card
//           clearActiveMatch();
//           setMatchEnd(status.result ?? null);
//           setPhase("finished");
//           phaseRef.current = "finished";
//           setStoredMatchCheck({ loading: false, status: null, result: null });
//           return;
//         }

//         if (status.status === "waiting" || status.status === "in_progress") {
//           // Match is live — show the reconnect card
//           setStoredMatchCheck({ loading: false, status: status.status, result: null });
//           return;
//         }

//         // Any other status (not_found, not_participant, error) → clear and show normal lobby
//         clearActiveMatch();
//         setStoredMatchCheck({ loading: false, status: null, result: null });
//       } catch {
//         if (!cancelled) {
//           clearActiveMatch();
//           setStoredMatchCheck({ loading: false, status: null, result: null });
//         }
//       }
//     })();

//     return () => { cancelled = true; };
//   }, [phase]);

//   const myScore  = scores[user?.id ?? ""] ?? 0;
//   const oppScore = opponentId ? (scores[opponentId] ?? 0) : 0;
//   const hintsUsed          = shownHints.length;
//   const totalHintsAvail    = question ? getTotalHintCount(question.country_name) : 0;
//   const remainingHintCount = totalHintsAvail - hintsUsed;
//   const expectedPoints     = selectedCountryName ? calculatePoints(hintsUsed) : null;

//   // ── Timer ─────────────────────────────────────────────────────────────────
//   const startTimer = useCallback((startedAt: string) => {
//     if (timerRef.current) clearInterval(timerRef.current);
//     const tick = () => {
//       const elapsed = (Date.now() - new Date(startedAt).getTime()) / 1000;
//       const remaining = Math.max(0, ROUND_SECONDS - elapsed);
//       setTimeLeft(Math.ceil(remaining));
//       if (remaining <= 0) clearInterval(timerRef.current!);
//     };
//     tick();
//     timerRef.current = setInterval(tick, 500);
//   }, []);

//   const cleanup = useCallback(() => {
//     intentionalCloseRef.current = true;

//     if (timerRef.current) clearInterval(timerRef.current);
//     if (pollRef.current) clearInterval(pollRef.current);
//     if (graceTimerRef.current) clearInterval(graceTimerRef.current);

//     if (socketRef.current) {
//       socketRef.current.onclose = null;
//       socketRef.current.onerror = null;
//       try {
//         if (
//           socketRef.current.readyState === WebSocket.OPEN ||
//           socketRef.current.readyState === WebSocket.CONNECTING
//         ) {
//           socketRef.current.close(1000, "cleanup");
//         }
//       } catch {}
//     }

//     socketRef.current = null;
//     timerRef.current = null;
//     pollRef.current = null;
//     graceTimerRef.current = null;
//   }, []);

//   const resetState = useCallback(() => {
//     cleanup();
//     setMatchEnd(null); setQuestion(null); setScores({});
//     setOpponentId(null); setRoundResults([]);
//     setLastResult(null); setConnected(0);
//     setTimeLeft(ROUND_SECONDS); setError(null);
//     setSelectedCountryName(null); setCorrectCountries([]); setWrongCountries([]);
//     setNextHintIndex(0); setShownHints([]);
//     setOpponentAnswered(false); setOpponentCorrect(null); setIsMapLocked(false);
//     setGraceCountdown(null);
//     // Always clear the stored match ID when fully resetting
//     clearActiveMatch();
//     xpAwardedRef.current = null;
//     sessionStorage.removeItem("mp_xp_awarded_match");
//     matchEndingRef.current = false;
//     restartingRef.current = false;
//   }, [cleanup]);

//   // ── Init a new round question ─────────────────────────────────────────────
//   const initQuestion = useCallback((q: Question) => {
//     setQuestion(prev => {
//       if (prev && prev.round !== q.round) {
//         setLastResult(lr => {
//           if (!lr || !lr.correct) {
//             setWrongCountries(wc => [...wc, prev.country_name]);
//           }
//           return lr;
//         });
//       }
//       return q;
//     });
//     setLastResult(null);
//     setSelectedCountryName(null);
//     setOpponentAnswered(false);
//     setOpponentCorrect(null);
//     setIsMapLocked(false);

//     soundEffects.playRoundStart();

//     const firstHint = getHintAtIndex(q.country_name, 0);
//     if (firstHint) {
//       setNextHintIndex(1);
//       setShownHints([firstHint]);
//       setNewHintModal({ text: firstHint.text, type: firstHint.type, countryName: q.country_name, flagUrl: firstHint.flagUrl });
//       setIsMapLocked(true);
//     } else {
//       setNextHintIndex(0);
//       setShownHints([]);
//     }

//     startTimer(q.started_at ?? new Date().toISOString());
//   }, [startTimer]);

//   // ── Request next hint ─────────────────────────────────────────────────────
//   const handleGetHint = useCallback(() => {
//     if (!question || (lastResult && lastResult.correct) || remainingHintCount === 0) return;
//     const hint = getHintAtIndex(question.country_name, nextHintIndex);
//     if (!hint) return;
//     soundEffects.playHint();
//     setNextHintIndex(prev => prev + 1);
//     setShownHints(prev => [...prev, hint]);
//     setNewHintModal({ text: hint.text, type: hint.type, countryName: question.country_name, flagUrl: hint.flagUrl });
//     setIsMapLocked(true);
//   }, [question, lastResult, remainingHintCount, nextHintIndex]);

//   // ── Map click ─────────────────────────────────────────────────────────────
//   const handleCountryClick = useCallback((geo: any) => {
//     if (isMapLocked || (lastResult && lastResult.correct)) return;
//     const name = geo.properties?.name || geo.name;
//     soundEffects.playClick();
//     setSelectedCountryName(name);
//   }, [isMapLocked, lastResult]);

//   // ── Submit answer ─────────────────────────────────────────────────────────
//   const handleSubmit = useCallback(() => {
//     if (!selectedCountryName || !socketRef.current) return;
//     if (lastResult && lastResult.correct) return;
//     socketRef.current.send(JSON.stringify({ event: "answer", data: { answer: selectedCountryName, hints_used: hintsUsed } }));
//   }, [selectedCountryName, lastResult, hintsUsed]);

//   const handleHintComplete = useCallback(() => {
//     setNewHintModal(null);
//     setIsMapLocked(false);
//   }, []);

//   // ── WebSocket connection ──────────────────────────────────────────────────
//   const connectToMatch = useCallback((mid: string) => {
//     restartingRef.current = false;
//     matchEndingRef.current = false;
//     intentionalCloseRef.current = false;

//     if (pollRef.current) {
//       clearInterval(pollRef.current);
//       pollRef.current = null;
//     }

//     saveActiveMatch(mid);
//     setPhase("connecting");
//     phaseRef.current = "connecting";
//     setConnected(0);

//     const ws = createMatchSocket(mid);
//     socketRef.current = ws;

//     ws.onopen = () => {
//       if (!matchEndingRef.current && !restartingRef.current) {
//         setPhase("waiting");
//         phaseRef.current = "waiting";
//       }
//     };

//     ws.onmessage = (evt) => {
//       const { event, data } = JSON.parse(evt.data);
//       switch (event) {
//         case "player_connected":
//           setConnected(c => c + 1);
//           if (data.user_id !== user?.id) setOpponentId(data.user_id);
//           break;

//         case "match_start":
//           setPhase("playing");
//           phaseRef.current = "playing";
//           setGraceCountdown(null);
//           if (!data.reconnect) {
//             setScores({});
//             setRoundResults([]);
//             setCorrectCountries([]);
//             setWrongCountries([]);
//           }
//           break;

//         case "question":
//           initQuestion(data as Question);
//           break;

//         case "answer_result":
//           setLastResult({ correct: data.correct, points: data.points_earned, correctAnswer: data.correct_answer });
//           if (data.correct && timerRef.current) clearInterval(timerRef.current);

//           if (data.correct) {
//             soundEffects.playCorrect();
//           } else {
//             setSelectedCountryName(null);
//             soundEffects.playWrong();
//           }

//           setRoundResults(prev => [...prev, {
//             round: data.round ?? 0,
//             myCorrect: data.correct,
//             myPoints: data.points_earned
//           }]);

//           if (data.correct && questionRef.current?.country_name) {
//             setCorrectCountries(prev => [...prev, questionRef.current!.country_name]);
//           }
//           break;

//         case "player_answered":
//           setScores(prev => ({
//             ...prev,
//             [data.user_id]: (prev[data.user_id] ?? 0) + (data.points_earned ?? 0)
//           }));
//           if (data.user_id !== user?.id) {
//             setOpponentId(data.user_id);
//             setOpponentAnswered(true);
//             setOpponentCorrect(data.correct ?? null);
//           }
//           break;

//         case "match_end": {
//           matchEndingRef.current = true;
//           phaseRef.current = "finished";

//           const currentMatchId = getActiveMatch() ?? "";
//           // Clear the stored match ID immediately when match ends
//           clearActiveMatch();

//           setPhase("finished");
//           cleanup();

//           if (user?.id && Array.isArray(data.players)) {
//             const me = data.players.find((p: any) => p.user_id === user.id);
//             const alreadyAwarded =
//               xpAwardedRef.current === currentMatchId ||
//               sessionStorage.getItem("mp_xp_awarded_match") === currentMatchId;

//             if (me?.xp_earned > 0 && currentMatchId && !alreadyAwarded) {
//               xpAwardedRef.current = currentMatchId;
//               sessionStorage.setItem("mp_xp_awarded_match", currentMatchId);
//               addXP(me.xp_earned);
//               window.dispatchEvent(new Event("xp-updated"));
//             }
//           }

//           if (data.is_draw) {
//             soundEffects.playAchievement();
//           } else if (data.winner_id === user?.id) {
//             soundEffects.playVictory();
//           } else {
//             soundEffects.playDefeat();
//           }

//           setMatchEnd({
//             winner_id: data.winner_id,
//             is_draw: data.is_draw,
//             forfeit: data.forfeit ?? false,
//             players: data.players
//           });
//           setPhase("finished");
//           break;
//         }

//         case "error": {
//           const msg = data.message ?? "An error occurred";
//           // If the server tells us the match already ended, clear storage immediately
//           if (msg === "match_already_ended") {
//             clearActiveMatch();
//             setStoredMatchCheck({ loading: false, status: null, result: null });
//             setError("This match has already ended.");
//             cleanup();
//             setPhase("lobby");
//             phaseRef.current = "lobby";
//           } else {
//             setError(msg);
//           }
//           break;
//         }

//         case "player_disconnected":
//           if (data.user_id !== user?.id) {
//             const graceSecs = data.grace_seconds ?? 0;
//             if (graceSecs > 0) {
//               setGraceCountdown(graceSecs);
//               if (graceTimerRef.current) clearInterval(graceTimerRef.current);
//               graceTimerRef.current = setInterval(() => {
//                 setGraceCountdown(prev => {
//                   if (prev === null || prev <= 1) {
//                     clearInterval(graceTimerRef.current!);
//                     graceTimerRef.current = null;
//                     return null;
//                   }
//                   return prev - 1;
//                 });
//               }, 1000);
//             } else {
//               // Opponent left and match won't continue — clear stored match ID
//               // BEFORE going to lobby so storedMatchCheck never shows the reconnect card
//               clearActiveMatch();
//               setStoredMatchCheck({ loading: false, status: null, result: null });
//               setError("Opponent disconnected.");
//               cleanup();
//               setPhase("lobby");
//               phaseRef.current = "lobby";
//             }
//           }
//           break;

//         case "opponent_reconnected":
//           if (data.user_id !== user?.id) {
//             if (graceTimerRef.current) {
//               clearInterval(graceTimerRef.current);
//               graceTimerRef.current = null;
//             }
//             setGraceCountdown(null);
//           }
//           break;
//       }
//     };

//     ws.onerror = () => {
//       if (!intentionalCloseRef.current && !matchEndingRef.current && !restartingRef.current) {
//         setError("Connection error.");
//       }
//     };

//     ws.onclose = (e) => {
//       if (intentionalCloseRef.current || matchEndingRef.current || restartingRef.current) return;

//       if (e.code === 4409) {
//         // Server explicitly told us: match already ended
//         clearActiveMatch();
//         setStoredMatchCheck({ loading: false, status: null, result: null });
//         setError("This match has already ended.");
//         setPhase("lobby");
//         phaseRef.current = "lobby";
//         return;
//       }

//       if (e.code !== 1000) {
//         if (phaseRef.current === "playing") {
//           setError("__reconnectable__");
//           setPhase("lobby");
//           phaseRef.current = "lobby";
//         } else {
//           // Non-playing disconnect (connecting/waiting) — clear the stale match
//           clearActiveMatch();
//           setStoredMatchCheck({ loading: false, status: null, result: null });
//           setError("Disconnected from match.");
//           setPhase("lobby");
//           phaseRef.current = "lobby";
//         }
//       }
//     };
//   }, [cleanup, initQuestion, user?.id]);

//   // ── Join queue ────────────────────────────────────────────────────────────
//   const handleJoinQueue = useCallback(async () => {
//     if (!user) {
//       setError("You need an account to play ranked multiplayer.");
//       return;
//     }

//     // Always clear any stale match state before entering the queue.
//     // The server's join_queue endpoint now validates match_found keys before
//     // returning them, so there's no risk of getting sent to a finished match.
//     clearActiveMatch();
//     setStoredMatchCheck({ loading: false, status: null, result: null });

//     restartingRef.current = false;
//     matchEndingRef.current = false;
//     intentionalCloseRef.current = false;

//     setError(null);
//     setPhase("queuing");
//     phaseRef.current = "queuing";

//     try {
//       const res = await matchmaking.joinQueue("classic");

//       if (res.status === "already_in_match" && res.match_id) {
//         // Server says we're already in a live match — connect directly.
//         // Never go to lobby: that triggers storedMatchCheck → reconnect card.
//         connectToMatch(res.match_id);
//         return;
//       }

//       if (res.status === "match_found" && res.match_id) {
//         connectToMatch(res.match_id);
//       } else {
//         // In queue — poll for a match
//         pollRef.current = setInterval(async () => {
//           try {
//             const status = await matchmaking.getStatus();

//             if (status.status === "match_found" && status.match_id) {
//               if (pollRef.current) {
//                 clearInterval(pollRef.current);
//                 pollRef.current = null;
//               }
//               connectToMatch(status.match_id);
//             } else if (status.status === "already_in_match" && status.match_id) {
//               // We were matched while polling — connect directly.
//               // Never go to lobby here: saveActiveMatch + setPhase("lobby")
//               // would trigger storedMatchCheck and show the reconnect card.
//               if (pollRef.current) {
//                 clearInterval(pollRef.current);
//                 pollRef.current = null;
//               }
//               connectToMatch(status.match_id);
//             } else if (status.status === "not_in_queue") {
//               if (pollRef.current) {
//                 clearInterval(pollRef.current);
//                 pollRef.current = null;
//               }
//               setError("Lost queue position. Please try again.");
//               setPhase("lobby");
//               phaseRef.current = "lobby";
//             }
//           } catch {
//             if (pollRef.current) {
//               clearInterval(pollRef.current);
//               pollRef.current = null;
//             }
//             setError("Lost connection to matchmaking.");
//             setPhase("lobby");
//             phaseRef.current = "lobby";
//           }
//         }, 2000);
//       }
//     } catch (e: any) {
//       setError(e.message ?? "Failed to join queue");
//       setPhase("lobby");
//       phaseRef.current = "lobby";
//     }
//   }, [connectToMatch, user]);

//   const handleLeaveQueue = async () => {
//     try { await matchmaking.leaveQueue(); } catch {}
//     resetState();
//     setPhase("lobby");
//   };

//   // ── Play Again — full reset then immediately join queue ───────────────────
//   const handlePlayAgain = useCallback(() => {
//     restartingRef.current = true;
//     intentionalCloseRef.current = true;
//     matchEndingRef.current = true;

//     if (socketRef.current) {
//       socketRef.current.onclose = null;
//       socketRef.current.onerror = null;
//       try {
//         socketRef.current.close(1000, "play_again");
//       } catch {}
//     }

//     // resetState calls clearActiveMatch and resets all game state
//     resetState();
//     phaseRef.current = "lobby";

//     requestAnimationFrame(() => {
//       restartingRef.current = false;
//       intentionalCloseRef.current = false;
//       matchEndingRef.current = false;
//       void handleJoinQueue();
//     });
//   }, [resetState, handleJoinQueue]);

//   // ── Reconnect to the same match after own disconnect ──────────────────────
//   const handleReconnect = useCallback(async () => {
//     const mid = getActiveMatch();
//     if (!mid) return;

//     try {
//       const status = await matchmaking.getMatchStatus(mid);
//       if (status.status === "finished") {
//         clearActiveMatch();
//         setStoredMatchCheck({ loading: false, status: null, result: null });
//         setMatchEnd(status.result ?? null);
//         setPhase("finished");
//         phaseRef.current = "finished";
//         return;
//       }
//     } catch {
//       // If status check fails, still attempt reconnect
//     }

//     if (timerRef.current) clearInterval(timerRef.current);
//     if (pollRef.current) clearInterval(pollRef.current);
//     if (graceTimerRef.current) clearInterval(graceTimerRef.current);

//     intentionalCloseRef.current = true;
//     if (socketRef.current) {
//       socketRef.current.onclose = null;
//       socketRef.current.onerror = null;
//       try {
//         socketRef.current.close(1000, "reconnect");
//       } catch {}
//     }

//     socketRef.current = null;
//     timerRef.current = null;
//     pollRef.current = null;
//     graceTimerRef.current = null;
//     setMatchEnd(null);
//     setError(null);
//     setGraceCountdown(null);
//     setOpponentAnswered(false);
//     setOpponentCorrect(null);
//     setStoredMatchCheck({ loading: false, status: null, result: null });

//     connectToMatch(mid);
//   }, [connectToMatch]);

//   // ── Abandon match ─────────────────────────────────────────────────────────
//   const handleAbandon = useCallback(async () => {
//     const mid = getActiveMatch();

//     // Clear client state immediately — do not wait for server
//     clearActiveMatch();
//     setStoredMatchCheck({ loading: false, status: null, result: null });

//     if (mid) {
//       try {
//         await matchmaking.forfeitMatch(mid);
//         addXP(20);
//         window.dispatchEvent(new Event("xp-updated"));
//       } catch (e: any) {
//         // 409 = already ended — that's fine, we're abandoning anyway
//         if (!e.message?.includes("409") && !e.message?.includes("match_already_ended")) {
//           console.warn("Abandon forfeit error:", e.message);
//         }
//       }
//     }

//     onBackToMenu();
//   }, [onBackToMenu]);

//   // ── Finish screen data ────────────────────────────────────────────────────
//   const myData  = matchEnd?.players.find(p => p.user_id === user?.id);
//   const oppData = matchEnd?.players.find(p => p.user_id !== user?.id);
//   const iWon    = !matchEnd?.is_draw && matchEnd?.winner_id === user?.id;
//   const isDraw  = matchEnd?.is_draw ?? false;

//   // ═══════════════════════════════════════════════════════════════════════════
//   // LOBBY
//   // ═══════════════════════════════════════════════════════════════════════════
//   if (phase === "lobby") {
//     const storedMatchId = getActiveMatch();

//     // Loading state while we check the match status
//     if (storedMatchId && storedMatchCheck.loading) {
//       return (
//         <div className="w-screen h-screen fixed inset-0 flex items-center justify-center bg-slate-950 p-4">
//           <div className="bg-slate-900 rounded-3xl shadow-2xl p-8 w-full max-w-md border border-slate-700/50 text-center">
//             <Loader2 className="w-10 h-10 text-white animate-spin mx-auto mb-4" />
//             <p className="text-white font-bold">Checking match status...</p>
//           </div>
//         </div>
//       );
//     }

//     // Only show the reconnect card if we have confirmed the match is still live
//     if (storedMatchId && storedMatchCheck.status && storedMatchCheck.status !== "finished") {
//       return (
//         <div className="w-screen h-screen fixed inset-0 flex items-center justify-center bg-slate-950 p-4">
//           <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
//             transition={{ type: "spring", damping: 20 }}
//             className="bg-slate-900 rounded-3xl shadow-2xl p-8 w-full max-w-md border border-slate-700/50">
//             <div className="text-center mb-6">
//               <motion.div
//                 animate={{ scale: [1, 1.08, 1] }}
//                 transition={{ duration: 1.6, repeat: Infinity }}
//                 className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl shadow-lg mb-4">
//                 <WifiOff className="w-9 h-9 text-white" />
//               </motion.div>
//               <h1 className="text-2xl font-black text-white mb-1">Match in Progress</h1>
//               <p className="text-slate-400 text-sm">You left an active match. Reconnect to continue.</p>
//             </div>

//             <div className="bg-yellow-900/20 border border-yellow-700/40 rounded-2xl p-4 mb-6">
//               <p className="text-yellow-300 text-sm font-semibold mb-1">⚠️ Your opponent is waiting</p>
//               <p className="text-yellow-200/60 text-xs leading-relaxed">
//                 If you don't reconnect in time, you'll automatically lose the match and your opponent will receive the win.
//                 You cannot start a new match until this one ends.
//               </p>
//             </div>

//             {error && (
//               <div className="bg-red-900/30 border border-red-700/50 rounded-xl px-4 py-3 mb-4">
//                 <p className="text-red-400 text-sm">{error}</p>
//               </div>
//             )}

//             <div className="flex flex-col gap-3">
//               <button onClick={handleReconnect}
//                 className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-white rounded-xl font-bold shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 text-base">
//                 <Wifi className="w-5 h-5" /> Reconnect to Match
//               </button>
//               <button onClick={handleAbandon}
//                 className="w-full py-2.5 bg-slate-700/50 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded-xl font-semibold text-sm transition-all active:scale-95">
//                 Abandon match (lose RP)
//               </button>
//             </div>
//           </motion.div>
//         </div>
//       );
//     }

//     // ── NORMAL LOBBY ──────────────────────────────────────────────────────────
//     return (
//       <div className="w-screen h-screen fixed inset-0 flex items-center justify-center bg-slate-950 p-4">
//         <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
//           transition={{ type: "spring", damping: 20 }}
//           className="bg-slate-900 rounded-3xl shadow-2xl p-8 w-full max-w-md border border-slate-700/50">
//           <div className="text-center mb-6">
//             <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl shadow-lg mb-4">
//               <Swords className="w-9 h-9 text-white" />
//             </div>
//             <h1 className="text-3xl font-black text-white mb-1">Multiplayer</h1>
//             <p className="text-slate-400 text-sm">Real-time map race — click the right country first</p>
//           </div>
//           <div className="bg-slate-800 rounded-2xl p-4 mb-6 space-y-2">
//             {["⚔️  Race against a real opponent on the world map",
//               "💡  Hint 1 (continent) is free — each extra hint costs points",
//               "🗺️  Click the country on the map, then press Submit",
//               "⚡  1 hint = 100pts  ·  2 = 80  ·  3 = 60  ·  4 = 40  ·  5 = 20  ·  6 = 10"].map(line => (
//               <p key={line} className="text-xs text-slate-300">{line}</p>
//             ))}
//           </div>
//           {user ? (
//             <div className="flex items-center gap-3 bg-slate-800 rounded-xl px-4 py-3 mb-6">
//               <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
//                 <span className="text-white font-black text-sm">{user.username.charAt(0).toUpperCase()}</span>
//               </div>
//               <div>
//                 <p className="text-white font-bold text-sm">{user.username}</p>
//                 <p className="text-slate-400 text-xs">Ready to compete</p>
//               </div>
//             </div>
//           ) : (
//             <div className="bg-amber-900/30 border border-amber-700/50 rounded-xl px-4 py-3 mb-6">
//               <p className="text-amber-400 text-sm font-semibold">Guest mode</p>
//               <p className="text-amber-300/70 text-xs mt-0.5">Sign in to play ranked matches and earn RP</p>
//             </div>
//           )}
//           {error && (
//             <div className="bg-red-900/30 border border-red-700/50 rounded-xl px-4 py-3 mb-4">
//               <p className="text-red-400 text-sm">{error}</p>
//             </div>
//           )}
//           <div className="flex gap-3">
//             <button onClick={onBackToMenu} className="flex-none px-4 py-3 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl font-semibold transition-all active:scale-95 flex items-center gap-2">
//               <Home className="w-4 h-4" /> Menu
//             </button>
//             <button onClick={handleJoinQueue} disabled={!user}
//               className="flex-1 py-3 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-bold shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2">
//               <Swords className="w-5 h-5" /> {user ? "Find Match" : "Sign in to play"}
//             </button>
//           </div>
//         </motion.div>
//       </div>
//     );
//   }

//   // ═══════════════════════════════════════════════════════════════════════════
//   // QUEUING / CONNECTING / WAITING
//   // ═══════════════════════════════════════════════════════════════════════════
//   if (phase === "queuing" || phase === "connecting" || phase === "waiting") {
//     const statusText = {
//       queuing: "Finding an opponent...",
//       connecting: "Connecting to match...",
//       waiting: "Waiting for opponent..."
//     }[phase];
//     return (
//       <div className="w-screen h-screen fixed inset-0 flex items-center justify-center bg-slate-950 p-4">
//         <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
//           className="bg-slate-900 rounded-3xl shadow-2xl p-8 w-full max-w-sm border border-slate-700/50 text-center">
//           <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl shadow-lg mb-5">
//             {phase === "waiting"
//               ? <Wifi className="w-9 h-9 text-white" />
//               : <Loader2 className="w-9 h-9 text-white animate-spin" />}
//           </div>
//           <h2 className="text-xl font-black text-white mb-2">{statusText}</h2>
//           <p className="text-slate-400 text-sm mb-6">
//             {phase === "waiting" ? `${connectedCount}/2 players connected` : "This usually takes a few seconds"}
//           </p>
//           <div className="flex justify-center gap-2 mb-6">
//             {[0,1,2].map(i => (
//               <motion.div key={i} animate={{ scale:[1,1.4,1], opacity:[0.4,1,0.4] }}
//                 transition={{ duration: 1.2, repeat: Infinity, delay: i*0.2 }}
//                 className="w-2.5 h-2.5 bg-rose-500 rounded-full" />
//             ))}
//           </div>
//           <button onClick={handleLeaveQueue} className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl font-semibold text-sm transition-all active:scale-95">
//             Cancel
//           </button>
//         </motion.div>
//       </div>
//     );
//   }

//   // ═══════════════════════════════════════════════════════════════════════════
//   // FINISHED
//   // ═══════════════════════════════════════════════════════════════════════════
//   if (phase === "finished" && matchEnd) {
//     const outcomeColor = isDraw ? "from-blue-400 to-cyan-500" : iWon ? "from-yellow-400 to-orange-500" : "from-slate-600 to-slate-700";
//     const OutcomeIcon  = isDraw ? Handshake : iWon ? Trophy : Shield;
//     const isForfeit    = matchEnd?.forfeit ?? false;
//     const outcomeTitle = isDraw ? "It's a Draw! 🤝" : iWon ? (isForfeit ? "Opponent Forfeited 🏳️" : "Victory! 🎉") : (isForfeit ? "You Forfeited" : "Defeated");

//     return (
//       <div className="w-screen h-screen fixed inset-0 flex items-center justify-center bg-slate-950 p-4">
//         <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
//           transition={{ type: "spring", damping: 18 }}
//           className="bg-slate-900 rounded-3xl shadow-2xl p-8 w-full max-w-md border border-slate-700/50">
//           <div className="text-center mb-6">
//             <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }}
//               className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl shadow-lg mb-3 bg-gradient-to-br ${outcomeColor}`}>
//               <OutcomeIcon className="w-9 h-9 text-white" />
//             </motion.div>
//             <h2 className="text-2xl font-black text-white">{outcomeTitle}</h2>
//             {isDraw && <p className="text-slate-400 text-sm mt-1">Both players earn +15 RP</p>}
//             {isForfeit && !isDraw && <p className="text-slate-400 text-sm mt-1">{iWon ? "Opponent disconnected — you win" : "Match ended by disconnect"}</p>}
//           </div>
//           <div className="grid grid-cols-2 gap-3 mb-5">
//             {[
//               { label: "You", data: myData, win: iWon && !isDraw },
//               { label: "Opponent", data: oppData, win: false },
//             ].map(({ label, data, win }) => (
//               <div key={label} className={`rounded-2xl p-4 text-center border-2 ${win ? "border-yellow-500/50 bg-yellow-500/10" : isDraw ? "border-blue-500/30 bg-blue-500/5" : "border-slate-700 bg-slate-800"}`}>
//                 <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
//                 <p className="text-3xl font-black text-white">{data?.score ?? 0}</p>
//                 <p className="text-xs text-slate-400 mt-1">{data?.correct_answers ?? 0} correct</p>
//                 <div className="mt-2 space-y-0.5">
//                   <p className="text-xs text-emerald-400 font-semibold">+{data?.xp_earned ?? 0} XP</p>
//                   <p className={`text-xs font-semibold ${(data?.rank_points_delta ?? 0) >= 0 ? "text-blue-400" : "text-red-400"}`}>
//                     {(data?.rank_points_delta ?? 0) >= 0 ? "+" : ""}{data?.rank_points_delta ?? 0} RP
//                   </p>
//                 </div>
//               </div>
//             ))}
//           </div>
//           <div className="grid grid-cols-3 gap-2 mb-6">
//             {[
//               { v: myData?.best_streak ?? 0, label: "Best Streak" },
//               { v: myData?.wrong_answers ?? 0, label: "Wrong" },
//               { v: myData && (myData.correct_answers + myData.wrong_answers) > 0
//                   ? `${Math.round(myData.correct_answers / (myData.correct_answers + myData.wrong_answers) * 100)}%`
//                   : "0%", label: "Accuracy" },
//             ].map(({ v, label }) => (
//               <div key={label} className="bg-slate-800 rounded-xl p-3 text-center">
//                 <p className="text-lg font-black text-white">{v}</p>
//                 <p className="text-[10px] text-slate-400 mt-0.5">{label}</p>
//               </div>
//             ))}
//           </div>
//           <div className="flex gap-3">
//             <button onClick={onBackToMenu} className="flex-none px-4 py-3 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl font-semibold transition-all active:scale-95 flex items-center gap-2">
//               <Home className="w-4 h-4" /> Menu
//             </button>
//             <button onClick={handlePlayAgain} className="flex-1 py-3 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white rounded-xl font-bold shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2">
//               <RotateCcw className="w-4 h-4" /> Play Again
//             </button>
//           </div>
//         </motion.div>
//       </div>
//     );
//   }

//   // ═══════════════════════════════════════════════════════════════════════════
//   // PLAYING — full-screen map with overlay HUD
//   // ═══════════════════════════════════════════════════════════════════════════
//   return (
//     <div className="w-screen h-screen fixed inset-0 overflow-hidden">

//       {/* ── World Map (full background) ── */}
//       {mapLoading ? (
//         <div className="w-full h-full flex items-center justify-center bg-slate-950">
//           <Loader2 className="w-10 h-10 text-blue-400 animate-spin" />
//         </div>
//       ) : (
//         <div className="absolute inset-0 z-0">
//           <WorldMap
//             countries={countries}
//             onCountryClick={handleCountryClick}
//             selectedCountryName={selectedCountryName}
//             correctCountries={correctCountries}
//             wrongCountries={wrongCountries}
//           />
//         </div>
//       )}

//       {/* ── Top HUD ── */}
//       <div className="absolute top-0 left-0 right-0 z-20 px-3 pt-3">
//         <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-md rounded-2xl px-3 py-2 border border-slate-700/50 shadow-xl">
//           <div className="text-center min-w-[52px]">
//             <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider leading-none">You</p>
//             <p className="text-xl font-black text-white leading-tight">{myScore}</p>
//           </div>
//           <div className="flex-1 text-center">
//             <p className="text-[10px] text-slate-400 font-semibold">Round {question?.round ?? "—"} / 10</p>
//             <div className={`flex items-center justify-center gap-1 ${timeLeft <= 10 ? "text-red-400" : "text-white"}`}>
//               <Clock className="w-3 h-3" />
//               <span className="text-base font-black tabular-nums">{timeLeft}s</span>
//             </div>
//             <div className="w-full h-1 bg-slate-700 rounded-full overflow-hidden mt-0.5">
//               <motion.div
//                 animate={{ width: `${(timeLeft / ROUND_SECONDS) * 100}%` }}
//                 transition={{ duration: 0.5, ease: "linear" }}
//                 className={`h-full rounded-full ${timeLeft <= 10 ? "bg-red-500" : timeLeft <= 20 ? "bg-yellow-400" : "bg-emerald-400"}`}
//               />
//             </div>
//           </div>
//           <div className="text-center min-w-[52px]">
//             <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider leading-none">Opp</p>
//             <p className="text-xl font-black text-white leading-tight">{oppScore}</p>
//             {opponentAnswered && (
//               <p className={`text-[9px] font-black leading-none ${opponentCorrect ? "text-emerald-400" : "text-red-400"}`}>
//                 {opponentCorrect ? "✓" : "✗"}
//               </p>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* ── Hints panel (left) ── */}
//       <div className="absolute top-20 left-3 z-20 w-64 max-w-[calc(50vw-12px)]">
//         <div className="bg-slate-900/92 backdrop-blur-md rounded-2xl border border-slate-700/50 shadow-xl overflow-hidden">
//           <div className="px-3 py-2 border-b border-slate-700/50 flex items-center gap-2">
//             <Lightbulb className="w-3.5 h-3.5 text-yellow-400" />
//             <span className="text-xs font-bold text-white">Hints</span>
//             <span className="ml-auto text-[10px] text-slate-400">{shownHints.length} / {totalHintsAvail}</span>
//           </div>
//           <div className="p-2 space-y-1.5 max-h-52 overflow-y-auto">
//             <AnimatePresence>
//               {shownHints.map((hint, i) => (
//                 <motion.div key={i}
//                   initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
//                   className={`flex items-start gap-2 px-2.5 py-2 rounded-xl text-xs ${
//                     i === 0
//                       ? "bg-indigo-500/15 border border-indigo-500/25"
//                       : "bg-slate-800/80 border border-slate-700/30"
//                   }`}>
//                   <span className={`mt-0.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${
//                     hint.type === "capital" ? "bg-purple-400"
//                     : hint.type === "continent" ? "bg-blue-400"
//                     : hint.type === "flag" ? "bg-red-400"
//                     : "bg-yellow-400"
//                   }`} />
//                   <div className="flex-1 min-w-0">
//                     {hint.type === "flag" && hint.flagUrl ? (
//                       <img src={hint.flagUrl} alt={hint.text} className="w-full h-12 object-cover rounded-lg" />
//                     ) : (
//                       <p className="text-slate-200 leading-snug">{hint.text}</p>
//                     )}
//                   </div>
//                 </motion.div>
//               ))}
//             </AnimatePresence>
//           </div>
//           {!(lastResult && lastResult.correct) && remainingHintCount > 0 && (
//             <div className="px-2 pb-2">
//               <button onClick={handleGetHint}
//                 className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 rounded-xl text-[11px] font-semibold text-yellow-400 transition-all active:scale-95">
//                 <ChevronRight className="w-3.5 h-3.5" />
//                 Get hint ({calculatePoints(hintsUsed + 1)} pts if correct)
//               </button>
//             </div>
//           )}
//           {!(lastResult && lastResult.correct) && remainingHintCount === 0 && shownHints.length > 0 && (
//             <p className="text-[10px] text-slate-500 text-center pb-2">No more hints available</p>
//           )}
//         </div>
//       </div>

//       {/* ── Submit panel (bottom-left) ── */}
//       <div className="absolute bottom-24 left-3 z-20 w-56">
//         <div className="bg-slate-900/92 backdrop-blur-md rounded-2xl border border-slate-700/50 shadow-xl p-3">
//           <AnimatePresence mode="wait">
//             {lastResult && lastResult.correct ? (
//               <motion.div key="result-correct" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
//                 className="text-center py-1 text-emerald-400">
//                 <Zap className="w-5 h-5 mx-auto mb-1" />
//                 <p className="font-black text-sm">+{lastResult.points} pts!</p>
//                 <p className="text-[10px] opacity-70">Correct! Next round soon...</p>
//               </motion.div>
//             ) : (
//               <motion.div key="submit" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
//                 <p className="text-[10px] text-slate-400 font-semibold mb-1.5 text-center">
//                   {selectedCountryName ? `Selected: ${selectedCountryName}` : "Click a country on the map"}
//                 </p>
//                 {selectedCountryName && expectedPoints !== null && (
//                   <p className="text-[10px] text-yellow-400 text-center mb-2">
//                     Worth ~{expectedPoints} pts · {hintsUsed} hint{hintsUsed !== 1 ? "s" : ""} used
//                   </p>
//                 )}
//                 <button onClick={handleSubmit} disabled={!selectedCountryName}
//                   className="w-full py-2.5 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-xl font-bold text-sm transition-all active:scale-95">
//                   Submit Answer
//                 </button>
//               </motion.div>
//             )}
//           </AnimatePresence>
//         </div>
//       </div>

//       {/* ── Round history dots ── */}
//       {roundResults.length > 0 && (
//         <div className="absolute bottom-7 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
//           {roundResults.slice(-10).map((r, i) => (
//             <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }}
//               className={`w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-black ${
//                 r.myCorrect
//                   ? "bg-emerald-500/30 border border-emerald-500/50 text-emerald-400"
//                   : "bg-red-500/30 border border-red-500/50 text-red-400"
//               }`}>
//               {r.myCorrect ? "✓" : "✗"}
//             </motion.div>
//           ))}
//         </div>
//       )}

//       {/* ── Leave button ── */}
//       <div className="absolute bottom-12 left-3 z-20">
//         <button onClick={() => {
//           if (window.confirm("Leave match? You will forfeit.\n\nYou can reconnect within 15 seconds from the Multiplayer screen.")) {
//             clearActiveMatch();
//             cleanup();
//             onBackToMenu();
//           }
//         }}
//           className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-xl text-xs font-semibold transition-all border border-slate-700/50">
//           <WifiOff className="w-3.5 h-3.5" /> Leave
//         </button>
//       </div>

//       {/* ── NewHintModal (locks map) ── */}
//       <NewHintModal
//         hint={newHintModal}
//         onComplete={handleHintComplete}
//         lockDuration={3}
//       />

//       {/* ── Map lock overlay ── */}
//       {isMapLocked && (
//         <div className="absolute inset-0 z-10 bg-black/15 pointer-events-none" />
//       )}

//       {/* ── Opponent grace period overlay ── */}
//       <AnimatePresence>
//         {graceCountdown !== null && (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             className="absolute inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-sm"
//           >
//             <motion.div
//               initial={{ scale: 0.85, opacity: 0 }}
//               animate={{ scale: 1, opacity: 1 }}
//               exit={{ scale: 0.85, opacity: 0 }}
//               transition={{ type: "spring", damping: 20, stiffness: 260 }}
//               className="bg-slate-900 border border-slate-700 rounded-3xl p-8 max-w-sm w-full mx-4 text-center shadow-2xl"
//             >
//               <div className="flex justify-center mb-4">
//                 <div className="w-16 h-16 rounded-full bg-yellow-500/20 border-2 border-yellow-500/40 flex items-center justify-center">
//                   <Wifi className="w-8 h-8 text-yellow-400" />
//                 </div>
//               </div>
//               <h3 className="text-lg font-bold text-slate-100 mb-1">Checking connection...</h3>
//               <p className="text-sm text-slate-400 mb-6">Opponent disconnected. Waiting for them to reconnect.</p>
//               <div className="relative flex items-center justify-center mb-6">
//                 <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
//                   <circle cx="48" cy="48" r="40" fill="none" stroke="#334155" strokeWidth="6" />
//                   <motion.circle
//                     cx="48" cy="48" r="40"
//                     fill="none"
//                     stroke="#eab308"
//                     strokeWidth="6"
//                     strokeLinecap="round"
//                     strokeDasharray={`${2 * Math.PI * 40}`}
//                     animate={{
//                       strokeDashoffset: `${2 * Math.PI * 40 * (1 - graceCountdown / 15)}`
//                     }}
//                     transition={{ duration: 0.8, ease: "linear" }}
//                   />
//                 </svg>
//                 <div className="absolute flex flex-col items-center">
//                   <span className="text-3xl font-black text-yellow-400">{graceCountdown}</span>
//                   <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">sec</span>
//                 </div>
//               </div>
//               <p className="text-xs text-slate-500">
//                 If they don't reconnect, you'll be awarded the win.
//               </p>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }








//MultiplayerGame.tsx
import React, { useState, useEffect, useRef, useCallback } from "react";
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
  const [graceCountdown, setGraceCountdown]     = useState<number | null>(null);
  const graceTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [storedMatchCheck, setStoredMatchCheck] = useState<{
    loading: boolean;
    status: "waiting" | "in_progress" | "finished" | null;
    result: any | null;
  }>({ loading: false, status: null, result: null });

  // Map interaction
  const [selectedCountryName, setSelectedCountryName] = useState<string | null>(null);
  const [correctCountries, setCorrectCountries]       = useState<string[]>([]);
  const [wrongCountries, setWrongCountries]           = useState<string[]>([]);

  // Hints state
  const [nextHintIndex, setNextHintIndex] = useState(0);
  const [shownHints, setShownHints]       = useState<MPHint[]>([]);
  const [isMapLocked, setIsMapLocked]     = useState(false);
  const [newHintModal, setNewHintModal]   = useState<{ text: string; type: any; countryName: string; flagUrl?: string } | null>(null);
  // Mobile: hints panel collapsed by default to give map space
  const [hintsExpanded, setHintsExpanded] = useState(false);

  const socketRef      = useRef<WebSocket | null>(null);
  const xpAwardedRef   = useRef<string | null>(null);
  const timerRef       = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollRef        = useRef<ReturnType<typeof setInterval> | null>(null);
  const phaseRef       = useRef<Phase>("lobby");
  const questionRef    = useRef<Question | null>(null);
  const matchEndingRef = useRef(false);
  const restartingRef  = useRef(false);
  const intentionalCloseRef = useRef(false);

  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { questionRef.current = question; }, [question]);

  // ── Stored match check ────────────────────────────────────────────────────
  useEffect(() => {
    const mid = getActiveMatch();
    if (phase !== "lobby" || !mid) {
      setStoredMatchCheck({ loading: false, status: null, result: null });
      return;
    }
    let cancelled = false;
    setStoredMatchCheck({ loading: true, status: null, result: null });
    (async () => {
      try {
        const status = await matchmaking.getMatchStatus(mid);
        if (cancelled) return;
        if (status.status === "finished") {
          clearActiveMatch();
          setMatchEnd(status.result ?? null);
          setPhase("finished");
          phaseRef.current = "finished";
          setStoredMatchCheck({ loading: false, status: null, result: null });
          return;
        }
        if (status.status === "waiting" || status.status === "in_progress") {
          setStoredMatchCheck({ loading: false, status: status.status, result: null });
          return;
        }
        clearActiveMatch();
        setStoredMatchCheck({ loading: false, status: null, result: null });
      } catch {
        if (!cancelled) {
          clearActiveMatch();
          setStoredMatchCheck({ loading: false, status: null, result: null });
        }
      }
    })();
    return () => { cancelled = true; };
  }, [phase]);

  const myScore  = scores[user?.id ?? ""] ?? 0;
  const oppScore = opponentId ? (scores[opponentId] ?? 0) : 0;
  const hintsUsed          = shownHints.length;
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

  const cleanup = useCallback(() => {
    intentionalCloseRef.current = true;
    if (timerRef.current) clearInterval(timerRef.current);
    if (pollRef.current) clearInterval(pollRef.current);
    if (graceTimerRef.current) clearInterval(graceTimerRef.current);
    if (socketRef.current) {
      socketRef.current.onclose = null;
      socketRef.current.onerror = null;
      try {
        if (socketRef.current.readyState === WebSocket.OPEN || socketRef.current.readyState === WebSocket.CONNECTING) {
          socketRef.current.close(1000, "cleanup");
        }
      } catch {}
    }
    socketRef.current = null;
    timerRef.current = null;
    pollRef.current = null;
    graceTimerRef.current = null;
  }, []);

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
    setHintsExpanded(false);
    clearActiveMatch();
    xpAwardedRef.current = null;
    sessionStorage.removeItem("mp_xp_awarded_match");
    matchEndingRef.current = false;
    restartingRef.current = false;
  }, [cleanup]);

  // ── Init round question ───────────────────────────────────────────────────
  const initQuestion = useCallback((q: Question) => {
    setQuestion(prev => {
      if (prev && prev.round !== q.round) {
        setLastResult(lr => {
          if (!lr || !lr.correct) setWrongCountries(wc => [...wc, prev.country_name]);
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
    // Expand hints when a new round starts so player sees the first hint
    setHintsExpanded(true);
    soundEffects.playRoundStart();
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

  const handleGetHint = useCallback(() => {
    if (!question || (lastResult && lastResult.correct) || remainingHintCount === 0) return;
    const hint = getHintAtIndex(question.country_name, nextHintIndex);
    if (!hint) return;
    soundEffects.playHint();
    setNextHintIndex(prev => prev + 1);
    setShownHints(prev => [...prev, hint]);
    setNewHintModal({ text: hint.text, type: hint.type, countryName: question.country_name, flagUrl: hint.flagUrl });
    setIsMapLocked(true);
    setHintsExpanded(true);
  }, [question, lastResult, remainingHintCount, nextHintIndex]);

  const handleCountryClick = useCallback((geo: any) => {
    if (isMapLocked || (lastResult && lastResult.correct)) return;
    const name = geo.properties?.name || geo.name;
    soundEffects.playClick();
    setSelectedCountryName(name);
  }, [isMapLocked, lastResult]);

  const handleSubmit = useCallback(() => {
    if (!selectedCountryName || !socketRef.current) return;
    if (lastResult && lastResult.correct) return;
    socketRef.current.send(JSON.stringify({ event: "answer", data: { answer: selectedCountryName, hints_used: hintsUsed } }));
  }, [selectedCountryName, lastResult, hintsUsed]);

  const handleHintComplete = useCallback(() => {
    setNewHintModal(null);
    setIsMapLocked(false);
  }, []);

  // ── WebSocket connection ──────────────────────────────────────────────────
  const connectToMatch = useCallback((mid: string) => {
    restartingRef.current = false;
    matchEndingRef.current = false;
    intentionalCloseRef.current = false;
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    saveActiveMatch(mid);
    setPhase("connecting");
    phaseRef.current = "connecting";
    setConnected(0);
    const ws = createMatchSocket(mid);
    socketRef.current = ws;

    ws.onopen = () => {
      if (!matchEndingRef.current && !restartingRef.current) {
        setPhase("waiting");
        phaseRef.current = "waiting";
      }
    };

    ws.onmessage = (evt) => {
      const { event, data } = JSON.parse(evt.data);
      switch (event) {
        case "player_connected":
          setConnected(c => c + 1);
          if (data.user_id !== user?.id) setOpponentId(data.user_id);
          break;
        case "match_start":
          setPhase("playing");
          phaseRef.current = "playing";
          setGraceCountdown(null);
          if (!data.reconnect) {
            setScores({});
            setRoundResults([]);
            setCorrectCountries([]);
            setWrongCountries([]);
          }
          break;
        case "question":
          initQuestion(data as Question);
          break;
        case "answer_result":
          setLastResult({ correct: data.correct, points: data.points_earned, correctAnswer: data.correct_answer });
          if (data.correct && timerRef.current) clearInterval(timerRef.current);
          if (data.correct) { soundEffects.playCorrect(); } else { setSelectedCountryName(null); soundEffects.playWrong(); }
          setRoundResults(prev => [...prev, { round: data.round ?? 0, myCorrect: data.correct, myPoints: data.points_earned }]);
          if (data.correct && questionRef.current?.country_name) {
            setCorrectCountries(prev => [...prev, questionRef.current!.country_name]);
          }
          break;
        case "player_answered":
          setScores(prev => ({ ...prev, [data.user_id]: (prev[data.user_id] ?? 0) + (data.points_earned ?? 0) }));
          if (data.user_id !== user?.id) {
            setOpponentId(data.user_id);
            setOpponentAnswered(true);
            setOpponentCorrect(data.correct ?? null);
          }
          break;
        case "match_end": {
          matchEndingRef.current = true;
          phaseRef.current = "finished";
          const currentMatchId = getActiveMatch() ?? "";
          clearActiveMatch();
          setPhase("finished");
          cleanup();
          if (user?.id && Array.isArray(data.players)) {
            const me = data.players.find((p: any) => p.user_id === user.id);
            const alreadyAwarded = xpAwardedRef.current === currentMatchId || sessionStorage.getItem("mp_xp_awarded_match") === currentMatchId;
            if (me?.xp_earned > 0 && currentMatchId && !alreadyAwarded) {
              xpAwardedRef.current = currentMatchId;
              sessionStorage.setItem("mp_xp_awarded_match", currentMatchId);
              addXP(me.xp_earned);
              window.dispatchEvent(new Event("xp-updated"));
            }
          }
          if (data.is_draw) { soundEffects.playAchievement(); }
          else if (data.winner_id === user?.id) { soundEffects.playVictory(); }
          else { soundEffects.playDefeat(); }
          setMatchEnd({ winner_id: data.winner_id, is_draw: data.is_draw, forfeit: data.forfeit ?? false, players: data.players });
          setPhase("finished");
          break;
        }
        case "error": {
          const msg = data.message ?? "An error occurred";
          if (msg === "match_already_ended") {
            clearActiveMatch();
            setStoredMatchCheck({ loading: false, status: null, result: null });
            setError("This match has already ended.");
            cleanup();
            setPhase("lobby");
            phaseRef.current = "lobby";
          } else { setError(msg); }
          break;
        }
        case "player_disconnected":
          if (data.user_id !== user?.id) {
            const graceSecs = data.grace_seconds ?? 0;
            if (graceSecs > 0) {
              setGraceCountdown(graceSecs);
              if (graceTimerRef.current) clearInterval(graceTimerRef.current);
              graceTimerRef.current = setInterval(() => {
                setGraceCountdown(prev => {
                  if (prev === null || prev <= 1) { clearInterval(graceTimerRef.current!); graceTimerRef.current = null; return null; }
                  return prev - 1;
                });
              }, 1000);
            } else {
              clearActiveMatch();
              setStoredMatchCheck({ loading: false, status: null, result: null });
              setError("Opponent disconnected.");
              cleanup();
              setPhase("lobby");
              phaseRef.current = "lobby";
            }
          }
          break;
        case "opponent_reconnected":
          if (data.user_id !== user?.id) {
            if (graceTimerRef.current) { clearInterval(graceTimerRef.current); graceTimerRef.current = null; }
            setGraceCountdown(null);
          }
          break;
      }
    };

    ws.onerror = () => {
      if (!intentionalCloseRef.current && !matchEndingRef.current && !restartingRef.current) setError("Connection error.");
    };

    ws.onclose = (e) => {
      if (intentionalCloseRef.current || matchEndingRef.current || restartingRef.current) return;
      if (e.code === 4409) {
        clearActiveMatch();
        setStoredMatchCheck({ loading: false, status: null, result: null });
        setError("This match has already ended.");
        setPhase("lobby"); phaseRef.current = "lobby";
        return;
      }
      if (e.code !== 1000) {
        if (phaseRef.current === "playing") {
          setError("__reconnectable__");
          setPhase("lobby"); phaseRef.current = "lobby";
        } else {
          clearActiveMatch();
          setStoredMatchCheck({ loading: false, status: null, result: null });
          setError("Disconnected from match.");
          setPhase("lobby"); phaseRef.current = "lobby";
        }
      }
    };
  }, [cleanup, initQuestion, user?.id]);

  // ── Join queue ────────────────────────────────────────────────────────────
  const handleJoinQueue = useCallback(async () => {
    if (!user) { setError("You need an account to play ranked multiplayer."); return; }
    clearActiveMatch();
    setStoredMatchCheck({ loading: false, status: null, result: null });
    restartingRef.current = false;
    matchEndingRef.current = false;
    intentionalCloseRef.current = false;
    setError(null);
    setPhase("queuing"); phaseRef.current = "queuing";
    try {
      const res = await matchmaking.joinQueue("classic");
      if (res.status === "already_in_match" && res.match_id) { connectToMatch(res.match_id); return; }
      if (res.status === "match_found" && res.match_id) { connectToMatch(res.match_id); }
      else {
        pollRef.current = setInterval(async () => {
          try {
            const status = await matchmaking.getStatus();
            if (status.status === "match_found" && status.match_id) {
              if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
              connectToMatch(status.match_id);
            } else if (status.status === "already_in_match" && status.match_id) {
              if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
              connectToMatch(status.match_id);
            } else if (status.status === "not_in_queue") {
              if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
              setError("Lost queue position. Please try again.");
              setPhase("lobby"); phaseRef.current = "lobby";
            }
          } catch {
            if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
            setError("Lost connection to matchmaking.");
            setPhase("lobby"); phaseRef.current = "lobby";
          }
        }, 2000);
      }
    } catch (e: any) {
      setError(e.message ?? "Failed to join queue");
      setPhase("lobby"); phaseRef.current = "lobby";
    }
  }, [connectToMatch, user]);

  const handleLeaveQueue = async () => {
    try { await matchmaking.leaveQueue(); } catch {}
    resetState(); setPhase("lobby");
  };

  const handlePlayAgain = useCallback(() => {
    restartingRef.current = true;
    intentionalCloseRef.current = true;
    matchEndingRef.current = true;
    if (socketRef.current) {
      socketRef.current.onclose = null;
      socketRef.current.onerror = null;
      try { socketRef.current.close(1000, "play_again"); } catch {}
    }
    resetState(); phaseRef.current = "lobby";
    requestAnimationFrame(() => {
      restartingRef.current = false;
      intentionalCloseRef.current = false;
      matchEndingRef.current = false;
      void handleJoinQueue();
    });
  }, [resetState, handleJoinQueue]);

  const handleReconnect = useCallback(async () => {
    const mid = getActiveMatch();
    if (!mid) return;
    try {
      const status = await matchmaking.getMatchStatus(mid);
      if (status.status === "finished") {
        clearActiveMatch();
        setStoredMatchCheck({ loading: false, status: null, result: null });
        setMatchEnd(status.result ?? null);
        setPhase("finished"); phaseRef.current = "finished";
        return;
      }
    } catch {}
    if (timerRef.current) clearInterval(timerRef.current);
    if (pollRef.current) clearInterval(pollRef.current);
    if (graceTimerRef.current) clearInterval(graceTimerRef.current);
    intentionalCloseRef.current = true;
    if (socketRef.current) {
      socketRef.current.onclose = null;
      socketRef.current.onerror = null;
      try { socketRef.current.close(1000, "reconnect"); } catch {}
    }
    socketRef.current = null; timerRef.current = null; pollRef.current = null; graceTimerRef.current = null;
    setMatchEnd(null); setError(null); setGraceCountdown(null);
    setOpponentAnswered(false); setOpponentCorrect(null);
    setStoredMatchCheck({ loading: false, status: null, result: null });
    connectToMatch(mid);
  }, [connectToMatch]);

  const handleAbandon = useCallback(async () => {
    const mid = getActiveMatch();
    clearActiveMatch();
    setStoredMatchCheck({ loading: false, status: null, result: null });
    if (mid) {
      try {
        await matchmaking.forfeitMatch(mid);
        addXP(20);
        window.dispatchEvent(new Event("xp-updated"));
      } catch (e: any) {
        if (!e.message?.includes("409") && !e.message?.includes("match_already_ended")) console.warn("Abandon forfeit error:", e.message);
      }
    }
    onBackToMenu();
  }, [onBackToMenu]);

  const myData  = matchEnd?.players.find(p => p.user_id === user?.id);
  const oppData = matchEnd?.players.find(p => p.user_id !== user?.id);
  const iWon    = !matchEnd?.is_draw && matchEnd?.winner_id === user?.id;
  const isDraw  = matchEnd?.is_draw ?? false;

  // ═══════════════════════════════════════════════════════════════════════════
  // LOBBY
  // ═══════════════════════════════════════════════════════════════════════════
  if (phase === "lobby") {
    const storedMatchId = getActiveMatch();
    if (storedMatchId && storedMatchCheck.loading) {
      return (
        <div className="w-screen h-screen fixed inset-0 flex items-center justify-center bg-slate-950 p-4">
          <div className="bg-slate-900 rounded-3xl shadow-2xl p-8 w-full max-w-md border border-slate-700/50 text-center">
            <Loader2 className="w-10 h-10 text-white animate-spin mx-auto mb-4" />
            <p className="text-white font-bold">Checking match status...</p>
          </div>
        </div>
      );
    }
    if (storedMatchId && storedMatchCheck.status && storedMatchCheck.status !== "finished") {
      return (
        <div className="w-screen h-screen fixed inset-0 flex items-center justify-center bg-slate-950 p-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", damping: 20 }}
            className="bg-slate-900 rounded-3xl shadow-2xl p-6 sm:p-8 w-full max-w-md border border-slate-700/50">
            <div className="text-center mb-6">
              <motion.div animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 1.6, repeat: Infinity }}
                className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl shadow-lg mb-4">
                <WifiOff className="w-9 h-9 text-white" />
              </motion.div>
              <h1 className="text-2xl font-black text-white mb-1">Match in Progress</h1>
              <p className="text-slate-400 text-sm">You left an active match. Reconnect to continue.</p>
            </div>
            <div className="bg-yellow-900/20 border border-yellow-700/40 rounded-2xl p-4 mb-6">
              <p className="text-yellow-300 text-sm font-semibold mb-1">⚠️ Your opponent is waiting</p>
              <p className="text-yellow-200/60 text-xs leading-relaxed">If you don't reconnect in time, you'll automatically lose and your opponent will receive the win.</p>
            </div>
            {error && <div className="bg-red-900/30 border border-red-700/50 rounded-xl px-4 py-3 mb-4"><p className="text-red-400 text-sm">{error}</p></div>}
            <div className="flex flex-col gap-3">
              <button onClick={handleReconnect} className="w-full py-3.5 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-white rounded-xl font-bold shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 text-base">
                <Wifi className="w-5 h-5" /> Reconnect to Match
              </button>
              <button onClick={handleAbandon} className="w-full py-3 bg-slate-700/50 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded-xl font-semibold text-sm transition-all active:scale-95">
                Abandon match (lose RP)
              </button>
            </div>
          </motion.div>
        </div>
      );
    }
    return (
      <div className="w-screen h-screen fixed inset-0 flex items-center justify-center bg-slate-950 p-4">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", damping: 20 }}
          className="bg-slate-900 rounded-3xl shadow-2xl p-6 sm:p-8 w-full max-w-md border border-slate-700/50">
          <div className="text-center mb-5">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl shadow-lg mb-4">
              <Swords className="w-9 h-9 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mb-1">Multiplayer</h1>
            <p className="text-slate-400 text-sm">Real-time map race — click the right country first</p>
          </div>
          <div className="bg-slate-800 rounded-2xl p-4 mb-5 space-y-1.5">
            {["⚔️  Race against a real opponent",
              "💡  Hint 1 (continent) is free — each extra hint costs points",
              "🗺️  Tap the country, then press Submit",
              "⚡  1 hint = 100pts  ·  2 = 80  ·  3 = 60  ·  4 = 40  ·  5 = 20"].map(line => (
              <p key={line} className="text-xs text-slate-300">{line}</p>
            ))}
          </div>
          {user ? (
            <div className="flex items-center gap-3 bg-slate-800 rounded-xl px-4 py-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                <span className="text-white font-black text-sm">{user.username.charAt(0).toUpperCase()}</span>
              </div>
              <div className="min-w-0">
                <p className="text-white font-bold text-sm truncate">{user.username}</p>
                <p className="text-slate-400 text-xs">Ready to compete</p>
              </div>
            </div>
          ) : (
            <div className="bg-amber-900/30 border border-amber-700/50 rounded-xl px-4 py-3 mb-5">
              <p className="text-amber-400 text-sm font-semibold">Guest mode</p>
              <p className="text-amber-300/70 text-xs mt-0.5">Sign in to play ranked matches and earn RP</p>
            </div>
          )}
          {error && <div className="bg-red-900/30 border border-red-700/50 rounded-xl px-4 py-3 mb-4"><p className="text-red-400 text-sm">{error}</p></div>}
          <div className="flex gap-3">
            <button onClick={onBackToMenu} className="flex-none min-h-[48px] px-4 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl font-semibold transition-all active:scale-95 flex items-center gap-2">
              <Home className="w-4 h-4" /> Menu
            </button>
            <button onClick={handleJoinQueue} disabled={!user}
              className="flex-1 min-h-[48px] bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-bold shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2">
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
    const statusText = { queuing: "Finding an opponent...", connecting: "Connecting to match...", waiting: "Waiting for opponent..." }[phase];
    return (
      <div className="w-screen h-screen fixed inset-0 flex items-center justify-center bg-slate-950 p-4">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="bg-slate-900 rounded-3xl shadow-2xl p-8 w-full max-w-sm border border-slate-700/50 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl shadow-lg mb-5">
            {phase === "waiting" ? <Wifi className="w-9 h-9 text-white" /> : <Loader2 className="w-9 h-9 text-white animate-spin" />}
          </div>
          <h2 className="text-xl font-black text-white mb-2">{statusText}</h2>
          <p className="text-slate-400 text-sm mb-6">
            {phase === "waiting" ? `${connectedCount}/2 players connected` : "This usually takes a few seconds"}
          </p>
          <div className="flex justify-center gap-2 mb-6">
            {[0,1,2].map(i => (
              <motion.div key={i} animate={{ scale:[1,1.4,1], opacity:[0.4,1,0.4] }} transition={{ duration: 1.2, repeat: Infinity, delay: i*0.2 }}
                className="w-2.5 h-2.5 bg-rose-500 rounded-full" />
            ))}
          </div>
          <button onClick={handleLeaveQueue} className="min-h-[48px] px-6 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl font-semibold text-sm transition-all active:scale-95">
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
      <div className="w-screen h-screen fixed inset-0 flex items-center justify-center bg-slate-950 p-4 overflow-y-auto">
        <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", damping: 18 }}
          className="bg-slate-900 rounded-3xl shadow-2xl p-5 sm:p-8 w-full max-w-md border border-slate-700/50 my-4">
          <div className="text-center mb-5">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }}
              className={`inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl shadow-lg mb-3 bg-gradient-to-br ${outcomeColor}`}>
              <OutcomeIcon className="w-7 h-7 sm:w-9 sm:h-9 text-white" />
            </motion.div>
            <h2 className="text-xl sm:text-2xl font-black text-white">{outcomeTitle}</h2>
            {isDraw && <p className="text-slate-400 text-sm mt-1">Both players earn +15 RP</p>}
            {isForfeit && !isDraw && <p className="text-slate-400 text-sm mt-1">{iWon ? "Opponent disconnected — you win" : "Match ended by disconnect"}</p>}
          </div>
          <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4">
            {[
              { label: "You", data: myData, win: iWon && !isDraw },
              { label: "Opponent", data: oppData, win: false },
            ].map(({ label, data, win }) => (
              <div key={label} className={`rounded-2xl p-3 sm:p-4 text-center border-2 ${win ? "border-yellow-500/50 bg-yellow-500/10" : isDraw ? "border-blue-500/30 bg-blue-500/5" : "border-slate-700 bg-slate-800"}`}>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
                <p className="text-2xl sm:text-3xl font-black text-white">{data?.score ?? 0}</p>
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
          <div className="grid grid-cols-3 gap-2 mb-5">
            {[
              { v: myData?.best_streak ?? 0, label: "Best Streak" },
              { v: myData?.wrong_answers ?? 0, label: "Wrong" },
              { v: myData && (myData.correct_answers + myData.wrong_answers) > 0
                  ? `${Math.round(myData.correct_answers / (myData.correct_answers + myData.wrong_answers) * 100)}%`
                  : "0%", label: "Accuracy" },
            ].map(({ v, label }) => (
              <div key={label} className="bg-slate-800 rounded-xl p-2 sm:p-3 text-center">
                <p className="text-base sm:text-lg font-black text-white">{v}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={onBackToMenu} className="flex-none min-h-[48px] px-4 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl font-semibold transition-all active:scale-95 flex items-center gap-2">
              <Home className="w-4 h-4" /> Menu
            </button>
            <button onClick={handlePlayAgain} className="flex-1 min-h-[48px] bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white rounded-xl font-bold shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2">
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

      {/* ── World Map ── */}
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
      <div className="absolute top-0 left-0 right-0 z-20 px-2 sm:px-3 pt-2 sm:pt-3"
        style={{ paddingTop: "max(env(safe-area-inset-top, 0px), 8px)" }}>
        <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-900/90 backdrop-blur-md rounded-xl sm:rounded-2xl px-2 sm:px-3 py-2 border border-slate-700/50 shadow-xl">
          {/* My score */}
          <div className="text-center min-w-[44px]">
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider leading-none">You</p>
            <p className="text-lg sm:text-xl font-black text-white leading-tight">{myScore}</p>
          </div>

          {/* Timer + round */}
          <div className="flex-1 text-center">
            <p className="text-[10px] text-slate-400 font-semibold">Round {question?.round ?? "—"}/10</p>
            <div className={`flex items-center justify-center gap-1 ${timeLeft <= 10 ? "text-red-400" : "text-white"}`}>
              <Clock className="w-3 h-3" />
              <span className="text-sm sm:text-base font-black tabular-nums">{timeLeft}s</span>
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
          <div className="text-center min-w-[44px]">
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider leading-none">Opp</p>
            <p className="text-lg sm:text-xl font-black text-white leading-tight">{oppScore}</p>
            {opponentAnswered && (
              <p className={`text-[9px] font-black leading-none ${opponentCorrect ? "text-emerald-400" : "text-red-400"}`}>
                {opponentCorrect ? "✓" : "✗"}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Hints panel — collapsible, left side ── */}
      <div className="absolute top-16 sm:top-20 left-2 sm:left-3 z-20"
        style={{ maxWidth: "min(200px, calc(50vw - 8px))" }}>
        <div className="bg-slate-900/92 backdrop-blur-md rounded-xl sm:rounded-2xl border border-slate-700/50 shadow-xl overflow-hidden">
          {/* Header — always visible, tap to expand/collapse */}
          <button
            onClick={() => setHintsExpanded(e => !e)}
            className="w-full px-2.5 py-1.5 border-b border-slate-700/50 flex items-center gap-1.5 active:bg-slate-800/50 transition-colors"
          >
            <Lightbulb className="w-3 h-3 text-yellow-400 flex-shrink-0" />
            <span className="text-[11px] font-bold text-white flex-1 text-left">Hints</span>
            <span className="text-[10px] text-slate-400 tabular-nums">{shownHints.length}/{totalHintsAvail}</span>
            <svg className={`w-3 h-3 text-slate-400 transition-transform ${hintsExpanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Hints list — shown when expanded */}
          <AnimatePresence initial={false}>
            {hintsExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden"
              >
                <div className="p-1.5 space-y-1 max-h-40 sm:max-h-52 overflow-y-auto">
                  <AnimatePresence>
                    {shownHints.map((hint, i) => (
                      <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                        className={`flex items-start gap-1.5 px-2 py-1.5 rounded-lg text-xs ${i === 0 ? "bg-indigo-500/15 border border-indigo-500/25" : "bg-slate-800/80 border border-slate-700/30"}`}>
                        <span className={`mt-0.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${hint.type === "capital" ? "bg-purple-400" : hint.type === "continent" ? "bg-blue-400" : hint.type === "flag" ? "bg-red-400" : "bg-yellow-400"}`} />
                        <div className="flex-1 min-w-0">
                          {hint.type === "flag" && hint.flagUrl
                            ? <img src={hint.flagUrl} alt={hint.text} className="w-full h-8 object-cover rounded" />
                            : <p className="text-slate-200 leading-snug text-[10px] sm:text-xs">{hint.text}</p>}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
                {!(lastResult && lastResult.correct) && remainingHintCount > 0 && (
                  <div className="px-1.5 pb-1.5">
                    <button onClick={handleGetHint}
                      className="w-full flex items-center justify-center gap-1 py-1.5 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 rounded-lg text-[10px] font-semibold text-yellow-400 transition-all active:scale-95">
                      <ChevronRight className="w-3 h-3" />
                      Hint ({calculatePoints(hintsUsed + 1)}pts)
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Submit + Leave — fixed to bottom, respects safe area ── */}
      <div
        className="absolute bottom-0 left-0 right-0 z-20 px-2 sm:px-3 pb-2 sm:pb-3"
        style={{ paddingBottom: "max(env(safe-area-inset-bottom, 0px), 8px)" }}
      >
        <div className="flex items-end gap-2 max-w-sm">
          {/* Leave button */}
          <button
            onClick={() => {
              if (window.confirm("Leave match? You will forfeit.\n\nYou can reconnect within 15 seconds.")) {
                clearActiveMatch(); cleanup(); onBackToMenu();
              }
            }}
            className="flex-shrink-0 flex items-center gap-1 px-2.5 py-2 bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-xl text-xs font-semibold transition-all border border-slate-700/50 min-h-[44px]"
          >
            <WifiOff className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Leave</span>
          </button>

          {/* Submit panel */}
          <div className="flex-1 bg-slate-900/92 backdrop-blur-md rounded-xl sm:rounded-2xl border border-slate-700/50 shadow-xl p-2.5 sm:p-3">
            <AnimatePresence mode="wait">
              {lastResult && lastResult.correct ? (
                <motion.div key="result-correct" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  className="text-center py-1 text-emerald-400">
                  <Zap className="w-4 h-4 mx-auto mb-0.5" />
                  <p className="font-black text-sm">+{lastResult.points} pts!</p>
                  <p className="text-[10px] opacity-70">Next round soon...</p>
                </motion.div>
              ) : (
                <motion.div key="submit" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <p className="text-[10px] text-slate-400 font-semibold mb-1.5 text-center truncate">
                    {selectedCountryName ? selectedCountryName : "Tap a country on the map"}
                  </p>
                  {selectedCountryName && expectedPoints !== null && (
                    <p className="text-[10px] text-yellow-400 text-center mb-1.5">
                      ~{expectedPoints}pts · {hintsUsed} hint{hintsUsed !== 1 ? "s" : ""}
                    </p>
                  )}
                  <button
                    onClick={handleSubmit}
                    disabled={!selectedCountryName}
                    className="w-full min-h-[44px] bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-xl font-bold text-sm transition-all active:scale-95"
                  >
                    Submit Answer
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ── Round history dots ── */}
      {roundResults.length > 0 && (
        <div className="absolute bottom-20 sm:bottom-24 left-1/2 -translate-x-1/2 z-20 flex gap-1">
          {roundResults.slice(-10).map((r, i) => (
            <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }}
              className={`w-4 h-4 sm:w-5 sm:h-5 rounded-md flex items-center justify-center text-[8px] sm:text-[9px] font-black ${r.myCorrect ? "bg-emerald-500/30 border border-emerald-500/50 text-emerald-400" : "bg-red-500/30 border border-red-500/50 text-red-400"}`}>
              {r.myCorrect ? "✓" : "✗"}
            </motion.div>
          ))}
        </div>
      )}

      {/* ── NewHintModal ── */}
      <NewHintModal hint={newHintModal} onComplete={handleHintComplete} lockDuration={3} />

      {/* ── Map lock overlay ── */}
      {isMapLocked && <div className="absolute inset-0 z-10 bg-black/15 pointer-events-none" />}

      {/* ── Opponent grace period overlay ── */}
      <AnimatePresence>
        {graceCountdown !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 260 }}
              className="bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center shadow-2xl">
              <div className="flex justify-center mb-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-yellow-500/20 border-2 border-yellow-500/40 flex items-center justify-center">
                  <Wifi className="w-7 h-7 sm:w-8 sm:h-8 text-yellow-400" />
                </div>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-100 mb-1">Checking connection...</h3>
              <p className="text-sm text-slate-400 mb-5">Opponent disconnected. Waiting for them to reconnect.</p>
              <div className="relative flex items-center justify-center mb-5">
                <svg className="w-20 h-20 sm:w-24 sm:h-24 -rotate-90" viewBox="0 0 96 96">
                  <circle cx="48" cy="48" r="40" fill="none" stroke="#334155" strokeWidth="6" />
                  <motion.circle cx="48" cy="48" r="40" fill="none" stroke="#eab308" strokeWidth="6" strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    animate={{ strokeDashoffset: `${2 * Math.PI * 40 * (1 - graceCountdown / 15)}` }}
                    transition={{ duration: 0.8, ease: "linear" }} />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-2xl sm:text-3xl font-black text-yellow-400">{graceCountdown}</span>
                  <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">sec</span>
                </div>
              </div>
              <p className="text-xs text-slate-500">If they don't reconnect, you'll be awarded the win.</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}