const scriptsList = document.getElementById('scriptsList');
const logsEl = document.getElementById('logs');
const logTabsEl = document.getElementById('logTabs');
const refreshButton = document.getElementById('refreshButton');
const quitButton = document.getElementById('quitButton');
const clearLogsButton = document.getElementById('clearLogsButton');
const terminalThemeTrigger = document.getElementById('terminalThemeTrigger');
const terminalThemeText = document.getElementById('terminalThemeText');
const terminalThemePreview = document.getElementById('terminalThemePreview');
const terminalThemeMenu = document.getElementById('terminalThemeMenu');
const terminalThemeOptions = Array.from(document.querySelectorAll('.terminal-theme-option'));
const packageSourceSelect = document.getElementById('packageSourceSelect');
const packageSourcePath = document.getElementById('packageSourcePath');
const filterRunningCheckbox = document.getElementById('filterRunningCheckbox');
const filterFavoritesCheckbox = document.getElementById('filterFavoritesCheckbox');

const FILTER_STATE_STORAGE_KEY = 'launcher.filters.v1';
const FAVORITES_STORAGE_KEY = 'launcher.favorites.v1';
const TERMINAL_THEME_STORAGE_KEY = 'launcher.terminal-theme.v1';
const TERMINAL_THEMES = new Set(['ocean', 'light', 'solarized-light', 'red', 'solarized-dark', 'dark']);
const TERMINAL_THEME_LABELS = {
  ocean: 'Ocean',
  light: 'Light',
  'solarized-light': 'Solarized Light',
  red: 'Red',
  'solarized-dark': 'Solarized Dark',
  dark: 'Dark',
};

let scriptsState = [];
let activeLogTab = 'all';
const logsByScript = new Map([['all', []]]);
let favoriteScripts = new Set();

let packageSourceState = null;
const urlPattern = /https?:\/\/[^\s<>"]+/gi;

function trimTrailingUrlPunctuation(urlText) {
  let trimmed = urlText;
  let trailing = '';

  while (/[),.;!?]$/.test(trimmed)) {
    trailing = trimmed.slice(-1) + trailing;
    trimmed = trimmed.slice(0, -1);
  }

  return { url: trimmed, trailing };
}

function appendLogTextWithLinks(container, text) {
  let lastIndex = 0;
  urlPattern.lastIndex = 0;

  for (const match of text.matchAll(urlPattern)) {
    const rawUrl = match[0];
    const matchIndex = match.index ?? 0;

    if (matchIndex > lastIndex) {
      container.appendChild(document.createTextNode(text.slice(lastIndex, matchIndex)));
    }

    const { url, trailing } = trimTrailingUrlPunctuation(rawUrl);
    if (url.length > 0) {
      const link = document.createElement('a');
      link.className = 'log-link';
      link.href = url;
      link.textContent = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.addEventListener('click', async (event) => {
        event.preventDefault();
        await window.launcherApi.openExternal(url);
      });
      container.appendChild(link);
    }

    if (trailing) {
      container.appendChild(document.createTextNode(trailing));
    }

    lastIndex = matchIndex + rawUrl.length;
  }

  if (lastIndex < text.length) {
    container.appendChild(document.createTextNode(text.slice(lastIndex)));
  }
}

function ensureLogBucket(scriptName) {
  if (!logsByScript.has(scriptName)) {
    logsByScript.set(scriptName, []);
  }
}

function getTabNames() {
  const names = new Set(['all']);

  for (const script of scriptsState) {
    if (script.running) {
      names.add(script.name);
    }
  }

  for (const key of logsByScript.keys()) {
    names.add(key);
  }

  return Array.from(names);
}

function renderLogs() {
  logsEl.replaceChildren();
  const bucket = logsByScript.get(activeLogTab) ?? [];

  for (const entry of bucket) {
    const line = document.createElement('pre');
    line.className = `log-line ${entry.stream}`;
    const lineText = activeLogTab === 'all' ? `[${entry.script}] ${entry.message}` : entry.message;
    appendLogTextWithLinks(line, lineText);
    logsEl.appendChild(line);
  }

  logsEl.scrollTop = logsEl.scrollHeight;
}

