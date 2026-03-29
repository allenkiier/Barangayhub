import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Secure session storage utilities using Web Crypto (AES-GCM)
// Note: This improves client-side confidentiality for demo-only data.
// It is not a substitute for server-side, httpOnly cookies.

const SESSION_CRYPTO_KEY = "barangay_session_crypto_key";

async function getCryptoKey(): Promise<CryptoKey> {
  // Reuse a random symmetric key stored in sessionStorage for this session
  let keyB64 = sessionStorage.getItem(SESSION_CRYPTO_KEY);
  if (!keyB64) {
    const raw = new Uint8Array(32);
    crypto.getRandomValues(raw);
    keyB64 = btoa(String.fromCharCode(...raw));
    sessionStorage.setItem(SESSION_CRYPTO_KEY, keyB64);
  }
  const rawBytes = Uint8Array.from(atob(keyB64), (c) => c.charCodeAt(0));
  return crypto.subtle.importKey(
    "raw",
    rawBytes,
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"]
  );
}

function toBase64(bytes: ArrayBuffer): string {
  const binary = String.fromCharCode(...new Uint8Array(bytes));
  return btoa(binary);
}

function isValidBase64(str: string): boolean {
  // Accepts base64 with or without padding, ignores whitespace
  if (typeof str !== 'string') return false;
  const cleaned = str.replace(/\s/g, '');
  // Base64 regex: groups of 4 chars, ending with 0-2 padding =
  return /^[A-Za-z0-9+/]*={0,2}$/.test(cleaned) && cleaned.length % 4 === 0;
}

function fromBase64(b64: string): Uint8Array {
  if (!isValidBase64(b64)) {
    throw new Error('Invalid base64 input');
  }
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
}

export async function secureSessionSet<T>(key: string, value: T): Promise<void> {
  const cryptoKey = await getCryptoKey();
  const iv = new Uint8Array(12);
  crypto.getRandomValues(iv);
  const data = new TextEncoder().encode(JSON.stringify(value));
  const cipher = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, cryptoKey, data);
  const payload = JSON.stringify({ iv: toBase64(iv.buffer), ct: toBase64(cipher) });
  sessionStorage.setItem(key, payload);
}

export async function secureSessionGet<T>(key: string): Promise<T | null> {
  const payload = sessionStorage.getItem(key);
  if (!payload) return null;
  try {
    const { iv, ct } = JSON.parse(payload);
    const cryptoKey = await getCryptoKey();
    const ivBytes = fromBase64(iv);
    const ctBytes = fromBase64(ct);
    const plain = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: ivBytes },
      cryptoKey,
      ctBytes
    );
    const json = new TextDecoder().decode(plain);
    return JSON.parse(json) as T;
  } catch (e) {
    // If base64 error, remove corrupted session key so it doesn't repeat
    if (e instanceof Error && e.message.includes('Invalid base64 input')) {
      sessionStorage.removeItem(key);
    }
    console.error("secureSessionGet decrypt error", e);
    return null;
  }
}

export function isSecureContextOrLocalhost(): boolean {
  try {
    const isLocalhost = location.hostname === "localhost" || location.hostname === "127.0.0.1";
    return isLocalhost || location.protocol === "https:";
  } catch {
    return false;
  }
}

export function loadExternalScript(src: string, id?: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (id && document.getElementById(id)) {
      resolve();
      return;
    }
    const s = document.createElement("script");
    s.src = src;
    if (id) s.id = id;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(s);
  });
}

export async function getCurrentUser<T = any>(): Promise<T | null> {
  // Try unified key first, then provider-specific fallbacks
  const unified = await secureSessionGet<T>("barangayUser");
  if (unified) return unified;
  const google = await secureSessionGet<T>("barangayGmailUser");
  if (google) return google;
  const facebook = await secureSessionGet<T>("barangayFacebookUser");
  if (facebook) return facebook;
  return null;
}

// Password hashing helpers (PBKDF2 with SHA-256)
export async function createPasswordHash(password: string): Promise<{ salt: string; hash: string }> {
  const saltBytes = new Uint8Array(16);
  crypto.getRandomValues(saltBytes);
  const saltB64 = btoa(String.fromCharCode(...saltBytes));
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(password), { name: 'PBKDF2' }, false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: saltBytes, iterations: 150000, hash: 'SHA-256' }, keyMaterial, 256);
  const hashB64 = btoa(String.fromCharCode(...new Uint8Array(bits)));
  return { salt: saltB64, hash: hashB64 };
}

export async function verifyPassword(password: string, saltB64: string, expectedHashB64: string): Promise<boolean> {
  try {
    const enc = new TextEncoder();
    const saltBytes = Uint8Array.from(atob(saltB64), (c) => c.charCodeAt(0));
    const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(password), { name: 'PBKDF2' }, false, ['deriveBits']);
    const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: saltBytes, iterations: 150000, hash: 'SHA-256' }, keyMaterial, 256);
    const hashB64 = btoa(String.fromCharCode(...new Uint8Array(bits)));
    return hashB64 === expectedHashB64;
  } catch {
    return false;
  }
}
