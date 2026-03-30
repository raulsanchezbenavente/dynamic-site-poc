const moduleSelect = document.getElementById('moduleSelect');
const statusEl = document.getElementById('status');
const runButton = document.getElementById('runButton');
const cancelButton = document.getElementById('cancelButton');
let persistedSelection = { moduleName: '' };
let moduleMetaByName = new Map();

function readSavedSelection() {
  return {
    moduleName: String(persistedSelection?.moduleName || '').trim(),
  };
}

function saveSelection() {
  const previous = readSavedSelection();
  const currentModuleName = String(moduleSelect.value || '').trim();
  const payload = {
    moduleName: currentModuleName || previous.moduleName,
  };

  persistedSelection = payload;
  void window.storybookByModuleApi.setPrefs(payload);
}

function setStatus(message, isError = false) {
  statusEl.textContent = String(message || '').trim();
  statusEl.classList.toggle('error', Boolean(isError));
}

function setBusy(isBusy) {
  moduleSelect.disabled = isBusy;
  const selectedOption = moduleSelect.selectedOptions?.[0] || null;
  const canRunSelected = Boolean(selectedOption) && !selectedOption.disabled;
  runButton.disabled = isBusy || !canRunSelected;
  cancelButton.disabled = isBusy;
  runButton.textContent = isBusy ? 'Running...' : 'Run Storybook';
}

function renderModules(modules) {
  const saved = readSavedSelection();
  const normalizedModules = Array.isArray(modules)
    ? modules
        .map((item) => {
          const name = String(item?.name || '').trim();
          if (!name) {
            return null;
          }

          return {
            name,
            hasStorybook: Boolean(item?.hasStorybook),
          };
        })
        .filter(Boolean)
    : [];

  moduleMetaByName = new Map(normalizedModules.map((item) => [item.name, item]));

  const withStorybook = normalizedModules
    .filter((item) => item.hasStorybook)
    .sort((a, b) => a.name.localeCompare(b.name));
  const withoutStorybook = normalizedModules
    .filter((item) => !item.hasStorybook)
    .sort((a, b) => a.name.localeCompare(b.name));

  moduleSelect.replaceChildren();

  if (withStorybook.length > 0) {
    const withGroup = document.createElement('optgroup');
    withGroup.label = 'Modules with Storybook';

    for (const moduleItem of withStorybook) {
      const option = document.createElement('option');
      option.value = moduleItem.name;
      option.textContent = moduleItem.name;
      withGroup.appendChild(option);
    }

    moduleSelect.appendChild(withGroup);
  }

  if (withoutStorybook.length > 0) {
    const withoutGroup = document.createElement('optgroup');
    withoutGroup.label = 'Modules without Storybook';

    for (const moduleItem of withoutStorybook) {
      const option = document.createElement('option');
      option.value = moduleItem.name;
      option.textContent = moduleItem.name;
      option.disabled = true;
      withoutGroup.appendChild(option);
    }

    moduleSelect.appendChild(withoutGroup);
  }

  if (withStorybook.length > 0 || withoutStorybook.length > 0) {
    const savedNormalized = String(saved.moduleName || '')
      .trim()
      .toLowerCase();
    const withNames = withStorybook.map((item) => item.name);
    const exactMatch = withNames.includes(saved.moduleName);
    const insensitiveMatch =
      withNames.find(
        (name) =>
          String(name || '')
            .trim()
            .toLowerCase() === savedNormalized
      ) || '';
    const defaultValue = exactMatch ? saved.moduleName : insensitiveMatch || withNames[0] || '';
    if (defaultValue) {
      moduleSelect.value = defaultValue;
    }
  }

  runButton.disabled = withStorybook.length === 0;
}

async function loadModules() {
  setBusy(true);
  setStatus('Loading modules...');

  try {
    const result = await window.storybookByModuleApi.listModules();
    if (!result?.ok) {
      renderModules([]);
      setStatus(result?.error || 'Could not load modules.', true);
      return;
    }

    const modules = result.modules || [];
    renderModules(modules);
    if (modules.length === 0) {
      setStatus('No modules available.', true);
      return;
    }

    const withStorybook = modules.filter((item) => Boolean(item?.hasStorybook)).length;
    const withoutStorybook = Math.max(0, modules.length - withStorybook);

    if (withStorybook === 0) {
      setStatus(`Ready. ${modules.length} modules found, but none have Storybook configured.`, true);
      return;
    }

    setStatus(
      `Ready. ${withStorybook} modules with Storybook${withoutStorybook > 0 ? ` and ${withoutStorybook} without Storybook` : ''}.`
    );
  } catch (error) {
    renderModules([]);
    setStatus(error?.message || String(error), true);
  } finally {
    setBusy(false);
  }
}

async function loadPrefs() {
  try {
    const result = await window.storybookByModuleApi.getPrefs();
    if (!result?.ok) {
      return;
    }

    persistedSelection = {
      moduleName: String(result?.prefs?.moduleName || '').trim(),
    };
  } catch {
    // Keep defaults when prefs cannot be loaded.
  }
}

async function runStorybook() {
  const moduleName = String(moduleSelect.value || '').trim();
  if (!moduleName) {
    setStatus('Select a module first.', true);
    return;
  }

  setBusy(true);
  setStatus(`Starting Storybook for ${moduleName} on port 6006...`);
  saveSelection();

  try {
    const result = await window.storybookByModuleApi.runStorybook({
      moduleName,
    });

    if (!result?.ok) {
      setStatus(result?.error || 'Could not start Storybook command.', true);
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
  void runStorybook();
});

moduleSelect.addEventListener('change', () => {
  saveSelection();
});

moduleSelect.addEventListener('input', () => {
  saveSelection();
});

cancelButton.addEventListener('click', () => {
  saveSelection();
  void window.storybookByModuleApi.closeApp();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    event.preventDefault();
    saveSelection();
    void window.storybookByModuleApi.closeApp();
    return;
  }

  if (event.key === 'Enter') {
    event.preventDefault();
    if (document.activeElement === cancelButton) {
      saveSelection();
      void window.storybookByModuleApi.closeApp();
      return;
    }

    void runStorybook();
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
