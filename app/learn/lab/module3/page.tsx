"use client"
import React, { useState, useEffect, useRef } from "react";
import { 
  Shield, Flame, Globe, Database, Lock, Play, RefreshCw, X, 
  Server, Terminal, CheckCircle2, AlertTriangle, Trophy, Users, Clock, Zap, Cpu, Eye, Swords, MapPin, History, LogOut, Bug, ArrowLeft, Brain, BookOpen
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { auth, db, database } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, onValue, update, push, set, remove, onDisconnect } from "firebase/database";
import { onAuthStateChanged } from "firebase/auth";

// --- TYPES ---
interface KingdomPlayer {
  id: string;
  name: string;
  xp: number;
  isBot: boolean;
  x: number;
  y: number;
  status: "idle" | "attacking" | "defending" | "shielded" | "disconnected";
  losses: number;
  wins: number;
  shieldTimer: number; 
  defenseStance: "WAF" | "Load Balancer" | "Zero-Trust";
}

interface ActiveRaid {
  id: string;
  firebaseKey?: string;
  slot: 1 | 2;
  attackerId: string;
  attackerName: string;
  targetId: string;
  targetName: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  type: "attack" | "scout";
  payload?: "SQL Injection" | "DDoS Flood" | "Phishing Link" | null;
  phase: "outbound" | "combat" | "return";
  timer: number; 
  maxTimer: number;
  combatSummary?: string;
  winner?: string | null;
  combatSnapshot?: { attXp: number; defXp: number };
}

const INITIAL_BOTS: KingdomPlayer[] = [
  { id: "p2", name: "CipherBot_Alpha", xp: 2100, isBot: true, x: 54, y: 35, status: "idle", losses: 0, wins: 0, shieldTimer: 0, defenseStance: "Load Balancer" },
  { id: "p3", name: "GlitchLord", xp: 24000, isBot: true, x: 38, y: 45, status: "idle", losses: 0, wins: 0, shieldTimer: 0, defenseStance: "Zero-Trust" },
  { id: "p4", name: "NullSector_99", xp: 1850, isBot: true, x: 80, y: 55, status: "idle", losses: 0, wins: 0, shieldTimer: 0, defenseStance: "WAF" }, 
  { id: "p5", name: "RootAccess", xp: 19500, isBot: true, x: 69, y: 85, status: "idle", losses: 0, wins: 0, shieldTimer: 0, defenseStance: "Load Balancer" }, 
];

const INITIAL_PLAYERS: KingdomPlayer[] = [
  { id: "p1", name: "You (Operative)", xp: 2575, isBot: false, x: 20, y: 70, status: "idle", losses: 0, wins: 0, shieldTimer: 0, defenseStance: "WAF" },
  ...INITIAL_BOTS
];

