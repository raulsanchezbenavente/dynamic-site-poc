const titleEl = document.getElementById('title');
const subtitleEl = document.getElementById('subtitle');
const optionsEl = document.getElementById('options');
const moduleSelect = document.getElementById('moduleSelect');
const statusEl = document.getElementById('status');
const runButton = document.getElementById('runButton');
const cancelButton = document.getElementById('cancelButton');

function detectMode() {
  if (globalThis.testByModuleApi) {
    const testsReadyStatus = (withCount, withoutCount) => {
      const suffix = withoutCount > 0 ? ` and ${withoutCount} without tests` : '';
      return `Ready. ${withCount} modules with tests${suffix}.`;
    };

    return {
      id: 'tests',
      title: 'Run Unit Tests by Module',
      subtitle: 'Select a module and run its specs from the terminal.',
      runIdleLabel: 'Run tests',
      runBusyLabel: 'Running...',
      loadingStatus: 'Loading modules...',
      emptyStatus: 'No modules available.',
      missingFeatureStatus: (total) => `Ready. ${total} modules found, but none have tests.`,
      readyStatus: testsReadyStatus,
      selectFirstStatus: 'Select a module first.',
      runStartingStatus: (name) => `Starting tests for ${name}...`,
      runFailedStatus: 'Could not start test command.',
      successStatus: 'Command started. Running in terminal...',
      withGroupLabel: 'Modules with tests',
      withoutGroupLabel: 'Modules without tests',
      capabilityKey: 'hasSpecs',
      runActionName: 'runTests',
      api: globalThis.testByModuleApi,
      prefsDefaults: { moduleName: '', watch: false, coverage: false },
      buildRunPayload: ({ moduleName, watch, coverage }) => ({
        moduleName,
        watch: Boolean(watch),
        coverage: Boolean(coverage),
      }),
      createOptions() {
        const watchLabel = document.createElement('label');
        watchLabel.className = 'check-row';

        const watchInput = document.createElement('input');
        watchInput.id = 'watchMode';
        watchInput.type = 'checkbox';

        watchLabel.appendChild(watchInput);
        watchLabel.appendChild(document.createTextNode('Watch mode'));

        const coverageLabel = document.createElement('label');
        coverageLabel.className = 'check-row';

        const coverageInput = document.createElement('input');
        coverageInput.id = 'coverageMode';
        coverageInput.type = 'checkbox';

        coverageLabel.appendChild(coverageInput);
        coverageLabel.appendChild(document.createTextNode('Coverage'));

        optionsEl.replaceChildren(watchLabel, coverageLabel);
        return { watchInput, coverageInput };
      },
    };
  }

  if (globalThis.storybookByModuleApi) {
    const storybookReadyStatus = (withCount, withoutCount) => {
      const suffix = withoutCount > 0 ? ` and ${withoutCount} without Storybook` : '';
      return `Ready. ${withCount} modules with Storybook${suffix}.`;
    };

    return {
      id: 'storybook',
      title: 'Run Storybook by Module',
      subtitle: 'Select a module and start its Storybook target from the terminal.',
      runIdleLabel: 'Run Storybook',
      runBusyLabel: 'Running...',
      loadingStatus: 'Loading modules...',
      emptyStatus: 'No modules available.',
      missingFeatureStatus: (total) => `Ready. ${total} modules found, but none have Storybook configured.`,
      readyStatus: storybookReadyStatus,
      selectFirstStatus: 'Select a module first.',
      runStartingStatus: (name) => `Starting Storybook for ${name} on port 6006...`,
      runFailedStatus: 'Could not start Storybook command.',
      successStatus: 'Command started. Running in terminal...',
      withGroupLabel: 'Modules with Storybook',
      withoutGroupLabel: 'Modules without Storybook',
      capabilityKey: 'hasStorybook',
      runActionName: 'runStorybook',
      api: globalThis.storybookByModuleApi,
      prefsDefaults: { moduleName: '' },
      buildRunPayload: ({ moduleName }) => ({ moduleName }),
      createOptions() {
        optionsEl.replaceChildren();
        return { watchInput: null, coverageInput: null };
      },
    };
  }

  return null;
}

