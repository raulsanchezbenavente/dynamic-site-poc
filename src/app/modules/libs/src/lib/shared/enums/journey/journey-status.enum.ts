export enum JourneyStatus {
  // Real-time operational status of the journey
  ON_TIME = 'OnTime',
  DELAYED = 'Delayed',
  ON_ROUTE = 'OnRoute',
  LANDED = 'Landed',
  CANCELLED = 'Cancelled',

  // Administrative status / journey lifecycle state
  OPEN = 'Open',
  CLOSED = 'Closed',
  CONFIRMED = 'Confirmed',
  DEPARTED = 'Departed',
  RETURNED = 'Returned',
  DIVERTED = 'Diverted',
}
