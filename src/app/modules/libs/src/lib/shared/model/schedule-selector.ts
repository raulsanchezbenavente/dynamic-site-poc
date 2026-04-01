export interface ScheduleSelection {
  departure?: {
    journeyId: string;
    fareId: string;
  };
  return?: {
    journeyId: string;
    fareId: string;
  };
}
