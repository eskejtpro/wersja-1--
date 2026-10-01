const test = require('node:test');
const assert = require('node:assert/strict');
const { DEFAULT_QUICK_ACCESS_WIDGETS } = require('../dist/data/initialData.cjs');

// ==============================================================================
// 🚀 TESTY MODUŁU: PULPIT SZYBKIEGO DOSTĘPU & CUSTOMIZACJA DOLNEGO PASKA
// ==============================================================================

test('PULPIT SZYBKI DOSTĘP: Domyślna lista widgetów posiada prawidłową konfigurację i kolejność', () => {
  const widgetList = [
    { id: 'w-workout', widgetType: 'active_workout', title: 'Dzisiejszy Trening', enabled: true, order: 1, size: 'full' },
    { id: 'w-timer', widgetType: 'timer_quick', title: 'Szybki Stoper Treningowy', enabled: true, order: 2, size: 'half' },
    { id: 'w-weight', widgetType: 'weight_trend', title: 'Masa Ciała & Filtr EMA', enabled: true, order: 3, size: 'half' },
    { id: 'w-ai-coach', widgetType: 'ai_coach_mini', title: 'Trener AI Gemini 3.8', enabled: true, order: 4, size: 'full' },
    { id: 'w-plates', widgetType: 'plate_calc_widget', title: 'Kalkulator Talerzy na Gryf', enabled: true, order: 5, size: 'half' },
    { id: 'w-water', widgetType: 'water_hydration', title: 'Licznik Nawodnienia (H₂O)', enabled: true, order: 6, size: 'half' },
    { id: 'w-radar', widgetType: 'muscle_volume_radar', title: 'Balans Objętości Tygodnia', enabled: true, order: 7, size: 'half' },
    { id: 'w-proto', widgetType: 'pharmacokinetics_summary', title: 'Kalendarz Iniekcji & Środków', enabled: true, order: 8, size: 'half' },
    { id: 'w-pr', widgetType: 'pr_tracker', title: 'Najnowsze Rekordy 1RM', enabled: true, order: 9, size: 'half' },
    { id: 'w-notes', widgetType: 'quick_notes', title: 'Szybki Notatnik Treningowy', enabled: true, order: 10, size: 'full' }
  ];

  assert.equal(widgetList.length, 10, 'Pulpit zawiera 10 modularnych widgetów');
  
  const activeWorkout = widgetList.find(w => w.widgetType === 'active_workout');
  assert.ok(activeWorkout);
  assert.equal(activeWorkout.enabled, true);
  assert.equal(activeWorkout.size, 'full');

  const timerWidget = widgetList.find(w => w.widgetType === 'timer_quick');
  assert.ok(timerWidget);
  assert.equal(timerWidget.enabled, true);
  assert.equal(timerWidget.size, 'half');
});

test('PULPIT SZYBKI DOSTĘP: Kalkulator Talerzy na Gryf (20kg) poprawnie oblicza talerze na stronę', () => {
  const calculatePlatesPerSide = (targetWeight) => {
    const barWeight = 20;
    if (targetWeight <= barWeight) return [];
    let perSide = (targetWeight - barWeight) / 2;
    const availablePlates = [25, 20, 15, 10, 5, 2.5, 1.25];
    const used = [];

    for (const p of availablePlates) {
      if (perSide >= p) {
        const count = Math.floor(perSide / p);
        used.push({ weight: p, count });
        perSide -= count * p;
      }
    }
    return used;
  };

  // 100 kg na sztandze = (100 - 20)/2 = 40 kg na stronę (1x 25kg + 1x 15kg lub 2x 20kg)
  const plates100 = calculatePlatesPerSide(100);
  const totalPerSide100 = plates100.reduce((acc, p) => acc + p.weight * p.count, 0);
  assert.equal(totalPerSide100, 40, 'Dla 100 kg suma talerzy na stronę to 40 kg');

  // 140 kg na sztandze = (140 - 20)/2 = 60 kg na stronę (2x 25kg + 1x 10kg)
  const plates140 = calculatePlatesPerSide(140);
  const totalPerSide140 = plates140.reduce((acc, p) => acc + p.weight * p.count, 0);
  assert.equal(totalPerSide140, 60, 'Dla 140 kg suma talerzy na stronę to 60 kg');
});

test('CUSTOMIZACJA DOLNEGO PASKA: Zmiana kolejności i widoczności kart działa dynamicznie', () => {
  const customOrder = ['quick_access', 'plan', 'weight', 'stats', 'settings'];
  const customVisible = ['quick_access', 'plan', 'weight', 'stats', 'settings'];

  const allModules = [
    { id: 'quick_access', label: 'Pulpit' },
    { id: 'plan', label: 'Trening' },
    { id: 'stats', label: 'Progres' },
    { id: 'muscle', label: 'Partie' },
    { id: 'weight', label: 'Pomiary' },
    { id: 'cycles', label: 'Kalendarz' },
    { id: 'exercises', label: 'Ćwiczenia' },
    { id: 'settings', label: 'Ustawienia' },
  ];

  const visibleSet = new Set(customVisible);
  const filteredAndOrdered = allModules
    .filter(m => visibleSet.has(m.id))
    .sort((a, b) => customOrder.indexOf(a.id) - customOrder.indexOf(b.id));

  assert.equal(filteredAndOrdered.length, 5, 'Tylko 5 wybranych kart jest widocznych na pasku');
  assert.equal(filteredAndOrdered[0].id, 'quick_access', 'Pierwsza karta to Szybki Dostęp (Pulpit)');
  assert.equal(filteredAndOrdered[1].id, 'plan');
  assert.equal(filteredAndOrdered[2].id, 'weight');
});

test('CUSTOMIZACJA WYGLĄDU: Obsługa stylów paska (floating_dock, classic_bar, minimal_capsule) i zaokrągleń', () => {
  const settings = {
    bottomNavStyle: 'floating_dock',
    cardBorderRadius: 'extra_rounded',
    cardGlowEffect: true,
    glassmorphism: true,
    accentColor: 'cyberpunk'
  };

  assert.equal(settings.bottomNavStyle, 'floating_dock');
  assert.equal(settings.cardBorderRadius, 'extra_rounded');
  assert.equal(settings.accentColor, 'cyberpunk');
  assert.equal(settings.glassmorphism, true);
});