const mode = detectMode();

if (!mode) {
  throw new Error('No by-module API detected in preload context.');
}

titleEl.textContent = mode.title;
subtitleEl.textContent = mode.subtitle;
runButton.textContent = mode.runIdleLabel;
setStatus(mode.loadingStatus);

const optionRefs = mode.createOptions();
let persistedSelection = { ...mode.prefsDefaults };

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
    watch: Boolean(optionRefs.watchInput?.checked),
    coverage: Boolean(optionRefs.coverageInput?.checked),
  };

  persistedSelection = {
    ...mode.prefsDefaults,
    ...payload,
  };

  mode.api.setPrefs(persistedSelection).catch(() => {
    // Preferences are best-effort and should not block launcher usage.
  });
}

function setStatus(message, isError = false) {
  statusEl.textContent = String(message || '').trim();
  statusEl.classList.toggle('error', Boolean(isError));
}

function hasCapability(item) {
  if (typeof item === 'string') {
    return true;
  }

  return Boolean(item?.[mode.capabilityKey]);
}

function normalizeModule(item) {
  if (typeof item === 'string') {
    return { name: item, enabled: true };
  }

  const name = String(item?.name || '').trim();
  if (!name) {
    return null;
  }

  return {
    name,
    enabled: hasCapability(item),
  };
}

function setBusy(isBusy) {
  moduleSelect.disabled = isBusy;
  if (optionRefs.watchInput) {
    optionRefs.watchInput.disabled = isBusy;
  }
  if (optionRefs.coverageInput) {
    optionRefs.coverageInput.disabled = isBusy;
  }

  const selectedOption = moduleSelect.selectedOptions?.[0] || null;
  const canRunSelected = Boolean(selectedOption) && !selectedOption.disabled;
  runButton.disabled = isBusy || !canRunSelected;
  cancelButton.disabled = isBusy;
  runButton.textContent = isBusy ? mode.runBusyLabel : mode.runIdleLabel;
}

function renderModules(modules) {
  const saved = readSavedSelection();
  const normalizedModules = Array.isArray(modules) ? modules.map(normalizeModule).filter(Boolean) : [];

  const enabled = normalizedModules.filter((item) => item.enabled).sort((a, b) => a.name.localeCompare(b.name));
  const disabled = normalizedModules.filter((item) => !item.enabled).sort((a, b) => a.name.localeCompare(b.name));

  moduleSelect.replaceChildren();

  if (enabled.length > 0) {
    const enabledGroup = document.createElement('optgroup');
    enabledGroup.label = mode.withGroupLabel;

    for (const moduleItem of enabled) {
      const option = document.createElement('option');
      option.value = moduleItem.name;
      option.textContent = moduleItem.name;
      enabledGroup.appendChild(option);
    }

    moduleSelect.appendChild(enabledGroup);
  }

  if (disabled.length > 0) {
    const disabledGroup = document.createElement('optgroup');
    disabledGroup.label = mode.withoutGroupLabel;

    for (const moduleItem of disabled) {
      const option = document.createElement('option');
      option.value = moduleItem.name;
      option.textContent = moduleItem.name;
      option.disabled = true;
      disabledGroup.appendChild(option);
    }

    moduleSelect.appendChild(disabledGroup);
  }

  if (enabled.length > 0 || disabled.length > 0) {
    const savedNormalized = String(saved.moduleName || '')
      .trim()
      .toLowerCase();
    const enabledNames = enabled.map((item) => item.name);
    const exactMatch = enabledNames.includes(saved.moduleName);
    const insensitiveMatch =
      enabledNames.find(
        (name) =>
          String(name || '')
            .trim()
            .toLowerCase() === savedNormalized
      ) || '';
    const defaultValue = exactMatch ? saved.moduleName : insensitiveMatch || enabledNames[0] || '';
    if (defaultValue) {
      moduleSelect.value = defaultValue;
    }
  }

  runButton.disabled = enabled.length === 0;
}

