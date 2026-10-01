import { GymData } from '../types';
import { DEFAULT_CATALOG_EXERCISES } from './defaultCatalogExercises';

export const initialGymData: GymData = {
  settings: {
    unit: 'kg',
    theme: 'dark',
    autoSave: true,
    reducedMotion: false,
    athleteName: 'Zawodnik',
    windowsPath: '%LOCALAPPDATA%\\GymTracker\\workout_data.json',
    soundFeedback: true,
    autoBackupEnabled: true,
    backupFolderPath: '%LOCALAPPDATA%\\GymTracker\\Backups',
    backupOnSave: true,
    backupOnClose: true,
    maxBackupFiles: 15,
    analysisOnlyCompleted: true,
    analysisHideEmptyGroups: true,
    analysisIncludePartialHistory: false,
    analysisStartWeek: 1,
    analysisEndWeek: 999,
    analysisDefaultMetric: 'progressPct',
    analysisShowAlerts: true,
    analysisShowBodyWeight: true,
    analysisShow1RM: true,
    analysisRoundValues: true,
    analysisAutoRefresh: true,
    analysisShowDataQualityWarnings: true,
    analysisRequireHistoryForCompleted: true,
    analysisMinExecutedSets: 1,
    analysisWarnMissingHistory: true,
    analysisWarnVolumeJumpPct: 30,
    analysisTrendWindowWeeks: 4,
    confirmBeforeDelete: true,
    showHoverAnnotations: true,
    startupView: 'plan',
    rememberLastView: false,
    analysisShowExecutionSummary: true,
    analysisShowWeekComparison: true,
    analysisShowWeeklyTonnage: false,
    analysisShowWeeklyMetrics: false,
    analysisShowExecutedDays: true,
    analysisShowExecutedExercises: true,
    analysisShowExecutedSets: true,
    analysisShowExecutedReps: true,
    analysisShowVolumeDelta: true,
    analysisShowDataConfidence: true,
    analysisShowBestE1RM: true,
    analysisShowLatestResult: true,
    analysisShowTrendLine: true,
    analysisShowPRMarkers: true,
    analysisPRMetric: 'e1RM',
    analysisStagnationWindow: 4,
    analysisStagnationMinSessions: 3,
    analysisShowRegularity: false,
    analysisRegularityTargetPct: 80,
    analysisShowMuscleFrequency: true,
    analysisShowMonthlyComparison: false,
    analysisMonthlyMetric: 'volume',
    analysisShowPeriodComparison: false,
    analysisPeriodComparisonMetric: 'volume',
    analysisShowRollingVolume: false,
    analysisReportLayout: 'bento_left',
    analysisShowLayoutSwitcher: false,
    analysisShowAiAgent: true,
    aiAgentMode: 'heuristic_local',
    aiAgentServerUrl: '',
    aiAgentApiKey: '',
    aiAgentPersona: 'balanced',
    aiAgentFocus: 'all_muscles',
    aiAgentResponseLength: 'concise',
    lastBackupTime: undefined
  },
  weeks: [
    {
      id: 'week-1',
      number: 1,
      name: 'Tydzień 1 - Rozpoczęcie Cyklu (Push / Pull / Legs)',
      startDate: '2026-09-01',
      days: [
        {
          id: 'w1-d1',
          name: 'Poniedziałek – Plan A: Push (Klatka, Barki Przód/Bok, Triceps)',
          completed: true,
          notes: 'Trening Push ukończony. Świetna pompa mięśniowa, dobre spięcie na klatce i barkach.',
          exercises: [
            {
              id: 'ex-push-1',
              name: 'Wyciskanie sztangi na ławce płaskiej',
              sets: 4,
              reps: 8,
              weight: 85,
              rpe: 8,
              notes: 'Pauza na klatce piersiowej, stabilny mostek',
              history: [
                { date: '2026-08-18', weight: 80, reps: 8, sets: 4, rpe: 7.5 },
                { date: '2026-08-25', weight: 82.5, reps: 8, sets: 4, rpe: 8 },
                { date: '2026-09-01', weight: 85, reps: 8, sets: 4, rpe: 8 }
              ]
            },
            {
              id: 'ex-push-2',
              name: 'Wyciskanie hantli na skosie dodatnim (30–45°)',
              sets: 3,
              reps: 10,
              weight: 30,
              rpe: 8.5,
              notes: 'Kąt ławki 30°, głębokie rozciągnięcie w fazie negatywnej',
              history: [
                { date: '2026-08-18', weight: 26, reps: 10, sets: 3 },
                { date: '2026-08-25', weight: 28, reps: 10, sets: 3 },
                { date: '2026-09-01', weight: 30, reps: 10, sets: 3 }
              ]
            },
            {
              id: 'ex-push-3',
              name: 'Rozpiętki na bramce / wyciągu',
              sets: 3,
              reps: 12,
              weight: 15,
              rpe: 8,
              notes: 'Spięcie mięśniowe w szczytowej fazie (1 sec holding)',
              history: [
                { date: '2026-08-18', weight: 12.5, reps: 12, sets: 3 },
                { date: '2026-08-25', weight: 13.5, reps: 12, sets: 3 },
                { date: '2026-09-01', weight: 15, reps: 12, sets: 3 }
              ]
            },
            {
              id: 'ex-push-4',
              name: 'OHP (Wyciskanie żołnierskie sztangi stojąc)',
              sets: 4,
              reps: 6,
              weight: 55,
              rpe: 8.5,
              notes: 'Napięty pośladek i brzuch, sztanga blisko twarzy',
              history: [
                { date: '2026-08-18', weight: 50, reps: 6, sets: 4 },
                { date: '2026-08-25', weight: 52.5, reps: 6, sets: 4 },
                { date: '2026-09-01', weight: 55, reps: 6, sets: 4 }
              ]
            },
            {
              id: 'ex-push-5',
              name: 'Wznosy bokiem z hantlami lub na wyciągu',
              sets: 4,
              reps: 12,
              weight: 12.5,
              rpe: 9,
              notes: 'Prowadzenie łokcia w górę, wolne opuszczanie',
              history: [
                { date: '2026-08-18', weight: 10, reps: 12, sets: 4 },
                { date: '2026-08-25', weight: 11.5, reps: 12, sets: 4 },
                { date: '2026-09-01', weight: 12.5, reps: 12, sets: 4 }
              ]
            },
            {
              id: 'ex-push-6',
              name: 'Prostowanie ramion z linką za głowy (French)',
              sets: 3,
              reps: 12,
              weight: 25,
              rpe: 8,
              notes: 'Akcent na długą głowę tricepsa',
              history: [
                { date: '2026-08-18', weight: 20, reps: 12, sets: 3 },
                { date: '2026-08-25', weight: 22.5, reps: 12, sets: 3 },
                { date: '2026-09-01', weight: 25, reps: 12, sets: 3 }
              ]
            },
            {
              id: 'ex-push-7',
              name: 'Prostowanie ramion na linkach wyciągu górnego',
              sets: 3,
              reps: 12,
              weight: 30,
              rpe: 8.5,
              notes: 'Rozchylenie linek w końcowej fazie ruchu',
              history: [
                { date: '2026-08-18', weight: 25, reps: 12, sets: 3 },
                { date: '2026-08-25', weight: 27.5, reps: 12, sets: 3 },
                { date: '2026-09-01', weight: 30, reps: 12, sets: 3 }
              ]
            },
            {
              id: 'ex-push-8',
              name: 'Plank (Deska)',
              sets: 3,
              reps: 60,
              weight: 0,
              rpe: 8,
              notes: 'Izometria brzucha 60 sekund',
              history: [
                { date: '2026-08-18', weight: 0, reps: 45, sets: 3 },
                { date: '2026-08-25', weight: 0, reps: 50, sets: 3 },
                { date: '2026-09-01', weight: 0, reps: 60, sets: 3 }
              ]
            }
          ]
        },
        {
          id: 'w1-d2',
          name: 'Wtorek – Plan B: Pull (Plecy, Tył Barku, Biceps)',
          completed: true,
          notes: 'Trening Pull ukończony. Plecy i biceps solidnie przepracowane.',
          exercises: [
            {
              id: 'ex-pull-1',
              name: 'Podciąganie na drążku (Nachwyt / Podchwyt)',
              sets: 4,
              reps: 8,
              weight: 0,
              rpe: 8,
              notes: 'Pełen zakres ruchu od wyprostu do brody nad drążek',
              history: [
                { date: '2026-08-19', weight: 0, reps: 6, sets: 4 },
                { date: '2026-08-26', weight: 0, reps: 7, sets: 4 },
                { date: '2026-09-02', weight: 0, reps: 8, sets: 4 }
              ]
            },
            {
              id: 'ex-pull-2',
              name: 'Wiosłowanie sztangą w opadzie tułowia',
              sets: 4,
              reps: 8,
              weight: 75,
              rpe: 8,
              notes: 'Przyciąganie sztangi do pępka, kąt opadu ok. 45°',
              history: [
                { date: '2026-08-19', weight: 70, reps: 8, sets: 4 },
                { date: '2026-08-26', weight: 72.5, reps: 8, sets: 4 },
                { date: '2026-09-02', weight: 75, reps: 8, sets: 4 }
              ]
            },
            {
              id: 'ex-pull-3',
              name: 'Wiosłowanie jednorącz na wyciągu dolnym do biodra',
              sets: 3,
              reps: 10,
              weight: 35,
              rpe: 8,
              notes: 'Prowadzenie łokcia tuż przy biodrze, głęboki rozciąg',
              history: [
                { date: '2026-08-19', weight: 30, reps: 10, sets: 3 },
                { date: '2026-08-26', weight: 32.5, reps: 10, sets: 3 },
                { date: '2026-09-02', weight: 35, reps: 10, sets: 3 }
              ]
            },
            {
              id: 'ex-pull-4',
              name: 'Pull-over (Przenoszenie drążka na wyciągu)',
              sets: 3,
              reps: 12,
              weight: 27.5,
              rpe: 8,
              notes: 'Izolacja najszerszego grzbietu na prostych ramionach',
              history: [
                { date: '2026-08-19', weight: 22.5, reps: 12, sets: 3 },
                { date: '2026-08-26', weight: 25, reps: 12, sets: 3 },
                { date: '2026-09-02', weight: 27.5, reps: 12, sets: 3 }
              ]
            },
            {
              id: 'ex-pull-5',
              name: 'Face Pulls (Przyciąganie linki do twarzy)',
              sets: 4,
              reps: 15,
              weight: 20,
              rpe: 8.5,
              notes: 'Akcent na rotatory i tył akromionu',
              history: [
                { date: '2026-08-19', weight: 15, reps: 15, sets: 4 },
                { date: '2026-08-26', weight: 17.5, reps: 15, sets: 4 },
                { date: '2026-09-02', weight: 20, reps: 15, sets: 4 }
              ]
            },
            {
              id: 'ex-pull-6',
              name: 'Wznosy hantli w opadzie leżąc przodem (30–45°)',
              sets: 3,
              reps: 12,
              weight: 10,
              rpe: 8.5,
              notes: 'Klatka oparta o ławkę skośną',
              history: [
                { date: '2026-08-19', weight: 8, reps: 12, sets: 3 },
                { date: '2026-08-26', weight: 9, reps: 12, sets: 3 },
                { date: '2026-09-02', weight: 10, reps: 12, sets: 3 }
              ]
            },
            {
              id: 'ex-pull-7',
              name: 'Uginanie ramion ze sztangą łamaną stojąc',
              sets: 3,
              reps: 10,
              weight: 35,
              rpe: 8.5,
              notes: 'Stabilny tułów bez cheatingu',
              history: [
                { date: '2026-08-19', weight: 30, reps: 10, sets: 3 },
                { date: '2026-08-26', weight: 32.5, reps: 10, sets: 3 },
                { date: '2026-09-02', weight: 35, reps: 10, sets: 3 }
              ]
            },
            {
              id: 'ex-pull-8',
              name: 'Uginanie hantli z supinacją na ławce skośnej',
              sets: 3,
              reps: 10,
              weight: 14,
              rpe: 8,
              notes: 'Pełny rozciąg w dolnej pozycji',
              history: [
                { date: '2026-08-19', weight: 12, reps: 10, sets: 3 },
                { date: '2026-08-26', weight: 13, reps: 10, sets: 3 },
                { date: '2026-09-02', weight: 14, reps: 10, sets: 3 }
              ]
            },
            {
              id: 'ex-pull-9',
              name: 'Uginanie młotkowe (Hantle / Linka)',
              sets: 3,
              reps: 12,
              weight: 16,
              rpe: 8.5,
              notes: 'Rozwój mięśnia ramiennego i ramienno-promieniowego',
              history: [
                { date: '2026-08-19', weight: 12, reps: 12, sets: 3 },
                { date: '2026-08-26', weight: 14, reps: 12, sets: 3 },
                { date: '2026-09-02', weight: 16, reps: 12, sets: 3 }
              ]
            },
            {
              id: 'ex-pull-10',
              name: 'Plank (Deska)',
              sets: 3,
              reps: 60,
              weight: 0,
              rpe: 8,
              notes: 'Deska po podciąganiu – stabilizacja gorsetu',
              history: [
                { date: '2026-08-19', weight: 0, reps: 50, sets: 3 },
                { date: '2026-08-26', weight: 0, reps: 55, sets: 3 },
                { date: '2026-09-02', weight: 0, reps: 60, sets: 3 }
              ]
            }
          ]
        },
        {
          id: 'w1-d3',
          name: 'Środa – Plan C: Legs & Abs (Nogi, Brzuch)',
          completed: false,
          notes: 'Mocny trening nóg i brzucha',
          exercises: [
            {
              id: 'ex-legs-1',
              name: 'Prostowanie nóg na maszynie siedząc',
              sets: 3,
              reps: 12,
              weight: 50,
              rpe: 8,
              notes: 'Wstępne zmęczenie czworogłowych ud',
              history: [
                { date: '2026-08-20', weight: 40, reps: 12, sets: 3 },
                { date: '2026-08-27', weight: 45, reps: 12, sets: 3 },
                { date: '2026-09-03', weight: 50, reps: 12, sets: 3 }
              ]
            },
            {
              id: 'ex-legs-2',
              name: 'Przysiady ze sztangą na plecach (Back Squat)',
              sets: 4,
              reps: 6,
              weight: 115,
              rpe: 8.5,
              notes: 'Głębokość poniżej linii kolan, kontrolowane schodzenie',
              history: [
                { date: '2026-08-20', weight: 105, reps: 6, sets: 4 },
                { date: '2026-08-27', weight: 110, reps: 6, sets: 4 },
                { date: '2026-09-03', weight: 115, reps: 6, sets: 4 }
              ]
            },
            {
              id: 'ex-legs-3',
              name: 'RDL – Rumuński Martwy Ciąg ze sztangą',
              sets: 4,
              reps: 8,
              weight: 95,
              rpe: 8,
              notes: 'Rozciągnięcie dwugłowych, biodra mocno w tył',
              history: [
                { date: '2026-08-20', weight: 85, reps: 8, sets: 4 },
                { date: '2026-08-27', weight: 90, reps: 8, sets: 4 },
                { date: '2026-09-03', weight: 95, reps: 8, sets: 4 }
              ]
            },
            {
              id: 'ex-legs-4',
              name: 'Wykroki chodzone z hantlami',
              sets: 3,
              reps: 10,
              weight: 18,
              rpe: 8.5,
              notes: '10 kroków na nogę (razem 20 kroków na serię)',
              history: [
                { date: '2026-08-20', weight: 14, reps: 10, sets: 3 },
                { date: '2026-08-27', weight: 16, reps: 10, sets: 3 },
                { date: '2026-09-03', weight: 18, reps: 10, sets: 3 }
              ]
            },
            {
              id: 'ex-legs-5',
              name: 'Wspięcia na palce stojąc',
              sets: 4,
              reps: 15,
              weight: 60,
              rpe: 9,
              notes: 'Pełen skok na palcach i przytrzymanie w szczycie 2 sec',
              history: [
                { date: '2026-08-20', weight: 50, reps: 15, sets: 4 },
                { date: '2026-08-27', weight: 55, reps: 15, sets: 4 },
                { date: '2026-09-03', weight: 60, reps: 15, sets: 4 }
              ]
            },
            {
              id: 'ex-legs-6',
              name: 'Unoszenie nóg w wiszeniu na drążku',
              sets: 3,
              reps: 12,
              weight: 0,
              rpe: 8.5,
              notes: 'Podwijanie miednicy do klatki bez bujania ciałem',
              history: [
                { date: '2026-08-20', weight: 0, reps: 10, sets: 3 },
                { date: '2026-08-27', weight: 0, reps: 12, sets: 3 },
                { date: '2026-09-03', weight: 0, reps: 12, sets: 3 }
              ]
            },
            {
              id: 'ex-legs-7',
              name: 'Allahy na bramce / wyciągu górnym',
              sets: 3,
              reps: 15,
              weight: 35,
              rpe: 8,
              notes: 'Mocny skurcz mięśnia prostego brzucha',
              history: [
                { date: '2026-08-20', weight: 27.5, reps: 15, sets: 3 },
                { date: '2026-08-27', weight: 30, reps: 15, sets: 3 },
                { date: '2026-09-03', weight: 35, reps: 15, sets: 3 }
              ]
            },
            {
              id: 'ex-legs-8',
              name: 'Plank (Deska)',
              sets: 3,
              reps: 60,
              weight: 0,
              rpe: 8,
              notes: 'Deska na zakończenie treningu nóg',
              history: [
                { date: '2026-08-20', weight: 0, reps: 50, sets: 3 },
                { date: '2026-08-27', weight: 0, reps: 55, sets: 3 },
                { date: '2026-09-03', weight: 0, reps: 60, sets: 3 }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'week-2',
      number: 2,
      name: 'Tydzień 2 - Progresja Ciężaru (+2.5kg)',
      startDate: '2026-09-08',
      days: [
        {
          id: 'w2-d1',
          name: 'Poniedziałek - Push (Klatka / Barki / Triceps)',
          completed: true,
          notes: 'Dodane +2.5kg na klatę poszło gładko!',
          exercises: [
            {
              id: 'ex-10',
              name: 'Wyciskanie sztangi leżąc (Bench Press)',
              sets: 4,
              reps: 8,
              weight: 87.5,
              rpe: 8.5,
              notes: 'Pobity rekord z zeszłego tygodnia',
              history: [
                { date: '2026-08-25', weight: 82.5, reps: 8, sets: 4 },
                { date: '2026-09-01', weight: 85, reps: 8, sets: 4 },
                { date: '2026-09-08', weight: 87.5, reps: 8, sets: 4 }
              ]
            },
            {
              id: 'ex-11',
              name: 'Wyciskanie hantli na skosie dodatnim',
              sets: 3,
              reps: 10,
              weight: 32,
              rpe: 9,
              notes: 'Weszło 32kg',
              history: [
                { date: '2026-08-25', weight: 28, reps: 10, sets: 3 },
                { date: '2026-09-01', weight: 30, reps: 10, sets: 3 },
                { date: '2026-09-08', weight: 32, reps: 10, sets: 3 }
              ]
            }
          ]
        },
        {
          id: 'w2-d2',
          name: 'Środa - Pull (Plecy / Biceps)',
          completed: false,
          notes: 'Cel: 145kg na martwym ciągu',
          exercises: [
            {
              id: 'ex-12',
              name: 'Martwy ciąg klasyczny (Deadlift)',
              sets: 4,
              reps: 5,
              weight: 145,
              rpe: 9,
              notes: 'Cel: 145kg',
              history: [
                { date: '2026-08-27', weight: 135, reps: 5, sets: 4 },
                { date: '2026-09-03', weight: 140, reps: 5, sets: 4 },
                { date: '2026-09-10', weight: 145, reps: 5, sets: 4 }
              ]
            }
          ]
        }
      ]
    }
  ],
  bodyWeights: [
    { id: 'bw-1', date: '2026-08-15', weight: 82.0, notes: 'Początek pomiarów rano' },
    { id: 'bw-2', date: '2026-08-22', weight: 81.6, notes: 'Na czczo po cardio' },
    { id: 'bw-3', date: '2026-08-29', weight: 81.2, notes: 'Lekki spadek retencji wody' },
    { id: 'bw-4', date: '2026-09-05', weight: 80.8, notes: 'Świetna forma, lepsza definicja' },
    { id: 'bw-5', date: '2026-09-12', weight: 80.4, notes: 'Waga stabilna, siła w górę' }
  ],
  bodyPartMeasurements: [
    { id: 'bpm-1', date: '2026-08-15', part: 'biceps', value: 37.5, notes: 'Początek mezocyklu' },
    { id: 'bpm-2', date: '2026-08-29', part: 'biceps', value: 38.0, notes: 'Dobra pompa po treningu' },
    { id: 'bpm-3', date: '2026-09-12', part: 'biceps', value: 38.5, notes: 'Na czczo rano, pełna regeneracja' },
    { id: 'bpm-4', date: '2026-08-15', part: 'triceps', value: 35.0, notes: 'Początek pomiarów' },
    { id: 'bpm-5', date: '2026-08-29', part: 'triceps', value: 35.5, notes: 'Postęp w wyciskaniu wąsko' },
    { id: 'bpm-6', date: '2026-09-12', part: 'triceps', value: 36.0, notes: 'Widoczna separacja bocznej głowy' },
    { id: 'bpm-7', date: '2026-08-15', part: 'klata', value: 106.0, notes: 'Na spokojnym wydechu' },
    { id: 'bpm-8', date: '2026-08-29', part: 'klata', value: 107.2, notes: 'Wzrost siły w wyciskaniu leżąc' },
    { id: 'bpm-9', date: '2026-09-12', part: 'klata', value: 108.5, notes: 'Wzrost obwodu klatki piersiowej' },
    { id: 'bpm-10', date: '2026-08-15', part: 'barki', value: 121.0, notes: 'Obwód obręczy barkowej' },
    { id: 'bpm-11', date: '2026-08-29', part: 'barki', value: 122.2, notes: 'Progres wznosów bokiem' },
    { id: 'bpm-12', date: '2026-09-12', part: 'barki', value: 123.5, notes: 'Poprawa proporcji V-taper' },
    { id: 'bpm-13', date: '2026-08-15', part: 'nogi', value: 60.5, notes: 'Najszerszy punkt uda rano' },
    { id: 'bpm-14', date: '2026-08-29', part: 'nogi', value: 61.2, notes: 'Po przysiadach i RDL' },
    { id: 'bpm-15', date: '2026-09-12', part: 'nogi', value: 62.0, notes: 'Gęstość czwórogłowych' }
  ],
  circumferences: [
    { id: 'circ-1', date: '2026-08-15', bodyPart: 'ramię', side: 'left', variant: 'flexed', millimeters: 375, notes: 'Start mezocyklu' },
    { id: 'circ-2', date: '2026-08-29', bodyPart: 'ramię', side: 'left', variant: 'flexed', millimeters: 380, notes: 'Po 2 tyg.' },
    { id: 'circ-3', date: '2026-09-12', bodyPart: 'ramię', side: 'left', variant: 'flexed', millimeters: 385, notes: 'Bieżący wynik' },
    { id: 'circ-4', date: '2026-08-15', bodyPart: 'klatka', side: null, variant: 'relaxed', millimeters: 1060, notes: 'Na wydechu' },
    { id: 'circ-5', date: '2026-09-12', bodyPart: 'klatka', side: null, variant: 'relaxed', millimeters: 1085, notes: 'Progres klatki' }
  ],
  protocolEntries: [
    {
      id: 'proto-1',
      date: '2026-09-01',
      time: '08:00',
      substance: 'Testosteron Enanthat',
      dosage: 250,
      unit: 'mg',
      route: 'IM',
      notes: 'Prawy pośladek, brak dyskomfortu'
    },
    {
      id: 'proto-2',
      date: '2026-09-04',
      time: '09:30',
      substance: 'HCG',
      dosage: 500,
      unit: 'IU',
      route: 'SC',
      notes: 'Podskórnie fałd brzuszny'
    },
    {
      id: 'proto-3',
      date: '2026-09-08',
      time: '08:00',
      substance: 'Testosteron Enanthat',
      dosage: 250,
      unit: 'mg',
      route: 'IM',
      notes: 'Lewy pośladek'
    },
    {
      id: 'proto-4',
      date: '2026-09-11',
      time: '09:00',
      substance: 'HCG',
      dosage: 500,
      unit: 'IU',
      route: 'SC',
      notes: 'Podskórnie brzuch'
    },
    {
      id: 'proto-5',
      date: '2026-09-15',
      time: '08:30',
      substance: 'Testosteron Enanthat',
      dosage: 250,
      unit: 'mg',
      route: 'IM',
      notes: 'Prawy pośladek'
    }
  ],
  profile: {
    id: 'prof-default',
    name: 'Pasik92',
    athleteTag: 'Pasik92 #001',
    avatarUrl: '',
    bio: 'Trening siłowy & periodyzacja falowa. Budowanie gęstości mięśniowej i czystej siły.',
    age: 32,
    heightCm: 182,
    experienceLevel: 'zaawansowany',
    primaryGoal: 'masa',
    targetWeight: 88.0,
    activityLevel: 'aktywny',
    dailyCalories: 3350,
    proteinGrams: 205,
    carbsGrams: 420,
    fatsGrams: 75,
    manualPRs: [
      {
        id: 'pr-1',
        exerciseName: 'Wyciskanie sztangi na ławce płaskiej',
        weight: 125,
        reps: 1,
        date: '2026-08-15',
        estimated1RM: 125,
        notes: 'Zatwierdzony PR z pauzą na klatce'
      },
      {
        id: 'pr-2',
        exerciseName: 'Przysiady ze sztangą na plecach (Back Squat)',
        weight: 165,
        reps: 1,
        date: '2026-08-20',
        estimated1RM: 165,
        notes: 'Głęboki przysiad poniżej kąta prostego'
      },
      {
        id: 'pr-3',
        exerciseName: 'RDL – Rumuński Martwy Ciąg ze sztangą',
        weight: 180,
        reps: 2,
        date: '2026-08-28',
        estimated1RM: 191,
        notes: 'Chwyt z paskami, kontrola fazy ekscentrycznej'
      },
      {
        id: 'pr-4',
        exerciseName: 'OHP (Wyciskanie żołnierskie sztangi stojąc)',
        weight: 80,
        reps: 3,
        date: '2026-09-02',
        estimated1RM: 85,
        notes: 'Ścisły lockout'
      }
    ],
    healthBloodworkEntries: [
      {
        id: 'hb-1',
        date: '2026-08-10',
        notes: 'Komplet badań krwi: profil hormonalny, próby wątrobowe ALT/AST i morfologia w normie.',
        jsonFileName: 'badania_krwi_2026_08_10.json',
        jsonData: '{\n  "data": "2026-08-10",\n  "testosteron": "1150 ng/dl",\n  "estradiol": "38.4 pg/ml",\n  "alt": "31 U/l",\n  "ast": "28 U/l",\n  "hematokryt": "47.8%"\n}'
      }
    ]
  },
  profilesList: [
    {
      id: 'prof-default',
      name: 'Pasik92',
      athleteTag: 'Pasik92 #001',
      avatarUrl: '',
      bio: 'Trening siłowy & periodyzacja falowa. Budowanie gęstości mięśniowej i czystej siły.',
      age: 32,
      heightCm: 182,
      experienceLevel: 'zaawansowany',
      primaryGoal: 'masa',
      targetWeight: 88.0,
      activityLevel: 'aktywny',
      dailyCalories: 3350,
      proteinGrams: 205,
      carbsGrams: 420,
      fatsGrams: 75
    }
  ],
  syncConfig: {
    serverUrl: 'http://192.168.1.100:8000',
    port: 8000,
    deviceId: 'WIN10-PASIK92-DESKTOP-MAIN',
    deviceName: 'Windows 10 Desktop (Główna stacja)',
    deviceType: 'windows_desktop',
    pairingCode: '749-182',
    authToken: 'gtp_win_sec_89df204e9c1',
    autoSync: false,
    conflictResolution: 'ask',
    lastSyncStatus: 'connected',
    lastSyncAt: '2026-09-17 08:30',
    lastSyncDetails: 'Połączono z węzłem lokalnym. Gotowość do przesyłania danych.',
    lastPingMs: 14
  },
  syncLogs: [
    {
      id: 'synclog-1',
      timestamp: '2026-09-17 08:30:12',
      direction: 'handshake',
      recordsAffected: 0,
      status: 'success',
      summary: 'Handshake nawiązany z węzłem http://192.168.1.100:8000 (Ping 14ms)'
    },
    {
      id: 'synclog-2',
      timestamp: '2026-09-16 21:15:00',
      direction: 'push_to_server',
      recordsAffected: 14,
      status: 'success',
      summary: 'Wysłano stan 6 tygodni i 12 pomiarów wagi do synchronizacji z Androidem'
    }
  ],
  catalogExercises: DEFAULT_CATALOG_EXERCISES
};

export const commonExerciseLibrary = [
  'Wyciskanie sztangi na ławce płaskiej',
  'Wyciskanie hantli na skosie dodatnim (30–45°)',
  'Rozpiętki na bramce / wyciągu',
  'OHP (Wyciskanie żołnierskie sztangi stojąc)',
  'Wznosy bokiem z hantlami lub na wyciągu',
  'Prostowanie ramion z linką za głowy (French)',
  'Prostowanie ramion na linkach wyciągu górnego',
  'Podciąganie na drążku (Nachwyt / Podchwyt)',
  'Wiosłowanie sztangą w opadzie tułowia',
  'Wiosłowanie jednorącz na wyciągu dolnym do biodra',
  'Pull-over (Przenoszenie drążka na wyciągu)',
  'Face Pulls (Przyciąganie linki do twarzy)',
  'Wznosy hantli w opadzie leżąc przodem (30–45°)',
  'Uginanie ramion ze sztangą łamaną stojąc',
  'Uginanie hantli z supinacją na ławce skośnej',
  'Uginanie młotkowe (Hantle / Linka)',
  'Prostowanie nóg na maszynie siedząc',
  'Przysiady ze sztangą na plecach (Back Squat)',
  'RDL – Rumuński Martwy Ciąg ze sztangą',
  'Wykroki chodzone z hantlami',
  'Wspięcia na palce stojąc',
  'Unoszenie nóg w wiszeniu na drążku',
  'Allahy na bramce / wyciągu górnym',
  'Plank (Deska)'
];
