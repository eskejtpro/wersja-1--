export interface LoggedSet {
  setNumber: number;
  weight: number;
  reps: number;
  completed: boolean;
}

export interface ExerciseHistoryPoint {
  date: string;
  weight: number;
  reps: number;
  sets: number;
  rpe?: number;
  loggedSets?: LoggedSet[];
}

export interface Exercise {
  id: string;
  name: string;
  category?: 'klatka' | 'plecy' | 'biceps' | 'triceps' | 'barki' | 'nogi';
  sets: number;
  reps: number;
  weight: number;
  goalWeight?: number;
  rpe: number;
  notes: string;
  history: ExerciseHistoryPoint[];
  loggedSets?: LoggedSet[];
}

export interface TrainingDay {
  id: string;
  name: string;
  completed: boolean;
  notes?: string;
  exercises: Exercise[];
}

export interface TrainingWeek {
  id: string;
  number: number;
  name: string;
  startDate?: string;
  days: TrainingDay[];
}

export interface BodyWeightEntry {
  id: string;
  date: string;
  weight: number;
  notes: string;
}

export const BODY_PARTS = ['biceps', 'triceps', 'klata', 'barki', 'nogi'] as const;
export type BodyPartType = (typeof BODY_PARTS)[number];

export interface BodyPartMeasurement {
  id: string;
  date: string;
  part: BodyPartType;
  value: number; // in cm, e.g. 38.5
  notes?: string;
}

export const CIRCUMFERENCE_BODY_PARTS = ['klatka', 'talia', 'biodra', 'udo', 'łydka', 'ramię'] as const;
export type CircumferenceBodyPart = (typeof CIRCUMFERENCE_BODY_PARTS)[number];
export type CircumferenceSide = 'left' | 'right' | null;
export type CircumferenceVariant = 'standard' | 'flexed' | 'relaxed';

export interface CircumferenceEntry {
  id: string;
  date: string;
  bodyPart: CircumferenceBodyPart;
  side: CircumferenceSide;
  variant: CircumferenceVariant;
  /** Stored as a positive integer to avoid floating-point drift. */
  millimeters: number;
  notes: string;
}

export interface BackupEntry {
  id: string;
  timestamp: string;
  fileName: string;
  sizeBytes: number;
  weeksCount: number;
  data: GymData;
}

