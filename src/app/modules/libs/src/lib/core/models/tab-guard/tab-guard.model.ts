export const TAB_GUARD_MESSAGE_TYPE = {
  Announce: 'announce',
  Respond: 'respond',
  Probe: 'probe',
} as const;

export type TabGuardMessageType = (typeof TAB_GUARD_MESSAGE_TYPE)[keyof typeof TAB_GUARD_MESSAGE_TYPE];

export interface TabGuardMessage {
  readonly type: TabGuardMessageType;
  readonly volatileTabId: string;
  readonly tabSessionId: string;
  readonly pathname: string;
  readonly timestamp: number;
}

export const TAB_GUARD_CONSTANTS = {
  CHANNEL_NAME: 'tab-guard-channel',
  PROBE_TIMEOUT_MS: 1500,
} as const;
