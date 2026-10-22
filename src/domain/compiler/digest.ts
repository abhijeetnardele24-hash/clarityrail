/**
 * ClarityRail Deterministic SHA-256 Source Digest Engine
 *
 * Implements FIPS 180-4 compliant SHA-256 over canonical normalized source text.
 * Completely offline-capable, browser-compatible, zero external dependencies.
 */

/**
 * Normalizes source text to a canonical form before hashing:
 * - Unicode NFC normalization
 * - Convert CRLF / CR line endings to LF
 * - Remove zero-width / invisible unicode characters
 * - Trim trailing whitespace per line and collapse internal runs of spaces/tabs
 * - Trim outer whitespace
 */
export function canonicalNormalizeSourceText(text: string): string {
  if (!text) return "";

  return text
    .normalize("NFC")
    .replace(/[\u200B-\u200D\uFEFF]/g, "") // strip zero-width chars
    .replace(/\r\n|\r/g, "\n")              // normalize newlines
    .split("\n")
    .map((line) => line.replace(/[ \t]+/g, " ").trim())
    .join("\n")
    .trim();
}

// SHA-256 Round Constants
const K = new Uint32Array([
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
]);

function rotr(n: number, b: number): number {
  return (n >>> b) | (n << (32 - b));
}

/**
 * Pure TypeScript synchronous SHA-256 implementation (FIPS 180-4).
 * Returns 64-character lowercase hex string.
 */
export function sha256Hex(input: string): string {
  // Convert string to UTF-8 byte array
  const encoder = new TextEncoder();
  const bytes = encoder.encode(input);
  const bitLen = bytes.length * 8;

  // Pre-processing: pad with 0x80, then 0x00s, then 64-bit big-endian length
  const padLen = ((bytes.length + 8) >> 6) + 1;
  const words = new Uint32Array(padLen * 16);

  for (let i = 0; i < bytes.length; i++) {
    const wordIdx = i >> 2;
    const b = bytes[i] ?? 0;
    words[wordIdx] = (words[wordIdx] ?? 0) | (b << ((3 - (i & 3)) * 8));
  }
  const endIdx = bytes.length >> 2;
  words[endIdx] = (words[endIdx] ?? 0) | (0x80 << ((3 - (bytes.length & 3)) * 8));

  // Big-endian 64-bit integer length at the end
  words[words.length - 2] = Math.floor(bitLen / 0x100000000);
  words[words.length - 1] = bitLen >>> 0;

  // Initial hash values
  let h0 = 0x6a09e667;
  let h1 = 0xbb67ae85;
  let h2 = 0x3c6ef372;
  let h3 = 0xa54ff53a;
  let h4 = 0x510e527f;
  let h5 = 0x9b05688c;
  let h6 = 0x1f83d9ab;
  let h7 = 0x5be0cd19;

  const w = new Uint32Array(64);

  // Process 512-bit blocks (16 words each)
  for (let i = 0; i < words.length; i += 16) {
    for (let j = 0; j < 16; j++) {
      w[j] = words[i + j] ?? 0;
    }
    for (let j = 16; j < 64; j++) {
      const w15 = w[j - 15] ?? 0;
      const w2 = w[j - 2] ?? 0;
      const s0 = rotr(w15, 7) ^ rotr(w15, 18) ^ (w15 >>> 3);
      const s1 = rotr(w2, 17) ^ rotr(w2, 19) ^ (w2 >>> 10);
      w[j] = ((w[j - 16] ?? 0) + s0 + (w[j - 7] ?? 0) + s1) >>> 0;
    }

    let a = h0;
    let b = h1;
    let c = h2;
    let d = h3;
    let e = h4;
    let f = h5;
    let g = h6;
    let h = h7;

    for (let j = 0; j < 64; j++) {
      const s1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
      const ch = (e & f) ^ (~e & g);
      const kj = K[j] ?? 0;
      const wj = w[j] ?? 0;
      const temp1 = (h + s1 + ch + kj + wj) >>> 0;
      const s0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (s0 + maj) >>> 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) >>> 0;
    }

    h0 = (h0 + a) >>> 0;
    h1 = (h1 + b) >>> 0;
    h2 = (h2 + c) >>> 0;
    h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0;
    h5 = (h5 + f) >>> 0;
    h6 = (h6 + g) >>> 0;
    h7 = (h7 + h) >>> 0;
  }

  const toHex = (n: number) => n.toString(16).padStart(8, "0");
  return `${toHex(h0)}${toHex(h1)}${toHex(h2)}${toHex(h3)}${toHex(h4)}${toHex(h5)}${toHex(h6)}${toHex(h7)}`;
}

/**
 * Computes deterministic SHA-256 digest of canonical normalized source text.
 * Format: "sha256_<64-char-hex>"
 */
export function computeNormalizedSourceDigest(text: string): string {
  const normalized = canonicalNormalizeSourceText(text);
  const hash = sha256Hex(normalized);
  return `sha256_${hash}`;
}

/**
 * Async version utilizing Web Crypto API when available, with pure JS fallback.
 */
export async function computeNormalizedSourceDigestAsync(text: string): Promise<string> {
  const normalized = canonicalNormalizeSourceText(text);

  if (typeof crypto !== "undefined" && crypto.subtle && typeof crypto.subtle.digest === "function") {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(normalized);
      const buffer = await crypto.subtle.digest("SHA-256", data);
      const hashArray = Array.from(new Uint8Array(buffer));
      const hex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
      return `sha256_${hex}`;
    } catch {
      // Fallback to pure TS
    }
  }

  return computeNormalizedSourceDigest(text);
}
