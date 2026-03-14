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
const toggleTerminalButton = document.getElementById('toggleTerminalButton');
const interactiveTerminalBar = document.getElementById('interactiveTerminalBar');
const interactiveTerminalCwd = document.getElementById('interactiveTerminalCwd');
const interactiveTerminalForm = document.getElementById('interactiveTerminalForm');
const interactiveTerminalInput = document.getElementById('interactiveTerminalInput');
const interactiveTerminalRunButton = document.getElementById('interactiveTerminalRunButton');
const packageSourceTrigger = document.getElementById('packageSourceTrigger');
const packageSourceText = document.getElementById('packageSourceText');
const packageSourcePreview = document.getElementById('packageSourcePreview');
const packageSourceMenu = document.getElementById('packageSourceMenu');
const packageSourceOptions = Array.from(document.querySelectorAll('.package-source-option'));
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
const PACKAGE_SOURCE_LABELS = {
  dev: 'Dev (current repository)',
  prod: 'Prod (project root)',
  custom: 'Other...',
};

let scriptsState = [];
let activeLogTab = 'all';
const logsByScript = new Map([['all', []]]);
let favoriteScripts = new Set();

let packageSourceState = null;
const urlPattern = /https?:\/\/[^\s<>"]+/gi;
let activeTerminalSessionId = null;
const terminalSessions = new Map();
const TERMINAL_TAB_PREFIX = 'terminal:';
let editingTerminalSessionId = null;

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

  for (const session of terminalSessions.values()) {
    names.add(`${TERMINAL_TAB_PREFIX}${session.id}`);
  }

  return Array.from(names);
}

function isTerminalTab(tabName) {
  return String(tabName).startsWith(TERMINAL_TAB_PREFIX);
}

function sessionIdFromTab(tabName) {
  if (!isTerminalTab(tabName)) {
    return null;
  }

  return String(tabName).slice(TERMINAL_TAB_PREFIX.length);
}

function hideTerminalInputBar() {
  if (interactiveTerminalBar) {
    interactiveTerminalBar.hidden = true;
    interactiveTerminalBar.setAttribute('aria-hidden', 'true');
  }

  if (interactiveTerminalInput) {
    interactiveTerminalInput.disabled = true;
  }

  if (interactiveTerminalRunButton) {
    interactiveTerminalRunButton.disabled = true;
  }
}

async function closeTerminalSession(sessionId) {
  if (!sessionId || !terminalSessions.has(sessionId)) {
    return;
  }

  await window.launcherApi.closeTerminalSession(sessionId);
  terminalSessions.delete(sessionId);

  if (activeTerminalSessionId === sessionId) {
    const remainingSessionIds = Array.from(terminalSessions.keys());
    if (remainingSessionIds.length > 0) {
      activeTerminalSessionId = remainingSessionIds[0];
      activeLogTab = `${TERMINAL_TAB_PREFIX}${activeTerminalSessionId}`;
    } else {
      activeTerminalSessionId = null;
      activeLogTab = 'all';
    }
  }

  renderLogTabs();
  renderLogs();
}

async function renameTerminalSession(sessionId, nextName) {
  const session = terminalSessions.get(sessionId);
  if (!session) {
    return;
  }

  const trimmedName = String(nextName ?? '').trim();
  if (!trimmedName || trimmedName === session.name) {
    editingTerminalSessionId = null;
    renderLogTabs();
    return;
  }

  const result = await window.launcherApi.renameTerminalSession(sessionId, trimmedName);
  if (result?.ok && result.session) {
    ensureTerminalSessionShape(result.session);
  }

  editingTerminalSessionId = null;
  renderLogTabs();
}

function startTerminalSessionRename(sessionId) {
  if (!sessionId || !terminalSessions.has(sessionId)) {
    return;
  }

  editingTerminalSessionId = sessionId;
  renderLogTabs();

  requestAnimationFrame(() => {
    const input = document.querySelector(`[data-terminal-rename-input="${sessionId}"]`);
    if (!(input instanceof HTMLInputElement)) {
      return;
    }

    input.focus();
    input.select();
  });
}

