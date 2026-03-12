const scriptsList = document.getElementById('scriptsList');
const logsEl = document.getElementById('logs');
const logTabsEl = document.getElementById('logTabs');
const refreshButton = document.getElementById('refreshButton');
const clearLogsButton = document.getElementById('clearLogsButton');
const packageSourceSelect = document.getElementById('packageSourceSelect');
const packageSourcePath = document.getElementById('packageSourcePath');

let scriptsState = [];
let activeLogTab = 'all';
const logsByScript = new Map([['all', []]]);
const favoriteScripts = new Set(['build', 'start:serve-proxy', 'start:backend']);

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

  for (const script of scriptsState) {
    const row = document.createElement('div');
    row.className = `script-row ${script.running ? 'running' : ''}`;

    const info = document.createElement('div');
    info.className = 'script-info';

    const title = document.createElement('div');
    title.className = 'script-title';

    const name = document.createElement('strong');
    name.textContent = script.name;

    title.appendChild(name);

    if (favoriteScripts.has(script.name)) {
      const favoriteIcon = document.createElement('span');
      favoriteIcon.className = 'favorite-star';
      favoriteIcon.textContent = '★';
      favoriteIcon.title = 'Favorite script';
      favoriteIcon.setAttribute('aria-label', 'Favorite script');
      title.appendChild(favoriteIcon);
    }

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
clearLogsButton.addEventListener('click', clearLogs);
packageSourceSelect.addEventListener('change', () => {
  void onPackageSourceChange();
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

async function init() {
  await refreshPackageSourceUi();
  await refreshScripts();
}

void init();
