import { SafeHtml } from '@angular/platform-browser';

export const PHONE_MASK = (text: SafeHtml): SafeHtml => {
  const html: string = text as string;
  const str = html.replaceAll(/[()]/g, '');
  const left = str.split('-')[0];
  const clean = left.replace(/^\+/, '');
  const match = /\d+/.exec(clean);
  return match ? match[0] : '';
};
