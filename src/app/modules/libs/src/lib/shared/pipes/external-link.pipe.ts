import { Injectable, Pipe, PipeTransform } from '@angular/core';

import { WindowHelper } from '../../core/helpers/window-helper';

@Pipe({
  name: 'isExternalLink',
  standalone: true,
})
@Injectable({ providedIn: 'root' })

export class ExternalLinkPipe implements PipeTransform {
  public transform(url: string | null | undefined): boolean {
    if (!url || typeof url !== 'string') {
      return false;
    }

    try {
      const parsedUrl = new URL(url, WindowHelper.getLocation().href);
      const currentDomain = new URL(WindowHelper.getLocation().href).hostname;
      return parsedUrl.hostname !== currentDomain;
    } catch (e) {
      console.error('Invalid URL:', url, e);
      return false;
    }
  }
}
