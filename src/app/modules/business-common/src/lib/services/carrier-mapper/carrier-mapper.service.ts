import { Injectable } from '@angular/core';
import { CarrierDTO } from '@dcx/ui/api-layer';
import type { CarrierVM, SegmentVM } from '@dcx/ui/libs';

@Injectable({
  providedIn: 'root',
})
export class CarrierMapperService {
  public mapCarrierNamesInSegments(segments: SegmentVM[], carriers: CarrierVM[]): SegmentVM[] {
    if (!segments?.length || !carriers?.length) {
      return segments;
    }

    const carriersMap = this.createCarriersMap(carriers);

    return segments.map((segment) => {
      const updatedSegment = this.mapCarrierName(segment, carriersMap, (seg, carrierName) => ({
        ...seg,
        transport: {
          ...seg.transport,
          carrier: {
            ...seg.transport.carrier,
            name: carrierName,
          },
        },
      }));

      if (updatedSegment.legs?.length) {
        return {
          ...updatedSegment,
          legs: updatedSegment.legs.map((leg) =>
            this.mapCarrierName(leg, carriersMap, (l, carrierName) => ({
              ...l,
              transport: {
                ...l.transport,
                carrier: {
                  ...l.transport.carrier,
                  name: carrierName,
                },
              },
            }))
          ),
        };
      }

      return updatedSegment;
    });
  }

  public getUniqueOperatingCarriers(segments: SegmentVM[]): string[] {
    if (!segments || segments.length === 0) {
      return [];
    }

    const uniqueCarriers = new Map<string, string>();

    for (const segment of segments) {
      if (!segment?.transport?.carrier) {
        continue;
      }

      const carrierCode = segment.transport.carrier.operatingAirlineCode || segment.transport.carrier.code;

      if (carrierCode && !uniqueCarriers.has(carrierCode)) {
        uniqueCarriers.set(carrierCode, segment.transport.carrier.name);
      }
    }
    return Array.from(uniqueCarriers.values());
  }

  /**
   * Generic helper to map carrier name for any entity (segment or leg).
   * Extracts carrier code, looks it up in the map, and applies update if found.
   *
   * @param entity - The entity (segment or leg) to update
   * @param carriersMap - Map of carrier codes to carrier data
   * @param updateFn - Function that knows how to update the specific entity type
   * @returns Updated entity or original if no match found
   */
  private mapCarrierName<T extends { transport?: { carrier?: { operatingAirlineCode?: string; code?: string } } }>(
    entity: T,
    carriersMap: Map<string, CarrierVM>,
    updateFn: (entity: T, carrierName: string) => T
  ): T {
    if (!entity?.transport?.carrier) {
      return entity;
    }

    const carrierCode = entity.transport.carrier.operatingAirlineCode || entity.transport.carrier.code;

    if (!carrierCode) {
      return entity;
    }

    const carrierFromRepo = carriersMap.get(carrierCode);

    return carrierFromRepo?.name ? updateFn(entity, carrierFromRepo.name) : entity;
  }

  private createCarriersMap(carriers: CarrierDTO[]): Map<string, CarrierVM> {
    const map = new Map<string, CarrierVM>();
    carriers.forEach((carrier) => {
      if (carrier.code) {
        map.set(carrier.code, carrier);
      }
    });
    return map;
  }
}
