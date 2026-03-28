const moduleSelect = document.getElementById('moduleSelect');
const watchMode = document.getElementById('watchMode');
const coverageMode = document.getElementById('coverageMode');
const statusEl = document.getElementById('status');
const runButton = document.getElementById('runButton');
const cancelButton = document.getElementById('cancelButton');
let persistedSelection = { moduleName: '', watch: false, coverage: false };

function readSavedSelection() {
  return {
    moduleName: String(persistedSelection?.moduleName || '').trim(),
    watch: Boolean(persistedSelection?.watch),
    coverage: Boolean(persistedSelection?.coverage),
  };
}

function saveSelection() {
  const previous = readSavedSelection();
  const currentModuleName = String(moduleSelect.value || '').trim();
  const payload = {
    moduleName: currentModuleName || previous.moduleName,
    watch: Boolean(watchMode.checked),
    coverage: Boolean(coverageMode.checked),
  };

  persistedSelection = payload;
  void window.testByModuleApi.setPrefs(payload);
}

function setStatus(message, isError = false) {
  statusEl.textContent = String(message || '').trim();
  statusEl.classList.toggle('error', Boolean(isError));
}

function setBusy(isBusy) {
  moduleSelect.disabled = isBusy;
  watchMode.disabled = isBusy;
  coverageMode.disabled = isBusy;
  runButton.disabled = isBusy || moduleSelect.options.length === 0;
  cancelButton.disabled = isBusy;
  runButton.textContent = isBusy ? 'Running...' : 'Run tests';
}

function renderModules(modules) {
  const saved = readSavedSelection();
  moduleSelect.replaceChildren();

  for (const name of modules) {
    const option = document.createElement('option');
    option.value = name;
    option.textContent = name;
    moduleSelect.appendChild(option);
  }

  if (modules.length > 0) {
    const savedNormalized = String(saved.moduleName || '').trim().toLowerCase();
    const exactMatch = modules.includes(saved.moduleName);
    const insensitiveMatch =
      modules.find((name) => String(name || '').trim().toLowerCase() === savedNormalized) || '';
    moduleSelect.value = exactMatch ? saved.moduleName : insensitiveMatch || modules[0];
  }

  runButton.disabled = modules.length === 0;
}

async function loadModules() {
  setBusy(true);
  setStatus('Loading modules...');

  try {
    const result = await window.testByModuleApi.listModules();
    if (!result?.ok) {
      renderModules([]);
      setStatus(result?.error || 'Could not load modules.', true);
      return;
    }

    renderModules(result.modules || []);
    if ((result.modules || []).length === 0) {
      setStatus('No modules available.', true);
      return;
    }

    setStatus(`Ready. ${result.modules.length} modules available.`);
  } catch (error) {
    renderModules([]);
    setStatus(error?.message || String(error), true);
  } finally {
    setBusy(false);
  }
}

async function loadPrefs() {
  try {
    const result = await window.testByModuleApi.getPrefs();
    if (!result?.ok) {
      return;
    }

    persistedSelection = {
      moduleName: String(result?.prefs?.moduleName || '').trim(),
      watch: Boolean(result?.prefs?.watch),
      coverage: Boolean(result?.prefs?.coverage),
    };

    watchMode.checked = persistedSelection.watch;
    coverageMode.checked = persistedSelection.coverage;
  } catch {
    // Keep defaults when prefs cannot be loaded.
  }
}

async function runTests() {
  const moduleName = String(moduleSelect.value || '').trim();
  if (!moduleName) {
    setStatus('Select a module first.', true);
    return;
  }

  setBusy(true);
  setStatus(`Starting tests for ${moduleName}...`);
  saveSelection();

  try {
    const result = await window.testByModuleApi.runTests({
      moduleName,
      watch: Boolean(watchMode.checked),
      coverage: Boolean(coverageMode.checked),
    });

    if (!result?.ok) {
      setStatus(result?.error || 'Could not start test command.', true);
      setBusy(false);
      return;
    }

    setStatus('Command started. Running in terminal...');
  } catch (error) {
    setStatus(error?.message || String(error), true);
    setBusy(false);
  }
}

runButton.addEventListener('click', () => {
  void runTests();
});

moduleSelect.addEventListener('change', () => {
  saveSelection();
});

moduleSelect.addEventListener('input', () => {
  saveSelection();
});

watchMode.addEventListener('change', () => {
  saveSelection();
});

coverageMode.addEventListener('change', () => {
  saveSelection();
});

cancelButton.addEventListener('click', () => {
  saveSelection();
  void window.testByModuleApi.closeApp();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    event.preventDefault();
    saveSelection();
    void window.testByModuleApi.closeApp();
    return;
  }

  if (event.key === 'Enter') {
    event.preventDefault();
    if (document.activeElement === cancelButton) {
      saveSelection();
      void window.testByModuleApi.closeApp();
      return;
    }

    void runTests();
  }
});

window.addEventListener('beforeunload', () => {
  saveSelection();
});

async function init() {
  await loadPrefs();
  await loadModules();
}

void init();
