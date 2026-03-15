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
const terminalTypeSelector = document.getElementById('terminalTypeSelector');
const terminalTypeTrigger = document.getElementById('terminalTypeTrigger');
const terminalTypeIcon = document.getElementById('terminalTypeIcon');
const terminalTypeText = document.getElementById('terminalTypeText');
const terminalTypeMenu = document.getElementById('terminalTypeMenu');
const interruptTerminalButton = document.getElementById('interruptTerminalButton');
const closeTerminalSessionButton = document.getElementById('closeTerminalSessionButton');
const terminalFontDecreaseButton = document.getElementById('terminalFontDecreaseButton');
const terminalFontResetButton = document.getElementById('terminalFontResetButton');
const terminalFontIncreaseButton = document.getElementById('terminalFontIncreaseButton');
const expandLogsButton = document.getElementById('expandLogsButton');
const layoutEl = document.querySelector('.layout');
const interactiveTerminalBar = document.getElementById('interactiveTerminalBar');
const interactiveTerminalCwd = document.getElementById('interactiveTerminalCwd');
const interactiveTerminalForm = document.getElementById('interactiveTerminalForm');
const interactiveTerminalInput = document.getElementById('interactiveTerminalInput');
const interactiveTerminalRunButton = document.getElementById('interactiveTerminalRunButton');
const packageSourceTrigger = document.getElementById('packageSourceTrigger');
const packageSourceText = document.getElementById('packageSourceText');
const packageSourcePreview = document.getElementById('packageSourcePreview');
const packageSourceTooltip = document.getElementById('packageSourceTooltip');
const packageSourceMenu = document.getElementById('packageSourceMenu');
const packageSourceOptions = Array.from(document.querySelectorAll('.package-source-option'));
const filterRunningCheckbox = document.getElementById('filterRunningCheckbox');
const filterFavoritesCheckbox = document.getElementById('filterFavoritesCheckbox');

