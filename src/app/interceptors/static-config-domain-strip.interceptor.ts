import { HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';

const STATIC_CONFIG_HOST = 'av-static-dev3.newshore.es';

function stripStaticConfigHostFromUrl(url: string): string {
  const trimmedUrl = url.trim();

  if (!trimmedUrl) {
    return url;
  }

  if (!/^https?:\/\//i.test(trimmedUrl)) {
    return url;
  }

  try {
    const parsed = new URL(trimmedUrl);
    if (parsed.hostname.toLowerCase() !== STATIC_CONFIG_HOST) {
      return url;
    }

    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return url;
  }
}

export const staticConfigDomainStripInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const normalizedUrl = stripStaticConfigHostFromUrl(req.url);

  if (normalizedUrl === req.url) {
    return next(req);
  }

  return next(req.clone({ url: normalizedUrl }));
};
