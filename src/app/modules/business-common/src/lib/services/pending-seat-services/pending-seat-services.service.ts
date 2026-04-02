import { inject, Injectable } from '@angular/core';
import { Service } from '@dcx/ui/api-layer';
import { EnumStorageKey, StorageService } from '@dcx/ui/libs';

/**
 * Service to manage pending seat services in session storage.
 * Centralizes all operations related to PendingSeatServices storage key.
 */
@Injectable({ providedIn: 'root' })
export class PendingSeatServicesService {
  private readonly storageService = inject(StorageService);

  /**
   * Gets all pending seat services from session storage
   * @returns Array of pending seat services, or empty array if none found
   */
  public getPendingSeatServices(): Service[] {
    return (this.storageService.getSessionStorage(EnumStorageKey.PendingSeatServices) as Service[]) ?? [];
  }

  /**
   * Sets pending seat services in session storage
   * @param services - Array of services to store
   */
  public setPendingSeatServices(services: Service[]): void {
    this.storageService.setSessionStorage(EnumStorageKey.PendingSeatServices, services);
  }

  /**
   * Gets a specific pending seat service for a passenger and segment
   * @param paxId - Passenger ID
   * @param segmentId - Segment ID
   * @returns The matching service or undefined
   */
  public getPendingSeatForPassengerAndSegment(paxId: string, segmentId: string): Service | undefined {
    const pendingServices = this.getPendingSeatServices();
    return pendingServices.find((service) => service.paxId === paxId && service.sellKey === segmentId);
  }

  /**
   * Adds a new pending seat service
   * @param service - Service to add
   */
  public addPendingSeatService(service: Service): void {
    const currentServices = this.getPendingSeatServices();
    const existingIndex = currentServices.findIndex((s) => s.paxId === service.paxId && s.sellKey === service.sellKey);

    if (existingIndex >= 0) {
      currentServices[existingIndex] = service;
    } else {
      currentServices.push(service);
    }

    this.setPendingSeatServices(currentServices);
  }

  /**
   * Removes a pending seat service for a specific passenger and segment
   * @param paxId - Passenger ID
   * @param segmentId - Segment ID
   */
  public removePendingSeatService(paxId: string, segmentId: string): void {
    const currentServices = this.getPendingSeatServices();
    const filteredServices = currentServices.filter((s) => !(s.paxId === paxId && s.sellKey === segmentId));
    this.setPendingSeatServices(filteredServices);
  }

  /**
   * Clears all pending seat services from session storage
   */
  public clearPendingSeatServices(): void {
    this.storageService.removeSessionStorage(EnumStorageKey.PendingSeatServices);
  }

  /**
   * Checks if there are any pending seat services
   * @returns true if there are pending services, false otherwise
   */
  public hasPendingSeatServices(): boolean {
    return this.getPendingSeatServices().length > 0;
  }
}
