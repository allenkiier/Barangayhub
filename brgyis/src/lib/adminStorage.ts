// Admin account storage utilities
// Uses localStorage for persistence across browser sessions

export interface AdminAccount {
  username: string;
  password: string; // In production, this should be hashed
  createdAt: string;
}

const ADMIN_STORAGE_KEY = 'barangay_admins';

function normalizeUsername(username: string): string {
  return username.trim().toLowerCase();
}

// Migrate from sessionStorage to localStorage (one-time migration)
function migrateFromSessionStorage(): void {
  try {
    // Check if we have data in sessionStorage but not in localStorage
    const sessionData = sessionStorage.getItem(ADMIN_STORAGE_KEY);
    const localData = localStorage.getItem(ADMIN_STORAGE_KEY);
    
    if (sessionData && !localData) {
      console.log('[AdminStorage] Migrating admin data from sessionStorage to localStorage');
      localStorage.setItem(ADMIN_STORAGE_KEY, sessionData);
      sessionStorage.removeItem(ADMIN_STORAGE_KEY);
      console.log('[AdminStorage] Migration complete');
    }
  } catch (error) {
    console.error('[AdminStorage] Migration failed:', error);
  }
}

// Initialize storage (run migration if needed)
migrateFromSessionStorage();

/**
 * Get all admin accounts
 */
export function getAdminAccounts(): AdminAccount[] {
  try {
    const data = localStorage.getItem(ADMIN_STORAGE_KEY);
    const parsed = data ? JSON.parse(data) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('[AdminStorage] Error reading admin accounts:', error);
    return [];
  }
}

/**
 * Save admin accounts
 */
export function saveAdminAccounts(admins: AdminAccount[]): void {
  try {
    localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(admins));
    console.log(`[AdminStorage] Saved ${admins.length} admin account(s) to localStorage`);
  } catch (error) {
    console.error('[AdminStorage] Error saving admin accounts:', error);
    throw error;
  }
}

/**
 * Check if username exists
 */
export function usernameExists(username: string): boolean {
  const normalized = normalizeUsername(username);
  if (!normalized) return false;
  const admins = getAdminAccounts();
  return admins.some(admin => normalizeUsername(admin.username) === normalized);
}

/**
 * Add new admin account
 */
export function addAdminAccount(username: string, password: string): boolean {
  try {
    const normalizedUsername = normalizeUsername(username);
    if (!normalizedUsername || usernameExists(normalizedUsername)) {
      return false;
    }

    const admins = getAdminAccounts();
    admins.push({
      username: normalizedUsername,
      password: password,
      createdAt: new Date().toISOString(),
    });

    saveAdminAccounts(admins);
    return true;
  } catch (error) {
    console.error('[AdminStorage] Error adding admin account:', error);
    throw error;
  }
}

/**
 * Verify admin credentials
 */
export function verifyAdminCredentials(username: string, password: string): boolean {
  const normalizedUsername = normalizeUsername(username);

  // Check default admin account
  if (normalizedUsername === 'admin' && password === 'admin123') {
    return true;
  }

  // Check stored admin accounts
  const admins = getAdminAccounts();
  return admins.some(
    admin => normalizeUsername(admin.username) === normalizedUsername && admin.password === password
  );
}

/**
 * Delete admin account (for admin management features)
 */
export function deleteAdminAccount(username: string): boolean {
  try {
    const normalized = normalizeUsername(username);
    const admins = getAdminAccounts();
    const filtered = admins.filter(admin => normalizeUsername(admin.username) !== normalized);
    
    if (filtered.length === admins.length) {
      return false; // Username not found
    }

    saveAdminAccounts(filtered);
    return true;
  } catch (error) {
    console.error('[AdminStorage] Error deleting admin account:', error);
    throw error;
  }
}

/**
 * Get total number of admin accounts (excluding default)
 */
export function getAdminCount(): number {
  return getAdminAccounts().length;
}