function renderLogTabs() {
  const tabNames = getTabNames();

  if (!tabNames.includes(activeLogTab)) {
    activeLogTab = 'all';
  }

  logTabsEl.replaceChildren();

  for (const tabName of tabNames) {
    const tab = document.createElement('button');
    tab.type = 'button';
    tab.role = 'tab';
    tab.className = `log-tab ${tabName === activeLogTab ? 'active' : ''}`;
    tab.textContent = tabName;
    tab.setAttribute('aria-selected', String(tabName === activeLogTab));
    tab.addEventListener('click', () => {
      activeLogTab = tabName;
      renderLogTabs();
      renderLogs();
    });
    logTabsEl.appendChild(tab);
  }
}

function appendLog({ script, stream, message }) {
  ensureLogBucket(script);

  const entry = { script, stream, message };
  logsByScript.get(script).push(entry);
  logsByScript.get('all').push(entry);

  renderLogTabs();
  renderLogs();
}

function focusScriptLogTab(scriptName) {
  ensureLogBucket(scriptName);
  activeLogTab = scriptName;
  renderLogTabs();
  renderLogs();
}

function updatePackageSourceUi() {
  if (!packageSourceState) {
    return;
  }

  packageSourceSelect.value = packageSourceState.mode;

  const stateLabel = packageSourceState.exists ? 'OK' : 'NOT FOUND';
  packageSourcePath.textContent = `${stateLabel}: ${packageSourceState.selectedPath}`;
  packageSourcePath.classList.toggle('invalid', !packageSourceState.exists);
}

async function refreshPackageSourceUi() {
  packageSourceState = await window.launcherApi.getPackageSource();
  updatePackageSourceUi();
}

async function applyPackageSource(mode, customPath = null) {
  const payload = customPath ? { mode, customPath } : { mode };
  packageSourceState = await window.launcherApi.setPackageSource(payload);
  updatePackageSourceUi();
  await refreshScripts();
}

async function chooseCustomPackageJson() {
  const selectedPath = await window.launcherApi.pickCustomPackageJson();
  if (!selectedPath) {
    return false;
  }

  await applyPackageSource('custom', selectedPath);
  return true;
}

async function onPackageSourceChange() {
  const mode = packageSourceSelect.value;

  if (mode === 'custom') {
    const selected = await chooseCustomPackageJson();
    if (!selected) {
      await refreshPackageSourceUi();
    }
    return;
  }

  await applyPackageSource(mode);
}

function clearLogs() {
  if (activeLogTab === 'all') {
    logsByScript.clear();
    logsByScript.set('all', []);
  } else {
    const allLogs = logsByScript.get('all') ?? [];
    const filteredAllLogs = allLogs.filter((entry) => entry.script !== activeLogTab);

    logsByScript.set('all', filteredAllLogs);
    logsByScript.delete(activeLogTab);
  }

  renderLogTabs();
  renderLogs();
}

function readSavedFilters() {
  try {
    const raw = window.localStorage.getItem(FILTER_STATE_STORAGE_KEY);
    if (!raw) {
      return { running: false, favorites: false };
    }

    const parsed = JSON.parse(raw);
    return {
      running: Boolean(parsed?.running),
      favorites: Boolean(parsed?.favorites),
    };
  } catch {
    return { running: false, favorites: false };
  }
}

function saveFilters() {
  const payload = {
    running: Boolean(filterRunningCheckbox?.checked),
    favorites: Boolean(filterFavoritesCheckbox?.checked),
  };

  window.localStorage.setItem(FILTER_STATE_STORAGE_KEY, JSON.stringify(payload));
}

function restoreFilters() {
  const saved = readSavedFilters();

  if (filterRunningCheckbox) {
    filterRunningCheckbox.checked = saved.running;
  }

  if (filterFavoritesCheckbox) {
    filterFavoritesCheckbox.checked = saved.favorites;
  }
}

function readSavedFavorites() {
  try {
    const raw = window.localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (!raw) {
      return new Set();
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return new Set();
    }

    const favorites = parsed.filter((name) => typeof name === 'string' && name.length > 0);
    return new Set(favorites);
  } catch {
    return new Set();
  }
}

