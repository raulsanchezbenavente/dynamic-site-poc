import { RegulatoryPaxDetailsCategory } from '@dcx/ui/libs';

import { ErrorDto } from '../services';

type JsonObject = Record<string, unknown>;

function asObject(data: unknown): JsonObject {
  return data && typeof data === 'object' ? (data as JsonObject) : {};
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

function asBoolean(value: unknown): boolean | undefined {
  return typeof value === 'boolean' ? value : undefined;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === 'string');
}

const VALID_REGULATORY_PAX_DETAILS_CATEGORIES = Object.values(RegulatoryPaxDetailsCategory);

function asRegulatoryPaxDetailsCategory(value: unknown): RegulatoryPaxDetailsCategory | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  return VALID_REGULATORY_PAX_DETAILS_CATEGORIES.includes(value as RegulatoryPaxDetailsCategory)
    ? (value as RegulatoryPaxDetailsCategory)
    : undefined;
}

export class PaxRegulatoryDetailsQueryResponse {
  public error?: ErrorDto;
  public success?: boolean;
  public result?: PaxRegulatoryDetailsResponseObject;

  public init(data?: unknown): void {
    const parsed = asObject(data);
    this.error = parsed['error'] ? ErrorDto.fromJS(parsed['error']) : undefined;
    this.success = asBoolean(parsed['success']);
    this.result = parsed['result'] ? PaxRegulatoryDetailsResponseObject.fromJS(parsed['result']) : undefined;
  }

  public static fromJS(data: unknown): PaxRegulatoryDetailsQueryResponse {
    const result = new PaxRegulatoryDetailsQueryResponse();
    result.init(data);
    return result;
  }

  public toJSON(data: JsonObject = {}): JsonObject {
    const output = data;
    output['error'] = this.error ? this.error.toJSON() : undefined;
    output['success'] = this.success;
    output['result'] = this.result ? this.result.toJSON() : undefined;
    return output;
  }
}

export class PaxRegulatoryDetailsResponseObject {
  public result?: boolean;
  public data?: PaxRegulatoryDetails;

  public init(data?: unknown): void {
    const parsed = asObject(data);
    this.result = asBoolean(parsed['result']);

    if (parsed['data']) {
      this.data = PaxRegulatoryDetails.fromJS(parsed['data']);
      return;
    }

    this.data = undefined;
  }

  public static fromJS(data: unknown): PaxRegulatoryDetailsResponseObject {
    const result = new PaxRegulatoryDetailsResponseObject();
    result.init(data);
    return result;
  }

  public toJSON(data: JsonObject = {}): JsonObject {
    const output = data;
    output['result'] = this.result;
    output['data'] = this.data ? this.data.toJSON() : undefined;
    return output;
  }
}

export class PaxRegulatoryDetails {
  public paxId?: string;
  public statusCleared?: boolean;
  public missingDetails?: RegulatoryPaxMissingDetails[];

  public init(data?: unknown): void {
    const parsed = asObject(data);
    this.paxId = asString(parsed['paxId']);
    this.statusCleared = asBoolean(parsed['statusCleared']);

    if (Array.isArray(parsed['missingDetails'])) {
      this.missingDetails = parsed['missingDetails'].map((item) => RegulatoryPaxMissingDetails.fromJS(item));
    }
  }

  public static fromJS(data: unknown): PaxRegulatoryDetails {
    const result = new PaxRegulatoryDetails();
    result.init(data);
    return result;
  }

  public toJSON(data: JsonObject = {}): JsonObject {
    const output = data;
    output['paxId'] = this.paxId;
    output['statusCleared'] = this.statusCleared;

    if (Array.isArray(this.missingDetails)) {
      output['missingDetails'] = this.missingDetails.map((item) => (item ? item.toJSON() : undefined));
    }

    return output;
  }
}

export class RegulatoryPaxMissingDetails {
  public category?: RegulatoryPaxDetailsCategory;
  public missingDetails?: RegulatoryPaxMissingDetailItem[];
  public isCompleted?: boolean;

  public init(data?: unknown): void {
    const parsed = asObject(data);
    this.category = asRegulatoryPaxDetailsCategory(parsed['category']);

    if (Array.isArray(parsed['missingDetails'])) {
      this.missingDetails = parsed['missingDetails'].map((item) => RegulatoryPaxMissingDetailItem.fromJS(item));
    }

    this.isCompleted = asBoolean(parsed['isCompleted']);

    // Backward compatibility while backend rollout is in progress.
    if (!this.category) {
      const categoryInfo = asObject(parsed['categoryInfo']);
      this.category = asRegulatoryPaxDetailsCategory(categoryInfo['categoryRegulatoryType']);
    }

    if (!this.missingDetails || this.missingDetails.length === 0) {
      const required = asStringArray(parsed['requiredFields']);
      const optional = asStringArray(parsed['optionalFields']);
      const mergedFields = [...required, ...optional];

      if (mergedFields.length > 0) {
        const legacyItem = new RegulatoryPaxMissingDetailItem();
        legacyItem.requiredDetailsFields = mergedFields;
        legacyItem.isOptional = false;
        this.missingDetails = [legacyItem];
      }
    }

    if (this.isCompleted === undefined) {
      this.isCompleted = asBoolean(parsed['isCompleted']);
    }

    if (this.isCompleted === undefined) {
      this.isCompleted = (this.missingDetails?.length ?? 0) === 0;
    }
  }

  public static fromJS(data: unknown): RegulatoryPaxMissingDetails {
    const result = new RegulatoryPaxMissingDetails();
    result.init(data);
    return result;
  }

  public toJSON(data: JsonObject = {}): JsonObject {
    const output = data;
    output['category'] = this.category;

    if (Array.isArray(this.missingDetails)) {
      output['missingDetails'] = this.missingDetails.map((item) => (item ? item.toJSON() : undefined));
    }

    output['isCompleted'] = this.isCompleted;
    return output;
  }
}

export class RegulatoryPaxMissingDetailItem {
  public canBeDeclined?: boolean;
  public detailsType?: string;
  public regulatoryType?: string;
  public requiredDetailsFields?: string[];
  public isOptional?: boolean;

  public init(data?: unknown): void {
    const parsed = asObject(data);
    this.canBeDeclined = asBoolean(parsed['canBeDeclined']);
    this.detailsType = asString(parsed['detailsType']);
    this.regulatoryType = asString(parsed['regulatoryType']);
    this.requiredDetailsFields = asStringArray(parsed['requiredDetailsFields']);
    this.isOptional = asBoolean(parsed['isOptional']);
  }

  public static fromJS(data: unknown): RegulatoryPaxMissingDetailItem {
    const result = new RegulatoryPaxMissingDetailItem();
    result.init(data);
    return result;
  }

  public toJSON(data: JsonObject = {}): JsonObject {
    const output = data;
    output['canBeDeclined'] = this.canBeDeclined;
    output['detailsType'] = this.detailsType;
    output['regulatoryType'] = this.regulatoryType;
    output['requiredDetailsFields'] = this.requiredDetailsFields ? [...this.requiredDetailsFields] : undefined;
    output['isOptional'] = this.isOptional;
    return output;
  }
}

export { RegulatoryPaxDetailsCategory } from '@dcx/ui/libs';
