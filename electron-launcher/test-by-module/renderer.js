const moduleSelect = document.getElementById('moduleSelect');
const watchMode = document.getElementById('watchMode');
const coverageMode = document.getElementById('coverageMode');
const statusEl = document.getElementById('status');
const runButton = document.getElementById('runButton');
const cancelButton = document.getElementById('cancelButton');

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
  moduleSelect.replaceChildren();

  for (const name of modules) {
    const option = document.createElement('option');
    option.value = name;
    option.textContent = name;
    moduleSelect.appendChild(option);
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

async function runTests() {
  const moduleName = String(moduleSelect.value || '').trim();
  if (!moduleName) {
    setStatus('Select a module first.', true);
    return;
  }

  setBusy(true);
  setStatus(`Starting tests for ${moduleName}...`);

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

cancelButton.addEventListener('click', () => {
  void window.testByModuleApi.closeApp();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    event.preventDefault();
    void window.testByModuleApi.closeApp();
    return;
  }

  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
    event.preventDefault();
    void runTests();
  }
});

void loadModules();