const FILTER_STATE_STORAGE_KEY = 'launcher.filters.v1';
const FAVORITES_STORAGE_KEY = 'launcher.favorites.v1';
const TERMINAL_THEME_STORAGE_KEY = 'launcher.terminal-theme.v1';
const TERMINAL_FONT_SIZE_STORAGE_KEY = 'launcher.terminal-font-size.v1';
const LOG_TAB_ORDER_STORAGE_KEY = 'launcher.log-tab-order.v1';
const TERMINAL_FULLSCREEN_STORAGE_KEY = 'launcher.terminal-fullscreen.v1';
const TERMINAL_TYPE_STORAGE_KEY = 'launcher.terminal-type.v1';
const ANSI_NON_SGR_CONTROL_SEQUENCE_PATTERN = /\u001b\[(?![0-9;]*m)[0-9;?]*[ -/]*[@-~]/g;
const ANSI_OSC_PATTERN = /\u001b\][^\u0007]*(?:\u0007|\u001b\\)/g;
const ANSI_SGR_PATTERN = /\u001b\[([0-9;]*)m/g;
const TERMINAL_THEMES = new Set(['ocean', 'light', 'solarized-light', 'tokion-night-light', 'red', 'solarized-dark', 'kimbie-dark', 'dark']);
const TERMINAL_FONT_SIZE_DEFAULT = 17.6;
const TERMINAL_FONT_SIZE_MIN = 12;
const TERMINAL_FONT_SIZE_MAX = 28;
const TERMINAL_FONT_SIZE_STEP = 1;
const TERMINAL_THEME_LABELS = {
  ocean: 'Ocean',
  light: 'Light',
  'solarized-light': 'Solarized Light',
  'tokion-night-light': 'Tokion Night Light',
  red: 'Red',
  'solarized-dark': 'Solarized Dark',
  'kimbie-dark': 'Kimbie Dark',
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
const TERMINAL_HISTORY_LIMIT = 200;
let editingTerminalSessionId = null;
const runningTerminalSessions = new Set();
const orderedLogTabs = [];
let terminalAutocompleteState = null;
let draggedLogTabName = null;
let terminalFontSizePx = TERMINAL_FONT_SIZE_DEFAULT;
let terminalTypeOptions = [];
let selectedTerminalType = 'cmd';
let defaultTerminalType = 'cmd';

function getTerminalTypeMeta(typeId) {
  const normalized = String(typeId || '').trim().toLowerCase();
  return terminalTypeOptions.find((entry) => entry.id === normalized) || null;
}

function getTerminalTypeVisual(typeId) {
  const normalized = String(typeId || '').trim().toLowerCase();

  if (normalized === 'powershell') {
    return { iconText: '>_', iconClass: 'terminal-type-icon-powershell' };
  }

  if (normalized === 'pwsh') {
    return { iconText: 'PS', iconClass: 'terminal-type-icon-pwsh' };
  }

  if (normalized === 'git-bash') {
    return { iconText: '$', iconClass: 'terminal-type-icon-git-bash' };
  }

  return { iconText: '>_', iconClass: 'terminal-type-icon-cmd' };
}

function ensureTerminalSessionBanner(session) {
  if (!session) {
    return;
  }

  if (!Array.isArray(session.lines)) {
    session.lines = [];
  }

  const hasBanner = session.lines.some((lineEntry) => lineEntry.className === 'interactive-terminal-session-meta');
  if (hasBanner) {
    return;
  }

  const terminalTypeMeta = getTerminalTypeMeta(session.terminalType);
  const shellLabel = terminalTypeMeta?.label || 'Terminal';
  const shellIcon = terminalTypeMeta?.iconText ? `${terminalTypeMeta.iconText} ` : '';
  session.lines.unshift({
    content: `[${shellIcon}${shellLabel} session]`,
    className: 'interactive-terminal-session-meta',
  });
}

function readSavedTerminalType() {
  try {
    return String(window.localStorage.getItem(TERMINAL_TYPE_STORAGE_KEY) || '').trim().toLowerCase();
  } catch {
    return '';
  }
}

function saveSelectedTerminalType(typeId) {
  try {
    window.localStorage.setItem(TERMINAL_TYPE_STORAGE_KEY, String(typeId || defaultTerminalType || 'cmd'));
  } catch {
    // Ignore storage failures.
  }
}

function applyTerminalTypeSelection(typeId) {
  const normalized = String(typeId || defaultTerminalType || 'cmd').trim().toLowerCase();
  const availableIds = new Set(terminalTypeOptions.map((entry) => entry.id));
  selectedTerminalType = availableIds.has(normalized) ? normalized : defaultTerminalType;

  const selectedOption = terminalTypeOptions.find((entry) => entry.id === selectedTerminalType);
  if (selectedOption) {
    if (terminalTypeIcon) {
      terminalTypeIcon.className = `terminal-type-trigger-icon ${selectedOption.iconClass}`;
      terminalTypeIcon.textContent = selectedOption.iconText || '';
    }

    if (terminalTypeText) {
      terminalTypeText.textContent = selectedOption.label;
    }
  }

  if (terminalTypeMenu) {
    for (const option of Array.from(terminalTypeMenu.querySelectorAll('.terminal-type-option'))) {
      option.setAttribute('aria-selected', String(option.dataset.type === selectedTerminalType));
    }
  }
}

function closeTerminalTypeMenu() {
  if (!terminalTypeMenu || !terminalTypeTrigger) {
    return;
  }

  terminalTypeMenu.hidden = true;
  terminalTypeTrigger.setAttribute('aria-expanded', 'false');
}

function openTerminalTypeMenu() {
  if (!terminalTypeMenu || !terminalTypeTrigger) {
    return;
  }

  terminalTypeMenu.hidden = false;
  terminalTypeTrigger.setAttribute('aria-expanded', 'true');
}

function toggleTerminalTypeMenu() {
  if (!terminalTypeMenu) {
    return;
  }

  if (terminalTypeMenu.hidden) {
    openTerminalTypeMenu();
    return;
  }

  closeTerminalTypeMenu();
}

function renderTerminalTypeMenu() {
  if (!terminalTypeMenu) {
    return;
  }

  terminalTypeMenu.replaceChildren();

  for (const option of terminalTypeOptions) {
    const button = document.createElement('button');
    button.className = 'terminal-type-option';
    button.type = 'button';
    button.role = 'option';
    button.dataset.type = option.id;
    button.setAttribute('aria-selected', String(option.id === selectedTerminalType));

    const icon = document.createElement('span');
    icon.className = `terminal-type-option-icon ${option.iconClass}`;
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = option.iconText || '';

    const label = document.createElement('span');
    label.className = 'terminal-type-option-label';
    label.textContent = option.label;

    button.append(icon, label);
    button.addEventListener('click', () => {
      applyTerminalTypeSelection(option.id);
      saveSelectedTerminalType(selectedTerminalType);
      closeTerminalTypeMenu();
    });

    terminalTypeMenu.appendChild(button);
  }
}

function populateTerminalTypeSelector(config) {
  if (!terminalTypeSelector || !terminalTypeMenu) {
    return;
  }

  const supported = Boolean(config?.supported);
  const options = Array.isArray(config?.options) ? config.options : [];
  terminalTypeOptions = options
    .filter((option) => option && typeof option.id === 'string' && typeof option.label === 'string')
    .map((option) => {
      const normalizedLabel = String(option.label || '').trim();
      const visual = getTerminalTypeVisual(option.id);
      return {
        id: option.id.toLowerCase(),
        iconText: visual.iconText,
        iconClass: visual.iconClass,
        label: normalizedLabel,
      };
    });

  const showSelector = supported && terminalTypeOptions.length > 0;
  terminalTypeSelector.hidden = !showSelector;

  defaultTerminalType = String(config?.defaultType || terminalTypeOptions[0]?.id || 'cmd').toLowerCase();
  const preferredType = readSavedTerminalType() || defaultTerminalType;
  applyTerminalTypeSelection(preferredType);
  renderTerminalTypeMenu();
  closeTerminalTypeMenu();
}

function normalizeTerminalFontSize(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return TERMINAL_FONT_SIZE_DEFAULT;
  }

  return Math.min(TERMINAL_FONT_SIZE_MAX, Math.max(TERMINAL_FONT_SIZE_MIN, parsed));
}

function updateTerminalFontButtonsState() {
  if (terminalFontDecreaseButton) {
    terminalFontDecreaseButton.disabled = terminalFontSizePx <= TERMINAL_FONT_SIZE_MIN;
  }

  if (terminalFontIncreaseButton) {
    terminalFontIncreaseButton.disabled = terminalFontSizePx >= TERMINAL_FONT_SIZE_MAX;
  }
}

function applyTerminalFontSize(sizePx) {
  terminalFontSizePx = normalizeTerminalFontSize(sizePx);
  document.body.style.setProperty('--terminal-font-size-px', `${terminalFontSizePx}px`);
  updateTerminalFontButtonsState();
}

function readSavedTerminalFontSize() {
  try {
    const raw = window.localStorage.getItem(TERMINAL_FONT_SIZE_STORAGE_KEY);
    return normalizeTerminalFontSize(raw);
  } catch {
    return TERMINAL_FONT_SIZE_DEFAULT;
  }
}

function saveTerminalFontSize(sizePx) {
  const normalized = normalizeTerminalFontSize(sizePx);
  try {
    window.localStorage.setItem(TERMINAL_FONT_SIZE_STORAGE_KEY, String(normalized));
  } catch {
    // Ignore storage failures.
  }
}

function changeTerminalFontSize(delta) {
  const nextSize = normalizeTerminalFontSize(terminalFontSizePx + delta);
  applyTerminalFontSize(nextSize);
  saveTerminalFontSize(nextSize);
}

function resetTerminalFontSize() {
  applyTerminalFontSize(TERMINAL_FONT_SIZE_DEFAULT);
  saveTerminalFontSize(TERMINAL_FONT_SIZE_DEFAULT);
}

function trimTrailingUrlPunctuation(urlText) {
  let trimmed = urlText;
  let trailing = '';

  while (/[),.;!?]$/.test(trimmed)) {
    trailing = trimmed.slice(-1) + trailing;
    trimmed = trimmed.slice(0, -1);
  }

  return { url: trimmed, trailing };
}