export interface AppSettings {
  unit: 'kg' | 'lbs';
  theme: 'dark' | 'light';
  autoSave: boolean;
  athleteName: string;
  windowsPath: string;
  soundFeedback: boolean;
  autoBackupEnabled?: boolean;
  backupFolderPath?: string;
  backupOnSave?: boolean;
  backupOnClose?: boolean;
  maxBackupFiles?: number;
  lastBackupTime?: string;
  /** v1.1: analysis uses completed sessions by default to avoid planned-volume inflation. */
  analysisOnlyCompleted?: boolean;
  analysisHideEmptyGroups?: boolean;
  analysisIncludePartialHistory?: boolean;
  analysisStartWeek?: number;
  analysisEndWeek?: number;
  analysisDefaultMetric?: 'progressPct' | 'volume' | 'executedSets';
  analysisShowAlerts?: boolean;
  analysisShowBodyWeight?: boolean;
  analysisShow1RM?: boolean;
  analysisRoundValues?: boolean;
  analysisAutoRefresh?: boolean;
  analysisShowDataQualityWarnings?: boolean;
  analysisRequireHistoryForCompleted?: boolean;
  analysisMinExecutedSets?: number;
  analysisWarnMissingHistory?: boolean;
  analysisWarnVolumeJumpPct?: number;
  analysisTrendWindowWeeks?: number;
  confirmBeforeDelete?: boolean;
  /** Hover annotation preview system for all UI elements and functions */
  showHoverAnnotations?: boolean;
  startupView?: 'plan' | 'stats' | 'muscle' | 'weight' | 'cycles' | 'exercises' | 'settings' | 'python' | 'profile';
  rememberLastView?: boolean;
  reducedMotion?: boolean;
  analysisShowExecutionSummary?: boolean;
  /** v2.0: show the executed-work comparison table for two selected weeks. */
  analysisShowWeekComparison?: boolean;
  /** v2.2: allow hiding the weekly tonnage chart without changing analysis data. */
  analysisShowWeeklyTonnage?: boolean;
  /** v2.3: controls for transparent weekly metrics and exercise trend signals. */
  analysisShowWeeklyMetrics?: boolean;
  analysisShowExecutedDays?: boolean;
  analysisShowExecutedExercises?: boolean;
  analysisShowExecutedSets?: boolean;
  analysisShowExecutedReps?: boolean;
  analysisShowVolumeDelta?: boolean;
  analysisShowDataConfidence?: boolean;
  analysisShowBestE1RM?: boolean;
  analysisShowLatestResult?: boolean;
  analysisShowTrendLine?: boolean;
  /** v2.4: personal-record marker and stagnation controls. */
  analysisShowPRMarkers?: boolean;
  analysisPRMetric?: 'weight' | 'e1RM' | 'volume';
  analysisStagnationWindow?: number;
  analysisStagnationMinSessions?: number;
  /** v2.5: weekly regularity target and chart visibility. */
  analysisShowRegularity?: boolean;
  analysisRegularityTargetPct?: number;
  /** v2.6: show executed muscle-group frequency. */
  analysisShowMuscleFrequency?: boolean;
  /** v2.7: month-level execution comparison. */
  analysisShowMonthlyComparison?: boolean;
  analysisMonthlyMetric?: 'volume' | 'executedSets' | 'executedReps';
  /** v2.8: compare two executed training periods from real history. */
  analysisShowPeriodComparison?: boolean;
  analysisPeriodComparisonMetric?: 'volume' | 'executedSets' | 'executedReps' | 'executedDays';
  /** Rolling average tonnage (4 weeks) toggle - hidden by default */
  analysisShowRollingVolume?: boolean;
  /** Layout preset for Mesocycle report summary cards */
  analysisReportLayout?: 'bento_left' | 'compact_dashboard' | 'split_preview' | 'executive_strip';
  /** Toggle visibility of layout switcher on report screen (hidden by default) */
  analysisShowLayoutSwitcher?: boolean;
  /** AI Coach / Analytical Agent */
  analysisShowAiAgent?: boolean;
  aiAgentMode?: 'heuristic_local' | 'server_endpoint';
  aiAgentServerUrl?: string;
  aiAgentApiKey?: string;
  aiAgentPersona?: 'coach_hardcore' | 'sports_scientist' | 'regenerative' | 'balanced';
  aiAgentFocus?: 'all_muscles' | 'hypertrophy_volume' | 'strength_progression' | 'fatigue_management';
  aiAgentResponseLength?: 'concise' | 'detailed' | 'bullet_points';
  /** v2.9: Ultra-sharp display rendering, resolution & pixel density scaling */
  uiScale?: 'compact' | 'standard' | 'high' | 'ultra';
  pixelDensity?: 'ultra' | 'crisp' | 'standard';
  fontSharpness?: 'retina' | 'sharp' | 'standard';
  /** Custom app branding in settings */
  customAppName?: string;
  customAppSubtitle?: string;
  customAppIcon?: 'dumbbell' | 'flame' | 'trophy' | 'zap' | 'activity' | 'shield';
  /** Custom navigation order and hidden features */
  navOrder?: string[];
  hiddenNavItems?: string[];
  /** Font customization & scaling */
  fontSizeScale?: number;
  fontFamilyChoice?: 'sans' | 'segoe' | 'mono' | 'condensed';
  fontContrast?: 'standard' | 'high_contrast' | 'bold_headings';
  uiDensity?: 'compact' | 'standard' | 'spacious';
  /** Windows Desktop sizing & frame simulation */
  windowsViewportMode?: 'responsive' | 'fhd_1080p' | 'laptop_768p' | 'wqhd_1440p' | 'classic_1280x800' | 'window_simulation';
  windowsShowDesktopFrame?: boolean;
  windowsDpiScale?: '100' | '125' | '150';
  /** Server-based Full App Update System */
  updateChannel?: 'stable' | 'beta' | 'nightly';
  autoCheckUpdates?: boolean;
  autoInstallPatches?: boolean;
  updateServerUrl?: string;
  lastUpdateCheckAt?: string;
  installedAppVersion?: string;
}

