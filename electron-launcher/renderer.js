const scriptsList = document.getElementById('scriptsList');
const logsEl = document.getElementById('logs');
const logTabsEl = document.getElementById('logTabs');
const refreshButton = document.getElementById('refreshButton');
const quitButton = document.getElementById('quitButton');
const quitButtonTooltip = document.getElementById('quitButtonTooltip');
const clearLogsButton = document.getElementById('clearLogsButton');
const exportLogsButton = document.getElementById('exportLogsButton');
const launcherToast = document.getElementById('launcherToast');
const byModuleOverlay = document.getElementById('byModuleOverlay');
const byModuleTitle = document.getElementById('byModuleTitle');
const byModuleSubtitle = document.getElementById('byModuleSubtitle');
const byModuleSelect = document.getElementById('byModuleSelect');
const byModuleWatchRow = document.getElementById('byModuleWatchRow');
const byModuleWatch = document.getElementById('byModuleWatch');
const byModuleCoverageRow = document.getElementById('byModuleCoverageRow');
const byModuleCoverage = document.getElementById('byModuleCoverage');
const byModuleDocsRow = document.getElementById('byModuleDocsRow');
const byModuleDocs = document.getElementById('byModuleDocs');
const byModuleStatus = document.getElementById('byModuleStatus');
const byModuleCancelButton = document.getElementById('byModuleCancelButton');
const byModuleRunButton = document.getElementById('byModuleRunButton');
const shutdownOverlay = document.getElementById('shutdownOverlay');
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
const terminalFontMenuTrigger = document.getElementById('terminalFontMenuTrigger');
const terminalFontMenuValue = document.getElementById('terminalFontMenuValue');
const terminalFontMenu = document.getElementById('terminalFontMenu');
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
const filterModeToggleButton = document.getElementById('filterModeToggleButton');

const LAUNCH_QUERY_PARAMS = (() => {
  try {
    return new URLSearchParams(window.location.search || '');
  } catch {
    return new URLSearchParams('');
  }
})();
const INITIAL_BY_MODULE_MODE = String(LAUNCH_QUERY_PARAMS.get('byModule') || '')
  .trim()
  .toLowerCase();
const IS_MODAL_ONLY_BY_MODULE = ['1', 'true', 'yes'].includes(
  String(LAUNCH_QUERY_PARAMS.get('modalOnly') || '')
    .trim()
    .toLowerCase()
);

const FILTER_STATE_STORAGE_KEY = 'launcher.filters.v1';
const FAVORITES_STORAGE_KEY = 'launcher.favorites.v1';
const DEFAULT_FILTER_STATE = { running: false, favorites: true, mode: 'and' };
const TERMINAL_THEME_STORAGE_KEY = 'launcher.terminal-theme.v1';
const TERMINAL_THEME_CHANGED_EVENT = 'launcher:terminal-theme-changed';
const TERMINAL_FONT_SIZE_STORAGE_KEY = 'launcher.terminal-font-size.v1';
const LOG_TAB_ORDER_STORAGE_KEY = 'launcher.log-tab-order.v1';
const ACTIVE_LOG_TAB_STORAGE_KEY = 'launcher.active-log-tab.v1';
const TERMINAL_FULLSCREEN_STORAGE_KEY = 'launcher.terminal-fullscreen.v1';
const TERMINAL_TYPE_STORAGE_KEY = 'launcher.terminal-type.v1';
const ANSI_NON_SGR_CONTROL_SEQUENCE_PATTERN = /\u001b\[(?![0-9;]*m)[0-9;?]*[ -/]*[@-~]/g;
const ANSI_OSC_PATTERN = /\u001b\][^\u0007]*(?:\u0007|\u001b\\)/g;
const ANSI_SGR_PATTERN = /\u001b\[([0-9;]*)m/g;
const TERMINAL_THEMES = new Set([
  'ocean',
  'light',
  'solarized-light',
  'tokion-night-light',
  'red',
  'kimbie-dark',
  'solarized-dark',
  'dark',
]);
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
  'kimbie-dark': 'Kimbie Dark',
  'solarized-dark': 'Solarized Dark',
  dark: 'Dark',
};
const PACKAGE_SOURCE_LABELS = {
  dev: 'Dev (current repository)',
  prod: 'Prod (project root)',
  custom: 'Other...',
};
const BY_MODULE_PREFS_STORAGE_KEY = 'launcher.by-module-prefs.v1';
const BY_MODULE_MODES = {
  tests: {
    scriptName: 'test-by-module',
    title: 'Run Unit Tests by Module',
    subtitle: 'Select a module and run its specs from the terminal.',
    runLabel: 'Run tests',
    loadingLabel: 'Loading modules...',
    emptyLabel: 'No modules found.',
    modeLabel: 'tests',
    availableGroupLabel: 'Modules with tests',
    unavailableGroupLabel: 'Modules without tests',
    showWatch: true,
    showCoverage: true,
    showDocs: false,
  },
  storybook: {
    scriptName: 'storybook-by-module',
    title: 'Run Storybook by Module',
    subtitle: 'Select a module and run its Storybook target from the terminal.',
    runLabel: 'Run storybook',
    loadingLabel: 'Loading modules...',
    emptyLabel: 'No modules found.',
    modeLabel: 'Storybook',
    availableGroupLabel: 'Modules with Storybook',
    unavailableGroupLabel: 'Modules without Storybook',
    showWatch: false,
    showCoverage: false,
    showDocs: true,
  },
};

let scriptsState = [];
let activeLogTab = 'all';
const logsByScript = new Map([['all', []]]);
let favoriteScripts = new Set();
let filterMode = 'or';
let defaultFilterMode = DEFAULT_FILTER_STATE.mode;