function appendTextWithLinks(container, text) {
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

function normalizeRenderedLogText(value) {
  return String(value ?? '')
    .replace(ANSI_OSC_PATTERN, '')
    .replace(ANSI_NON_SGR_CONTROL_SEQUENCE_PATTERN, '')
    .replace(/\r/g, '');
}

function ansiCodeToColor(code) {
  switch (code) {
    case 30:
      return '#111827';
    case 31:
      return '#ef4444';
    case 32:
      return '#22c55e';
    case 33:
      return '#f59e0b';
    case 34:
      return '#3b82f6';
    case 35:
      return '#d946ef';
    case 36:
      return '#06b6d4';
    case 37:
      return '#e5e7eb';
    case 90:
      return '#9ca3af';
    case 91:
      return '#f87171';
    case 92:
      return '#4ade80';
    case 93:
      return '#fbbf24';
    case 94:
      return '#60a5fa';
    case 95:
      return '#e879f9';
    case 96:
      return '#22d3ee';
    case 97:
      return '#f9fafb';
    default:
      return null;
  }
}

function appendStyledTextWithLinks(container, text, styleState) {
  if (!text) {
    return;
  }

  let lastIndex = 0;
  urlPattern.lastIndex = 0;

  const applyStyle = (element) => {
    if (!styleState) {
      return;
    }

    if (styleState.color) {
      element.style.color = styleState.color;
    }

    if (styleState.bold) {
      element.style.fontWeight = '700';
    }

    if (styleState.dim) {
      element.style.opacity = '0.75';
    }
  };

  for (const match of text.matchAll(urlPattern)) {
    const rawUrl = match[0];
    const matchIndex = match.index ?? 0;

    if (matchIndex > lastIndex) {
      const chunk = text.slice(lastIndex, matchIndex);
      if (chunk) {
        const span = document.createElement('span');
        span.textContent = chunk;
        applyStyle(span);
        container.appendChild(span);
      }
    }

    const { url, trailing } = trimTrailingUrlPunctuation(rawUrl);
    if (url.length > 0) {
      const link = document.createElement('a');
      link.className = 'log-link';
      link.href = url;
      link.textContent = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      applyStyle(link);
      link.addEventListener('click', async (event) => {
        event.preventDefault();
        await window.launcherApi.openExternal(url);
      });
      container.appendChild(link);
    }

    if (trailing) {
      const trailingSpan = document.createElement('span');
      trailingSpan.textContent = trailing;
      applyStyle(trailingSpan);
      container.appendChild(trailingSpan);
    }

    lastIndex = matchIndex + rawUrl.length;
  }

  if (lastIndex < text.length) {
    const tail = document.createElement('span');
    tail.textContent = text.slice(lastIndex);
    applyStyle(tail);
    container.appendChild(tail);
  }
}

function appendAnsiStyledText(container, text) {
  const normalized = normalizeRenderedLogText(text);
  const styleState = {
    color: null,
    bold: false,
    dim: false,
  };

  let cursor = 0;
  ANSI_SGR_PATTERN.lastIndex = 0;

  for (const match of normalized.matchAll(ANSI_SGR_PATTERN)) {
    const index = match.index ?? 0;

    if (index > cursor) {
      appendStyledTextWithLinks(container, normalized.slice(cursor, index), styleState);
    }

    const codes = String(match[1] ?? '')
      .split(';')
      .map((value) => Number(value || '0'));

    for (const code of codes) {
      if (!Number.isFinite(code)) {
        continue;
      }

      if (code === 0) {
        styleState.color = null;
        styleState.bold = false;
        styleState.dim = false;
        continue;
      }

      if (code === 1) {
        styleState.bold = true;
        continue;
      }

      if (code === 2) {
        styleState.dim = true;
        continue;
      }

      if (code === 22) {
        styleState.bold = false;
        styleState.dim = false;
        continue;
      }

      if (code === 39) {
        styleState.color = null;
        continue;
      }

      const mappedColor = ansiCodeToColor(code);
      if (mappedColor) {
        styleState.color = mappedColor;
      }
    }

    cursor = index + match[0].length;
  }

  if (cursor < normalized.length) {
    appendStyledTextWithLinks(container, normalized.slice(cursor), styleState);
  }
}

function createLogLineElement(className, text) {
  const line = document.createElement('pre');
  line.className = className;
  appendAnsiStyledText(line, text);
  return line;
}

function ensureLogBucket(scriptName) {
  if (!logsByScript.has(scriptName)) {
    logsByScript.set(scriptName, []);
  }

  if (scriptName && scriptName !== 'all') {
    registerTabOrder(scriptName);
  }
}

function readSavedLogTabOrder() {
  try {
    const raw = window.localStorage.getItem(LOG_TAB_ORDER_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    const seen = new Set();
    const cleaned = [];

    for (const entry of parsed) {
      if (typeof entry !== 'string' || !entry || entry === 'all' || seen.has(entry)) {
        continue;
      }

      seen.add(entry);
      cleaned.push(entry);
    }

    return cleaned;
  } catch {
    return [];
  }
}

function saveLogTabOrder() {
  try {
    window.localStorage.setItem(LOG_TAB_ORDER_STORAGE_KEY, JSON.stringify(orderedLogTabs));
  } catch {
    // Ignore storage failures (private mode/quota) and keep in-memory ordering.
  }
}

function restoreLogTabOrder() {
  const saved = readSavedLogTabOrder();
  orderedLogTabs.splice(0, orderedLogTabs.length, ...saved);
}

function registerTabOrder(tabName) {
  if (!tabName || tabName === 'all') {
    return;
  }

  if (!orderedLogTabs.includes(tabName)) {
    orderedLogTabs.push(tabName);
    saveLogTabOrder();
  }
}

function touchTabOrder(tabName) {
  if (!tabName || tabName === 'all') {
    return;
  }

  const existingIndex = orderedLogTabs.indexOf(tabName);
  if (existingIndex >= 0) {
    orderedLogTabs.splice(existingIndex, 1);
  }

  orderedLogTabs.push(tabName);
  saveLogTabOrder();
}

function isReorderableLogTab(tabName) {
  return Boolean(tabName && tabName !== 'all');
}

function clearLogTabDropIndicators() {
  if (!logTabsEl) {
    return;
  }

  for (const element of logTabsEl.querySelectorAll('.log-tab-drop-before, .log-tab-drop-after')) {
    element.classList.remove('log-tab-drop-before', 'log-tab-drop-after');
  }
}

function reorderLogTabs(sourceTabName, targetTabName, insertBefore = true) {
  if (!isReorderableLogTab(sourceTabName) || !isReorderableLogTab(targetTabName)) {
    return false;
  }

  if (sourceTabName === targetTabName) {
    return false;
  }

  const sourceIndex = orderedLogTabs.indexOf(sourceTabName);
  const targetIndex = orderedLogTabs.indexOf(targetTabName);
  if (sourceIndex < 0 || targetIndex < 0) {
    return false;
  }

  orderedLogTabs.splice(sourceIndex, 1);

  const adjustedTargetIndex = orderedLogTabs.indexOf(targetTabName);
  const insertionIndex = insertBefore ? adjustedTargetIndex : adjustedTargetIndex + 1;
  orderedLogTabs.splice(insertionIndex, 0, sourceTabName);

  saveLogTabOrder();
  return true;
}

function pruneTabOrder(availableTabs) {
  if (!(availableTabs instanceof Set)) {
    return;
  }

  const knownScriptNames = new Set((scriptsState || []).map((script) => script.name));
  let changed = false;
  for (let index = orderedLogTabs.length - 1; index >= 0; index -= 1) {
    const tabName = orderedLogTabs[index];

    if (isTerminalTab(tabName)) {
      if (availableTabs.has(tabName)) {
        continue;
      }

      orderedLogTabs.splice(index, 1);
      changed = true;
      continue;
    }

    const scriptStillKnown = knownScriptNames.has(tabName);
    const hasLogsBucket = logsByScript.has(tabName);
    if (scriptStillKnown || hasLogsBucket) {
      continue;
    }

    if (!availableTabs.has(tabName)) {
      orderedLogTabs.splice(index, 1);
      changed = true;
    }
  }

  if (changed) {
    saveLogTabOrder();
  }
}

function getTabNames() {
  const availableTabs = new Set(['all']);

  for (const script of scriptsState) {
    if (script.running) {
      availableTabs.add(script.name);
    }
  }

  for (const key of logsByScript.keys()) {
    if (key !== 'all') {
      availableTabs.add(key);
    }
  }

  for (const session of terminalSessions.values()) {
    availableTabs.add(`${TERMINAL_TAB_PREFIX}${session.id}`);
  }

  for (const tabName of availableTabs) {
    registerTabOrder(tabName);
  }

  pruneTabOrder(availableTabs);

  return ['all', ...orderedLogTabs.filter((tabName) => availableTabs.has(tabName))];
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

function updateInterruptTerminalButtonState() {
  if (!interruptTerminalButton) {
    return;
  }

  const activeSession = getActiveTerminalSession();
  const canInterrupt = Boolean(isTerminalTab(activeLogTab) && activeSession);
  interruptTerminalButton.disabled = !canInterrupt;
}

function updateCloseTerminalSessionButtonState() {
  if (!closeTerminalSessionButton) {
    return;
  }

  const activeSession = getActiveTerminalSession();
  const canCloseSession = Boolean(isTerminalTab(activeLogTab) && activeSession);
  closeTerminalSessionButton.disabled = !canCloseSession;
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

  updateInterruptTerminalButtonState();
  updateCloseTerminalSessionButtonState();

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
    const lineText = activeLogTab === 'all' ? `[${entry.script}] ${entry.message}` : entry.message;
    const line = createLogLineElement(`log-line ${entry.stream}`, lineText);
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
    tab.dataset.tabName = tabName;
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
          // Keep keystrokes inside rename input so parent tab keyboard shortcuts don't intercept space/enter.
          event.stopPropagation();

          if (event.key === 'Enter') {
            event.preventDefault();
            void renameTerminalSession(sessionId, label.value);
            return;
          }

          if (event.key === 'Escape') {
            event.preventDefault();
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

      const terminalTypeMeta = getTerminalTypeMeta(session?.terminalType);
      const terminalTypeIcon = document.createElement('span');
      terminalTypeIcon.className = `log-tab-terminal-type-icon ${terminalTypeMeta?.iconClass || ''}`.trim();
      terminalTypeIcon.textContent = terminalTypeMeta?.iconText || '';
      terminalTypeIcon.title = terminalTypeMeta?.label || '';
      terminalTypeIcon.setAttribute('aria-hidden', 'true');

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

      tab.replaceChildren(terminalTypeIcon, label, closeButton);
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

    if (isReorderableLogTab(tabName)) {
      tab.draggable = true;
      tab.classList.add('log-tab-draggable');

      tab.addEventListener('dragstart', (event) => {
        draggedLogTabName = tabName;
        tab.classList.add('log-tab-dragging');

        if (event.dataTransfer) {
          event.dataTransfer.effectAllowed = 'move';
          event.dataTransfer.setData('text/plain', tabName);
        }
      });

      tab.addEventListener('dragover', (event) => {
        if (!draggedLogTabName || draggedLogTabName === tabName) {
          return;
        }

        event.preventDefault();

        const rect = tab.getBoundingClientRect();
        const dropBefore = event.clientX < rect.left + rect.width / 2;

        clearLogTabDropIndicators();
        tab.classList.add(dropBefore ? 'log-tab-drop-before' : 'log-tab-drop-after');

        if (event.dataTransfer) {
          event.dataTransfer.dropEffect = 'move';
        }
      });

      tab.addEventListener('dragleave', (event) => {
        const related = event.relatedTarget;
        if (related instanceof Node && tab.contains(related)) {
          return;
        }

        tab.classList.remove('log-tab-drop-before', 'log-tab-drop-after');
      });

      tab.addEventListener('drop', (event) => {
        if (!draggedLogTabName || draggedLogTabName === tabName) {
          return;
        }

        event.preventDefault();

        const rect = tab.getBoundingClientRect();
        const dropBefore = event.clientX < rect.left + rect.width / 2;
        const didReorder = reorderLogTabs(draggedLogTabName, tabName, dropBefore);

        draggedLogTabName = null;
        clearLogTabDropIndicators();

        if (didReorder) {
          renderLogTabs();
        }
      });

      tab.addEventListener('dragend', () => {
        draggedLogTabName = null;
        clearLogTabDropIndicators();
        tab.classList.remove('log-tab-dragging');
      });
    }

    tab.setAttribute('aria-selected', String(tabName === activeLogTab));
    tab.addEventListener('click', () => {
      resetTerminalAutocompleteState();
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
  const sourceTooltip = `${stateLabel}: ${packageSourceState.selectedPath}`;
  if (packageSourceTrigger) {
    packageSourceTrigger.title = sourceTooltip;
    packageSourceTrigger.setAttribute('aria-label', `${PACKAGE_SOURCE_LABELS[mode]}. ${sourceTooltip}`);
  }

  if (packageSourceTooltip) {
    packageSourceTooltip.textContent = sourceTooltip;
    packageSourceTooltip.setAttribute('aria-hidden', 'false');
  }
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
    existing.terminalType = session.terminalType || existing.terminalType || defaultTerminalType;
    if (!Array.isArray(existing.lines)) {
      existing.lines = [];
    }
    if (!Array.isArray(existing.commandHistory)) {
      existing.commandHistory = [];
    }
    if (!Number.isInteger(existing.historyCursor)) {
      existing.historyCursor = -1;
    }
    if (typeof existing.historyDraft !== 'string') {
      existing.historyDraft = '';
    }
    ensureTerminalSessionBanner(existing);
    return existing;
  }

  const created = {
    id: session.id,
    name: session.name || 'Session',
    cwd: session.cwd || '',
    terminalType: session.terminalType || defaultTerminalType,
    lines: [],
    commandHistory: [],
    historyCursor: -1,
    historyDraft: '',
  };
  ensureTerminalSessionBanner(created);
  terminalSessions.set(created.id, created);
  return created;
}

function resetTerminalHistoryNavigation(session) {
  if (!session) {
    return;
  }

  session.historyCursor = -1;
  session.historyDraft = '';
}

function addTerminalCommandToHistory(session, command) {
  if (!session) {
    return;
  }

  const normalized = String(command || '').trim();
  if (!normalized) {
    return;
  }

  session.commandHistory.push(normalized);
  if (session.commandHistory.length > TERMINAL_HISTORY_LIMIT) {
    session.commandHistory.splice(0, session.commandHistory.length - TERMINAL_HISTORY_LIMIT);
  }

  resetTerminalHistoryNavigation(session);
}

function navigateTerminalHistory(direction) {
  const session = getActiveTerminalSession();
  if (!session || !interactiveTerminalInput || interactiveTerminalInput.disabled) {
    return;
  }

  const history = session.commandHistory || [];
  if (history.length === 0) {
    return;
  }

  if (direction === 'up') {
    if (session.historyCursor === -1) {
      session.historyDraft = interactiveTerminalInput.value;
      session.historyCursor = history.length - 1;
    } else if (session.historyCursor > 0) {
      session.historyCursor -= 1;
    }

    interactiveTerminalInput.value = history[session.historyCursor] || '';
  } else if (direction === 'down') {
    if (session.historyCursor === -1) {
      return;
    }

    if (session.historyCursor < history.length - 1) {
      session.historyCursor += 1;
      interactiveTerminalInput.value = history[session.historyCursor] || '';
    } else {
      session.historyCursor = -1;
      interactiveTerminalInput.value = session.historyDraft || '';
      session.historyDraft = '';
    }
  }

  const end = interactiveTerminalInput.value.length;
  interactiveTerminalInput.setSelectionRange(end, end);
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
    const line = createLogLineElement(`log-line ${lineEntry.className}`.trim(), lineEntry.content);
    logsEl.appendChild(line);
  }

  logsEl.scrollTop = logsEl.scrollHeight;
}

async function createNewTerminalSession() {
  resetTerminalAutocompleteState();
  const created = await window.launcherApi.createTerminalSession({ terminalType: selectedTerminalType });
  const session = ensureTerminalSessionShape(created);
  if (!session) {
    return null;
  }

  touchTabOrder(`${TERMINAL_TAB_PREFIX}${session.id}`);
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

function resetTerminalAutocompleteState() {
  terminalAutocompleteState = null;
}

function replaceTerminalInputToken(start, end, replacement) {
  if (!interactiveTerminalInput) {
    return;
  }

  const value = interactiveTerminalInput.value;
  interactiveTerminalInput.value = `${value.slice(0, start)}${replacement}${value.slice(end)}`;
  const nextCursor = start + replacement.length;
  interactiveTerminalInput.setSelectionRange(nextCursor, nextCursor);
}

function canCycleAutocomplete(sessionId) {
  if (!terminalAutocompleteState || !interactiveTerminalInput) {
    return false;
  }

  if (terminalAutocompleteState.sessionId !== sessionId) {
    return false;
  }

  if (!Array.isArray(terminalAutocompleteState.suggestions) || terminalAutocompleteState.suggestions.length === 0) {
    return false;
  }

  const value = interactiveTerminalInput.value;
  const cursor = interactiveTerminalInput.selectionStart ?? value.length;
  const { prefix, suffix, tokenStart, tokenEnd } = terminalAutocompleteState;

  if (!value.startsWith(prefix) || !value.endsWith(suffix)) {
    return false;
  }

  return cursor >= tokenStart && cursor <= tokenEnd;
}

function applyNextAutocompleteSuggestion(step = 1) {
  if (!terminalAutocompleteState || !interactiveTerminalInput) {
    return;
  }

  const suggestions = terminalAutocompleteState.suggestions;
  const size = suggestions.length;
  const normalizedStep = step >= 0 ? 1 : -1;
  const baseIndex = terminalAutocompleteState.index;
  const seedIndex = baseIndex < 0 ? (normalizedStep > 0 ? -1 : 0) : baseIndex;
  const nextIndex = (seedIndex + normalizedStep + size) % size;
  const nextSuggestion = suggestions[nextIndex];

  replaceTerminalInputToken(terminalAutocompleteState.tokenStart, terminalAutocompleteState.tokenEnd, nextSuggestion);
  terminalAutocompleteState.index = nextIndex;
  terminalAutocompleteState.tokenEnd = terminalAutocompleteState.tokenStart + nextSuggestion.length;
}

function clearAutocompleteSuggestionsFromSession(sessionId) {
  const session = terminalSessions.get(sessionId);
  if (!session || !Array.isArray(session.lines)) {
    return;
  }

  const nextLines = session.lines.filter((lineEntry) => lineEntry.className !== 'interactive-terminal-completion');
  if (nextLines.length === session.lines.length) {
    return;
  }

  session.lines = nextLines;
  if (activeTerminalSessionId === sessionId) {
    renderTerminalOutput();
  }
}

function renderAutocompleteSuggestionsOnce(sessionId, suggestions) {
  if (!suggestions || suggestions.length === 0 || !terminalSessions.has(sessionId)) {
    return;
  }

  clearAutocompleteSuggestionsFromSession(sessionId);

  const line = suggestions
    .slice(0, 60)
    .map((item) => String(item || '').trim())
    .filter(Boolean)
    .join('  ');

  if (!line) {
    return;
  }

  appendTerminalLine(sessionId, line, 'interactive-terminal-completion');
}

function interruptActiveTerminalSession() {
  if (!isTerminalTab(activeLogTab) || !activeTerminalSessionId || !runningTerminalSessions.has(activeTerminalSessionId)) {
    return;
  }

  appendTerminalLine(activeTerminalSessionId, '^C', 'interactive-terminal-stderr');
  void window.launcherApi.interruptTerminalSession(activeTerminalSessionId);
}

async function handleTerminalTabAutocomplete(reverse = false) {
  const session = getActiveTerminalSession();
  if (!session || !interactiveTerminalInput || interactiveTerminalInput.disabled) {
    return;
  }

  if (canCycleAutocomplete(session.id)) {
    applyNextAutocompleteSuggestion(reverse ? -1 : 1);
    return;
  }

  const inputValue = interactiveTerminalInput.value;
  const cursor = interactiveTerminalInput.selectionStart ?? inputValue.length;
  let result = null;
  try {
    result = await window.launcherApi.completeTerminalInput(session.id, inputValue, cursor);
  } catch {
    resetTerminalAutocompleteState();
    return;
  }

  if (!result?.ok) {
    clearAutocompleteSuggestionsFromSession(session.id);
    resetTerminalAutocompleteState();
    return;
  }

  const tokenStart = Number.isInteger(result.start) ? result.start : cursor;
  const tokenEnd = Number.isInteger(result.end) ? result.end : cursor;
  const tokenValue = inputValue.slice(tokenStart, tokenEnd);
  const completion = String(result.completion ?? tokenValue);
  const suggestions = Array.isArray(result.suggestions)
    ? result.suggestions.map((entry) => String(entry?.replacement || '')).filter(Boolean)
    : [];
  const suggestionLabels = Array.isArray(result.suggestions)
    ? result.suggestions.map((entry) => String(entry?.display || '').trim()).filter(Boolean)
    : [];

  if (completion && completion !== tokenValue) {
    replaceTerminalInputToken(tokenStart, tokenEnd, completion);
  }

  if (suggestions.length === 0) {
    clearAutocompleteSuggestionsFromSession(session.id);
    resetTerminalAutocompleteState();
    return;
  }

  const prefix = inputValue.slice(0, tokenStart);
  const suffix = inputValue.slice(tokenEnd);

  // Keep state even for a single suggestion so repeated Tab does not clear the list.
  terminalAutocompleteState = {
    sessionId: session.id,
    prefix,
    suffix,
    tokenStart,
    tokenEnd: tokenStart + completion.length,
    suggestions,
    index: suggestions.length > 1 ? -1 : 0,
  };

  if (suggestions.length === 1) {
    renderAutocompleteSuggestionsOnce(session.id, suggestionLabels);
    if (suggestions[0] !== completion) {
      replaceTerminalInputToken(tokenStart, tokenStart + completion.length, suggestions[0]);
      terminalAutocompleteState.tokenEnd = tokenStart + suggestions[0].length;
    }
    return;
  }

  const currentValue = interactiveTerminalInput.value;
  const currentToken = currentValue.slice(prefix.length, currentValue.length - suffix.length);

  terminalAutocompleteState.tokenEnd = tokenStart + currentToken.length;

  renderAutocompleteSuggestionsOnce(session.id, suggestionLabels);
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

  resetTerminalAutocompleteState();
  clearAutocompleteSuggestionsFromSession(session.id);

  addTerminalCommandToHistory(session, trimmed);

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
  runningTerminalSessions.add(session.id);
  updateInterruptTerminalButtonState();

  if (interactiveTerminalRunButton) {
    interactiveTerminalRunButton.disabled = true;
  }

  if (interactiveTerminalInput) {
    interactiveTerminalInput.disabled = true;
  }

  try {
    const result = await window.launcherApi.runTerminalCommand(session.id, trimmed, {
      terminalType: session.terminalType || selectedTerminalType,
    });
    setTerminalCwd(session.id, result?.cwd || session.cwd);

    if (!result?.streamed) {
      for (const line of splitTerminalText(result?.output || '')) {
        appendTerminalLine(session.id, line, 'interactive-terminal-stdout');
      }

      for (const line of splitTerminalText(result?.error || '')) {
        appendTerminalLine(session.id, line, 'interactive-terminal-stderr');
      }
    }

    appendTerminalLine(session.id, `[exit ${result?.exitCode ?? 1}]`, 'interactive-terminal-exit');
  } catch (error) {
    appendTerminalLine(session.id, String(error?.message || error), 'interactive-terminal-stderr');
    appendTerminalLine(session.id, '[exit 1]', 'interactive-terminal-exit');
  } finally {
    runningTerminalSessions.delete(session.id);
    updateInterruptTerminalButtonState();

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
      return 'kimbie-dark';
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
  if (running) {
    touchTabOrder(scriptName);
  }
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
  await refreshTerminalSessions();
  scriptsState = await window.launcherApi.listScripts();
  renderScripts();
  renderLogTabs();
  renderLogs();
}

async function refreshTerminalSessions() {
  const existingSessions = await window.launcherApi.listTerminalSessions();
  const nextSessionIds = new Set();

  for (const session of existingSessions) {
    const normalized = ensureTerminalSessionShape(session);
    if (!normalized) {
      continue;
    }

    nextSessionIds.add(normalized.id);
    registerTabOrder(`${TERMINAL_TAB_PREFIX}${normalized.id}`);
  }

  for (const sessionId of Array.from(terminalSessions.keys())) {
    if (!nextSessionIds.has(sessionId)) {
      terminalSessions.delete(sessionId);
      runningTerminalSessions.delete(sessionId);
    }
  }

  if (activeTerminalSessionId && !terminalSessions.has(activeTerminalSessionId)) {
    activeTerminalSessionId = null;
    if (isTerminalTab(activeLogTab)) {
      activeLogTab = 'all';
    }
  }

  if (terminalSessions.size > 0 && !activeTerminalSessionId) {
    activeTerminalSessionId = Array.from(terminalSessions.keys())[0];
  }
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
interruptTerminalButton.addEventListener('click', () => {
  interruptActiveTerminalSession();
});
closeTerminalSessionButton?.addEventListener('click', () => {
  if (!activeTerminalSessionId) {
    return;
  }

  void closeTerminalSession(activeTerminalSessionId);
});
expandLogsButton.addEventListener('click', () => {
  const isExpanded = layoutEl.classList.toggle('terminal-fullscreen');
  expandLogsButton.setAttribute('aria-pressed', String(isExpanded));
  expandLogsButton.setAttribute('data-tooltip', isExpanded ? 'Collapse terminal' : 'Expand terminal');
  expandLogsButton.setAttribute('aria-label', isExpanded ? 'Collapse terminal' : 'Expand terminal');
  try {
    window.localStorage.setItem(TERMINAL_FULLSCREEN_STORAGE_KEY, String(isExpanded));
  } catch {
    // Ignore storage failures.
  }
});
terminalFontDecreaseButton?.addEventListener('click', () => {
  changeTerminalFontSize(-TERMINAL_FONT_SIZE_STEP);
});
terminalFontResetButton?.addEventListener('click', () => {
  resetTerminalFontSize();
});
terminalFontIncreaseButton?.addEventListener('click', () => {
  changeTerminalFontSize(TERMINAL_FONT_SIZE_STEP);
});
terminalTypeTrigger?.addEventListener('click', toggleTerminalTypeMenu);
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
interactiveTerminalInput.addEventListener('keydown', (event) => {
  if (!isTerminalTab(activeLogTab) || !activeTerminalSessionId) {
    return;
  }

  if (event.key === 'Tab') {
    event.preventDefault();
    void handleTerminalTabAutocomplete(Boolean(event.shiftKey));
    return;
  }

  if (event.key === 'ArrowUp') {
    event.preventDefault();
    navigateTerminalHistory('up');
    return;
  }

  if (event.key === 'ArrowDown') {
    event.preventDefault();
    navigateTerminalHistory('down');
  }
});
interactiveTerminalInput.addEventListener('input', () => {
  resetTerminalAutocompleteState();
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
  const target = event.target;
  if (!(target instanceof Node)) {
    return;
  }

  if (terminalThemeMenu && terminalThemeTrigger) {
    const clickedInsideSelector = terminalThemeMenu.contains(target) || terminalThemeTrigger.contains(target);
    if (!clickedInsideSelector) {
      closeThemeMenu();
    }
  }

  if (terminalTypeMenu && terminalTypeTrigger) {
    const clickedInsideTerminalType = terminalTypeMenu.contains(target) || terminalTypeTrigger.contains(target);
    if (!clickedInsideTerminalType) {
      closeTerminalTypeMenu();
    }
  }

  if (packageSourceMenu && packageSourceTrigger) {
    const clickedInsidePackageSelector = packageSourceMenu.contains(target) || packageSourceTrigger.contains(target);
    if (!clickedInsidePackageSelector) {
      closePackageSourceMenu();
    }
  }
});
document.addEventListener('keydown', (event) => {
  const isCtrlShortcut = event.ctrlKey && !event.metaKey && !event.altKey;
  if (isCtrlShortcut) {
    const key = String(event.key);
    const code = String(event.code || '');

    if (event.key === 'Enter' || code === 'Enter' || code === 'NumpadEnter') {
      event.preventDefault();
      expandLogsButton?.click();
      return;
    }

    if (String(key).toLowerCase() === 'n' || code === 'KeyN') {
      event.preventDefault();
      void createNewTerminalSession().then((session) => {
        if (session && interactiveTerminalInput) {
          interactiveTerminalInput.focus();
        }
      });
      return;
    }

    if (String(key).toLowerCase() === 's' || code === 'KeyS') {
      event.preventDefault();
      void refreshScripts();
      return;
    }

    if (String(key).toLowerCase() === 'd' || code === 'KeyD') {
      event.preventDefault();
      clearLogs();
      return;
    }

    if (String(key).toLowerCase() === 'q' || code === 'KeyQ') {
      event.preventDefault();
      if (activeTerminalSessionId) {
        void closeTerminalSession(activeTerminalSessionId);
      }
      return;
    }

    if (String(key).toLowerCase() === 'x' || code === 'KeyX') {
      event.preventDefault();
      interruptActiveTerminalSession();
      return;
    }

    if (key === '+' || (key === '=' && event.shiftKey) || code === 'NumpadAdd') {
      event.preventDefault();
      changeTerminalFontSize(TERMINAL_FONT_SIZE_STEP);
      return;
    }

    if (key === '-' || key === '_' || code === 'NumpadSubtract') {
      event.preventDefault();
      changeTerminalFontSize(-TERMINAL_FONT_SIZE_STEP);
      return;
    }

    if (key === '0' || code === 'Numpad0') {
      event.preventDefault();
      resetTerminalFontSize();
      return;
    }
  }

  if (
    (event.ctrlKey || event.metaKey) &&
    String(event.key).toLowerCase() === 'c' &&
    isTerminalTab(activeLogTab) &&
    activeTerminalSessionId &&
    runningTerminalSessions.has(activeTerminalSessionId)
  ) {
    event.preventDefault();
    interruptActiveTerminalSession();
    return;
  }

  if (event.key === 'Escape') {
    closeThemeMenu();
    closeTerminalTypeMenu();
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

window.launcherApi.onTerminalOutput(({ sessionId, stream, message }) => {
  const className = stream === 'stderr' ? 'interactive-terminal-stderr' : 'interactive-terminal-stdout';

  for (const line of splitTerminalText(message || '')) {
    appendTerminalLine(sessionId, line, className);
  }
});

async function init() {
  favoriteScripts = readSavedFavorites();
  applyTerminalTheme(readSavedTerminalTheme());
  applyTerminalFontSize(readSavedTerminalFontSize());
  restoreFilters();
  restoreLogTabOrder();

  try {
    if (window.localStorage.getItem(TERMINAL_FULLSCREEN_STORAGE_KEY) === 'true' && layoutEl && expandLogsButton) {
      layoutEl.classList.add('terminal-fullscreen');
      expandLogsButton.setAttribute('aria-pressed', 'true');
      expandLogsButton.setAttribute('data-tooltip', 'Collapse terminal');
      expandLogsButton.setAttribute('aria-label', 'Collapse terminal');
    }
  } catch {
    // Ignore storage failures.
  }
  await refreshPackageSourceUi();
  populateTerminalTypeSelector(await window.launcherApi.getTerminalTypes());
  await refreshScripts();

  // Re-render after restoring terminal sessions so Session tabs appear on first load.
  renderLogTabs();
  renderLogs();

  if (interactiveTerminalBar) {
    interactiveTerminalBar.hidden = true;
  }
  updateConsoleSurface();
}

void init();