export interface AppUpdateInfo {
  version: string;
  currentVersion: string;
  releaseDate: string;
  title: string;
  releaseNotes: string[];
  downloadUrl: string;
  fileSizeBytes: number;
  sha256Checksum: string;
  isMandatory: boolean;
  minSupportedVersion?: string;
  packageType: 'full_dist' | 'bundle_zip' | 'exe_installer' | 'hotfix_patch';
  author: string;
}

export interface AppUpdateHistoryEntry {
  id: string;
  version: string;
  installedAt: string;
  status: 'success' | 'rolled_back' | 'failed';
  packageType: string;
  notes?: string;
}

export interface AppUpdateState {
  status: 'idle' | 'checking' | 'available' | 'downloading' | 'verifying' | 'ready_to_install' | 'installing' | 'up_to_date' | 'error';
  progressPct: number;
  bytesDownloaded: number;
  totalBytes: number;
  downloadSpeedMbps?: number;
  errorMessage?: string;
  availableUpdate?: AppUpdateInfo | null;
  lastCheckedAt?: string;
  history?: AppUpdateHistoryEntry[];
}

export interface ProtocolEntry {
  id: string;
  date: string;
  time?: string;
  substance: string;
  dosage: number;
  unit: 'mg' | 'IU' | 'mcg' | 'ml' | 'tab';
  route: 'IM' | 'SC' | 'Oral';
  notes?: string;
}

export interface AthletePersonalRecord {
  id: string;
  exerciseName: string;
  weight: number;
  reps: number;
  date: string;
  estimated1RM: number;
  notes?: string;
}

export interface HealthBloodworkEntry {
  id: string;
  date: string;
  notes?: string;
  jsonFileName?: string;
  jsonData?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  athleteTag?: string;
  avatarUrl?: string;
  bio?: string;
  age?: number;
  heightCm?: number;
  height?: number;
  experienceLevel?: 'poczatkujacy' | 'sredniozaawansowany' | 'zaawansowany' | 'zawodnik' | 'beginner' | 'intermediate' | 'advanced' | 'elite' | string;
  primaryGoal?: 'masa' | 'redukcja' | 'rekompozycja' | 'sila' | 'utrzymanie' | string;
  goal?: string;
  targetWeight?: number;
  activityLevel?: 'siedzacy' | 'umiarkowany' | 'aktywny' | 'bardzo_aktywny' | string;
  // Feature 1: Nutrition & Macro Goals
  dailyCalories?: number;
  proteinGrams?: number;
  carbsGrams?: number;
  fatsGrams?: number;
  dietaryMacros?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fats?: number;
  };
  // Feature 2: Official PRs
  manualPRs?: AthletePersonalRecord[];
  // Feature 3: Health & Bloodwork (Daty z notatką i plikami JSON)
  healthBloodworkEntries?: HealthBloodworkEntry[];
  isPinned?: boolean;
}

export interface SyncServerConfig {
  serverUrl: string;
  port: number;
  deviceId: string;
  deviceName: string;
  deviceType: 'windows_desktop' | 'android_mobile';
  pairingCode: string;
  authToken: string;
  autoSync: boolean;
  conflictResolution: 'ask' | 'prefer_desktop' | 'prefer_mobile' | 'merge_newer';
  lastSyncAt?: string;
  lastSyncStatus?: 'connected' | 'offline' | 'error' | 'syncing' | 'idle';
  lastSyncDetails?: string;
  lastPingMs?: number;
}

export interface SyncLogEntry {
  id: string;
  timestamp: string;
  direction: 'push_to_server' | 'pull_from_server' | 'handshake';
  recordsAffected: number;
  status: 'success' | 'conflict_detected' | 'failed';
  summary: string;
}