let packageSourceState = null;
const urlPattern = /https?:\/\/[^\s<>"]+/gi;
let activeTerminalSessionId = null;
const terminalSessions = new Map();
const TERMINAL_TAB_PREFIX = 'terminal:';
const TERMINAL_HISTORY_LIMIT = 200;
const TERMINAL_DEFAULT_PLACEHOLDER = 'Type a command and press Enter';
const TERMINAL_PASSWORD_PLACEHOLDER = 'Enter sudo password and press Enter';
const SUDO_PASSWORD_PROMPT_PATTERN =
  /(?:^|\s)(?:\[sudo\]\s*)?password(?:\s+for\s+[^:]+)?\s*:\s*$|^\s*contrase(?:n|ñ)a(?:\s+de\s+sudo)?\s*:\s*$/i;
let editingTerminalSessionId = null;
const runningTerminalSessions = new Set();
const terminalPasswordPromptSessions = new Set();
const orderedLogTabs = [];
let terminalAutocompleteState = null;
let draggedLogTabName = null;
let terminalFontSizePx = TERMINAL_FONT_SIZE_DEFAULT;
let terminalTypeOptions = [];
let selectedTerminalType = 'cmd';
let defaultTerminalType = 'cmd';
let logTabTooltipPortalEl = null;
let activeLogTabTooltipTarget = null;
let launcherToastHideTimer = null;
let isQuitInProgress = false;
let byModuleDialogState = null;
const IS_MACOS = /mac/i.test(String(globalThis?.navigator?.platform || ''));
const IS_LINUX = /linux/i.test(String(globalThis?.navigator?.platform || ''));
const IS_WINDOWS = /win/i.test(String(globalThis?.navigator?.platform || ''));

function getTerminalTypeMeta(typeId) {
  const normalized = String(typeId || '')
    .trim()
    .toLowerCase();
  return terminalTypeOptions.find((entry) => entry.id === normalized) || null;
}

function getTerminalTypeVisual(typeId) {
  const normalized = String(typeId || '')
    .trim()
    .toLowerCase();

  if (normalized === 'powershell') {
    return { iconText: '>_', iconClass: 'terminal-type-icon-powershell' };
  }

  if (normalized === 'pwsh') {
    return { iconText: 'PS', iconClass: 'terminal-type-icon-pwsh' };
  }

  if (normalized === 'git-bash') {
    return { iconText: '$', iconClass: 'terminal-type-icon-git-bash' };
  }

  if (IS_MACOS) {
    return { iconText: '>_', iconClass: 'terminal-type-icon-macos' };
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
    return String(window.localStorage.getItem(TERMINAL_TYPE_STORAGE_KEY) || '')
      .trim()
      .toLowerCase();
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
  const normalized = String(typeId || defaultTerminalType || 'cmd')
    .trim()
    .toLowerCase();
  const availableIds = new Set(terminalTypeOptions.map((entry) => entry.id));
  selectedTerminalType = availableIds.has(normalized) ? normalized : defaultTerminalType;

  const selectedOption = terminalTypeOptions.find((entry) => entry.id === selectedTerminalType);
  if (selectedOption) {
    if (terminalTypeIcon) {
      terminalTypeIcon.className = `terminal-type-trigger-icon ${selectedOption.iconClass}`;
      terminalTypeIcon.textContent = selectedOption.iconText || '';
      terminalTypeIcon.removeAttribute('title');
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

  const showSelector = supported && terminalTypeOptions.length > 1;
  terminalTypeSelector.hidden = !showSelector;

  terminalTypeSelector.classList.toggle('terminal-type-selector-combined', showSelector);
  toggleTerminalButton?.classList.toggle('terminal-type-button-combined', showSelector);

  defaultTerminalType = String(config?.defaultType || terminalTypeOptions[0]?.id || 'cmd').toLowerCase();
  const preferredType = readSavedTerminalType() || defaultTerminalType;
  applyTerminalTypeSelection(preferredType);
  renderTerminalTypeMenu();
  closeTerminalTypeMenu();
}

function normalizeTerminalFontSize(value) {
  if (value === null || value === undefined || String(value).trim() === '') {
    return TERMINAL_FONT_SIZE_DEFAULT;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed === 0) {
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

function formatTerminalFontSizeLabel(sizePx) {
  const rounded = Math.round(sizePx * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

function updateTerminalFontMenuLabel() {
  const label = formatTerminalFontSizeLabel(terminalFontSizePx);

  if (terminalFontMenuValue) {
    terminalFontMenuValue.textContent = label;
  }

  if (terminalFontMenuTrigger) {
    terminalFontMenuTrigger.setAttribute('aria-label', `Terminal font size ${label}px`);
  }
}

function openTerminalFontMenu() {
  if (!terminalFontMenu || !terminalFontMenuTrigger) {
    return;
  }

  terminalFontMenu.hidden = false;
  terminalFontMenuTrigger.setAttribute('aria-expanded', 'true');
}

function closeTerminalFontMenu() {
  if (!terminalFontMenu || !terminalFontMenuTrigger) {
    return;
  }

  terminalFontMenu.hidden = true;
  terminalFontMenuTrigger.setAttribute('aria-expanded', 'false');
}

function toggleTerminalFontMenu() {
  if (!terminalFontMenu) {
    return;
  }

  if (terminalFontMenu.hidden) {
    openTerminalFontMenu();
    return;
  }

  closeTerminalFontMenu();
}

function applyTerminalFontSize(sizePx) {
  terminalFontSizePx = normalizeTerminalFontSize(sizePx);
  document.body.style.setProperty('--terminal-font-size-px', `${terminalFontSizePx}px`);
  updateTerminalFontButtonsState();
  updateTerminalFontMenuLabel();
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

function normalizeAnsiSgrInsideUrls(value) {
  return String(value ?? '').replace(/https?:\/\/[^\s<>"]+/gi, (urlToken) => {
    // Keep ANSI rendering globally, but remove SGR codes injected inside URL tokens
    // so link parsing does not split host/port segments.
    return urlToken.replace(/\u001b\[[0-9;]*m/g, '');
  });
}

function clampAnsiRgbChannel(value) {
  const channel = Number(value);
  if (!Number.isFinite(channel)) {
    return 0;
  }
  return Math.max(0, Math.min(255, Math.trunc(channel)));
}

function rgbToHex(red, green, blue) {
  const r = clampAnsiRgbChannel(red);
  const g = clampAnsiRgbChannel(green);
  const b = clampAnsiRgbChannel(blue);
  return `#${[r, g, b].map((channel) => channel.toString(16).padStart(2, '0')).join('')}`;
}

function parseCssColorToRgb(value) {
  const raw = String(value || '').trim();
  if (!raw) {
    return null;
  }

  const hexMatch = raw.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hexMatch) {
    const hex = hexMatch[1];
    if (hex.length === 3) {
      return {
        red: Number.parseInt(`${hex[0]}${hex[0]}`, 16),
        green: Number.parseInt(`${hex[1]}${hex[1]}`, 16),
        blue: Number.parseInt(`${hex[2]}${hex[2]}`, 16),
      };
    }

    return {
      red: Number.parseInt(hex.slice(0, 2), 16),
      green: Number.parseInt(hex.slice(2, 4), 16),
      blue: Number.parseInt(hex.slice(4, 6), 16),
    };
  }

  const rgbMatch = raw.match(/^rgba?\(([^)]+)\)$/i);
  if (!rgbMatch) {
    return null;
  }

  const parts = rgbMatch[1]
    .split(',')
    .map((part) => Number.parseFloat(part.trim()))
    .filter((part) => Number.isFinite(part));

  if (parts.length < 3) {
    return null;
  }

  return {
    red: clampAnsiRgbChannel(parts[0]),
    green: clampAnsiRgbChannel(parts[1]),
    blue: clampAnsiRgbChannel(parts[2]),
  };
}

function getRelativeLuminance(red, green, blue) {
  const normalize = (channel) => {
    const sRgb = clampAnsiRgbChannel(channel) / 255;
    return sRgb <= 0.03928 ? sRgb / 12.92 : ((sRgb + 0.055) / 1.055) ** 2.4;
  };

  const r = normalize(red);
  const g = normalize(green);
  const b = normalize(blue);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function getThemeAwareAnsiBasePalette() {
  const darkBackgroundPalette = [
    '#000000',
    '#aa0000',
    '#00aa00',
    '#aa5500',
    '#0000aa',
    '#aa00aa',
    '#00aaaa',
    '#aaaaaa',
    '#555555',
    '#ff5555',
    '#55ff55',
    '#ffff55',
    '#5555ff',
    '#ff55ff',
    '#55ffff',
    '#ffffff',
  ];

  const lightBackgroundPalette = [
    '#24292f',
    '#cf222e',
    '#1a7f37',
    '#9a6700',
    '#0969da',
    '#8250df',
    '#1b7c83',
    '#57606a',
    '#6e7781',
    '#a40e26',
    '#116329',
    '#7d4e00',
    '#0550ae',
    '#6639ba',
    '#0f5f66',
    '#1f2328',
  ];

  const palettesByTheme = {
    ocean: ['#0b1321', '#db3b50', '#2ec27e', '#d38f20', '#3f8cff', '#c061cb', '#2db8b8', '#d8e2f0', '#3e4f66', '#ff6b81', '#51e59a', '#f2b84a', '#78abff', '#e19be7', '#59d9d9', '#f3f7ff'],
    dark: ['#11161f', '#e75b66', '#33c36e', '#d9a036', '#5a9bff', '#d17ae8', '#43c9cf', '#dbe6f5', '#3a475a', '#ff7f8e', '#54de8c', '#efbc58', '#82b5ff', '#e4a2f4', '#6edee2', '#f6faff'],
    'solarized-dark': ['#073642', '#dc322f', '#859900', '#b58900', '#268bd2', '#d33682', '#2aa198', '#93a1a1', '#586e75', '#ff5f56', '#a3be3b', '#d7b45a', '#5ca9df', '#e56ea7', '#52c6be', '#dce6e8'],
    'kimbie-dark': ['#1f1a14', '#f26a6a', '#9bcf6d', '#d9b35f', '#7aa6ff', '#d48be6', '#66c2b3', '#dbc7a8', '#5a4b37', '#ff8d8d', '#b4df88', '#e9c37b', '#9bc0ff', '#e4a6f0', '#83d4c7', '#f2e2cb'],
    light: ['#2f3742', '#c92f3d', '#1e7f3f', '#946300', '#1767cc', '#7a4dcf', '#1a7c83', '#4f5f72', '#6a7380', '#ab1f2e', '#166431', '#7f5500', '#0f57ad', '#6841ba', '#12666b', '#232a33'],
    'solarized-light': ['#586e75', '#dc322f', '#859900', '#b58900', '#268bd2', '#d33682', '#2aa198', '#657b83', '#93a1a1', '#cb4b16', '#6c8f0f', '#9a7b16', '#1f76b4', '#b84f8f', '#279489', '#3f5058'],
    'tokion-night-light': ['#404a63', '#c14a6b', '#2a8a60', '#9b730e', '#3f6fca', '#7c5bc1', '#2a8191', '#58627a', '#737c97', '#a53c59', '#1f7550', '#87620f', '#325dae', '#6a48a7', '#226f7d', '#3b445a'],
    red: ['#2e0f12', '#ff8c8c', '#ffd69a', '#ffe28f', '#ffb3c6', '#f0a7ff', '#ffb89e', '#ffe9e9', '#6b2a2a', '#ffacac', '#ffe4b8', '#ffeeb0', '#ffc8d6', '#f5bcff', '#ffd0b6', '#fff6f6'],
  };

  const themeName = String(document.body.dataset.terminalTheme || 'ocean').trim().toLowerCase();
  const themePalette = palettesByTheme[themeName] || palettesByTheme[themeName === 'kdark' ? 'kimbie-dark' : ''];
  if (Array.isArray(themePalette) && themePalette.length === 16) {
    return themePalette;
  }

  const computedStyles = window.getComputedStyle(document.body);
  const backgroundValue = computedStyles.getPropertyValue('--terminal-body-bg').trim();
  const backgroundRgb = parseCssColorToRgb(backgroundValue);
  if (!backgroundRgb) {
    return darkBackgroundPalette;
  }

  const luminance = getRelativeLuminance(backgroundRgb.red, backgroundRgb.green, backgroundRgb.blue);
  return luminance > 0.5 ? lightBackgroundPalette : darkBackgroundPalette;
}

function ansiIndexedColorToHex(index) {
  const normalized = Number(index);
  if (!Number.isFinite(normalized)) {
    return null;
  }

  const value = Math.max(0, Math.min(255, Math.trunc(normalized)));

  const basePalette = getThemeAwareAnsiBasePalette();

  if (value < 16) {
    return basePalette[value];
  }

  if (value >= 16 && value <= 231) {
    const cube = value - 16;
    const red = Math.floor(cube / 36);
    const green = Math.floor((cube % 36) / 6);
    const blue = cube % 6;
    const levels = [0, 95, 135, 175, 215, 255];
    return rgbToHex(levels[red], levels[green], levels[blue]);
  }

  const gray = 8 + (value - 232) * 10;
  return rgbToHex(gray, gray, gray);
}

function ansiCodeToColor(code) {
  const numericCode = Number(code);
  if (!Number.isFinite(numericCode)) {
    return null;
  }

  if (numericCode >= 30 && numericCode <= 37) {
    return ansiIndexedColorToHex(numericCode - 30);
  }

  if (numericCode >= 90 && numericCode <= 97) {
    return ansiIndexedColorToHex(numericCode - 90 + 8);
  }

  return null;
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

    const resolvedColor = styleState.inverse ? styleState.backgroundColor || 'currentColor' : styleState.color;
    const resolvedBackgroundColor = styleState.inverse
      ? styleState.color || 'currentColor'
      : styleState.backgroundColor;

    if (resolvedColor) {
      element.style.color = resolvedColor;
    }

    if (resolvedBackgroundColor) {
      element.style.backgroundColor = resolvedBackgroundColor;
    }

    if (styleState.bold) {
      element.style.fontWeight = '700';
    }

    if (styleState.dim) {
      element.style.opacity = '0.75';
    }

    if (styleState.italic) {
      element.style.fontStyle = 'italic';
    }

    const textDecorations = [];
    if (styleState.underline) {
      textDecorations.push('underline');
    }
    if (styleState.strikethrough) {
      textDecorations.push('line-through');
    }
    if (textDecorations.length > 0) {
      element.style.textDecoration = textDecorations.join(' ');
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
  const normalized = normalizeAnsiSgrInsideUrls(normalizeRenderedLogText(text));
  const styleState = {
    color: null,
    backgroundColor: null,
    bold: false,
    dim: false,
    italic: false,
    underline: false,
    inverse: false,
    strikethrough: false,
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

    for (let codeIndex = 0; codeIndex < codes.length; codeIndex += 1) {
      const code = codes[codeIndex];
      if (!Number.isFinite(code)) {
        continue;
      }

      if (code === 0) {
        styleState.color = null;
        styleState.backgroundColor = null;
        styleState.bold = false;
        styleState.dim = false;
        styleState.italic = false;
        styleState.underline = false;
        styleState.inverse = false;
        styleState.strikethrough = false;
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

      if (code === 3) {
        styleState.italic = true;
        continue;
      }

      if (code === 23) {
        styleState.italic = false;
        continue;
      }

      if (code === 4) {
        styleState.underline = true;
        continue;
      }

      if (code === 24) {
        styleState.underline = false;
        continue;
      }

      if (code === 7) {
        styleState.inverse = true;
        continue;
      }

      if (code === 27) {
        styleState.inverse = false;
        continue;
      }

      if (code === 9) {
        styleState.strikethrough = true;
        continue;
      }

      if (code === 29) {
        styleState.strikethrough = false;
        continue;
      }

      if (code === 39) {
        styleState.color = null;
        continue;
      }

      if (code === 49) {
        styleState.backgroundColor = null;
        continue;
      }

      if (code >= 40 && code <= 47) {
        styleState.backgroundColor = ansiIndexedColorToHex(code - 40);
        continue;
      }

      if (code >= 100 && code <= 107) {
        styleState.backgroundColor = ansiIndexedColorToHex(code - 100 + 8);
        continue;
      }

      if (code === 38 || code === 48) {
        const isBackground = code === 48;
        const mode = codes[codeIndex + 1];

        if (mode === 5) {
          const indexedColor = ansiIndexedColorToHex(codes[codeIndex + 2]);
          if (indexedColor) {
            if (isBackground) {
              styleState.backgroundColor = indexedColor;
            } else {
              styleState.color = indexedColor;
            }
          }
          codeIndex += 2;
        } else if (mode === 2) {
          const red = codes[codeIndex + 2];
          const green = codes[codeIndex + 3];
          const blue = codes[codeIndex + 4];
          if ([red, green, blue].every((value) => Number.isFinite(value))) {
            const rgbColor = rgbToHex(red, green, blue);
            if (isBackground) {
              styleState.backgroundColor = rgbColor;
            } else {
              styleState.color = rgbColor;
            }
          }
          codeIndex += 4;
        }

        continue;
      }

      if (code >= 30 && code <= 37) {
        styleState.color = ansiIndexedColorToHex(code - 30);
        continue;
      }

      if (code >= 90 && code <= 97) {
        styleState.color = ansiIndexedColorToHex(code - 90 + 8);
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

  const normalized = normalizeRenderedLogText(text);
  const plainWithoutSgr = normalized.replace(/\u001b\[[0-9;]*m/g, '');
  const hasSgrCodes = /\u001b\[[0-9;]*m/.test(normalized);

  // Some Windows tools inject ANSI SGR codes in the middle of URLs (e.g. before :4200),
  // which breaks link parsing into partial links like http://localhost.
  // If ANSI is present, prioritize preserving terminal styling over linkification.
  if (/https?:\/\//i.test(plainWithoutSgr) && !hasSgrCodes) {
    appendTextWithLinks(line, plainWithoutSgr);
    return line;
  }

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

function readSavedActiveLogTab() {
  try {
    return String(window.localStorage.getItem(ACTIVE_LOG_TAB_STORAGE_KEY) || '').trim();
  } catch {
    return '';
  }
}

function saveActiveLogTab(tabName) {
  const normalized = String(tabName || 'all').trim() || 'all';
  try {
    window.localStorage.setItem(ACTIVE_LOG_TAB_STORAGE_KEY, normalized);
  } catch {
    // Ignore storage failures.
  }
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

function ensureLogTabTooltipPortal() {
  if (logTabTooltipPortalEl && document.body.contains(logTabTooltipPortalEl)) {
    return logTabTooltipPortalEl;
  }

  const tooltip = document.createElement('div');
  tooltip.className = 'log-tab-tooltip-portal';
  tooltip.setAttribute('role', 'tooltip');
  tooltip.hidden = true;
  document.body.appendChild(tooltip);
  logTabTooltipPortalEl = tooltip;
  return tooltip;
}

function hideLogTabTooltipPortal() {
  activeLogTabTooltipTarget = null;
  if (!logTabTooltipPortalEl) {
    return;
  }

  logTabTooltipPortalEl.hidden = true;
  logTabTooltipPortalEl.textContent = '';
}

function positionLogTabTooltipPortal(target) {
  const tooltip = ensureLogTabTooltipPortal();
  if (!tooltip || !target) {
    return;
  }

  const targetRect = target.getBoundingClientRect();
  const gap = 8;
  tooltip.hidden = false;
  tooltip.style.left = '0px';
  tooltip.style.top = '0px';

  const tooltipRect = tooltip.getBoundingClientRect();
  const minLeft = 8;
  const maxLeft = Math.max(minLeft, window.innerWidth - tooltipRect.width - 8);
  const tooltipAlign = String(target?.getAttribute('data-tooltip-align') || 'center')
    .trim()
    .toLowerCase();
  const targetCenterX = targetRect.left + targetRect.width / 2;
  // Keep arrow center (0.76rem + 0.23rem ~= 16px) right under the terminal icon.
  const arrowCenterOffsetPx = 16;
  const preferredLeft = tooltipAlign === 'start' ? targetRect.left : targetCenterX - arrowCenterOffsetPx;
  const left = Math.min(maxLeft, Math.max(minLeft, preferredLeft));

  let top = targetRect.bottom + gap;
  let side = 'bottom';
  if (top + tooltipRect.height > window.innerHeight - 8) {
    top = Math.max(8, targetRect.top - tooltipRect.height - gap);
    side = 'top';
  }

  tooltip.style.left = `${Math.round(left)}px`;
  tooltip.style.top = `${Math.round(top)}px`;
  tooltip.dataset.side = side;
}

function showLogTabTooltipPortal(target) {
  const tooltipText = String(target?.getAttribute('data-tooltip') || '').trim();
  if (!tooltipText) {
    hideLogTabTooltipPortal();
    return;
  }

  const tooltip = ensureLogTabTooltipPortal();
  if (!tooltip) {
    return;
  }

  const forceOpaque = tooltipText.toLowerCase() === 'script is running';

  const isDisabled =
    target instanceof HTMLButtonElement
      ? target.disabled
      : String(target?.getAttribute('aria-disabled') || '').toLowerCase() === 'true';

  tooltip.textContent = tooltipText;
  tooltip.dataset.sourceDisabled = String(isDisabled && !forceOpaque);
  activeLogTabTooltipTarget = target;
  positionLogTabTooltipPortal(target);
}

function refreshLogTabTooltipPortalPosition() {
  if (!activeLogTabTooltipTarget || !document.body.contains(activeLogTabTooltipTarget)) {
    hideLogTabTooltipPortal();
    return;
  }

  positionLogTabTooltipPortal(activeLogTabTooltipTarget);
}

function handleLogTabsWheelScroll(event) {
  if (!logTabsEl) {
    return;
  }

  const delta = Math.abs(event.deltaX) > 0 ? event.deltaX : event.deltaY;
  if (!delta) {
    return;
  }

  const maxScrollLeft = Math.max(0, logTabsEl.scrollWidth - logTabsEl.clientWidth);
  if (maxScrollLeft <= 0) {
    return;
  }

  const nextScrollLeft = Math.min(maxScrollLeft, Math.max(0, logTabsEl.scrollLeft + delta));
  if (nextScrollLeft === logTabsEl.scrollLeft) {
    return;
  }

  event.preventDefault();
  logTabsEl.scrollLeft = nextScrollLeft;
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

function isTerminalSessionRunning(sessionId) {
  return Boolean(sessionId && runningTerminalSessions.has(sessionId));
}

function isAwaitingTerminalPassword(sessionId) {
  return Boolean(sessionId && terminalPasswordPromptSessions.has(sessionId));
}

function updateInteractiveTerminalInputMode() {
  if (!interactiveTerminalInput) {
    return;
  }

  const sessionId = isTerminalTab(activeLogTab) ? activeTerminalSessionId : null;
  const awaitingPassword = Boolean(sessionId && isAwaitingTerminalPassword(sessionId));
  const running = Boolean(sessionId && isTerminalSessionRunning(sessionId));

  interactiveTerminalInput.type = awaitingPassword ? 'password' : 'text';
  interactiveTerminalInput.placeholder = awaitingPassword
    ? TERMINAL_PASSWORD_PLACEHOLDER
    : TERMINAL_DEFAULT_PLACEHOLDER;

  if (interactiveTerminalRunButton && sessionId) {
    interactiveTerminalRunButton.disabled = false;
  }
}

function markTerminalSessionAwaitingPassword(sessionId, awaitingPassword) {
  if (!sessionId) {
    return;
  }

  if (awaitingPassword) {
    terminalPasswordPromptSessions.add(sessionId);
  } else {
    terminalPasswordPromptSessions.delete(sessionId);
  }

  if (activeTerminalSessionId === sessionId) {
    updateInteractiveTerminalInputMode();
  }
}

function lineLooksLikeSudoPasswordPrompt(line) {
  return SUDO_PASSWORD_PROMPT_PATTERN.test(String(line ?? '').trim());
}

function hideTerminalInputBar() {
  if (interactiveTerminalBar) {
    interactiveTerminalBar.hidden = true;
    interactiveTerminalBar.setAttribute('aria-hidden', 'true');
  }

  if (interactiveTerminalInput) {
    interactiveTerminalInput.disabled = true;
    interactiveTerminalInput.type = 'text';
    interactiveTerminalInput.placeholder = TERMINAL_DEFAULT_PLACEHOLDER;
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

  const result = await window.launcherApi.closeTerminalSession(sessionId);
  if (!result?.ok) {
    appendTerminalLine(sessionId, '[close failed: process is still running]', 'interactive-terminal-stderr');
    showLauncherToast('Failed to close terminal session: process is still running', { type: 'error' });
    return;
  }

  terminalSessions.delete(sessionId);
  terminalPasswordPromptSessions.delete(sessionId);

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
  updateInteractiveTerminalInputMode();
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
  updateInteractiveTerminalInputMode();

  setTerminalCwd(activeSession.id, activeSession.cwd);
  renderTerminalOutput();
}

function focusActiveTabTextbox() {
  const activeTabTextbox = logTabsEl?.querySelector('.log-tab.active input:not([disabled])');
  if (activeTabTextbox instanceof HTMLInputElement) {
    activeTabTextbox.focus();
    if (activeTabTextbox.dataset.terminalRenameInput) {
      activeTabTextbox.select();
    }
    return;
  }

  const canFocusInteractiveTerminalInput =
    isTerminalTab(activeLogTab) &&
    interactiveTerminalBar &&
    !interactiveTerminalBar.hidden &&
    interactiveTerminalInput &&
    !interactiveTerminalInput.disabled;

  if (canFocusInteractiveTerminalInput) {
    interactiveTerminalInput.focus();
  }
}

function focusRenderedTabByName(tabName) {
  if (!logTabsEl || !tabName) {
    return;
  }

  for (const element of Array.from(logTabsEl.querySelectorAll('.log-tab'))) {
    if (!(element instanceof HTMLElement)) {
      continue;
    }

    if (String(element.dataset.tabName || '') !== String(tabName)) {
      continue;
    }

    element.focus();
    return;
  }
}

function activateLogTab(tabName, options = null) {
  const normalizedTabName = String(tabName || 'all').trim() || 'all';
  resetTerminalAutocompleteState();
  activeLogTab = normalizedTabName;

  if (isTerminalTab(normalizedTabName)) {
    activeTerminalSessionId = sessionIdFromTab(normalizedTabName);
  } else {
    activeTerminalSessionId = null;
  }

  renderLogTabs();
  renderLogs();
  updateInteractiveTerminalInputMode();

  if (isTerminalTab(normalizedTabName) && interactiveTerminalInput) {
    interactiveTerminalInput.focus();
    return;
  }

  if (options?.focusTab) {
    focusRenderedTabByName(normalizedTabName);
  }
}

function cycleLogTabs(step = 1) {
  const tabNames = getTabNames();
  if (!Array.isArray(tabNames) || tabNames.length === 0) {
    return;
  }

  const normalizedStep = Number(step) || 1;
  const currentIndex = Math.max(0, tabNames.indexOf(activeLogTab));
  const nextIndex = (currentIndex + normalizedStep + tabNames.length) % tabNames.length;
  const nextTabName = tabNames[nextIndex];

  if (!nextTabName) {
    return;
  }

  activateLogTab(nextTabName, { focusTab: true });
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

  saveActiveLogTab(activeLogTab);
  hideLogTabTooltipPortal();

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
      const terminalTypeVisual = getTerminalTypeVisual(session?.terminalType);
      const terminalTypeMetaLabel = String(terminalTypeMeta?.label || '').trim();
      const terminalTypeTooltip = terminalTypeMetaLabel
        ? /^terminal$/i.test(terminalTypeMetaLabel)
          ? IS_MACOS
            ? 'MacOS terminal'
            : IS_LINUX
              ? 'Linux terminal'
              : terminalTypeMetaLabel
          : terminalTypeMetaLabel
        : IS_MACOS
          ? 'MacOS terminal'
          : IS_LINUX
            ? 'Linux terminal'
            : 'Terminal';
      const terminalTypeIcon = document.createElement('span');
      terminalTypeIcon.className =
        `log-tab-terminal-type-icon ${terminalTypeMeta?.iconClass || terminalTypeVisual.iconClass || ''}`.trim();
      terminalTypeIcon.textContent = terminalTypeMeta?.iconText || terminalTypeVisual.iconText || '';
      terminalTypeIcon.setAttribute('data-tooltip', terminalTypeTooltip);
      terminalTypeIcon.setAttribute('aria-hidden', 'true');
      terminalTypeIcon.addEventListener('mouseenter', () => {
        showLogTabTooltipPortal(terminalTypeIcon);
      });
      terminalTypeIcon.addEventListener('mouseleave', () => {
        hideLogTabTooltipPortal();
      });

      const closeButton = document.createElement('button');
      closeButton.type = 'button';
      closeButton.className = 'log-tab-close';
      closeButton.textContent = '×';
      const closeSessionTooltip = `Close ${session?.name || 'session'}`;
      closeButton.setAttribute('data-tooltip', closeSessionTooltip);
      closeButton.setAttribute('aria-label', closeSessionTooltip);
      closeButton.addEventListener('mouseenter', () => {
        showLogTabTooltipPortal(closeButton);
      });
      closeButton.addEventListener('mouseleave', () => {
        hideLogTabTooltipPortal();
      });
      closeButton.addEventListener('focus', () => {
        showLogTabTooltipPortal(closeButton);
      });
      closeButton.addEventListener('blur', () => {
        hideLogTabTooltipPortal();
      });
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
      tab.textContent = tabName === 'all' ? 'All scripts' : tabName;
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
      updateInteractiveTerminalInputMode();

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

function formatExportTimestamp(date = new Date()) {
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}${month}${day}-${hours}${minutes}${seconds}`;
}

function normalizeExportName(value, fallback = 'logs') {
  const normalized = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return normalized || fallback;
}

function buildCurrentLogExportPayload() {
  const timestamp = formatExportTimestamp();

  if (isTerminalTab(activeLogTab)) {
    const session = getActiveTerminalSession();
    const sessionLabel = normalizeExportName(session?.name || 'terminal-session', 'terminal-session');
    const lines = Array.isArray(session?.lines)
      ? session.lines.map((lineEntry) => String(lineEntry?.content || ''))
      : [];
    return {
      suggestedFileName: `${sessionLabel}-${timestamp}.log`,
      content: `${lines.join('\n')}\n`,
    };
  }

  const bucket = logsByScript.get(activeLogTab) ?? [];
  const tabLabel = activeLogTab === 'all' ? 'all-scripts' : normalizeExportName(activeLogTab, 'script');
  const lines = bucket.map((entry) =>
    activeLogTab === 'all' ? `[${entry.script}] ${entry.message}` : String(entry.message || '')
  );

  return {
    suggestedFileName: `${tabLabel}-${timestamp}.log`,
    content: `${lines.join('')}\n`,
  };
}

async function exportActiveLogs() {
  const payload = buildCurrentLogExportPayload();
  const result = await window.launcherApi.exportLogs(payload);

  if (!result?.ok) {
    showLauncherToast(`Failed to export logs: ${result?.error || 'Unknown error'}`, { type: 'error' });
    return;
  }

  if (result.canceled) {
    return;
  }

  showLauncherToast(`Logs exported to ${result.path}`);
}

function showLauncherToast(message, options = {}) {
  if (!launcherToast) {
    return;
  }

  const type = options.type === 'error' ? 'error' : 'success';
  launcherToast.textContent = String(message || '').trim();
  launcherToast.hidden = false;
  launcherToast.classList.toggle('is-error', type === 'error');
  launcherToast.classList.add('is-visible');
  launcherToast.setAttribute('role', type === 'error' ? 'alert' : 'status');
  launcherToast.setAttribute('aria-live', type === 'error' ? 'assertive' : 'polite');

  if (launcherToastHideTimer) {
    clearTimeout(launcherToastHideTimer);
  }

  launcherToastHideTimer = setTimeout(() => {
    launcherToast.classList.remove('is-visible');
    launcherToastHideTimer = null;
    setTimeout(() => {
      if (!launcherToast.classList.contains('is-visible')) {
        launcherToast.hidden = true;
      }
    }, 170);
  }, 5000);
}

function setByModuleStatus(message, isError = false) {
  if (!byModuleStatus) {
    return;
  }

  byModuleStatus.textContent = String(message || '').trim();
  byModuleStatus.classList.toggle('is-error', Boolean(isError));
}

function readByModulePrefs(mode) {
  const normalizedMode = String(mode || '').trim().toLowerCase();

  try {
    const raw = window.localStorage.getItem(BY_MODULE_PREFS_STORAGE_KEY);
    if (!raw) {
      return {
        moduleName: '',
        watch: false,
        coverage: false,
        generateDocumentation: false,
      };
    }

    const parsed = JSON.parse(raw);
    const entry = parsed && typeof parsed === 'object' ? parsed[normalizedMode] : null;

    return {
      moduleName: String(entry?.moduleName || '').trim(),
      watch: Boolean(entry?.watch),
      coverage: Boolean(entry?.coverage),
      generateDocumentation: Boolean(entry?.generateDocumentation),
    };
  } catch {
    return {
      moduleName: '',
      watch: false,
      coverage: false,
      generateDocumentation: false,
    };
  }
}

function saveByModulePrefs(mode, prefs) {
  const normalizedMode = String(mode || '').trim().toLowerCase();
  if (!normalizedMode) {
    return;
  }

  try {
    const raw = window.localStorage.getItem(BY_MODULE_PREFS_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    const next = parsed && typeof parsed === 'object' ? { ...parsed } : {};

    next[normalizedMode] = {
      moduleName: String(prefs?.moduleName || '').trim(),
      watch: Boolean(prefs?.watch),
      coverage: Boolean(prefs?.coverage),
      generateDocumentation: Boolean(prefs?.generateDocumentation),
    };

    window.localStorage.setItem(BY_MODULE_PREFS_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Ignore storage failures.
  }
}

function saveCurrentByModulePrefs() {
  if (!byModuleDialogState || !byModuleSelect) {
    return;
  }

  saveByModulePrefs(byModuleDialogState.mode, {
    moduleName: String(byModuleSelect.value || '').trim(),
    watch: Boolean(byModuleWatch?.checked),
    coverage: Boolean(byModuleCoverage?.checked),
    generateDocumentation: Boolean(byModuleDocs?.checked),
  });
}

function setByModuleBusy(isBusy) {
  const busy = Boolean(isBusy);

  if (byModuleSelect) {
    byModuleSelect.disabled = busy;
  }

  if (byModuleWatch) {
    byModuleWatch.disabled = busy;
  }

  if (byModuleCoverage) {
    byModuleCoverage.disabled = busy;
  }

  if (byModuleDocs) {
    byModuleDocs.disabled = busy;
  }

  if (byModuleCancelButton) {
    byModuleCancelButton.disabled = busy;
  }

  if (byModuleRunButton) {
    byModuleRunButton.disabled = busy || !byModuleSelect?.value;
  }
}

function closeByModuleDialog() {
  byModuleDialogState = null;
  if (byModuleOverlay) {
    byModuleOverlay.hidden = true;
  }

  if (IS_MODAL_ONLY_BY_MODULE) {
    window.close();
  }
}

function renderByModuleOptions(modeConfig, modules) {
  if (!byModuleSelect) {
    return;
  }

  byModuleSelect.replaceChildren();
  const available = [];
  const unavailable = [];

  for (const entry of Array.isArray(modules) ? modules : []) {
    const name = String(entry?.name || '').trim();
    if (!name) {
      continue;
    }

    if (entry?.available === false) {
      unavailable.push(entry);
      continue;
    }

    available.push(entry);
  }

  const createOption = (entry, disabled = false) => {
    const option = document.createElement('option');
    option.value = String(entry.name);
    option.textContent = String(entry.name);
    option.disabled = disabled;
    return option;
  };

  if (available.length > 0) {
    const availableGroup = document.createElement('optgroup');
    availableGroup.label = modeConfig.availableGroupLabel || 'Modules';
    for (const entry of available) {
      availableGroup.appendChild(createOption(entry));
    }
    byModuleSelect.appendChild(availableGroup);
  }

  if (unavailable.length > 0) {
    const unavailableGroup = document.createElement('optgroup');
    unavailableGroup.label = modeConfig.unavailableGroupLabel || 'Unavailable';
    for (const entry of unavailable) {
      unavailableGroup.appendChild(createOption(entry, true));
    }
    byModuleSelect.appendChild(unavailableGroup);
  }

  const firstEnabled = Array.from(byModuleSelect.options).find((option) => !option.disabled);
  const savedPrefs = readByModulePrefs(byModuleDialogState?.mode || '');
  const savedModuleName = String(savedPrefs.moduleName || '');
  const matchingSavedOption = Array.from(byModuleSelect.options).find(
    (option) => !option.disabled && option.value === savedModuleName
  );
  byModuleSelect.value = matchingSavedOption ? matchingSavedOption.value : firstEnabled ? firstEnabled.value : '';

  if (available.length === 0) {
    setByModuleStatus(modeConfig.emptyLabel, true);
  } else {
    setByModuleStatus(`Ready. ${available.length} modules with ${modeConfig.modeLabel || 'support'} and ${unavailable.length} without ${modeConfig.modeLabel || 'support'}.`);
  }
}

async function ensureTerminalTargetForByModule(tabName) {
  let session = getActiveTerminalSession();
  if (!session && terminalSessions.size > 0) {
    const firstSessionId = Array.from(terminalSessions.keys())[0];
    if (firstSessionId) {
      session = terminalSessions.get(firstSessionId) || null;
    }
  }

  if (!session) {
    session = await createNewTerminalSession();
  }

  if (!session) {
    throw new Error('Could not create terminal session');
  }

  const renameResult = await window.launcherApi.renameTerminalSession(session.id, tabName);
  if (renameResult?.ok) {
    ensureTerminalSessionShape(renameResult.session);
  }

  activeTerminalSessionId = session.id;
  activeLogTab = `${TERMINAL_TAB_PREFIX}${session.id}`;
  renderLogTabs();
  renderLogs();
  return session;
}

async function runByModuleFromDialog() {
  if (!byModuleDialogState) {
    return;
  }

  const modeConfig = BY_MODULE_MODES[byModuleDialogState.mode];
  if (!modeConfig) {
    return;
  }

  const selectedModule = String(byModuleSelect?.value || '').trim();
  if (!selectedModule) {
    setByModuleStatus('Select a module first.', true);
    return;
  }

  const payload = {
    mode: byModuleDialogState.mode,
    moduleName: selectedModule,
    watch: Boolean(byModuleWatch?.checked),
    coverage: Boolean(byModuleCoverage?.checked),
    generateDocumentation: Boolean(byModuleDocs?.checked),
  };

  setByModuleBusy(true);
  setByModuleStatus('Preparing command...');

  try {
    let result;
    if (IS_MODAL_ONLY_BY_MODULE) {
      // Persist selection before standalone flow closes this window.
      saveCurrentByModulePrefs();
      result = await window.launcherApi.runByModuleStandalone(payload);
    } else {
      const build = await window.launcherApi.buildByModuleCommand(payload);
      if (!build?.ok) {
        setByModuleStatus(build?.error || 'Could not prepare command.', true);
        setByModuleBusy(false);
        return;
      }

      focusScriptLogTab(modeConfig.scriptName);
      closeByModuleDialog();
      result = await window.launcherApi.startInlineScript({
        scriptName: modeConfig.scriptName,
        command: build.command,
        cwd: build.cwd || '',
      });
    }

    if (!result?.ok) {
      setByModuleStatus(result?.error || 'Could not start command.', true);
      setByModuleBusy(false);
      return;
    }

    saveCurrentByModulePrefs();
  } catch (error) {
    setByModuleStatus(error?.message || String(error), true);
    setByModuleBusy(false);
  }
}

async function openByModuleDialog(mode) {
  const normalizedMode = String(mode || '').trim().toLowerCase();
  const modeConfig = BY_MODULE_MODES[normalizedMode];
  if (!modeConfig || !byModuleOverlay) {
    return;
  }

  byModuleDialogState = { mode: normalizedMode };
  byModuleOverlay.hidden = false;

  if (byModuleTitle) {
    byModuleTitle.textContent = modeConfig.title;
  }

  if (byModuleSubtitle) {
    byModuleSubtitle.textContent = modeConfig.subtitle;
  }

  if (byModuleRunButton) {
    byModuleRunButton.textContent = modeConfig.runLabel;
  }

  if (byModuleWatchRow) {
    byModuleWatchRow.hidden = !modeConfig.showWatch;
  }

  if (byModuleCoverageRow) {
    byModuleCoverageRow.hidden = !modeConfig.showCoverage;
  }

  if (byModuleDocsRow) {
    byModuleDocsRow.hidden = !modeConfig.showDocs;
  }

  if (byModuleWatch) {
    byModuleWatch.checked = false;
  }

  if (byModuleCoverage) {
    byModuleCoverage.checked = false;
  }

  if (byModuleDocs) {
    byModuleDocs.checked = false;
  }

  const savedPrefs = readByModulePrefs(normalizedMode);
  if (byModuleWatch) {
    byModuleWatch.checked = savedPrefs.watch;
  }

  if (byModuleCoverage) {
    byModuleCoverage.checked = savedPrefs.coverage;
  }

  if (byModuleDocs) {
    byModuleDocs.checked = savedPrefs.generateDocumentation;
  }

  setByModuleBusy(true);
  setByModuleStatus(modeConfig.loadingLabel);

  try {
    const result = await window.launcherApi.listByModuleOptions(normalizedMode);
    if (!result?.ok) {
      setByModuleStatus(result?.error || 'Could not load modules.', true);
      if (byModuleSelect) {
        byModuleSelect.replaceChildren();
      }
      setByModuleBusy(false);
      return;
    }

    renderByModuleOptions(modeConfig, result.modules || []);
    setByModuleBusy(false);

    if (byModuleSelect && !byModuleSelect.disabled) {
      byModuleSelect.focus();
    }
  } catch (error) {
    setByModuleStatus(error?.message || String(error), true);
    if (byModuleSelect) {
      byModuleSelect.replaceChildren();
    }
    setByModuleBusy(false);
  }
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
      return { ...DEFAULT_FILTER_STATE, mode: defaultFilterMode };
    }

    const parsed = JSON.parse(raw);
    const parsedMode = String(parsed?.mode || '')
      .trim()
      .toLowerCase();
    return {
      running: Boolean(parsed?.running),
      favorites: Boolean(parsed?.favorites),
      mode: parsedMode === 'and' ? 'and' : 'or',
    };
  } catch {
    return { ...DEFAULT_FILTER_STATE, mode: defaultFilterMode };
  }
}

function saveFilters() {
  const payload = {
    running: Boolean(filterRunningCheckbox?.checked),
    favorites: Boolean(filterFavoritesCheckbox?.checked),
    mode: filterMode,
  };

  window.localStorage.setItem(FILTER_STATE_STORAGE_KEY, JSON.stringify(payload));
}

function applyFilterMode(nextMode) {
  filterMode = nextMode === 'and' ? 'and' : 'or';

  if (filterModeToggleButton) {
    const isAnd = filterMode === 'and';
    filterModeToggleButton.textContent = isAnd ? '&' : 'Ø';
    filterModeToggleButton.setAttribute('aria-label', `Filter mode ${isAnd ? 'AND' : 'OR'}`);
    filterModeToggleButton.setAttribute(
      'data-tooltip',
      isAnd
        ? 'Filter mode: & (must be Running and Favorites). Click to switch to OR.'
        : 'Filter mode: Ø (Running or Favorites). Click to switch to AND.'
    );
  }
}

function restoreFilters() {
  const saved = readSavedFilters();

  if (filterRunningCheckbox) {
    filterRunningCheckbox.checked = saved.running;
  }

  if (filterFavoritesCheckbox) {
    filterFavoritesCheckbox.checked = saved.favorites;
  }

  applyFilterMode(saved.mode);
}

function ensureDefaultFilterStateStorage() {
  try {
    const raw = window.localStorage.getItem(FILTER_STATE_STORAGE_KEY);
    if (raw !== null) {
      return;
    }

    window.localStorage.setItem(
      FILTER_STATE_STORAGE_KEY,
      JSON.stringify({ ...DEFAULT_FILTER_STATE, mode: defaultFilterMode })
    );
  } catch {
    // Ignore storage failures.
  }
}

async function loadDefaultFilterMode() {
  try {
    if (typeof window.launcherApi?.getDefaultFilterMode !== 'function') {
      return DEFAULT_FILTER_STATE.mode;
    }

    const configuredMode = await window.launcherApi.getDefaultFilterMode();
    return String(configuredMode || '')
      .trim()
      .toLowerCase() === 'or'
      ? 'or'
      : 'and';
  } catch {
    return DEFAULT_FILTER_STATE.mode;
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

function ensureDefaultFavoritesStorage(defaultFavoriteScripts = []) {
  try {
    const raw = window.localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (raw !== null) {
      return;
    }

    window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(defaultFavoriteScripts));
  } catch {
    // Ignore storage failures.
  }
}

async function loadDefaultFavoriteScripts() {
  try {
    if (typeof window.launcherApi?.getDefaultFavoriteScripts !== 'function') {
      return [];
    }

    const configured = await window.launcherApi.getDefaultFavoriteScripts();
    if (!Array.isArray(configured)) {
      return [];
    }

    return Array.from(
      new Set(
        configured
          .filter((name) => typeof name === 'string')
          .map((name) => name.trim())
          .filter(Boolean)
      )
    );
  } catch {
    return [];
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

async function interruptActiveTerminalSession() {
  if (
    !isTerminalTab(activeLogTab) ||
    !activeTerminalSessionId ||
    !runningTerminalSessions.has(activeTerminalSessionId)
  ) {
    return;
  }

  const sessionId = activeTerminalSessionId;
  markTerminalSessionAwaitingPassword(sessionId, false);

  const result = await window.launcherApi.interruptTerminalSession(sessionId);
  if (!result?.ok) {
    appendTerminalLine(sessionId, '[interrupt failed: process is still running]', 'interactive-terminal-stderr');
    return;
  }

  appendTerminalLine(sessionId, '^C', 'interactive-terminal-stderr');
}

async function submitInteractiveTerminalInput(sessionId, input) {
  const result = await window.launcherApi.sendTerminalInput(sessionId, input, { appendNewline: true });
  if (result?.ok) {
    return;
  }

  appendTerminalLine(sessionId, String(result?.error || 'Failed to send input\n'), 'interactive-terminal-stderr');
  markTerminalSessionAwaitingPassword(sessionId, false);
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

async function runInteractiveTerminalCommand(command, executionOptions = null) {
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
  markTerminalSessionAwaitingPassword(session.id, false);

  addTerminalCommandToHistory(session, trimmed);

  if (/^sudo(?:\s|$)/i.test(trimmed)) {
    markTerminalSessionAwaitingPassword(session.id, true);
  }

  const normalized = trimmed.toLowerCase();
  if (normalized === 'clear' || normalized === 'cls') {
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
  updateInteractiveTerminalInputMode();

  try {
    const result = await window.launcherApi.runTerminalCommand(session.id, trimmed, {
      terminalType: session.terminalType || selectedTerminalType,
      cwd: executionOptions?.cwd || '',
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
    markTerminalSessionAwaitingPassword(session.id, false);
    updateInterruptTerminalButtonState();

    if (interactiveTerminalInput) {
      interactiveTerminalInput.focus();
      interactiveTerminalInput.select();
    }

    updateInteractiveTerminalInputMode();
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

  window.dispatchEvent(
    new CustomEvent(TERMINAL_THEME_CHANGED_EVENT, {
      detail: { theme: normalizedTheme },
    })
  );
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

function getThemeMenuOptions() {
  return Array.from(terminalThemeMenu?.querySelectorAll('.terminal-theme-option') || []).filter(
    (option) => option instanceof HTMLButtonElement
  );
}

function getSelectedThemeOptionIndex(options) {
  if (!Array.isArray(options) || options.length === 0) {
    return -1;
  }

  const selectedIndex = options.findIndex((option) => option.getAttribute('aria-selected') === 'true');
  return selectedIndex >= 0 ? selectedIndex : 0;
}

function focusThemeOptionByOffset(offset) {
  if (!terminalThemeMenu || terminalThemeMenu.hidden) {
    return;
  }

  const options = getThemeMenuOptions();
  if (options.length === 0) {
    return;
  }

  const activeElement = document.activeElement;
  const activeIndex = options.findIndex((option) => option === activeElement);
  const baseIndex = activeIndex >= 0 ? activeIndex : getSelectedThemeOptionIndex(options);
  const safeOffset = Number(offset) || 0;
  const nextIndex = (baseIndex + safeOffset + options.length) % options.length;
  const nextOption = options[nextIndex];
  if (!nextOption) {
    return;
  }

  selectTerminalTheme(nextOption.dataset.theme || 'ocean', {
    persist: true,
    closeMenu: false,
    focusInput: false,
  });
  nextOption.focus();
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

function hasSavedTerminalTheme() {
  try {
    const raw = window.localStorage.getItem(TERMINAL_THEME_STORAGE_KEY);
    return typeof raw === 'string' && raw.length > 0;
  } catch {
    return false;
  }
}

function normalizeTerminalTheme(themeName) {
  const normalizedTheme = String(themeName || '')
    .trim()
    .toLowerCase();
  return TERMINAL_THEMES.has(normalizedTheme) ? normalizedTheme : '';
}

function ensureDefaultTerminalThemeStorage(defaultThemeName = '') {
  try {
    if (hasSavedTerminalTheme()) {
      return;
    }

    const normalizedTheme = normalizeTerminalTheme(defaultThemeName);
    const themeToPersist = normalizedTheme || 'ocean';
    window.localStorage.setItem(TERMINAL_THEME_STORAGE_KEY, themeToPersist);
  } catch {
    // Ignore storage failures.
  }
}

async function loadDefaultTerminalTheme() {
  try {
    if (typeof window.launcherApi?.getDefaultTerminalTheme !== 'function') {
      return '';
    }

    const configuredTheme = await window.launcherApi.getDefaultTerminalTheme();
    return normalizeTerminalTheme(configuredTheme);
  } catch {
    return '';
  }
}

function saveTerminalTheme(themeName) {
  const normalizedTheme = TERMINAL_THEMES.has(themeName) ? themeName : 'ocean';
  window.localStorage.setItem(TERMINAL_THEME_STORAGE_KEY, normalizedTheme);
}

function selectTerminalTheme(themeName, options = null) {
  const normalizedTheme = TERMINAL_THEMES.has(themeName) ? themeName : 'ocean';
  const persist = options?.persist !== false;
  const closeMenu = options?.closeMenu === true;
  const focusInput = options?.focusInput === true;

  applyTerminalTheme(normalizedTheme);
  if (persist) {
    saveTerminalTheme(normalizedTheme);
  }

  if (closeMenu) {
    closeThemeMenu();
  }

  if (focusInput && interactiveTerminalInput && !interactiveTerminalInput.disabled) {
    interactiveTerminalInput.focus();
    interactiveTerminalInput.select();
  }
}

function onTerminalThemeChange(selectedTheme) {
  selectTerminalTheme(selectedTheme, {
    persist: true,
    closeMenu: true,
    focusInput: true,
  });
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
  if (scriptName === BY_MODULE_MODES.tests.scriptName) {
    await openByModuleDialog('tests');
    return;
  }

  if (scriptName === BY_MODULE_MODES.storybook.scriptName) {
    await openByModuleDialog('storybook');
    return;
  }

  const result = await window.launcherApi.startScript(scriptName);
  if (!result.ok) {
    appendLog({ script: scriptName, stream: 'stderr', message: `${result.error}\n` });
    return;
  }

  focusScriptLogTab(scriptName);
}

async function stopScript(scriptName) {
  focusScriptLogTab(scriptName);

  const result = await window.launcherApi.stopScript(scriptName);
  if (!result.ok) {
    appendLog({ script: scriptName, stream: 'stderr', message: `${result.error}\n` });
  }
}

function sleep(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function isScriptRunning(scriptName) {
  return scriptsState.some((script) => script.name === scriptName && script.running);
}

async function waitForScriptRunningState(scriptName, expectedRunning, timeoutMs = 5000) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    if (isScriptRunning(scriptName) === expectedRunning) {
      return true;
    }

    await sleep(120);
  }

  return false;
}

async function restartScript(scriptName) {
  focusScriptLogTab(scriptName);

  if (!isScriptRunning(scriptName)) {
    await runScript(scriptName);
    return;
  }

  const stopResult = await window.launcherApi.stopScript(scriptName);
  if (!stopResult.ok) {
    appendLog({ script: scriptName, stream: 'stderr', message: `${stopResult.error}\n` });
    return;
  }

  const stopped = await waitForScriptRunningState(scriptName, false, 7000);
  if (!stopped) {
    appendLog({
      script: scriptName,
      stream: 'stderr',
      message: `Restart timeout: ${scriptName} did not stop in time.\n`,
    });
    return;
  }

  await runScript(scriptName);
}

function createScriptActionIcon(kind) {
  const svgNs = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNs, 'svg');
  svg.setAttribute('class', 'script-action-icon-svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');

  if (kind === 'start') {
    const play = document.createElementNS(svgNs, 'path');
    play.setAttribute('d', 'M8 6.5L18.5 12L8 17.5V6.5Z');
    play.setAttribute('fill', 'currentColor');
    svg.append(play);
    return svg;
  }

  if (kind === 'restart') {
    const bar = document.createElementNS(svgNs, 'rect');
    bar.setAttribute('x', '5.8');
    bar.setAttribute('y', '5.8');
    bar.setAttribute('width', '2.2');
    bar.setAttribute('height', '12.4');
    bar.setAttribute('rx', '1');
    bar.setAttribute('fill', 'currentColor');

    const play = document.createElementNS(svgNs, 'path');
    play.setAttribute('d', 'M10.2 5.8L18.6 12L10.2 18.2V5.8Z');
    play.setAttribute('fill', 'currentColor');

    svg.append(bar, play);
    return svg;
  }

  const stop = document.createElementNS(svgNs, 'rect');
  stop.setAttribute('x', '7.5');
  stop.setAttribute('y', '7.5');
  stop.setAttribute('width', '9');
  stop.setAttribute('height', '9');
  stop.setAttribute('rx', '1.6');
  stop.setAttribute('fill', 'currentColor');
  svg.append(stop);

  return svg;
}

function createScriptActionButton(kind, label, onClick, disabled = false) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `script-action-btn ${kind}-btn`;
  button.disabled = disabled;
  button.setAttribute('aria-label', label);

  const icon = document.createElement('span');
  icon.className = 'script-action-icon';
  icon.setAttribute('aria-hidden', 'true');
  icon.appendChild(createScriptActionIcon(kind));

  button.append(icon);
  button.addEventListener('click', onClick);
  return button;
}

function bindScriptActionTooltip(button, tooltipText) {
  if (!button) {
    return;
  }

  button.setAttribute('data-tooltip', tooltipText);
  button.setAttribute('data-tooltip-align', 'center');

  button.addEventListener('mouseenter', () => {
    showLogTabTooltipPortal(button);
  });
  button.addEventListener('mouseleave', () => {
    hideLogTabTooltipPortal();
  });
  button.addEventListener('focus', () => {
    showLogTabTooltipPortal(button);
  });
  button.addEventListener('blur', () => {
    hideLogTabTooltipPortal();
  });
}

function renderScripts() {
  scriptsList.replaceChildren();
  const runningOnly = Boolean(filterRunningCheckbox?.checked);
  const favoritesChecked = Boolean(filterFavoritesCheckbox?.checked);
  const favoritesOnly = favoritesChecked && favoriteScripts.size > 0;

  const visibleScripts = scriptsState.filter((script) => {
    if (!runningOnly && !favoritesOnly) {
      return true;
    }

    if (runningOnly && favoritesOnly) {
      return filterMode === 'and'
        ? script.running && isFavoriteScript(script.name)
        : script.running || isFavoriteScript(script.name);
    }

    if (runningOnly) {
      return script.running;
    }

    if (favoritesOnly) {
      return isFavoriteScript(script.name);
    }

    return true;
  });

  if (visibleScripts.length === 0) {
    const emptyState = document.createElement('p');
    emptyState.className = 'scripts-empty-state';
    emptyState.textContent = 'No scripts match the selected filters.';
    scriptsList.appendChild(emptyState);
    return;
  }

  for (const script of visibleScripts) {
    const isRunning = Boolean(script.running);
    const row = document.createElement('div');
    row.className = `script-row ${isRunning ? 'running' : ''}`;

    const info = document.createElement('div');
    info.className = 'script-info';

    const top = document.createElement('div');
    top.className = 'script-top';

    const title = document.createElement('div');
    title.className = 'script-title';

    const name = document.createElement('strong');
    name.textContent = script.name;
    if (script.description) {
      name.setAttribute('data-tooltip', script.description);
      name.setAttribute('data-tooltip-align', 'start');
      name.setAttribute('aria-label', `${script.name}: ${script.description}`);
      name.tabIndex = 0;
      name.addEventListener('mouseenter', () => {
        showLogTabTooltipPortal(name);
      });
      name.addEventListener('mouseleave', () => {
        hideLogTabTooltipPortal();
      });
      name.addEventListener('focus', () => {
        showLogTabTooltipPortal(name);
      });
      name.addEventListener('blur', () => {
        hideLogTabTooltipPortal();
      });
    }

    title.append(name);

    const favoriteButton = document.createElement('button');
    favoriteButton.type = 'button';
    favoriteButton.className = `favorite-toggle ${isFavoriteScript(script.name) ? 'active' : ''}`;
    favoriteButton.textContent = isFavoriteScript(script.name) ? '★' : '☆';
    const favoriteLabel = isFavoriteScript(script.name) ? 'Remove from favorites' : 'Add to favorites';
    favoriteButton.setAttribute('aria-label', favoriteLabel);
    favoriteButton.setAttribute('aria-pressed', String(isFavoriteScript(script.name)));
    favoriteButton.addEventListener('click', () => toggleFavoriteScript(script.name));
    title.appendChild(favoriteButton);

    top.append(title);

    const actions = document.createElement('div');
    actions.className = 'actions';

    const startBtn = createScriptActionButton('start', 'Start', () => runScript(script.name), isRunning);
    bindScriptActionTooltip(startBtn, isRunning ? 'Script is running' : 'Start script');

    const restartBtn = createScriptActionButton(
      'restart',
      'Restart',
      () => restartScript(script.name),
      !isRunning
    );
    bindScriptActionTooltip(restartBtn, 'Restart script');

    const stopBtn = createScriptActionButton('stop', 'Stop', () => stopScript(script.name), !isRunning);
    bindScriptActionTooltip(stopBtn, 'Stop script');

    const commandLine = document.createElement('div');
    commandLine.className = 'script-command-line';

    const commandText = document.createElement('div');
    commandText.className = 'script-command script-command-inline-text';
    commandText.textContent = String(script.command || '').trim();

    actions.append(startBtn, restartBtn, stopBtn);

    commandText.append(' ', actions);
    commandLine.append(commandText);
    info.append(top, commandLine);
    row.append(info);
    scriptsList.appendChild(row);
  }
}

async function refreshScripts() {
  await refreshTerminalSessions();
  scriptsState = await window.launcherApi.listScripts();
  renderScripts();
  renderLogTabs();
  renderLogs();
  requestAnimationFrame(() => {
    focusActiveTabTextbox();
  });
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

byModuleRunButton?.addEventListener('click', () => {
  void runByModuleFromDialog();
});

byModuleCancelButton?.addEventListener('click', () => {
  closeByModuleDialog();
});

byModuleSelect?.addEventListener('change', () => {
  if (byModuleRunButton) {
    byModuleRunButton.disabled = !byModuleSelect.value;
  }

  saveCurrentByModulePrefs();
});

byModuleWatch?.addEventListener('change', saveCurrentByModulePrefs);
byModuleCoverage?.addEventListener('change', saveCurrentByModulePrefs);
byModuleDocs?.addEventListener('change', saveCurrentByModulePrefs);

byModuleOverlay?.addEventListener('click', (event) => {
  if (event.target === byModuleOverlay) {
    closeByModuleDialog();
  }
});

refreshButton.addEventListener('click', refreshScripts);
quitButton.addEventListener('click', async () => {
  if (isQuitInProgress) {
    return;
  }

  isQuitInProgress = true;
  if (shutdownOverlay) {
    shutdownOverlay.hidden = false;
  }

  try {
    await window.launcherApi.quitApp();
  } catch (error) {
    isQuitInProgress = false;
    if (shutdownOverlay) {
      shutdownOverlay.hidden = true;
    }
    appendLog({
      script: 'launcher',
      stream: 'stderr',
      message: `Failed to close launcher: ${error?.message || String(error)}\n`,
    });
  }
});
quitButton.addEventListener('mouseenter', () => {
  if (quitButtonTooltip) {
    quitButtonTooltip.textContent = 'Exit (Ctrl Q)';
    quitButtonTooltip.setAttribute('aria-hidden', 'false');
  }
});
quitButton.addEventListener('mouseleave', () => {
  if (quitButtonTooltip) {
    quitButtonTooltip.setAttribute('aria-hidden', 'true');
  }
});
quitButton.addEventListener('focus', () => {
  if (quitButtonTooltip) {
    quitButtonTooltip.textContent = 'Exit (Ctrl Q)';
    quitButtonTooltip.setAttribute('aria-hidden', 'false');
  }
});
quitButton.addEventListener('blur', () => {
  if (quitButtonTooltip) {
    quitButtonTooltip.setAttribute('aria-hidden', 'true');
  }
});
clearLogsButton.addEventListener('click', clearLogs);
exportLogsButton?.addEventListener('click', () => {
  void exportActiveLogs();
});
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
terminalFontMenuTrigger?.addEventListener('click', toggleTerminalFontMenu);
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

  const sessionId = activeTerminalSessionId;
  const command = interactiveTerminalInput.value;
  interactiveTerminalInput.value = '';

  if (isTerminalSessionRunning(sessionId)) {
    void submitInteractiveTerminalInput(sessionId, command);
    return;
  }

  void runInteractiveTerminalCommand(command);
});
interactiveTerminalInput.addEventListener('keydown', (event) => {
  if (!isTerminalTab(activeLogTab) || !activeTerminalSessionId) {
    return;
  }

  if (event.key === 'Tab' && !event.ctrlKey && !event.metaKey && !event.altKey) {
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
terminalThemeTrigger.addEventListener('keydown', (event) => {
  if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') {
    return;
  }

  event.preventDefault();
  if (terminalThemeMenu?.hidden) {
    openThemeMenu();
  }

  focusThemeOptionByOffset(event.key === 'ArrowDown' ? 1 : -1);
});
for (const option of terminalThemeOptions) {
  option.addEventListener('click', () => {
    onTerminalThemeChange(option.dataset.theme || 'ocean');
  });

  option.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      focusThemeOptionByOffset(event.key === 'ArrowDown' ? 1 : -1);
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onTerminalThemeChange(option.dataset.theme || 'ocean');
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      closeThemeMenu();
      terminalThemeTrigger?.focus();
    }
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

  if (terminalFontMenu && terminalFontMenuTrigger) {
    const clickedInsideFontMenu = terminalFontMenu.contains(target) || terminalFontMenuTrigger.contains(target);
    if (!clickedInsideFontMenu) {
      closeTerminalFontMenu();
    }
  }

  if (packageSourceMenu && packageSourceTrigger) {
    const clickedInsidePackageSelector = packageSourceMenu.contains(target) || packageSourceTrigger.contains(target);
    if (!clickedInsidePackageSelector) {
      closePackageSourceMenu();
    }
  }
});

window.addEventListener('resize', refreshLogTabTooltipPortalPosition);
window.addEventListener('scroll', refreshLogTabTooltipPortalPosition, true);
window.addEventListener(TERMINAL_THEME_CHANGED_EVENT, () => {
  if (isTerminalTab(activeLogTab)) {
    renderTerminalOutput();
    return;
  }

  renderLogs();
});

logTabsEl?.addEventListener('wheel', handleLogTabsWheelScroll, { passive: false });

function hasSelectedTextForCopyShortcut() {
  const activeElement = document.activeElement;
  const isTextInput = activeElement instanceof HTMLInputElement || activeElement instanceof HTMLTextAreaElement;

  if (isTextInput) {
    const start = Number(activeElement.selectionStart ?? -1);
    const end = Number(activeElement.selectionEnd ?? -1);
    if (start >= 0 && end >= 0 && start !== end) {
      return true;
    }
  }

  if (activeElement && activeElement.isContentEditable) {
    const contentSelection = window.getSelection ? window.getSelection() : null;
    if (contentSelection && !contentSelection.isCollapsed && String(contentSelection).trim()) {
      return true;
    }
  }

  const selection = window.getSelection ? window.getSelection() : null;
  return Boolean(selection && !selection.isCollapsed && String(selection).trim());
}

document.addEventListener('keydown', (event) => {
  if (byModuleDialogState && byModuleOverlay && !byModuleOverlay.hidden) {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeByModuleDialog();
      return;
    }

    if (event.key === 'Enter' && document.activeElement !== byModuleCancelButton) {
      event.preventDefault();
      void runByModuleFromDialog();
      return;
    }
  }

  const isCtrlShortcut = event.ctrlKey && !event.metaKey && !event.altKey;
  if (isCtrlShortcut) {
    const key = String(event.key);
    const code = String(event.code || '');

    if (key === 'Tab' || code === 'Tab') {
      event.preventDefault();
      cycleLogTabs(event.shiftKey ? -1 : 1);
      return;
    }

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

    if (String(key).toLowerCase() === 'e' || code === 'KeyE') {
      event.preventDefault();
      void exportActiveLogs();
      return;
    }

    if (String(key).toLowerCase() === 'w' || code === 'KeyW') {
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

    if (String(key).toLowerCase() === 'q' || code === 'KeyQ') {
      event.preventDefault();
      quitButton?.click();
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
    !hasSelectedTextForCopyShortcut() &&
    isTerminalTab(activeLogTab) &&
    activeTerminalSessionId &&
    runningTerminalSessions.has(activeTerminalSessionId)
  ) {
    event.preventDefault();
    interruptActiveTerminalSession();
    return;
  }

  if (event.key === 'Escape') {
    if (byModuleDialogState && byModuleOverlay && !byModuleOverlay.hidden) {
      closeByModuleDialog();
      return;
    }

    closeThemeMenu();
    closeTerminalTypeMenu();
    closeTerminalFontMenu();
    closePackageSourceMenu();
  }
});
filterRunningCheckbox.addEventListener('change', renderScripts);
filterFavoritesCheckbox.addEventListener('change', renderScripts);
filterRunningCheckbox.addEventListener('change', saveFilters);
filterFavoritesCheckbox.addEventListener('change', saveFilters);
filterModeToggleButton?.addEventListener('click', () => {
  applyFilterMode(filterMode === 'and' ? 'or' : 'and');
  saveFilters();
  renderScripts();
});

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
    if (stream === 'stderr' && lineLooksLikeSudoPasswordPrompt(line)) {
      markTerminalSessionAwaitingPassword(sessionId, true);
    }
    appendTerminalLine(sessionId, line, className);
  }
});

async function init() {
  if (IS_MODAL_ONLY_BY_MODULE) {
    document.body.classList.add('modal-only-by-module');

    if (INITIAL_BY_MODULE_MODE === 'tests' || INITIAL_BY_MODULE_MODE === 'storybook') {
      await openByModuleDialog(INITIAL_BY_MODULE_MODE);
    }

    return;
  }

  const savedActiveLogTab = readSavedActiveLogTab();
  const defaultFavoriteScripts = await loadDefaultFavoriteScripts();
  const defaultTerminalTheme = await loadDefaultTerminalTheme();
  defaultFilterMode = await loadDefaultFilterMode();

  ensureDefaultFilterStateStorage();
  ensureDefaultFavoritesStorage(defaultFavoriteScripts);
  ensureDefaultTerminalThemeStorage(defaultTerminalTheme);
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

  if (savedActiveLogTab) {
    const availableTabs = new Set(getTabNames());
    if (availableTabs.has(savedActiveLogTab)) {
      activeLogTab = savedActiveLogTab;
      if (isTerminalTab(savedActiveLogTab)) {
        activeTerminalSessionId = sessionIdFromTab(savedActiveLogTab);
      }
    }
  }

  // Re-render after restoring terminal sessions so Session tabs appear on first load.
  renderLogTabs();
  renderLogs();

  if (interactiveTerminalBar) {
    interactiveTerminalBar.hidden = true;
  }
  updateInteractiveTerminalInputMode();
  updateConsoleSurface();

  if (INITIAL_BY_MODULE_MODE === 'tests' || INITIAL_BY_MODULE_MODE === 'storybook') {
    await openByModuleDialog(INITIAL_BY_MODULE_MODE);
  }
}

void init();
