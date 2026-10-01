import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  DownloadCloud, RefreshCw, CheckCircle2, AlertCircle, ShieldCheck,
  Server, History, RotateCcw, FileCode, Sparkles, Cpu, Layers, Check,
  Radio, Play, Wifi, WifiOff, Terminal, Lock, Database, Globe, Zap,
  Info, ChevronDown, ChevronUp, Activity, Clock, HardDrive, Shield,
  Code, Network,
} from "lucide-react";
import { AppSettings, AppUpdateInfo, AppUpdateHistoryEntry, AppUpdateState } from "../types";
import { AppUpdateService, CURRENT_APP_VERSION } from "../utils/appUpdateService";

interface AppUpdateServerPanelProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
}

type ServerLiveStatus = "idle" | "checking" | "online" | "offline" | "degraded";

interface ServerHealthData {
  status: string;
  app: string;
  version: string;
  apiVersion: string;
  capabilities: string[];
  timestamp: string;
}

const ENDPOINTS = [
  { method: "GET",  path: "/api/health",        auth: false, desc: "Status i wersja serwera — sprawdzenie zywotnosci procesu Node.js." },
  { method: "GET",  path: "/api/version",        auth: false, desc: "Szczegoly wersji: appVersion, apiVersion, schemaVersion i capabilities." },
  { method: "POST", path: "/api/auth/login",     auth: false, desc: "Logowanie: { username, password } -> token Bearer z TTL 8h." },
  { method: "POST", path: "/api/auth/logout",    auth: true,  desc: "Uniewaznienie biezacej sesji. Wymaga naglowka Authorization: Bearer <token>." },
  { method: "GET",  path: "/api/data",           auth: true,  desc: "Pobranie magazynu serwera: { schemaVersion, revision, updatedAt, contentHash, data }." },
  { method: "POST", path: "/api/data",           auth: true,  desc: "Atomowy zapis GymData z weryfikacja revision/contentHash. Zwraca 409 przy konflikcie." },
  { method: "GET",  path: "/api/sync/status",    auth: true,  desc: "Revision, hash, deviceId, online/offline — status synchronizacji." },
  { method: "POST", path: "/api/agent/analyze",  auth: true,  desc: "Lokalna analiza heurystyczna: tonaz, e1RM, regularnosc. Zero polaczen zewnetrznych." },
  { method: "GET",  path: "/api/update/check",   auth: false, desc: "Sprawdzenie aktualizacji z opcjonalnego manifestu GYMTRACKER_UPDATE_MANIFEST." },
  { method: "GET",  path: "/api/update/history", auth: false, desc: "Historia wydan z manifestu. Zwraca unavailable_not_configured bez pliku manifestu." },
];

const CAPABILITIES_INFO: Record<string, string> = {
  auth_session:           "Sesje Bearer z TTL i brute-force lockout (5 prob / 15 min)",
  gymdata_validation:     "Walidacja schematu GymData przy kazdym zapisie (schemaVersion 1)",
  sync_status:            "Sledzenie revision + contentHash dla bezpiecznej synchronizacji",
  heuristic_local_agent:  "Analityk lokalny: e1RM, tonaz, regularnosc — zero polaczen AI",
  update_metadata_only:   "Metadane wydan z zewnetrznego manifestu JSON — bez auto-instalatora",
};

