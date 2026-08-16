import raw from '@/data/site.config.json';
import type { SiteConfig } from '@/lib/types';

export const siteConfig = raw as unknown as SiteConfig;

/** True for real, filled-in text — false for blank values and unfilled [BRACKET_PLACEHOLDER] content. */
export function hasContent(value?: string | null): value is string {
  if (!value) return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  return !/^\[[\w\s]+\]$/.test(trimmed);
}
