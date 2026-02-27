import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ---------------------------------------------------------
// URL helpers for product links
// ---------------------------------------------------------

/**
 * Ensure the provided URL is absolute and starts with https.
 * If it's relative or malformed, the function will return an empty string.
 */
export function sanitizeUrl(raw: string, defaultHost?: string): string {
  if (!raw || typeof raw !== 'string') return '';
  let urlString = raw.trim();

  // add protocol if missing
  if (!/^https?:\/\//i.test(urlString)) {
    urlString = `https://${urlString}`;
  }

  try {
    const url = new URL(urlString);
    return url.href;
  } catch {
    // fallback to default host if provided
    if (defaultHost) {
      try {
        return new URL(urlString, defaultHost).href;
      } catch {
        // swallow
      }
    }
  }

  return '';
}

export function buildAmazonUrl(asin: string): string {
  return `https://www.amazon.in/dp/${asin}`;
}

export function buildFlipkartUrl(pid: string, name?: string): string {
  // Flipkart URL format is https://www.flipkart.com/<slug>/p/itm?pid=<pid>
  // where the slug is optional.  Including a slug makes the URL more
  // realistic and may avoid redirection to search results.
  let base = `https://www.flipkart.com/p/itm?pid=${pid}`;
  if (name) {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    base = `https://www.flipkart.com/${slug}/p/itm?pid=${pid}`;
  }
  return base;
}

export function buildMeeshoUrl(pid: string): string {
  // Meesho uses the /p/<pid> pattern in newer links.  Some demo data uses
  // "/s/p/...", so we'll normalise to the form below.
  return `https://www.meesho.com/p/${pid}`;
}
