/**
 * Simple encoding/decoding for tournament IDs
 * This provides URL-safe obscurity (not cryptographic security)
 */

/**
 * Encode a tournament ID to a URL-safe hash
 */
export function encodeTournamentId(id: string): string {
  // Base64 encode and make URL-safe
  const base64 = Buffer.from(id).toString('base64');
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

/**
 * Decode a hash back to tournament ID
 */
export function decodeTournamentId(hash: string): string {
  // Restore base64 format and decode
  let base64 = hash.replace(/-/g, '+').replace(/_/g, '/');
  // Add padding if needed
  while (base64.length % 4) {
    base64 += '=';
  }
  return Buffer.from(base64, 'base64').toString('utf-8');
}
