import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ConfigService } from '@dcx/ui/libs';
import { Observable } from 'rxjs';

import { ResourceEnvelope, ResourceQuery } from '../models/dtos/resource/resource-envelope.dto';
/**
 * Generic service for repository resources
 * Provides a flexible way to retrieve ANY repository type without modifying this service
 */
@Injectable({
  providedIn: 'root',
})
export class RepositoryResourcesService {
  private readonly http = inject(HttpClient);
  private readonly configService = inject(ConfigService);

  /**
   * Retrieves any repository resource by type
   *
   * @param resourceType The resource identifier (e.g., 'carriers', 'airports')
   * @param query Query parameters (culture is required)
   * @returns Observable of ResourceEnvelope with typed data array
   */
  public getResource<T>(resourceType: string, query: ResourceQuery): Observable<ResourceEnvelope<T>> {
    const url = this.buildUrl(resourceType);
    const params = this.buildParams(query);

    return this.http.get<ResourceEnvelope<T>>(url, { params });
  }

  /**
   * Builds full URL for specific resource type
   */
  private buildUrl(resourceType: string): string {
    const base = this.buildBaseUrl();
    return `${base}/${resourceType}`;
  }

  /**
   * Builds base URL for repository-resources endpoint
   */
  private buildBaseUrl(): string {
    const endpoints = this.configService.getEndpointsConfig();
    const baseUrl = endpoints.apiURLRepositoryResources;
    return baseUrl;
  }

  /**
   * Converts query object to HttpParams
   */
  private buildParams(query: ResourceQuery): HttpParams {
    let params = new HttpParams();

    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params = params.set(key, String(value));
      }
    });

    return params;
  }
}