async function loadModules() {
  setBusy(true);
  setStatus(mode.loadingStatus);

  try {
    const result = await mode.api.listModules();
    if (!result?.ok) {
      renderModules([]);
      setStatus(result?.error || 'Could not load modules.', true);
      return;
    }

    const modules = result.modules || [];
    renderModules(modules);

    if (modules.length === 0) {
      setStatus(mode.emptyStatus, true);
      return;
    }

    const enabledCount = modules.filter(hasCapability).length;
    const disabledCount = Math.max(0, modules.length - enabledCount);

    if (enabledCount === 0) {
      setStatus(mode.missingFeatureStatus(modules.length), true);
      return;
    }

    setStatus(mode.readyStatus(enabledCount, disabledCount));
  } catch (error) {
    renderModules([]);
    setStatus(error?.message || String(error), true);
  } finally {
    setBusy(false);
  }
}

async function loadPrefs() {
  try {
    const result = await mode.api.getPrefs();
    if (!result?.ok) {
      return;
    }

    persistedSelection = {
      ...mode.prefsDefaults,
      moduleName: String(result?.prefs?.moduleName || '').trim(),
      watch: Boolean(result?.prefs?.watch),
      coverage: Boolean(result?.prefs?.coverage),
    };

    if (optionRefs.watchInput) {
      optionRefs.watchInput.checked = persistedSelection.watch;
    }

    if (optionRefs.coverageInput) {
      optionRefs.coverageInput.checked = persistedSelection.coverage;
    }
  } catch {
    // Keep defaults when prefs cannot be loaded.
  }
}

async function runAction() {
  const moduleName = String(moduleSelect.value || '').trim();
  if (!moduleName) {
    setStatus(mode.selectFirstStatus, true);
    return;
  }

  setBusy(true);
  setStatus(mode.runStartingStatus(moduleName));
  saveSelection();

  try {
    const result = await mode.api[mode.runActionName](
      mode.buildRunPayload({
        moduleName,
        watch: Boolean(optionRefs.watchInput?.checked),
        coverage: Boolean(optionRefs.coverageInput?.checked),
      })
    );

    if (!result?.ok) {
      setStatus(result?.error || mode.runFailedStatus, true);
      setBusy(false);
      return;
    }

    setStatus(mode.successStatus);
  } catch (error) {
    setStatus(error?.message || String(error), true);
    setBusy(false);
  }
}

runButton.addEventListener('click', () => {
  void runAction();
});

moduleSelect.addEventListener('change', () => {
  saveSelection();
});

moduleSelect.addEventListener('input', () => {
  saveSelection();
});

if (optionRefs.watchInput) {
  optionRefs.watchInput.addEventListener('change', () => {
    saveSelection();
  });
}

if (optionRefs.coverageInput) {
  optionRefs.coverageInput.addEventListener('change', () => {
    saveSelection();
  });
}

cancelButton.addEventListener('click', () => {
  saveSelection();
  mode.api.closeApp().catch(() => {
    // No-op: app close failures are handled on the main process side.
  });
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    event.preventDefault();
    saveSelection();
    mode.api.closeApp().catch(() => {
      // No-op: app close failures are handled on the main process side.
    });
    return;
  }

  if (event.key === 'Enter') {
    event.preventDefault();
    if (document.activeElement === cancelButton) {
      saveSelection();
      mode.api.closeApp().catch(() => {
        // No-op: app close failures are handled on the main process side.
      });
      return;
    }

    void runAction();
  }
});

globalThis.addEventListener('beforeunload', () => {
  saveSelection();
});

async function init() {
  await loadPrefs();
  await loadModules();
}

init().catch((error) => {
  setStatus(error?.message || String(error), true);
});