export default function KingdomSiegeArena() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userXp, setUserXp] = useState<number>(2575);

  const [gameState, setGameState] = useState<"instructions" | "lobby" | "playing" | "gameover">("instructions");
  const [lobbyTimer, setLobbyTimer] = useState<number>(60); 
  const [matchTimer, setMatchTimer] = useState<number>(420); 
  const [exitUnlocked, setExitUnlocked] = useState<boolean>(false); 
  const [roomId, setRoomId] = useState<string | null>(null);
  const [players, setPlayers] = useState<KingdomPlayer[]>([]);
  const [historyLogs, setHistoryLogs] = useState<string[]>([]);
  
  const [lobbyEndTime, setLobbyEndTime] = useState<number | null>(null);
  const [matchEndTime, setMatchEndTime] = useState<number | null>(null);
  const [raids, setRaids] = useState<ActiveRaid[]>([]);
  
  const [selectedTarget, setSelectedTarget] = useState<KingdomPlayer | null>(null);
  const [selectedPayload, setSelectedPayload] = useState<"SQL Injection" | "DDoS Flood" | "Phishing Link" | null>(null);
  const [centerMessage, setCenterMessage] = useState<string | null>(null);

  const isGameOverProcessed = useRef(false);
  const shouldSyncStorage = useRef(false); 

  // --- NEW: REFS FOR REAL-TIME INTERVALS (Fixes the timer lag) ---
  const playersRef = useRef(players);
  const raidsRef = useRef(raids);
  
  useEffect(() => {
    playersRef.current = players;
    raidsRef.current = raids;
  }, [players, raids]);

  // Identify the Host
  const activeRealPlayers = players.filter(p => !p.isBot && p.status !== "disconnected");
  const isHost = activeRealPlayers.length > 0 ? activeRealPlayers[0].id === currentUser?.uid : false;

  const showCenterMessage = (msg: string) => {
    setCenterMessage(msg);
    setTimeout(() => setCenterMessage(null), 3000);
  };

  // --- HYDRATION: LOAD LOCAL STORAGE SAFELY ---
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedState = localStorage.getItem("siege_gameState") as any;
      if (savedState) setGameState(savedState);
      
      const savedRoom = localStorage.getItem("siege_roomId");
      if (savedRoom) setRoomId(savedRoom);

      const savedExit = localStorage.getItem("siege_exitUnlocked");
      if (savedExit === "true") setExitUnlocked(true);

      shouldSyncStorage.current = true;
    }
  }, []);

  // --- SYNC LOCAL STORAGE ---
  useEffect(() => {
    if (typeof window !== "undefined" && shouldSyncStorage.current) {
      localStorage.setItem("siege_gameState", gameState);
      localStorage.setItem("siege_exitUnlocked", exitUnlocked.toString());
      if (roomId) localStorage.setItem("siege_roomId", roomId);
    }
  }, [gameState, exitUnlocked, roomId]);

  // --- 1. AUTH & FIRESTORE XP SYNC ---
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) return;
      setCurrentUser(user);
      try {
        const userDocRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userDocRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          setUserXp(data.stats?.points || 2575);
        }
      } catch (err) {
        console.warn("Firestore sync fallback");
      }
    });
    return () => unsubAuth();
  }, []);

  // --- 2. MULTIPLAYER ROOM MATCHMAKING ---
  const initializeMatchmakingRoom = async () => {
    if (!currentUser) return;
    setGameState("lobby");
    isGameOverProcessed.current = false; 
    shouldSyncStorage.current = true;
    
    try {
      const roomsRef = ref(database, "rooms");
      const snapshot = await new Promise<any>((resolve) => onValue(roomsRef, (snap) => resolve(snap.val()), { onlyOnce: true }));

      let targetRoomKey: string | null = null;
      if (snapshot) {
        for (const [key, val] of Object.entries(snapshot as Record<string, any>)) {
          if (val.status === "lobby" && val.players && Object.keys(val.players).length < 5) {
            targetRoomKey = key;
            break;
          }
        }
      }

      const myProfile: KingdomPlayer = {
        id: currentUser.uid, name: currentUser.displayName || "Operative", xp: userXp,
        isBot: false, x: 20, y: 70, status: "idle", losses: 0, wins: 0, shieldTimer: 0, defenseStance: "WAF"
      };

      if (targetRoomKey) {
        setRoomId(targetRoomKey);
        const roomData = snapshot[targetRoomKey];
        const playersInRoom = Object.values(roomData.players) as KingdomPlayer[];
        const botToReplace = [...playersInRoom].reverse().find(p => p.isBot);

        const updates: any = {};
        updates[`rooms/${targetRoomKey}/players/${currentUser.uid}`] = myProfile;
        
        if (botToReplace) {
          updates[`rooms/${targetRoomKey}/players/${botToReplace.id}`] = null;
          myProfile.x = botToReplace.x; 
          myProfile.y = botToReplace.y;
        }
        await update(ref(database), updates);

      } else {
        const newRoomRef = push(ref(database, "rooms"));
        const newKey = newRoomRef.key!;
        setRoomId(newKey);
        
        const initialPlayersMap: Record<string, KingdomPlayer> = { [currentUser.uid]: myProfile };
        INITIAL_BOTS.forEach((bot) => initialPlayersMap[bot.id] = bot);

        const now = Date.now();
        await set(newRoomRef, {
          status: "lobby",
          lobbyEndTime: now + 60000, 
          matchEndTime: now + 60000 + 420000, 
          players: initialPlayersMap,
          createdAt: now
        });
      }
    } catch (err) {
      console.error("Matchmaking room error:", err);
    }
  };

  // --- GRACEFUL DISCONNECTION ENGINE ---
  useEffect(() => {
    if (!roomId || !currentUser) return;
    const myPlayerRef = ref(database, `rooms/${roomId}/players/${currentUser.uid}`);
    onDisconnect(myPlayerRef).update({ status: "disconnected" });
    return () => { onDisconnect(myPlayerRef).cancel(); };
  }, [roomId, currentUser]);

  // --- 3. MASTER FIREBASE LISTENER ---
  useEffect(() => {
    if (!roomId || gameState === "instructions") return;
    const roomRef = ref(database, `rooms/${roomId}`);
    
    const unsubscribe = onValue(roomRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;

      if (data.status && data.status !== gameState) setGameState(data.status);
      if (data.lobbyEndTime) setLobbyEndTime(data.lobbyEndTime);
      if (data.matchEndTime) setMatchEndTime(data.matchEndTime);
      if (data.players) setPlayers(Object.values(data.players) as KingdomPlayer[]);
      setRaids(data.raids ? (Object.values(data.raids) as ActiveRaid[]) : []);
    });

    return () => unsubscribe();
  }, [roomId, gameState]);

  // --- 4. LOCAL VISUAL TICKER ---
  useEffect(() => {
    const ticker = setInterval(() => {
      const now = Date.now();

      if (gameState === "lobby" && lobbyEndTime) {
        const lTime = Math.max(0, Math.floor((lobbyEndTime - now) / 1000));
        setLobbyTimer(lTime);
        if (lTime <= 0 && isHost) update(ref(database, `rooms/${roomId}`), { status: "playing" });
      }

      if (gameState === "playing" && matchEndTime) {
        const mTime = Math.max(0, Math.floor((matchEndTime - now) / 1000));
        setMatchTimer(mTime);
        
        if (mTime <= 0 && isHost) update(ref(database, `rooms/${roomId}`), { status: "gameover" });
        if (420 - mTime >= 300) setExitUnlocked(true); 
      }
    }, 1000);

    return () => clearInterval(ticker);
  }, [gameState, lobbyEndTime, matchEndTime, isHost, roomId]);

  // --- 5. HOST AUTOBOT ENGINE (Fixed Real-Time Bug) ---
  useEffect(() => {
    if (gameState !== "playing" || !isHost || !roomId) return;

    const botInterval = setInterval(async () => {
      const currentPlayers = playersRef.current; // Grab the un-interrupted array

      const updates: any = {};
      currentPlayers.forEach(p => {
        if (p.shieldTimer > 0) updates[`rooms/${roomId}/players/${p.id}/shieldTimer`] = p.shieldTimer - 1;
      });
      if (Object.keys(updates).length > 0) await update(ref(database), updates);

      if (Math.random() < 0.20) {
        const bots = currentPlayers.filter(p => p.isBot && p.shieldTimer === 0 && p.status !== "disconnected");
        if (bots.length > 0) {
          const randomBot = bots[Math.floor(Math.random() * bots.length)];
          const validTargets = currentPlayers.filter(p => p.id !== randomBot.id && p.shieldTimer === 0 && p.status !== "disconnected");
          
          if (validTargets.length > 0) {
            let target = validTargets[Math.floor(Math.random() * validTargets.length)];
            const humans = validTargets.filter(p => !p.isBot);
            
            if (humans.length > 0 && Math.random() < 0.60) {
              target = humans[Math.floor(Math.random() * humans.length)];
            }

            const payloads: ("SQL Injection" | "DDoS Flood" | "Phishing Link")[] = ["SQL Injection", "DDoS Flood", "Phishing Link"];
            const isFarAway = target.id === "p4" || target.id === "p5" || randomBot.id === "p4" || randomBot.id === "p5";
            const tTime = isFarAway ? 5 : 3;

            const uniqueId = `bot_raid_${Date.now()}_${randomBot.id}_${Math.random().toString(36).substring(2, 7)}`;

            const raidRef = push(ref(database, `rooms/${roomId}/raids`));
            await set(raidRef, {
              id: uniqueId, firebaseKey: raidRef.key,
              slot: 1, attackerId: randomBot.id, attackerName: randomBot.name,
              targetId: target.id, targetName: target.name,
              sourceX: randomBot.x, sourceY: randomBot.y, targetX: target.x, targetY: target.y,
              type: "attack", payload: payloads[Math.floor(Math.random() * payloads.length)],
              phase: "outbound", timer: tTime, maxTimer: tTime,
              combatSummary: "Incoming Bot Blitz!"
            });
          }
        }
      }
    }, 1000);

    // Removed `players` from this array so React stops deleting the interval
    return () => clearInterval(botInterval);
  }, [gameState, isHost, roomId]); 

  // --- 6. BROADCASTING ATTACKS & SCOUTS ---
  const launchActionWithPayload = async (type: "attack" | "scout", payloadStr?: "SQL Injection" | "DDoS Flood" | "Phishing Link") => {
    if (!selectedTarget || !roomId || !currentUser) return;
    const me = players.find(p => p.id === currentUser.uid);
    if (!me) return;

    if (type === "attack" && me.shieldTimer > 0) {
      showCenterMessage("Emergency Shield active! You cannot attack while shielded.");
      return;
    }
    if (type === "attack" && selectedTarget.shieldTimer > 0) {
      showCenterMessage("Target is protected by an Emergency Shield! Cannot attack.");
      setSelectedTarget(null);
      setSelectedPayload(null);
      return;
    }

    const myRaids = raids.filter(r => r.attackerId === currentUser.uid);
    if (myRaids.some(r => r.slot === 1) && myRaids.some(r => r.slot === 2)) {
      showCenterMessage("Both Raid Capacitors are busy! All slots occupied.");
      setSelectedTarget(null);
      setSelectedPayload(null);
      return;
    }

    const assignedSlot = !myRaids.some(r => r.slot === 1) ? 1 : 2;
    const isFarAway = selectedTarget.id === "p4" || selectedTarget.id === "p5" || me.id === "p4" || me.id === "p5";
    const travelTime = isFarAway ? 5 : 3;

    const uniqueId = `raid_${Date.now()}_${currentUser.uid}_${Math.random().toString(36).substring(2, 7)}`;

    const raidRef = push(ref(database, `rooms/${roomId}/raids`));
    await set(raidRef, {
      id: uniqueId, firebaseKey: raidRef.key,
      slot: assignedSlot, attackerId: currentUser.uid, attackerName: me.name,
      targetId: selectedTarget.id, targetName: selectedTarget.name,
      sourceX: me.x, sourceY: me.y, targetX: selectedTarget.x, targetY: selectedTarget.y,
      type: type, payload: payloadStr || null, phase: "outbound",
      timer: travelTime, maxTimer: travelTime,
      combatSummary: type === "scout" ? "Scouting stance..." : `Deploying ${payloadStr}...`
    });

    setHistoryLogs(prev => [`[LAUNCH] ${type.toUpperCase()} deployed to ${selectedTarget.name}`, ...prev].slice(0, 50));
    setSelectedTarget(null);
    setSelectedPayload(null);
  };

  // --- 7. CYBER MATRIX COMBAT ENGINE (Fixed Real-Time Bug) ---
  useEffect(() => {
    if (gameState !== "playing" || !roomId || !currentUser) return;

    const raidInterval = setInterval(async () => {
      const currentRaids = raidsRef.current; // Un-interrupted array
      const currentPlayers = playersRef.current;

      if (currentRaids.length === 0) return;

      for (const raid of currentRaids) {
        const attacker = currentPlayers.find(p => p.id === raid.attackerId);
        const isMyRaid = raid.attackerId === currentUser.uid;
        const isBotRaid = attacker?.isBot;
        const isGhostRaid = !attacker || attacker.status === "disconnected";

        if (!isMyRaid && !(isHost && (isBotRaid || isGhostRaid))) continue;

        const nextTimer = raid.timer - 1;
        const raidKeyRef = ref(database, `rooms/${roomId}/raids/${raid.firebaseKey || raid.id}`);

        if (nextTimer > 0) {
          await update(raidKeyRef, { timer: nextTimer });
        } else {
          if (raid.phase === "outbound") {
            if (raid.type === "scout") {
              const target = currentPlayers.find(p => p.id === raid.targetId);
              await update(raidKeyRef, { phase: "return", timer: 3, maxTimer: 3, combatSummary: `Scouted Stance: ${target?.defenseStance || "Unknown"}` });
              if (isMyRaid) setHistoryLogs(prev => [`[SCOUT] Target: ${raid.targetName} | Stance: ${target?.defenseStance || "Unknown"}`, ...prev].slice(0, 50));
            } else {
              const target = currentPlayers.find(p => p.id === raid.targetId);
              await update(raidKeyRef, { 
                phase: "combat", timer: 4, maxTimer: 4, 
                combatSummary: "Evaluating Payload vs Stance...",
                combatSnapshot: { attXp: attacker?.xp || 0, defXp: target?.xp || 0 }
              }); 
            }
          } 
          else if (raid.phase === "combat") {
            const enemy = currentPlayers.find(p => p.id === raid.targetId);

            if (!attacker || !enemy) { await remove(raidKeyRef); continue; }

            let strategyWin = false;
            let matrixLog = "Neutral Clash. XP Tie-Breaker.";
            if (raid.payload === "SQL Injection" && enemy.defenseStance === "WAF") { strategyWin = false; matrixLog = "WAF blocked SQLi."; }
            else if (raid.payload === "SQL Injection" && enemy.defenseStance === "Zero-Trust") { strategyWin = true; matrixLog = "SQLi bypassed Zero-Trust."; }
            else if (raid.payload === "DDoS Flood" && enemy.defenseStance === "Load Balancer") { strategyWin = false; matrixLog = "LB absorbed DDoS."; }
            else if (raid.payload === "DDoS Flood" && enemy.defenseStance === "WAF") { strategyWin = true; matrixLog = "DDoS overwhelmed WAF."; }
            else if (raid.payload === "Phishing Link" && enemy.defenseStance === "Zero-Trust") { strategyWin = false; matrixLog = "Zero-Trust caught Phishing."; }
            else if (raid.payload === "Phishing Link" && enemy.defenseStance === "Load Balancer") { strategyWin = true; matrixLog = "Phishing bypassed LB."; }
            else {
              const diff = Math.floor(Math.random() * 200);
              strategyWin = (attacker.xp - diff) >= (enemy.xp - (diff * 1.5));
            }

            const isEmpHit = strategyWin && Math.random() > 0.95; 
            const enemyRef = ref(database, `rooms/${roomId}/players/${enemy.id}`);
            const attackerRef = ref(database, `rooms/${roomId}/players/${attacker.id}`);
            
            let enemyLosses = enemy.losses + (strategyWin ? 1 : 0);
            let attWins = attacker.wins + (strategyWin ? 1 : 0);
            let enemyShield = enemy.shieldTimer || 0;

            if (strategyWin && enemyLosses > 0 && enemyLosses % 4 === 0) enemyShield = 60;
            if (isEmpHit) enemyShield = 0; 

            await update(enemyRef, { losses: enemyLosses, shieldTimer: enemyShield });
            await update(attackerRef, { wins: attWins });

            if (raid.attackerId === currentUser.uid || raid.targetId === currentUser.uid) {
              const userWon = raid.attackerId === currentUser.uid ? strategyWin : !strategyWin;
              const actionText = raid.attackerId === currentUser.uid ? `Raid on ${enemy.name}` : `Defended raid from ${attacker.name}`;
              setHistoryLogs(prev => [
                `[COMBAT] ${actionText}. ${userWon ? 'VICTORY (+30XP)' : 'DEFEAT (-35XP)'} | ${matrixLog}`, 
                ...(isEmpHit ? [`[CRITICAL] EMP Blast destroyed ${enemy.name}'s systems!`] : []),
                ...prev
              ].slice(0, 50));
            }

            await update(raidKeyRef, {
              phase: "return", timer: 3, maxTimer: 3,
              winner: strategyWin ? attacker.name : enemy.name,
              combatSummary: strategyWin ? "Victory: Exploited vulnerability" : "Defeat: Defenses held firm"
            });
          } 
          else if (raid.phase === "return") {
            await remove(raidKeyRef);
          }
        }
      }
    }, 1000);

    // Removed `raids` and `players` to prevent React from resetting the interval
    return () => clearInterval(raidInterval);
  }, [gameState, roomId, currentUser, isHost]);

  // --- 8. GAME OVER SETTLEMENT ---
  useEffect(() => {
    if (gameState === "gameover" && !isGameOverProcessed.current && currentUser) {
      isGameOverProcessed.current = true;
      
      const userMe = players.find(p => p.id === currentUser.uid);
      if (!userMe || userMe.status === "disconnected") return;

      const netXpChange = (userMe.wins * 30) - (userMe.losses * 35);
      const finalNewXp = Math.max(0, userXp + netXpChange);

      setUserXp(finalNewXp);
      updateDoc(doc(db, "users", currentUser.uid), { "stats.points": finalNewXp }).catch(() => {});
    }
  }, [gameState, currentUser, players, userXp]);

  const cleanExitAndRestart = () => {
    shouldSyncStorage.current = false; 
    localStorage.removeItem("siege_gameState");
    localStorage.removeItem("siege_roomId");
    localStorage.removeItem("siege_exitUnlocked");
    
    setRoomId(null);
    setGameState("instructions");
    setRaids([]);
    setPlayers([]);
    setHistoryLogs([]);
    isGameOverProcessed.current = false;
  };

  const userMe = players.find(p => p.id === currentUser?.uid);
  const netXpChange = userMe ? (userMe.wins * 30) - (userMe.losses * 35) : 0;

  return (
    <div className="h-screen bg-black text-white flex flex-col relative overflow-hidden font-mono">
      <style jsx global>{`
        .gamezone-dark-grid {
          background-color: #090d16;
          background-image: 
            linear-gradient(to right, rgba(245, 158, 11, 0.09) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(239, 68, 68, 0.05) 1px, transparent 1px);
          background-size: 32px 32px;
        }
        @keyframes mapPan {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animated-kingdom-map {
          background-image: url('/map2.jpeg');
          background-size: cover;
          background-repeat: no-repeat;
          animation: mapPan 40s ease-in-out infinite;
        }
      `}</style>

      <div className="p-4 border-b border-zinc-800 bg-zinc-950 flex justify-between items-center z-20 shrink-0">
        <div className="flex items-center gap-4">
          {gameState !== "playing" && (
            <Button variant="outline" size="sm" asChild className="border-zinc-800 bg-zinc-900 text-zinc-300 h-8 text-xs">
              <Link href="/learn/"><ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Labs</Link>
            </Button>
          )}
          <h1 className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-red-500">
            Cyber Dominion: Siege Arena
          </h1>
        </div>
        {gameState === "playing" && (
          <div className="flex items-center gap-4 text-xs font-bold bg-black px-4 py-2 rounded-lg border border-zinc-800">
            <span className="text-amber-400"><Zap className="w-3 h-3 inline" /> {userXp} XP</span>
            <span className="text-zinc-600">|</span>
            <span className="text-red-400"><Clock className="w-3 h-3 inline" /> {Math.floor(matchTimer / 60)}:{String(matchTimer % 60).padStart(2, "0")}</span>
            <span className="text-zinc-600">|</span>
            <Button 
              disabled={!exitUnlocked}
              onClick={() => { update(ref(database, `rooms/${roomId}`), { status: "gameover" }); }}
              size="sm"
              className={`h-6 text-[10px] ${exitUnlocked ? "bg-red-600 hover:bg-red-500 text-white cursor-pointer" : "bg-zinc-800 text-zinc-500 cursor-not-allowed"}`}
            >
              {exitUnlocked ? "Retreat" : "Locked (5m)"}
            </Button>
          </div>
        )}
      </div>

      {gameState === "instructions" && (
        <div className="flex-1 flex gamezone-dark-grid items-center justify-center p-6 overflow-y-auto">
          <div className="flex flex-col lg:flex-row gap-6 max-w-6xl w-full">
            <div className="flex-1 p-8 bg-zinc-950/95 border border-amber-500/40 rounded-2xl shadow-2xl flex flex-col justify-between">
              <div>
                <Trophy className="w-12 h-12 text-amber-500 mb-4" />
                <h2 className="text-3xl font-black uppercase tracking-wider mb-2">Operation: Siege</h2>
                <p className="text-sm text-zinc-400 mb-6">Command your department in live multiplayer rooms. Drop malware, defend your hub, and extract enemy XP.</p>
                <ul className="text-sm text-zinc-300 space-y-4 mb-8">
                  <li className="flex items-start"><Users className="w-5 h-5 text-amber-400 mr-2 shrink-0"/> Matchmaking groups 5 live players. Missing slots are filled by Autobots.</li>
                  <li className="flex items-start"><Shield className="w-5 h-5 text-amber-400 mr-2 shrink-0"/> 4 consecutive defeats triggers a 60s Emergency Shield.</li>
                  <li className="flex items-start"><LogOut className="w-5 h-5 text-red-500 mr-2 shrink-0"/> <strong>DO NOT NAVIGATE AWAY.</strong> If you leave the page during a match, your city will be abandoned and you forfeit all XP gains.</li>
                  <li className="flex items-start"><Zap className="w-5 h-5 text-amber-400 mr-2 shrink-0"/> Wins grant +30 XP. Defeats cost -35 XP.</li>
                </ul>
              </div>
              <Button onClick={initializeMatchmakingRoom} className="w-full bg-amber-600 hover:bg-amber-500 text-black font-extrabold py-6 text-lg uppercase tracking-widest shadow-[0_0_15px_rgba(245,158,11,0.4)]">
                Enter the Arena
              </Button>
            </div>
            <div className="flex-1 p-8 bg-zinc-900/90 border border-zinc-800 rounded-2xl shadow-xl flex flex-col justify-center">
              <h3 className="text-xl font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center"><Brain className="w-6 h-6 mr-2"/> Cyber Matrix Field Guide</h3>
              <p className="text-xs text-zinc-400 mb-6">Scout your enemies to determine their active defense stance. Select the correct payload to breach them.</p>
              <div className="space-y-4">
                <div className="bg-black/60 p-4 rounded-xl border-l-4 border-red-500">
                  <h4 className="font-bold text-white mb-1">🔥 SQL Injection</h4>
                  <p className="text-xs text-zinc-300">Bypasses <span className="text-cyan-400">Zero-Trust</span>, but gets blocked by a <span className="text-amber-400">WAF</span>.</p>
                </div>
                <div className="bg-black/60 p-4 rounded-xl border-l-4 border-blue-500">
                  <h4 className="font-bold text-white mb-1">⚡ DDoS Flood</h4>
                  <p className="text-xs text-zinc-300">Overwhelms a <span className="text-amber-400">WAF</span>, but gets absorbed by a <span className="text-cyan-400">Load Balancer</span>.</p>
                </div>
                <div className="bg-black/60 p-4 rounded-xl border-l-4 border-green-500">
                  <h4 className="font-bold text-white mb-1">🎣 Phishing Link</h4>
                  <p className="text-xs text-zinc-300">Bypasses a <span className="text-cyan-400">Load Balancer</span>, but gets caught by <span className="text-amber-400">Zero-Trust</span> policies.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STATE 1: LOBBY */}
      {gameState === "lobby" && (
        <div className="flex-1 flex gamezone-dark-grid items-center justify-center p-6">
          <div className="max-w-md w-full p-8 bg-zinc-950/90 border border-amber-500/30 rounded-2xl text-center shadow-2xl backdrop-blur-md">
            <Users className="w-12 h-12 text-amber-500 mx-auto mb-4 animate-pulse" />
            <h2 className="text-xl font-bold mb-2">Staging War Room</h2>
            <div className="text-4xl font-mono text-amber-400 py-4">00:{String(lobbyTimer).padStart(2, "0")}</div>
            <p className="text-xs text-zinc-400 mb-6">Matchroom Connected Players: <strong className="text-cyan-400">{players.filter(p=>!p.isBot && p.status !== "disconnected").length} / 5</strong></p>
            
            {/* NEW: Force Start Button for the Host */}
            {isHost ? (
              <Button 
                onClick={() => update(ref(database, `rooms/${roomId}`), { status: "playing" })} 
                className="w-full bg-red-950 hover:bg-red-900 text-red-100 font-bold border border-red-800 transition-colors"
              >
                <Play className="w-4 h-4 mr-2 fill-current" /> Deploy Immediately (Fill with Bots)
              </Button>
            ) : (
              <div className="py-2 border border-zinc-800 rounded bg-black/50">
                <p className="text-[10px] text-zinc-500 animate-pulse">Waiting for Squad Leader to deploy...</p>
              </div>
            )}
          </div>
        </div>
      )}

      {gameState === "playing" && (
        <div className="flex-1 flex overflow-hidden relative">
          {centerMessage && (
            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 bg-red-600 text-white px-6 py-3 rounded-xl shadow-2xl font-bold text-xs animate-bounce border border-red-400">
              {centerMessage}
            </div>
          )}

          <div className="w-80 bg-zinc-950 border-r border-zinc-800 p-4 flex flex-col space-y-4 shrink-0 z-20">
            <div className="p-3 bg-amber-950/20 border border-amber-500/30 rounded-xl space-y-2">
              <h3 className="font-bold text-sm text-white">{currentUser?.displayName || "Operative"}</h3>
              <p className="text-xs text-amber-400">Power: {userXp} XP</p>
              
              <div className="pt-2 border-t border-zinc-900">
                <span className="text-[10px] text-zinc-400 block mb-1">Defense Stance:</span>
                <select 
                  value={userMe?.defenseStance || "WAF"}
                  onChange={async (e) => {
                    const val = e.target.value as any;
                    if (roomId && currentUser) {
                      await update(ref(database, `rooms/${roomId}/players/${currentUser.uid}`), { defenseStance: val });
                    }
                  }}
                  className="w-full bg-black border border-zinc-700 text-xs text-amber-300 rounded p-1 font-mono focus:outline-none"
                >
                  <option value="WAF">WAF (Blocks SQLi)</option>
                  <option value="Load Balancer">Load Balancer (Blocks DDoS)</option>
                  <option value="Zero-Trust">Zero-Trust (Blocks Phishing)</option>
                </select>
              </div>

              {userMe?.shieldTimer ? (userMe.shieldTimer > 0 && <Badge className="bg-cyan-600 text-black text-[10px] mt-1 animate-pulse">Shield Active: {userMe.shieldTimer}s</Badge>) : null}
            </div>

            <div className="flex gap-2">
              {[1, 2].map(slotNum => {
                const raid = raids.find(r => r.slot === slotNum && r.attackerId === currentUser?.uid);
                return (
                  <div key={slotNum} className={`flex-1 p-2 rounded border text-center text-[10px] font-bold ${raid ? "bg-red-950/40 border-red-800 text-red-400" : "bg-zinc-900 border-zinc-800 text-zinc-500"}`}>
                    SLOT {slotNum}: {raid ? "BUSY" : "READY"}
                  </div>
                );
              })}
            </div>

            <div className="flex-1 flex flex-col min-h-0 border-t border-zinc-900 pt-4">
              <span className="text-[10px] text-amber-400 uppercase flex items-center gap-1 mb-2">
                <History className="w-3 h-3" /> Tactical Intel & History
              </span>
              <div className="flex-1 bg-black/80 p-3 rounded-xl border border-zinc-800 overflow-y-auto space-y-1.5 text-[10px]">
                {historyLogs.map((log, idx) => (
                  <div key={idx} className={`border-b border-zinc-900 pb-1 ${log.includes('VICTORY') ? 'text-green-400' : log.includes('SCOUT') ? 'text-orange-400' : log.includes('DEFEAT') ? 'text-red-400' : 'text-zinc-300'}`}>
                    {log}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex-1 relative overflow-hidden animated-kingdom-map">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] pointer-events-none"></div>

            <div className="absolute top-4 right-4 w-80 z-30 space-y-2 pointer-events-none">
              {raids.filter(r => r.attackerId === currentUser?.uid || r.targetId === currentUser?.uid).map(r => {
                const isIncoming = r.targetId === currentUser?.uid;
                return (
                  <div key={r.id} className={`bg-zinc-950/95 border ${isIncoming ? 'border-red-600' : 'border-amber-500/50'} p-2.5 rounded-lg shadow-xl text-[10px] space-y-1`}>
                    <div className="flex justify-between items-center">
                      <strong className={r.type === 'attack' ? 'text-red-400' : 'text-green-400'}>
                        {isIncoming ? 'INCOMING RAID' : r.type.toUpperCase()}: {isIncoming ? r.attackerName : r.targetName}
                      </strong>
                      <span className="text-zinc-400 font-bold">
                        {r.phase === 'outbound' && `Reaching in ${r.timer}s`}
                        {r.phase === 'combat' && <span className="text-amber-400 animate-pulse">Engaged</span>}
                        {r.phase === 'return' && `Returning (${r.timer}s)`}
                      </span>
                    </div>
                    {r.combatSummary && (
                      <div className="bg-black p-1.5 rounded border border-zinc-800 text-[9px] text-amber-300 font-mono">
                        {r.combatSummary}
                      </div>
                    )}
                    {r.phase === 'combat' && r.combatSnapshot && (
                      <div className="bg-black border border-zinc-800 rounded p-1.5 mt-1 flex justify-between items-center font-bold">
                        <span className={isIncoming ? "text-amber-400" : "text-cyan-400"}>{isIncoming ? r.combatSnapshot.defXp : r.combatSnapshot.attXp} XP</span>
                        <span className="text-[8px] text-zinc-500 animate-ping">VS</span>
                        <span className={isIncoming ? "text-cyan-400" : "text-amber-400"}>{isIncoming ? r.combatSnapshot.attXp : r.combatSnapshot.defXp} XP</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
              <defs>
                <marker id="arrow-attack" markerWidth="16" markerHeight="12" refX="8" refY="6" orient="auto">
                  <path d="M 2 2 L 6 6 L 2 10 M 8 2 L 12 6 L 8 10" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </marker>
                <marker id="arrow-scout" markerWidth="16" markerHeight="12" refX="8" refY="6" orient="auto">
                  <path d="M 2 2 L 6 6 L 2 10 M 8 2 L 12 6 L 8 10" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </marker>
              </defs>
              {raids.map(r => {
                const color = r.type === "attack" ? "#ef4444" : "#f97316"; 
                const markerId = r.type === "attack" ? "arrow-attack" : "arrow-scout";
                const isMyRaid = r.attackerId === currentUser?.uid;
                
                let progress = 0;
                if (r.phase === "outbound") progress = (r.maxTimer - r.timer) / r.maxTimer;
                if (r.phase === "combat") progress = 1;
                if (r.phase === "return") progress = r.timer / r.maxTimer; 

                const dotX = r.sourceX + (r.targetX - r.sourceX) * progress;
                const dotY = r.sourceY + (r.targetY - r.sourceY) * progress;

                const isOutbound = r.phase === "outbound" || r.phase === "combat";
                const startX = isOutbound ? r.sourceX : r.targetX;
                const startY = isOutbound ? r.sourceY : r.targetY;
                const midX = (r.sourceX + r.targetX) / 2;
                const midY = (r.sourceY + r.targetY) / 2;

                return (
                  <g key={r.id}>
                    <line 
                      x1={`${r.sourceX}%`} y1={`${r.sourceY}%`} 
                      x2={`${r.targetX}%`} y2={`${r.targetY}%`} 
                      stroke={color} 
                      strokeWidth={isMyRaid ? "2.5" : "1.5"} 
                      strokeDasharray={isMyRaid ? "none" : "4 4"} 
                      opacity={isMyRaid ? "0.9" : "0.4"} 
                    />
                    <line 
                      x1={`${startX}%`} y1={`${startY}%`} 
                      x2={`${midX}%`} y2={`${midY}%`} 
                      stroke="rgba(255,255,255,0.01)" 
                      strokeWidth="2"
                      markerEnd={`url(#${markerId})`}
                    />
                    <foreignObject x={`${dotX}%`} y={`${dotY}%`} width="24" height="24" style={{ transform: 'translate(-12px, -12px)' }}>
                      <div className={`w-full h-full rounded-full flex items-center justify-center bg-black border ${r.type === "attack" ? "border-red-500 shadow-[0_0_10px_red]" : "border-orange-500 shadow-[0_0_10px_orange]"}`}>
                        {r.type === "attack" ? <Bug className="w-3 h-3 text-red-500" /> : <Eye className="w-3 h-3 text-orange-500" />}
                      </div>
                    </foreignObject>
                  </g>
                );
              })}
            </svg>

            {players.map((p) => {
              const isSelf = p.id === currentUser?.uid;
              const isDisconnected = p.status === "disconnected";
              
              return (
                <div 
                  key={p.id}
                  className={`absolute z-20 flex flex-col items-center group -translate-x-1/2 -translate-y-1/2 ${isDisconnected ? 'opacity-40 grayscale' : 'cursor-pointer'}`}
                  style={{ left: `${p.x}%`, top: `${p.y}%` }}
                  onClick={() => { if (!isDisconnected) setSelectedTarget(p); }}
                >
                  <div className={`w-16 h-20 rounded-t-lg flex flex-col items-center justify-end pb-2 relative transition-transform ${!isDisconnected && 'hover:-translate-y-2'}
                    ${isSelf ? 'bg-amber-900 border-t-2 border-amber-400 shadow-[0_15px_0_0_#451a03,0_20px_20px_rgba(245,158,11,0.4)]' 
                             : 'bg-zinc-800 border-t-2 border-red-500 shadow-[0_15px_0_0_#27272a,0_20px_20px_rgba(239,68,68,0.3)]'}
                  `}>
                    {p.shieldTimer > 0 && <div className="absolute -top-4 w-20 h-24 rounded-t-full border-2 border-cyan-500 bg-cyan-500/10 pointer-events-none" />}
                    {isSelf ? <Shield className="w-6 h-6 text-amber-400 z-10" /> : <Server className="w-6 h-6 text-red-400 z-10" />}
                  </div>

                  <div className="mt-6 bg-black/90 px-2 py-1 rounded border border-zinc-800 text-center z-20 shadow-lg">
                    <span className="text-[10px] font-bold text-white block">{isDisconnected ? "Abandoned" : p.name}</span>
                  </div>
                </div>
              );
            })}

            {selectedTarget && selectedTarget.id !== currentUser?.uid && (
              <div 
                className="absolute z-40 bg-zinc-950 border border-amber-500/50 p-3 rounded-lg shadow-2xl w-56"
                style={{ 
                  left: `calc(${selectedTarget.x}% - 96px)`, 
                  top: selectedTarget.y > 60 ? `calc(${selectedTarget.y}% - 170px)` : `calc(${selectedTarget.y}% + 40px)` 
                }}
              >
                <div className="text-xs font-bold text-white mb-2">{selectedTarget.name}</div>
                
                {!selectedPayload ? (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => launchActionWithPayload("scout")} className="flex-1 h-7 text-[10px] bg-zinc-800 hover:bg-zinc-700 text-green-400">
                      <Eye className="w-3 h-3 mr-1" /> Scout
                    </Button>
                    <Button size="sm" onClick={() => setSelectedPayload("SQL Injection")} className="flex-1 h-7 text-[10px] bg-red-900 hover:bg-red-800 text-white">
                      <Bug className="w-3 h-3 mr-1" /> Attack
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-zinc-400 block">Select Attack Payload:</span>
                    <button onClick={() => launchActionWithPayload("attack", "SQL Injection")} className="w-full text-left text-[10px] bg-red-950 hover:bg-red-900 text-red-300 p-1 rounded border border-red-800">
                      🔥 SQL Injection
                    </button>
                    <button onClick={() => launchActionWithPayload("attack", "DDoS Flood")} className="w-full text-left text-[10px] bg-red-950 hover:bg-red-900 text-red-300 p-1 rounded border border-red-800">
                      ⚡ DDoS Flood
                    </button>
                    <button onClick={() => launchActionWithPayload("attack", "Phishing Link")} className="w-full text-left text-[10px] bg-red-950 hover:bg-red-900 text-red-300 p-1 rounded border border-red-800">
                      🎣 Phishing Link
                    </button>
                  </div>
                )}

                <button onClick={() => { setSelectedTarget(null); setSelectedPayload(null); }} className="absolute -top-2 -right-2 bg-black border border-zinc-700 rounded-full p-0.5 text-zinc-400 hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* STATE 5: GAME OVER */}
      {gameState === "gameover" && (
        <div className="flex-1 flex gamezone-dark-grid items-center justify-center p-6 overflow-y-auto">
          <div className="max-w-md w-full p-8 bg-zinc-950/90 border border-zinc-800 rounded-2xl text-center shadow-2xl backdrop-blur-md">
            <Trophy className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Siege Concluded</h2>
            <div className="bg-zinc-900/90 p-4 rounded-xl space-y-2 text-xs font-mono mb-6 border border-zinc-800">
              <div className="flex justify-between text-green-400"><span>Wins: {userMe?.wins || 0}</span><span>+{(userMe?.wins || 0) * 30} XP</span></div>
              <div className="flex justify-between text-red-400"><span>Losses: {userMe?.losses || 0}</span><span>-{(userMe?.losses || 0) * 35} XP</span></div>
              <div className="border-t border-zinc-800 pt-2 flex justify-between font-bold">
                <span className="text-white">Net Dashboard XP Adjustment:</span>
                <span className={netXpChange >= 0 ? "text-green-400" : "text-red-400"}>{netXpChange >= 0 ? `+${netXpChange}` : netXpChange} XP</span>
              </div>
            </div>
            <Button onClick={cleanExitAndRestart} className="w-full bg-amber-600 hover:bg-amber-500 text-black font-bold">
              Return to War Room / Play Again
            </Button>
          </div>
        </div>  
      )}
    </div>
  );
}