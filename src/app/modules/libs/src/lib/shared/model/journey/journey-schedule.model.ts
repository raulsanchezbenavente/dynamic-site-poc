export interface JourneySchedule {
  /** Scheduled Time of Departure (local). */
  std: Date;

  /** Scheduled Time of Departure in UTC. */
  stdutc?: Date;

  /** Scheduled Time of Arrival (local). */
  sta: Date;

  /** Scheduled Time of Arrival in UTC. */
  stautc?: Date;

  /** Estimated Time of Departure (local). */
  etd?: Date;

  /** Estimated Time of Departure in UTC. */
  etdutc?: Date;

  /** Estimated Time of Arrival (local). */
  eta?: Date;

  /** Estimated Time of Arrival in UTC. */
  etautc?: Date;

  /** Actual Time of Departure (local). */
  atd?: Date;

  /** Actual Time of Departure in UTC. */
  atdutc?: Date;

  /** Actual Time of Arrival (local). */
  ata?: Date;

  /** Actual Time of Arrival in UTC. */
  atautc?: Date;
}