export interface CatalogExercise {
  id: string;
  name: string;
  category: 'klatka' | 'plecy' | 'biceps' | 'triceps' | 'barki' | 'nogi';
  equipment?: 'sztanga' | 'hantle' | 'maszyna' | 'wyciag' | 'masa_ciala' | 'inne';
  defaultSets: number;
  defaultReps: number;
  defaultRpe?: number;
  notes?: string;
  isCustom?: boolean;
}

export interface GymData {
  settings: AppSettings;
  weeks: TrainingWeek[];
  bodyWeights: BodyWeightEntry[];
  /** Optional for compatibility with JSON saved before circumference tracking. */
  circumferences?: CircumferenceEntry[];
  bodyPartMeasurements?: BodyPartMeasurement[];
  protocolEntries?: ProtocolEntry[];
  profile?: UserProfile;
  profilesList?: UserProfile[];
  syncConfig?: SyncServerConfig;
  syncLogs?: SyncLogEntry[];
  catalogExercises?: CatalogExercise[];
  activeSessionDraft?: ActiveSessionDraft | null;
  workoutSessionsHistory?: WorkoutSessionRecord[];
}

// ==========================================
// 1. ZNORMALIZOWANE RELACYJNE ENCJE BAZODANOWE (ROOM / SQLITE)
// ==========================================

export interface WorkoutPlanEntity {
  id: string;
  name: string;
  description?: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TrainingWeekEntity {
  id: string;
  planId: string;
  number: number;
  name: string;
  startDate?: string;
  orderIndex: number;
}

export interface TrainingDayEntity {
  id: string;
  weekId: string;
  name: string;
  completed: boolean;
  notes?: string;
  orderIndex: number;
  scheduledWeekday?: number; // 0=Niedziela, 1=Poniedziałek ... 6=Sobota
}

export interface ExerciseEntity {
  id: string;
  dayId: string;
  catalogId?: string;
  name: string;
  category: 'klatka' | 'plecy' | 'biceps' | 'triceps' | 'barki' | 'nogi';
  sets: number;
  reps: number;
  weight: number;
  goalWeight?: number;
  rpe: number;
  notes?: string;
  orderIndex: number;
}

export interface LoggedSetEntity {
  id: string;
  exerciseId: string;
  sessionId?: string;
  setNumber: number;
  weight: number;
  reps: number;
  completed: boolean;
  rpe?: number;
  executedAt: string;
}

// ==========================================
// 2. ACTIVE SESSION RUNNER (ZERO DATA LOSS DRAFT)
// ==========================================

export interface ActiveSetDraft {
  setNumber: number;
  weight: number;
  reps: number;
  completed: boolean;
  rpe?: number;
  completedAt?: string;
  restTimeSeconds?: number;
}

export interface ActiveExerciseDraft {
  exerciseId: string;
  catalogId?: string;
  name: string;
  category: 'klatka' | 'plecy' | 'biceps' | 'triceps' | 'barki' | 'nogi';
  orderIndex: number;
  targetSets: number;
  targetReps: number;
  targetWeight: number;
  targetRpe?: number;
  notes?: string;
  sets: ActiveSetDraft[];
}

export interface ActiveSessionDraft {
  sessionId: string;
  planId: string;
  weekId: string;
  dayId: string;
  dayName: string;
  startedAt: string;
  lastSavedAt: string;
  elapsedSeconds: number;
  isPaused: boolean;
  activeExercises: ActiveExerciseDraft[];
  sessionNotes?: string;
}

// ==========================================
// 3. ARCHIWUM UKOŃCZONYCH SESJI TRENINGOWYCH
// ==========================================

export interface WorkoutSessionRecord {
  id: string;
  planId: string;
  weekId: string;
  dayId: string;
  dayName: string;
  startedAt: string;
  finishedAt: string;
  durationMinutes: number;
  totalVolumeKg: number;
  totalSets: number;
  totalReps: number;
  notes?: string;
  rating?: number; // 1-5 odczucia po treningu
}