function ServerStatusBadge({ status }: { status: ServerLiveStatus }) {
  if (status === "checking") {
    return (
      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-bold animate-pulse">
        <RefreshCw className="w-3 h-3 animate-spin" /> Sprawdzam...
      </span>
    );
  }
  if (status === "online") {
    return (
      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold">
        <Radio className="w-3 h-3 animate-pulse" /> ONLINE
      </span>
    );
  }
  if (status === "degraded") {
    return (
      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-bold">
        <AlertCircle className="w-3 h-3" /> DEGRADED
      </span>
    );
  }
  if (status === "offline") {
    return (
      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-300 text-[11px] font-bold">
        <WifiOff className="w-3 h-3" /> OFFLINE
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-700/50 border border-slate-700 text-slate-400 text-[11px] font-bold">
      <Wifi className="w-3 h-3" /> Nie sprawdzono
    </span>
  );
}

export const AppUpdateServerPanel: React.FC<AppUpdateServerPanelProps> = ({
  settings,
  onUpdateSettings,
}) => {
  const currentVersion = settings.installedAppVersion || CURRENT_APP_VERSION;
  const channel = settings.updateChannel || "stable";
  const serverUrl = settings.updateServerUrl || "http://127.0.0.1:3000";

  const [state, setState] = useState<AppUpdateState>({
    status: "idle",
    progressPct: 0,
    bytesDownloaded: 0,
    totalBytes: 0,
    availableUpdate: null,
    history: AppUpdateService.getUpdateHistory(),
  });
  const [notification, setNotification] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);
  const [liveStatus, setLiveStatus] = useState<ServerLiveStatus>("idle");
  const [healthData, setHealthData] = useState<ServerHealthData | null>(null);
  const [pingMs, setPingMs] = useState<number | null>(null);
  const [showEndpoints, setShowEndpoints] = useState(false);
  const [showCapabilities, setShowCapabilities] = useState(false);
  const [showEnvInfo, setShowEnvInfo] = useState(false);
  const [startingServer, setStartingServer] = useState(false);
  const [startLog, setStartLog] = useState<string[]>([]);
  const pingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const checkHealth = useCallback(async (url: string = serverUrl) => {
    const clean = url.trim().replace(/\/+$/, "");
    if (!clean) return "offline";
    setLiveStatus("checking");
    const t0 = Date.now();
    try {
      const res = await fetch(`${clean}/api/health`, {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(4000),
      });
      const ms = Date.now() - t0;
      setPingMs(ms);
      if (res.ok) {
        const data: ServerHealthData = await res.json();
        setHealthData(data);
        const st = data.status === "degraded" ? "degraded" : "online";
        setLiveStatus(st);
        return st;
      } else {
        setHealthData(null);
        setLiveStatus("offline");
        return "offline";
      }
    } catch {
      setHealthData(null);
      setLiveStatus("offline");
      setPingMs(null);
      return "offline";
    }
  }, [serverUrl]);

  useEffect(() => {
    checkHealth();
    pingIntervalRef.current = setInterval(() => checkHealth(), 10_000);
    return () => { if (pingIntervalRef.current) clearInterval(pingIntervalRef.current); };
  }, [checkHealth]);

  useEffect(() => {
    if (settings.autoCheckUpdates) { handleCheckForUpdates(true); }
  }, []);

  const handleCheckForUpdates = async (silent = false) => {
    setState(prev => ({ ...prev, status: "checking", errorMessage: undefined }));
    if (!silent) setNotification({ type: "info", text: "Laczenie z serwerem aktualizacji..." });
    try {
      const result = await AppUpdateService.checkForUpdates(serverUrl, channel, currentVersion);
      onUpdateSettings({ lastUpdateCheckAt: new Date().toLocaleTimeString() });
      if (result.updateAvailable && result.update) {
        setState(prev => ({ ...prev, status: "available", availableUpdate: result.update, lastCheckedAt: new Date().toLocaleTimeString() }));
        setNotification({ type: "success", text: `Znaleziono nowe wydanie: v${result.update!.version}!` });
      } else {
        setState(prev => ({ ...prev, status: "up_to_date", availableUpdate: null, lastCheckedAt: new Date().toLocaleTimeString() }));
        if (!silent) setNotification({ type: "info", text: result.message || "Twoja wersja GymTracker Pro jest aktualna." });
      }
    } catch (e: any) {
      setState(prev => ({ ...prev, status: "error", errorMessage: e.message || "Blad komunikacji z serwerem wydan" }));
      setNotification({ type: "error", text: "Nie udalo sie polaczyc z serwerem aktualizacji." });
    }
  };

  const handleStartUpdate = async () => {
    if (!state.availableUpdate) return;
    const update = state.availableUpdate;
    try {
      setState(prev => ({ ...prev, status: "downloading", progressPct: 0, bytesDownloaded: 0, totalBytes: update.fileSizeBytes }));
      await AppUpdateService.downloadUpdatePackage(update, prog => {
        setState(prev => ({ ...prev, progressPct: prog.progressPct, bytesDownloaded: prog.bytesDownloaded, totalBytes: prog.totalBytes, downloadSpeedMbps: prog.speedMbps }));
      });
      setState(prev => ({ ...prev, status: "verifying", progressPct: 100 }));
      const isVerified = await AppUpdateService.verifyChecksum(update);
      if (!isVerified) throw new Error("Suma kontrolna SHA-256 nie zgadza sie z sygnatura serwera.");
      setState(prev => ({ ...prev, status: "installing" }));
      const applyRes = await AppUpdateService.applyUpdate(update, serverUrl);
      if (applyRes.success) {
        onUpdateSettings({ installedAppVersion: update.version });
        setState(prev => ({ ...prev, status: "ready_to_install", history: AppUpdateService.getUpdateHistory() }));
        setNotification({ type: "success", text: `Aplikacja zaktualizowana do wersji ${update.version}!` });
      }
    } catch (err: any) {
      setState(prev => ({ ...prev, status: "error", errorMessage: err.message || "Blad procesu aktualizacji" }));
      setNotification({ type: "error", text: err.message || "Blad instalacji aktualizacji" });
    }
  };

  const handleRollback = async (targetVersion: string) => {
    if (!window.confirm(`Czy na pewno chcesz przywrocic wersje ${targetVersion}?`)) return;
    try {
      setNotification({ type: "info", text: `Przywracanie ${targetVersion}...` });
      const res = await AppUpdateService.rollbackVersion(targetVersion, serverUrl);
      if (res.success) {
        onUpdateSettings({ installedAppVersion: targetVersion });
        setState(prev => ({ ...prev, status: "idle", availableUpdate: null, history: AppUpdateService.getUpdateHistory() }));
        setNotification({ type: "success", text: res.message });
      }
    } catch {
      setNotification({ type: "error", text: "Blad podczas przywracania wersji" });
    }
  };

  const handleStartServer = async () => {
    setStartingServer(true);
    setStartLog([]);
    const addLog = (line: string) => setStartLog(prev => [...prev, line]);
    addLog("Sprawdzanie statusu serwera...");
    let currentStatus = await checkHealth();
    if (currentStatus === "online") {
      addLog("OK: Serwer juz dziala! Brak potrzeby uruchamiania.");
      setStartingServer(false);
      return;
    }
    addLog("Proba uruchomienia przez Electron API...");
    const api = (window as any).electronAPI;
    if (api?.startServer) {
      try {
        const result = await api.startServer();
        addLog(result?.message ? `OK: ${result.message}` : "OK: Polecenie wyslane do procesu glownego Electron.");
      } catch (e: any) {
        addLog(`ERR: Blad Electron API: ${e.message}`);
      }
    } else {
      addLog("WARN: Electron API niedostepne (tryb przegladarkowy).");
      addLog("Aby uruchomic serwer, uzyj: npm run dev");
      addLog("lub dwukliknij: start-server.bat");
    }
    addLog("Oczekiwanie na start serwera (max 12s)...");
    for (let i = 0; i < 6; i++) {
      await new Promise(r => setTimeout(r, 2000));
      currentStatus = await checkHealth();
      if (currentStatus === "online" || currentStatus === "degraded") {
        addLog("OK: Serwer odpowiada! Polaczono pomyslnie.");
        break;
      }
      addLog(`  ...proba ${i + 1}/6`);
    }
    setStartingServer(false);
  };

  const methodColor = (m: string) =>
    m === "GET"  ? "text-sky-400 bg-sky-500/10 border-sky-500/20" :
    m === "POST" ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" :
                  "text-amber-400 bg-amber-500/10 border-amber-500/20";

  return (
    <div className="space-y-5" id="server-update-panel">

      {/* ── SEKCJA 1: LIVE STATUS SERWERA ── */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 pt-5 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border transition-colors ${
              liveStatus === "online"   ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
              liveStatus === "degraded" ? "bg-amber-500/10 border-amber-500/20 text-amber-400" :
              liveStatus === "offline"  ? "bg-red-500/10 border-red-500/20 text-red-400" :
              "bg-slate-800 border-slate-700 text-slate-400"
            }`}>
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-bold text-slate-100">Serwer GymTracker Pro</h3>
                <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[11px] font-semibold">
                  v{healthData?.version ?? currentVersion}
                </span>
                <ServerStatusBadge status={liveStatus} />
                {pingMs !== null && liveStatus === "online" && (
                  <span className="text-[10px] text-slate-500 font-mono">{pingMs} ms</span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5 font-mono">{serverUrl}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <button
              type="button"
              onClick={() => checkHealth()}
              disabled={liveStatus === "checking"}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
              id="btn-ping-server"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${liveStatus === "checking" ? "animate-spin" : ""}`} />
              Ping
            </button>
            <button
              type="button"
              onClick={handleStartServer}
              disabled={startingServer || liveStatus === "online"}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${
                liveStatus === "online"
                  ? "bg-emerald-900/40 border border-emerald-800 text-emerald-400 cursor-default"
                  : "bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white border border-emerald-500 disabled:opacity-60"
              }`}
              id="btn-start-local-server"
            >
              {liveStatus === "online"
                ? <><CheckCircle2 className="w-3.5 h-3.5" /> Serwer dziala</>
                : startingServer
                ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Uruchamianie...</>
                : <><Play className="w-3.5 h-3.5" /> Uruchom serwer</>}
            </button>
          </div>
        </div>

        {healthData && liveStatus !== "offline" && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-slate-800">
            {[
              { icon: <Activity className="w-3.5 h-3.5" />, label: "Status",   value: healthData.status.toUpperCase(), color: healthData.status === "ok" ? "text-emerald-400" : "text-amber-400" },
              { icon: <Cpu className="w-3.5 h-3.5" />,      label: "API",      value: `v${healthData.apiVersion}`,    color: "text-sky-400" },
              { icon: <Layers className="w-3.5 h-3.5" />,   label: "Aplikacja",value: healthData.app,                 color: "text-slate-200" },
              { icon: <Clock className="w-3.5 h-3.5" />,    label: "Ping",     value: pingMs !== null ? `${pingMs} ms` : "—", color: pingMs !== null && pingMs < 20 ? "text-emerald-400" : "text-amber-400" },
            ].map(item => (
              <div key={item.label} className="flex flex-col gap-0.5 bg-slate-900/80 px-4 py-3">
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                  {item.icon}{item.label}
                </div>
                <div className={`text-xs font-bold font-mono ${item.color}`}>{item.value}</div>
              </div>
            ))}
          </div>
        )}

        {startLog.length > 0 && (
          <div className="m-4 bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-0.5 font-mono text-[11px]">
            <div className="flex items-center gap-1.5 text-slate-400 font-semibold mb-1.5 pb-1.5 border-b border-slate-800">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" /> Dziennik uruchamiania
            </div>
            {startLog.map((line, i) => (
              <div key={i} className={
                line.startsWith("OK") ? "text-emerald-400" :
                line.startsWith("ERR") ? "text-red-400" :
                line.startsWith("WARN") ? "text-amber-400" : "text-slate-400"
              }>{line}</div>
            ))}
          </div>
        )}

        {liveStatus === "offline" && (
          <div className="m-4 p-4 bg-red-950/30 border border-red-800/50 rounded-xl">
            <div className="flex items-start gap-3">
              <WifiOff className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="space-y-1.5">
                <p className="text-xs font-bold text-red-300">Serwer niedostepny na {serverUrl}</p>
                <p className="text-[11px] text-slate-400">Kliknij <strong className="text-emerald-400">Uruchom serwer</strong> powyzej lub uruchom recznie:</p>
                <div className="flex flex-col gap-1">
                  <code className="block bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[11px] text-emerald-300 font-mono">npm run dev</code>
                  <code className="block bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[11px] text-slate-400 font-mono">lub dwukliknij: start-server.bat</code>
                </div>
                <p className="text-[11px] text-slate-500">Wymagane: Node.js &gt;= 20 i poprawny plik <code className="font-mono">.env</code></p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── SEKCJA 2: FUNKCJE I MOZLIWOSCI ── */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <button
          type="button"
          onClick={() => setShowCapabilities(v => !v)}
          className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-slate-800/50 transition-colors"
          id="btn-toggle-capabilities"
        >
          <div className="flex items-center gap-2.5 text-sm font-bold text-slate-200">
            <Zap className="w-4 h-4 text-amber-400" />
            Funkcje i Mozliwosci Serwera
            {healthData?.capabilities && (
              <span className="px-1.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold">
                {healthData.capabilities.length} aktywnych
              </span>
            )}
          </div>
          {showCapabilities ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
        </button>

        {showCapabilities && (
          <div className="px-5 pb-5 space-y-2.5 border-t border-slate-800 pt-4">
            {Object.entries(CAPABILITIES_INFO).map(([cap, desc]) => {
              const isActive = healthData?.capabilities?.includes(cap) ?? false;
              return (
                <div key={cap} className={`flex items-start gap-3 p-3 rounded-xl border transition-colors ${isActive ? "bg-emerald-950/20 border-emerald-800/40" : "bg-slate-950/50 border-slate-800"}`}>
                  <div className={`mt-0.5 shrink-0 ${isActive ? "text-emerald-400" : "text-slate-600"}`}>
                    {isActive ? <CheckCircle2 className="w-4 h-4" /> : <Info className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-xs font-bold font-mono mb-0.5 ${isActive ? "text-emerald-300" : "text-slate-500"}`}>{cap}</div>
                    <div className="text-[11px] text-slate-400">{desc}</div>
                  </div>
                  {isActive && liveStatus === "online" && (
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full shrink-0">LIVE</span>
                  )}
                </div>
              );
            })}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
              {[
                { icon: <Lock className="w-4 h-4" />, color: "text-sky-400", label: "Bezpieczenstwo", items: ["Hasla: scrypt KDF (N=16384)", "Tokeny jako hash SHA-256", "Brute-force lockout (5/15min)", "CORS: tylko localhost", "Helmet + CSP headers"] },
                { icon: <Database className="w-4 h-4" />, color: "text-purple-400", label: "Magazyn danych", items: ["Zapis atomowy: .tmp -> rename", "Walidacja JSON przy kazdym odczycie", "Sciezka: %LOCALAPPDATA%/GymTracker", "Wersja schematu: 1", "Kontrola contentHash"] },
                { icon: <Globe className="w-4 h-4" />, color: "text-emerald-400", label: "Siec i binding", items: ["Domyslnie: 127.0.0.1:3000", "LAN: wymaga TLS (cert + key)", "HTTP: tylko loopback + insecure flag", "Timeout zadan: 5000 ms", "Limit ciala: 256 kb"] },
              ].map(card => (
                <div key={card.label} className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2">
                  <div className={`flex items-center gap-1.5 text-xs font-bold ${card.color}`}>
                    {card.icon}{card.label}
                  </div>
                  <ul className="space-y-1">
                    {card.items.map(item => (
                      <li key={item} className="text-[11px] text-slate-400 flex items-start gap-1.5">
                        <span className={`mt-0.5 shrink-0 ${card.color}`}>-</span>{item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── SEKCJA 3: ENDPOINTY API ── */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <button
          type="button"
          onClick={() => setShowEndpoints(v => !v)}
          className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-slate-800/50 transition-colors"
          id="btn-toggle-endpoints"
        >
          <div className="flex items-center gap-2.5 text-sm font-bold text-slate-200">
            <Code className="w-4 h-4 text-sky-400" />
            Endpointy REST API
            <span className="px-1.5 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-[10px] font-bold">{ENDPOINTS.length}</span>
          </div>
          {showEndpoints ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
        </button>
        {showEndpoints && (
          <div className="border-t border-slate-800 divide-y divide-slate-800/60">
            {ENDPOINTS.map((ep, i) => (
              <div key={i} className="flex items-start gap-3 px-5 py-3 hover:bg-slate-800/30 transition-colors">
                <span className={`shrink-0 mt-0.5 px-1.5 py-0.5 rounded border text-[10px] font-bold font-mono ${methodColor(ep.method)}`}>
                  {ep.method}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <code className="text-xs text-slate-200 font-mono">{ep.path}</code>
                    {ep.auth ? (
                      <span className="flex items-center gap-1 text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded-full">
                        <Lock className="w-2.5 h-2.5" />Auth
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500 bg-slate-800 border border-slate-700 px-1.5 py-0.5 rounded-full">Publiczny</span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">{ep.desc}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── SEKCJA 4: AKTUALIZACJE + KONFIGURACJA ── */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <DownloadCloud className="w-4 h-4 text-emerald-400" />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-bold text-slate-100">Aktualizacje Aplikacji</h3>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                  channel === "stable" ? "bg-emerald-950 text-emerald-300 border border-emerald-800" :
                  channel === "beta"   ? "bg-amber-950 text-amber-300 border border-amber-800" :
                  "bg-purple-950 text-purple-300 border border-purple-800"
                }`}>
                  {channel}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Sprawdzono: {settings.lastUpdateCheckAt || "Nigdy"} - Wersja: v{currentVersion}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleCheckForUpdates(false)}
            disabled={state.status === "checking" || state.status === "downloading" || state.status === "installing"}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 transition-colors shrink-0"
            id="btn-check-server-updates"
          >
            <RefreshCw className={`w-4 h-4 ${state.status === "checking" ? "animate-spin" : ""}`} />
            {state.status === "checking" ? "Sprawdzanie..." : "Sprawdz aktualizacje"}
          </button>
        </div>

        {notification && (
          <div className={`p-3 rounded-xl text-xs flex items-center gap-2.5 border ${
            notification.type === "success" ? "bg-emerald-950/60 border-emerald-800 text-emerald-200" :
            notification.type === "error"   ? "bg-red-950/60 border-red-800 text-red-200" :
            "bg-slate-950 border-slate-800 text-slate-300"
          }`}>
            {notification.type === "success" && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
            {notification.type === "error"   && <AlertCircle  className="w-4 h-4 text-red-400 shrink-0" />}
            {notification.type === "info"    && <Info         className="w-4 h-4 text-blue-400 shrink-0" />}
            <span>{notification.text}</span>
          </div>
        )}

        {state.availableUpdate && state.status !== "ready_to_install" && (
          <div className="bg-slate-950 border border-emerald-500/30 rounded-xl p-4 sm:p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <h4 className="text-sm font-bold text-slate-100">{state.availableUpdate.title}</h4>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 font-mono">
                  <span>Wydanie: {state.availableUpdate.releaseDate}</span>
                  <span>-</span>
                  <span>Rozmiar: {(state.availableUpdate.fileSizeBytes / (1024 * 1024)).toFixed(1)} MB</span>
                  <span>-</span>
                  <span>Typ: {state.availableUpdate.packageType}</span>
                </div>
              </div>
              {state.status === "available" && (
                <button
                  type="button"
                  onClick={handleStartUpdate}
                  className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-2 transition-transform active:scale-95 shrink-0"
                  id="btn-install-server-update"
                >
                  <DownloadCloud className="w-4 h-4" /> Pobierz i Zainstaluj
                </button>
              )}
            </div>
            <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3.5 space-y-2">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <FileCode className="w-3.5 h-3.5 text-emerald-400" /> Dziennik zmian:
              </span>
              <ul className="space-y-1.5 pl-2">
                {state.availableUpdate.releaseNotes.map((note, idx) => (
                  <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">-</span><span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono truncate">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              SHA-256: {state.availableUpdate.sha256Checksum}
            </div>
            {(state.status === "downloading" || state.status === "verifying" || state.status === "installing") && (
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-emerald-400 font-semibold flex items-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    {state.status === "downloading" && `Pobieranie... (${state.progressPct}%)`}
                    {state.status === "verifying" && "Weryfikacja SHA-256..."}
                    {state.status === "installing" && "Instalowanie..."}
                  </span>
                  {state.downloadSpeedMbps && <span className="text-slate-400">{state.downloadSpeedMbps} MB/s</span>}
                </div>
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full transition-all duration-200 rounded-full" style={{ width: `${state.progressPct}%` }} />
                </div>
              </div>
            )}
          </div>
        )}

        {state.status === "ready_to_install" && (
          <div className="bg-emerald-950/40 border border-emerald-800/80 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-full">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-emerald-300">Aktualizacja zainstalowana pomyslnie!</h4>
                <p className="text-xs text-slate-400">Wersja v{state.availableUpdate?.version || "?"} jest gotowa.</p>
              </div>
            </div>
            <button type="button" onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 transition-colors">
              <RotateCcw className="w-4 h-4" /> Zastosuj i Przeladuj
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pt-1">
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Network className="w-3.5 h-3.5 text-emerald-400" /> Adres serwera
            </h4>
            <div className="flex gap-2">
              <input
                type="text"
                value={serverUrl}
                onChange={e => onUpdateSettings({ updateServerUrl: e.target.value })}
                placeholder="http://127.0.0.1:3000"
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono focus:border-emerald-500 focus:outline-none transition-colors"
              />
              <button type="button" onClick={() => checkHealth()}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 text-xs font-semibold transition-colors">
                Test
              </button>
            </div>
            <p className="text-[11px] text-slate-500">Endpoint: <code className="font-mono">/api/update/*</code> - Domyslnie: <code className="font-mono text-emerald-400/80">http://127.0.0.1:3000</code></p>
            <h4 className="text-xs font-bold text-slate-300 pt-1">Kanal wydan</h4>
            <div className="grid grid-cols-3 gap-2">
              {(["stable", "beta", "nightly"] as const).map(c => (
                <button key={c} type="button" onClick={() => onUpdateSettings({ updateChannel: c })}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    channel === c ? "bg-emerald-950/40 border-emerald-500/60 text-emerald-200" : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}>
                  <div className="text-xs font-bold flex items-center justify-between">
                    <span>{c === "stable" ? "Stabilny" : c === "beta" ? "Beta" : "Nightly"}</span>
                    {channel === c && <Check className="w-3 h-3 text-emerald-400" />}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {c === "stable" ? "Przetestowane" : c === "beta" ? "Wczesny dostep" : "Codzienne"}
                  </div>
                </button>
              ))}
            </div>
            <div className="space-y-2 pt-1">
              <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
                <input type="checkbox" checked={settings.autoCheckUpdates !== false} onChange={e => onUpdateSettings({ autoCheckUpdates: e.target.checked })} className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 bg-slate-950" />
                Automatycznie sprawdzaj aktualizacje przy starcie
              </label>
              <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
                <input type="checkbox" checked={settings.autoInstallPatches === true} onChange={e => onUpdateSettings({ autoInstallPatches: e.target.checked })} className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 bg-slate-950" />
                Automatycznie instaluj mikro-poprawki (Hotfix)
              </label>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-emerald-400" /> Historia i Rollback
            </h4>
            <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
              {state.history && state.history.length > 0 ? (
                state.history.map(h => (
                  <div key={h.id} className="p-3 bg-slate-950 border border-slate-800/90 rounded-lg flex items-center justify-between gap-3 text-xs">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 font-bold text-slate-200">
                        <span className="font-mono text-emerald-400">v{h.version}</span>
                        <span className="text-[10px] px-1.5 rounded bg-slate-800 text-slate-400 font-mono">{h.packageType}</span>
                      </div>
                      <div className="text-[11px] text-slate-400">{h.notes}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{h.installedAt}</div>
                    </div>
                    {h.version !== currentVersion && (
                      <button type="button" onClick={() => handleRollback(h.version)}
                        className="px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold flex items-center gap-1 border border-slate-700 transition-colors shrink-0">
                        <RotateCcw className="w-3.5 h-3.5 text-amber-400" /> Przywroc
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-xs text-slate-500 bg-slate-950 rounded-lg border border-slate-800">
                  Brak zarejestrowanych aktualizacji.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── SEKCJA 5: SRODOWISKO / .env ── */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <button
          type="button"
          onClick={() => setShowEnvInfo(v => !v)}
          className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-slate-800/50 transition-colors"
          id="btn-toggle-env"
        >
          <div className="flex items-center gap-2.5 text-sm font-bold text-slate-200">
            <HardDrive className="w-4 h-4 text-purple-400" />
            Srodowisko i konfiguracja (.env)
          </div>
          {showEnvInfo ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
        </button>
        {showEnvInfo && (
          <div className="px-5 pb-5 border-t border-slate-800 pt-4 space-y-3">
            <p className="text-[11px] text-slate-400">
              Serwer konfiguruje sie przez zmienne z pliku <code className="font-mono text-slate-300">.env</code>. Wymagany <code className="font-mono text-slate-300">GYMTRACKER_ALLOW_INSECURE_LOCALHOST=1</code> do trybu deweloperskiego (loopback HTTP).
            </p>
            <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="text-left px-3 py-2 text-slate-500 font-semibold">Zmienna</th>
                    <th className="text-left px-3 py-2 text-slate-500 font-semibold hidden sm:table-cell">Domyslna</th>
                    <th className="text-left px-3 py-2 text-slate-500 font-semibold">Opis</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {[
                    { v: "PORT", d: "3000", desc: "Port TCP serwera Express" },
                    { v: "GYMTRACKER_BIND", d: "127.0.0.1", desc: "Adres bindowania (LAN = TLS wymagany!)" },
                    { v: "GYMTRACKER_USERNAME", d: "local", desc: "Nazwa uzytkownika do logowania" },
                    { v: "GYMTRACKER_PASSWORD_HASH", d: "(pusty)", desc: "Hash scrypt hasla — bez niego brak logowania" },
                    { v: "GYMTRACKER_SESSION_TTL_MS", d: "28800000", desc: "Waznosc tokena Bearer: 8 godzin" },
                    { v: "GYMTRACKER_DATA_FILE", d: "%LOCALAPPDATA%/GymTracker/server_data.json", desc: "Sciezka trwalego magazynu" },
                    { v: "GYMTRACKER_ALLOW_INSECURE_LOCALHOST", d: "0", desc: "HTTP bez TLS — tylko loopback dev!" },
                    { v: "GYMTRACKER_HTTPS", d: "0", desc: "TLS w procesie Node (1 = wlacz + cert/key)" },
                  ].map(row => (
                    <tr key={row.v} className="hover:bg-slate-900/50 transition-colors">
                      <td className="px-3 py-2 font-mono text-purple-300 font-semibold whitespace-nowrap">{row.v}</td>
                      <td className="px-3 py-2 font-mono text-slate-500 hidden sm:table-cell whitespace-nowrap">{row.d}</td>
                      <td className="px-3 py-2 text-slate-400">{row.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-start gap-2 p-3 bg-amber-950/20 border border-amber-800/40 rounded-lg text-[11px] text-amber-300">
              <Shield className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>Nigdy nie uzywaj <code className="font-mono">GYMTRACKER_ALLOW_INSECURE_LOCALHOST=1</code> dla bindowania LAN. Do sieci lokalnej wymagaj TLS (<code className="font-mono">GYMTRACKER_TLS_CERT_FILE</code> + <code className="font-mono">GYMTRACKER_TLS_KEY_FILE</code>).</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
