export interface AnalyticsEvent<TEventName extends string = string> {
  eventName: TEventName;
  data: {
    [key: string]: any;
  };
  account?: string;
}
