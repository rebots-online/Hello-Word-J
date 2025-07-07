/**
 * Web-compatible API for liturgical data
 * Copyright (C) 2025 Robin L. M. Cheung, MBA. All rights reserved.
 */

export async function getLiturgicalMass(date: string) {
  try {
    // For web version, we need to call a backend API or use pre-computed data
    // Since the CLI cannot run in browser, we'll fallback to empty propers
    console.warn('Web version: CLI integration not available in browser - need backend API');
    return { propers: {} };
  } catch (error) {
    console.error('Error in web liturgical API:', error);
    return { propers: {} };
  }
}

export async function getLiturgicalOffice(date: string, hour: string) {
  try {
    console.warn('Web version: CLI integration not available in browser - need backend API');
    return { hours: {} };
  } catch (error) {
    console.error('Error in web liturgical API:', error);
    return { hours: {} };
  }
}