export interface SeatAssignedContext {
  [segmentId: string]: PassengersSeatAssignedContext;
}

export interface PassengersSeatAssignedContext {
  [passengerId: string]: {
    seat: string;
    isConfirmed?: boolean;
    isAutoAssigned?: boolean;
    isSeatPendingPayment?: boolean;
  };
}