function saveFavorites() {
  const payload = Array.from(favoriteScripts).sort();
  window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(payload));
}

function isFavoriteScript(scriptName) {
  return favoriteScripts.has(scriptName);
}

function toggleFavoriteScript(scriptName) {
  if (favoriteScripts.has(scriptName)) {
    favoriteScripts.delete(scriptName);
  } else {
    favoriteScripts.add(scriptName);
  }

  saveFavorites();
  renderScripts();
}

function applyTerminalTheme(themeName) {
  const normalizedTheme = TERMINAL_THEMES.has(themeName) ? themeName : 'ocean';
  document.body.dataset.terminalTheme = normalizedTheme;

  if (terminalThemeText) {
    terminalThemeText.textContent = TERMINAL_THEME_LABELS[normalizedTheme];
  }

  if (terminalThemePreview) {
    terminalThemePreview.className = `theme-preview theme-preview-${normalizedTheme}`;
  }

  for (const option of terminalThemeOptions) {
    option.setAttribute('aria-selected', String(option.dataset.theme === normalizedTheme));
  }
}

function openThemeMenu() {
  if (!terminalThemeMenu || !terminalThemeTrigger) {
    return;
  }

  terminalThemeMenu.hidden = false;
  terminalThemeTrigger.setAttribute('aria-expanded', 'true');
}

function closeThemeMenu() {
  if (!terminalThemeMenu || !terminalThemeTrigger) {
    return;
  }

  terminalThemeMenu.hidden = true;
  terminalThemeTrigger.setAttribute('aria-expanded', 'false');
}

function toggleThemeMenu() {
  if (!terminalThemeMenu) {
    return;
  }

  if (terminalThemeMenu.hidden) {
    openThemeMenu();
    return;
  }

  closeThemeMenu();
}

function readSavedTerminalTheme() {
  try {
    const raw = window.localStorage.getItem(TERMINAL_THEME_STORAGE_KEY);
    if (raw === 'kdark') {
      return 'dark';
    }

    if (!raw || !TERMINAL_THEMES.has(raw)) {
      return 'ocean';
    }

    return raw;
  } catch {
    return 'ocean';
  }
}

function saveTerminalTheme(themeName) {
  const normalizedTheme = TERMINAL_THEMES.has(themeName) ? themeName : 'ocean';
  window.localStorage.setItem(TERMINAL_THEME_STORAGE_KEY, normalizedTheme);
}

function onTerminalThemeChange(selectedTheme) {
  applyTerminalTheme(selectedTheme);
  saveTerminalTheme(selectedTheme);
  closeThemeMenu();
}

function setRunning(scriptName, running) {
  scriptsState = scriptsState.map((script) => (script.name === scriptName ? { ...script, running } : script));
  renderScripts();
  renderLogTabs();
}

async function runScript(scriptName) {
  const result = await window.launcherApi.startScript(scriptName);
  if (!result.ok) {
    appendLog({ script: scriptName, stream: 'stderr', message: `${result.error}\n` });
    return;
  }

  focusScriptLogTab(scriptName);
}

async function stopScript(scriptName) {
  const result = await window.launcherApi.stopScript(scriptName);
  if (!result.ok) {
    appendLog({ script: scriptName, stream: 'stderr', message: `${result.error}\n` });
  }
}

