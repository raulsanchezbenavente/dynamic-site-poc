import { HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';

const STATIC_CONFIG_DOMAIN = 'av-static-dev3.newshore.es';

function stripStaticConfigDomain(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) {
    return url;
  }

  // Handle malformed URLs without protocol, e.g. av-static-dev3.newshore.es/static-config/...
  if (trimmed.startsWith(`${STATIC_CONFIG_DOMAIN}/`)) {
    return `/${trimmed.slice(STATIC_CONFIG_DOMAIN.length + 1)}`;
  }

  if (!/^https?:\/\//i.test(trimmed)) {
    return url;
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.hostname.toLowerCase() !== STATIC_CONFIG_DOMAIN) {
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
  const normalizedUrl = stripStaticConfigDomain(req.url);

  if (normalizedUrl === req.url) {
    return next(req);
  }

  return next(req.clone({ url: normalizedUrl }));
};
