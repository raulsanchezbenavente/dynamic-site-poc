import type { RfIpErrorMessages } from '../../../../../lib/components/rf-ip-input/models/rf-ip-input-error-messages.model';

export const ERROR_MESSAGES_IP: RfIpErrorMessages = Object.fromEntries(
  Array.from({ length: 4 }, (_, i) => {
    const index: number = i + 1;
    return [
      `ip${index}`,
      {
        required: `Segment ${index} is required.`,
        pattern: `Segment ${index} must be a number between 0 and 255.`,
      },
    ];
  })
) as unknown as RfIpErrorMessages;
