import { HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';

const STATIC_CONFIG_DOMAIN = 'av-static-dev3.newshore.es';

function stripStaticConfigDomain(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) {
    return url;
  }

  // Support URLs with or without protocol and optional port.
  const withoutProtocol =
    trimmed.toLowerCase().startsWith('http://') || trimmed.toLowerCase().startsWith('https://')
      ? trimmed.slice(trimmed.indexOf('//') + 2)
      : trimmed;

  const firstSlash = withoutProtocol.indexOf('/');
  if (firstSlash <= 0) {
    return url;
  }

  const hostWithOptionalPort = withoutProtocol.slice(0, firstSlash);
  const pathWithQueryHash = withoutProtocol.slice(firstSlash + 1);
  const host = hostWithOptionalPort.split(':')[0]?.toLowerCase();

  if (host === STATIC_CONFIG_DOMAIN && pathWithQueryHash.length > 0) {
    return `/${pathWithQueryHash}`;
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