function renderScripts() {
  scriptsList.replaceChildren();
  const runningOnly = Boolean(filterRunningCheckbox?.checked);
  const favoritesOnly = Boolean(filterFavoritesCheckbox?.checked);

  const visibleScripts = scriptsState.filter((script) => {
    if (!runningOnly && !favoritesOnly) {
      return true;
    }

    return (runningOnly && script.running) || (favoritesOnly && isFavoriteScript(script.name));
  });

  if (visibleScripts.length === 0) {
    const emptyState = document.createElement('p');
    emptyState.className = 'scripts-empty-state';
    emptyState.textContent = 'No scripts match the selected filters.';
    scriptsList.appendChild(emptyState);
    return;
  }

  for (const script of visibleScripts) {
    const row = document.createElement('div');
    row.className = `script-row ${script.running ? 'running' : ''}`;

    const info = document.createElement('div');
    info.className = 'script-info';

    const title = document.createElement('div');
    title.className = 'script-title';

    const name = document.createElement('strong');
    name.textContent = script.name;

    title.appendChild(name);

    const favoriteButton = document.createElement('button');
    favoriteButton.type = 'button';
    favoriteButton.className = `favorite-toggle ${isFavoriteScript(script.name) ? 'active' : ''}`;
    favoriteButton.textContent = isFavoriteScript(script.name) ? '★' : '☆';
    favoriteButton.title = isFavoriteScript(script.name) ? 'Remove from favorites' : 'Add to favorites';
    favoriteButton.setAttribute('aria-label', favoriteButton.title);
    favoriteButton.setAttribute('aria-pressed', String(isFavoriteScript(script.name)));
    favoriteButton.addEventListener('click', () => toggleFavoriteScript(script.name));
    title.appendChild(favoriteButton);

    const command = document.createElement('span');
    command.textContent = script.command;

    const status = document.createElement('span');
    status.className = `status ${script.running ? 'running' : 'stopped'}`;
    status.textContent = script.running ? 'running' : 'stopped';

    info.append(title, command, status);

    const actions = document.createElement('div');
    actions.className = 'actions';

    const runBtn = document.createElement('button');
    runBtn.type = 'button';
    runBtn.className = 'run-btn';
    runBtn.textContent = 'Run';
    runBtn.disabled = script.running;
    runBtn.addEventListener('click', () => runScript(script.name));

    const stopBtn = document.createElement('button');
    stopBtn.type = 'button';
    stopBtn.className = 'stop-btn';
    stopBtn.textContent = 'Stop';
    stopBtn.disabled = !script.running;
    stopBtn.addEventListener('click', () => stopScript(script.name));

    actions.append(runBtn, stopBtn);
    row.append(info, actions);
    scriptsList.appendChild(row);
  }
}

async function refreshScripts() {
  scriptsState = await window.launcherApi.listScripts();
  renderScripts();
  renderLogTabs();
  renderLogs();
}

refreshButton.addEventListener('click', refreshScripts);
quitButton.addEventListener('click', async () => {
  try {
    await window.launcherApi.quitApp();
  } catch (error) {
    appendLog({
      script: 'launcher',
      stream: 'stderr',
      message: `Failed to close launcher: ${error?.message || String(error)}\n`,
    });
  }
});
clearLogsButton.addEventListener('click', clearLogs);
terminalThemeTrigger.addEventListener('click', toggleThemeMenu);
for (const option of terminalThemeOptions) {
  option.addEventListener('click', () => {
    onTerminalThemeChange(option.dataset.theme || 'ocean');
  });
}
document.addEventListener('click', (event) => {
  if (!terminalThemeMenu || !terminalThemeTrigger) {
    return;
  }

  const target = event.target;
  if (!(target instanceof Node)) {
    return;
  }

  const clickedInsideSelector = terminalThemeMenu.contains(target) || terminalThemeTrigger.contains(target);
  if (!clickedInsideSelector) {
    closeThemeMenu();
  }
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeThemeMenu();
  }
});
packageSourceSelect.addEventListener('change', () => {
  void onPackageSourceChange();
});
filterRunningCheckbox.addEventListener('change', renderScripts);
filterFavoritesCheckbox.addEventListener('change', renderScripts);
filterRunningCheckbox.addEventListener('change', saveFilters);
filterFavoritesCheckbox.addEventListener('change', saveFilters);

window.launcherApi.onScriptLog((payload) => {
  appendLog(payload);
});

window.launcherApi.onScriptStatus(({ script, running }) => {
  setRunning(script, running);

  if (running) {
    focusScriptLogTab(script);
  }
});

async function init() {
  favoriteScripts = readSavedFavorites();
  applyTerminalTheme(readSavedTerminalTheme());
  restoreFilters();
  await refreshPackageSourceUi();
  await refreshScripts();
}

void init();