function updateConsoleSurface() {
  const terminalTabActive = isTerminalTab(activeLogTab);
  const activeSession = getActiveTerminalSession();
  const showTerminalInput = Boolean(terminalTabActive && activeSession);

  if (!showTerminalInput) {
    hideTerminalInputBar();
    return;
  }

  interactiveTerminalBar.hidden = false;
  interactiveTerminalBar.setAttribute('aria-hidden', 'false');
  interactiveTerminalInput.disabled = false;
  interactiveTerminalRunButton.disabled = false;

  setTerminalCwd(activeSession.id, activeSession.cwd);
  renderTerminalOutput();
}

function renderLogs() {
  updateConsoleSurface();
  if (isTerminalTab(activeLogTab)) {
    return;
  }

  hideTerminalInputBar();

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
    const terminalTab = isTerminalTab(tabName);
    const tab = document.createElement(terminalTab ? 'div' : 'button');
    if (tab instanceof HTMLButtonElement) {
      tab.type = 'button';
    }
    tab.role = 'tab';
    tab.className = `log-tab ${tabName === activeLogTab ? 'active' : ''}`;
    if (terminalTab) {
      const sessionId = sessionIdFromTab(tabName);
      const session = sessionId ? terminalSessions.get(sessionId) : null;
      const isEditing = sessionId && editingTerminalSessionId === sessionId;

      const label = document.createElement(isEditing ? 'input' : 'span');
      label.className = isEditing ? 'log-tab-edit-input' : 'log-tab-label';

      if (isEditing && label instanceof HTMLInputElement) {
        label.type = 'text';
        label.value = session?.name || '';
        label.setAttribute('data-terminal-rename-input', sessionId || '');
        label.addEventListener('click', (event) => {
          event.stopPropagation();
        });
        label.addEventListener('keydown', (event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            event.stopPropagation();
            void renameTerminalSession(sessionId, label.value);
            return;
          }

          if (event.key === 'Escape') {
            event.preventDefault();
            event.stopPropagation();
            editingTerminalSessionId = null;
            renderLogTabs();
          }
        });
        label.addEventListener('blur', () => {
          void renameTerminalSession(sessionId, label.value);
        });
      } else {
        label.textContent = session?.name || 'Session';
        label.addEventListener('dblclick', (event) => {
          event.stopPropagation();
          startTerminalSessionRename(sessionId);
        });
      }

      const closeButton = document.createElement('button');
      closeButton.type = 'button';
      closeButton.className = 'log-tab-close';
      closeButton.textContent = '×';
      closeButton.title = `Close ${session?.name || 'session'}`;
      closeButton.setAttribute('aria-label', closeButton.title);
      closeButton.addEventListener('click', (event) => {
        event.stopPropagation();
        void closeTerminalSession(sessionId);
      });

      tab.replaceChildren(label, closeButton);
      tab.classList.add('log-tab-terminal');
      tab.tabIndex = 0;
      tab.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          tab.click();
        }
      });
    } else {
      tab.textContent = tabName;
    }
    tab.setAttribute('aria-selected', String(tabName === activeLogTab));
    tab.addEventListener('click', () => {
      activeLogTab = tabName;
      if (isTerminalTab(tabName)) {
        activeTerminalSessionId = sessionIdFromTab(tabName);
      } else {
        activeTerminalSessionId = null;
      }
      renderLogTabs();
      renderLogs();

      if (isTerminalTab(tabName) && interactiveTerminalInput) {
        interactiveTerminalInput.focus();
      }
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

  const mode = Object.prototype.hasOwnProperty.call(PACKAGE_SOURCE_LABELS, packageSourceState.mode)
    ? packageSourceState.mode
    : 'dev';

  if (packageSourceText) {
    packageSourceText.textContent = PACKAGE_SOURCE_LABELS[mode];
  }

  if (packageSourcePreview) {
    packageSourcePreview.className = `source-preview source-preview-${mode}`;
  }

  for (const option of packageSourceOptions) {
    option.setAttribute('aria-selected', String(option.dataset.source === mode));
  }

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

async function onPackageSourceChange(mode = 'dev') {

  if (mode === 'custom') {
    const selected = await chooseCustomPackageJson();
    if (!selected) {
      await refreshPackageSourceUi();
    }
    closePackageSourceMenu();
    return;
  }

  await applyPackageSource(mode);
  closePackageSourceMenu();
}

function openPackageSourceMenu() {
  if (!packageSourceMenu || !packageSourceTrigger) {
    return;
  }

  packageSourceMenu.hidden = false;
  packageSourceTrigger.setAttribute('aria-expanded', 'true');
}

function closePackageSourceMenu() {
  if (!packageSourceMenu || !packageSourceTrigger) {
    return;
  }

  packageSourceMenu.hidden = true;
  packageSourceTrigger.setAttribute('aria-expanded', 'false');
}

function togglePackageSourceMenu() {
  if (!packageSourceMenu) {
    return;
  }

  if (packageSourceMenu.hidden) {
    openPackageSourceMenu();
    return;
  }

  closePackageSourceMenu();
}

function clearLogs() {
  if (isTerminalTab(activeLogTab)) {
    const activeSession = getActiveTerminalSession();
    if (activeSession) {
      activeSession.lines = [];
      renderTerminalOutput();

      if (interactiveTerminalInput && !interactiveTerminalInput.disabled) {
        interactiveTerminalInput.focus();
      }
    }
    return;
  }

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

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function getActiveTerminalSession() {
  if (!activeTerminalSessionId) {
    return null;
  }

  return terminalSessions.get(activeTerminalSessionId) || null;
}

function ensureTerminalSessionShape(session) {
  if (!session || !session.id) {
    return null;
  }

  const existing = terminalSessions.get(session.id);
  if (existing) {
    existing.name = session.name || existing.name;
    existing.cwd = session.cwd || existing.cwd;
    return existing;
  }

  const created = {
    id: session.id,
    name: session.name || 'Session',
    cwd: session.cwd || '',
    lines: [],
  };
  terminalSessions.set(created.id, created);
  return created;
}

function appendTerminalLine(sessionId, content, className = '') {
  const session = terminalSessions.get(sessionId);
  if (!session) {
    return;
  }

  session.lines.push({ content: String(content), className });

  if (activeTerminalSessionId === sessionId) {
    renderTerminalOutput();
  }
}

function setTerminalCwd(sessionId, cwd) {
  const session = terminalSessions.get(sessionId);
  if (!session) {
    return;
  }

  session.cwd = String(cwd || '');

  if (activeTerminalSessionId === sessionId && interactiveTerminalCwd) {
    interactiveTerminalCwd.textContent = session.cwd;
    interactiveTerminalCwd.title = session.cwd;
  }
}

function renderTerminalOutput() {
  if (!logsEl) {
    return;
  }

  logsEl.replaceChildren();
  const session = getActiveTerminalSession();
  if (!session) {
    return;
  }

  for (const lineEntry of session.lines) {
    const line = document.createElement('pre');
    line.className = `log-line ${lineEntry.className}`.trim();
    line.innerHTML = escapeHtml(lineEntry.content);
    logsEl.appendChild(line);
  }

  logsEl.scrollTop = logsEl.scrollHeight;
}

async function createNewTerminalSession() {
  const created = await window.launcherApi.createTerminalSession();
  const session = ensureTerminalSessionShape(created);
  if (!session) {
    return null;
  }

  activeTerminalSessionId = session.id;
  activeLogTab = `${TERMINAL_TAB_PREFIX}${session.id}`;
  renderLogTabs();
  renderLogs();
  return session;
}

function splitTerminalText(value) {
  const lines = String(value || '').split(/\r?\n/);
  if (lines.length > 0 && lines[lines.length - 1] === '') {
    lines.pop();
  }

  return lines;
}

async function runInteractiveTerminalCommand(command) {
  const session = getActiveTerminalSession();
  if (!session) {
    return;
  }

  const trimmed = String(command || '').trim();
  if (!trimmed) {
    return;
  }

  const normalized = trimmed.toLowerCase();
  if (normalized === 'clear') {
    session.lines = [];
    renderTerminalOutput();

    if (interactiveTerminalInput && !interactiveTerminalInput.disabled) {
      interactiveTerminalInput.focus();
    }
    return;
  }

  if (normalized === 'exit') {
    await closeTerminalSession(session.id);
    return;
  }

  appendTerminalLine(session.id, `${session.cwd || '~'} $ ${trimmed}`, 'interactive-terminal-command');

  if (interactiveTerminalRunButton) {
    interactiveTerminalRunButton.disabled = true;
  }

  if (interactiveTerminalInput) {
    interactiveTerminalInput.disabled = true;
  }

  try {
    const result = await window.launcherApi.runTerminalCommand(session.id, trimmed);
    setTerminalCwd(session.id, result?.cwd || session.cwd);

    for (const line of splitTerminalText(result?.output || '')) {
      appendTerminalLine(session.id, line, 'interactive-terminal-stdout');
    }

    for (const line of splitTerminalText(result?.error || '')) {
      appendTerminalLine(session.id, line, 'interactive-terminal-stderr');
    }

    appendTerminalLine(session.id, `[exit ${result?.exitCode ?? 1}]`, 'interactive-terminal-exit');
  } catch (error) {
    appendTerminalLine(session.id, String(error?.message || error), 'interactive-terminal-stderr');
    appendTerminalLine(session.id, '[exit 1]', 'interactive-terminal-exit');
  } finally {
    if (interactiveTerminalInput) {
      interactiveTerminalInput.disabled = false;
      interactiveTerminalInput.focus();
      interactiveTerminalInput.select();
    }

    if (interactiveTerminalRunButton) {
      interactiveTerminalRunButton.disabled = false;
    }
  }
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
toggleTerminalButton.addEventListener('click', async () => {
  const session = await createNewTerminalSession();
  if (!session) {
    return;
  }

  if (interactiveTerminalInput) {
    interactiveTerminalInput.focus();
  }
});
interactiveTerminalForm.addEventListener('submit', (event) => {
  event.preventDefault();

  if (!activeTerminalSessionId) {
    return;
  }

  const command = interactiveTerminalInput.value;
  interactiveTerminalInput.value = '';
  void runInteractiveTerminalCommand(command);
});
terminalThemeTrigger.addEventListener('click', toggleThemeMenu);
for (const option of terminalThemeOptions) {
  option.addEventListener('click', () => {
    onTerminalThemeChange(option.dataset.theme || 'ocean');
  });
}
packageSourceTrigger.addEventListener('click', togglePackageSourceMenu);
for (const option of packageSourceOptions) {
  option.addEventListener('click', () => {
    void onPackageSourceChange(option.dataset.source || 'dev');
  });
}
document.addEventListener('click', (event) => {
  if (!terminalThemeMenu || !terminalThemeTrigger || !packageSourceMenu || !packageSourceTrigger) {
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

  const clickedInsidePackageSelector = packageSourceMenu.contains(target) || packageSourceTrigger.contains(target);
  if (!clickedInsidePackageSelector) {
    closePackageSourceMenu();
  }
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeThemeMenu();
    closePackageSourceMenu();
  }
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

  const existingSessions = await window.launcherApi.listTerminalSessions();
  for (const session of existingSessions) {
    ensureTerminalSessionShape(session);
  }

  if (terminalSessions.size > 0 && !activeTerminalSessionId) {
    activeTerminalSessionId = Array.from(terminalSessions.keys())[0];
  }

  // Re-render after restoring terminal sessions so Session tabs appear on first load.
  renderLogTabs();
  renderLogs();

  if (interactiveTerminalBar) {
    interactiveTerminalBar.hidden = true;
  }
  updateConsoleSurface();
}

void init();
