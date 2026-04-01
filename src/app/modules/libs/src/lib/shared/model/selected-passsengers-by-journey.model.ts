export interface SelectedPassengersByJourney<T = string[]> {
  [journeyId: string]: T;
}
