import type { Observable } from 'rxjs';

export interface CommandResponseOfVoidCommandResponse {
  error?: unknown;
  success?: boolean;
  result?: ResponseObjectOfVoidCommandResponse;
  init?: () => void;
  toJSON?: () => unknown;
  [key: string]: unknown;
}

export interface ResponseObjectOfVoidCommandResponse {
  result?: boolean;
  data?: VoidCommandResponse;
  [key: string]: unknown;
}

export interface VoidCommandResponse {
  [key: string]: unknown;
}

export interface QueryResponseOfBooking {
  error?: unknown;
  success?: boolean;
  result?: ResponseObjectOfBooking;
  init?: () => void;
  toJSON?: () => unknown;
  [key: string]: unknown;
}

export interface ResponseObjectOfBooking {
  result?: boolean;
  data?: Booking;
  [key: string]: unknown;
}

export interface Booking {
  [key: string]: unknown;
}

export interface BookingPricing {
  [key: string]: unknown;
}

export interface Contact {
  [key: string]: unknown;
}

export enum ContactType {
  Emergency = 'Emergency',
}

export interface Journey {
  [key: string]: unknown;
}

export interface LoyaltyNumberInfo {
  [key: string]: unknown;
}

export interface Pax {
  [key: string]: unknown;
}

export interface PaxSegmentInfo {
  [key: string]: unknown;
}

export enum PaxSegmentInfoStatus {
  NotCheckedIn = 'NotCheckedIn',
}

export enum PaxStatus {
  Confirmed = 'Confirmed',
}

export interface PaxTypeInfo {
  [key: string]: unknown;
}

export enum PaxTypeInfoCategory {
  Adult = 'Adult',
  Child = 'Child',
  Infant = 'Infant',
  Teenager = 'Teenager',
}

export interface PersonAddress {
  [key: string]: unknown;
}

export interface PersonCommunicationChannel {
  [key: string]: unknown;
}

export enum PersonCommunicationChannelScope {
  Personal = 'Personal',
}

export enum PersonCommunicationChannelType {
  Email = 'Email',
  Phone = 'Phone',
}

export interface PersonDocument {
  [key: string]: unknown;
}

export enum PersonDocumentType {
  ID = 'ID',
  P = 'P',
}

export interface PersonInfo {
  [key: string]: unknown;
}

export enum PersonInfoGender {
  Female = 'Female',
  Male = 'Male',
}

export enum PersonInfoWeight {
  Female = 'Female',
  Male = 'Male',
}

export interface PersonName {
  [key: string]: unknown;
}

export enum PersonNameTitle {
  MR = 'MR',
  MS = 'MS',
  MISS = 'MISS',
}

export interface UpdatePaxCommand {
  [key: string]: unknown;
}

export interface UpdatePaxRegulatoryDetailsCommand {
  [key: string]: unknown;
}

export interface IPaxClient {
  patch(command: UpdatePaxCommand, version: string): Observable<CommandResponseOfVoidCommandResponse>;
}

export interface IPaxRegulatoryDetailsClient {
  regulatoryDetails(
    command: UpdatePaxRegulatoryDetailsCommand,
    version: string
  ): Observable<CommandResponseOfVoidCommandResponse>;
}

export interface ISessionClient {
  get(version: string): Observable<QueryResponseOfBooking>;
}
