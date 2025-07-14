import config from '../config/config';

/**
 * Enhanced storage utility with security features
 */
class SecureStorage {
    constructor(storageProvider = localStorage) {
        this.storage = storageProvider;
        this.prefix = 'agriai_';
    }

    /**
     * Get item from storage and parse JSON
     * @param {string} key - Storage key
     * @param {any} defaultValue - Default value if not found
     * @returns {any} Parsed value or default value
     */
    get(key, defaultValue = null) {
        try {
            const prefixedKey = this.prefix + key;
            const item = this.storage.getItem(prefixedKey);
            
            if (!item || item === 'undefined' || item === 'null') {
                return defaultValue;
            }
            
            const parsedItem = JSON.parse(item);
            
            // Check if the item has expired
            if (parsedItem.__expires && parsedItem.__expires < Date.now()) {
                this.remove(key);
                return defaultValue;
            }
            
            return parsedItem.data;
        } catch (error) {
            console.error(`Error retrieving ${key} from storage:`, error);
            this.remove(key);
            return defaultValue;
        }
    }

    /**
     * Set item in storage with JSON stringification and optional expiry
     * @param {string} key - Storage key
     * @param {any} value - Value to store
     * @param {number} [ttl=null] - Time to live in seconds (optional)
     */
    set(key, value, ttl = null) {
        try {
            const prefixedKey = this.prefix + key;
            
            if (value === undefined || value === null) {
                this.storage.removeItem(prefixedKey);
                return;
            }
            
            const storageItem = {
                data: value,
                __timestamp: Date.now()
            };
            
            // Add expiry if TTL is provided
            if (ttl) {
                storageItem.__expires = Date.now() + (ttl * 1000);
            }
            
            this.storage.setItem(prefixedKey, JSON.stringify(storageItem));
        } catch (error) {
            console.error(`Error setting ${key} in storage:`, error);
            // If storage is full, clear non-essential items
            if (error instanceof DOMException && error.code === 22) {
                this.clearNonEssentialData();
            }
        }
    }

    /**
     * Remove item from storage
     * @param {string} key - Storage key
     */
    remove(key) {
        try {
            const prefixedKey = this.prefix + key;
            this.storage.removeItem(prefixedKey);
        } catch (error) {
            console.error(`Error removing ${key} from storage:`, error);
        }
    }
    
    /**
     * Clear all storage items with our prefix
     */
    clearAll() {
        try {
            const keysToRemove = [];
            
            for (let i = 0; i < this.storage.length; i++) {
                const key = this.storage.key(i);
                if (key && key.startsWith(this.prefix)) {
                    keysToRemove.push(key);
                }
            }
            
            keysToRemove.forEach(key => this.storage.removeItem(key));
        } catch (error) {
            console.error('Error clearing storage:', error);
        }
    }
    
    /**
     * Clear expired and non-essential data
     */
    clearNonEssentialData() {
        try {
            const essentialKeys = [
                config.STORAGE_KEYS.TOKEN, 
                config.STORAGE_KEYS.USER_TYPE,
                config.STORAGE_KEYS.USER_INFO,
                config.STORAGE_KEYS.LANGUAGE
            ].map(key => this.prefix + key);
            
            const keysToCheck = [];
            
            for (let i = 0; i < this.storage.length; i++) {
                const key = this.storage.key(i);
                if (key && key.startsWith(this.prefix) && !essentialKeys.includes(key)) {
                    keysToCheck.push(key);
                }
            }
            
            // Remove expired items
            keysToCheck.forEach(key => {
                try {
                    const item = JSON.parse(this.storage.getItem(key));
                    if (item.__expires && item.__expires < Date.now()) {
                        this.storage.removeItem(key);
                    }
                } catch {
                    // If we can't parse it, it's safer to remove it
                    this.storage.removeItem(key);
                }
            });
        } catch (error) {
            console.error('Error cleaning storage:', error);
        }
    }
    
    /**
     * Set user session data with automatic TTL
     * @param {string} token - JWT token
     * @param {Object} userData - User data
     * @param {boolean} rememberMe - Whether to persist session
     */
    setSession(token, userData, rememberMe = false) {
        try {
            const ttl = rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60; // 30 days or 24 hours
            
            this.set(config.STORAGE_KEYS.TOKEN, token, ttl);
            this.set(config.STORAGE_KEYS.USER_INFO, userData, ttl);
            this.set(config.STORAGE_KEYS.USER_TYPE, userData.userType, ttl);
            this.set('session_remember', rememberMe, ttl);
            this.set('session_timestamp', Date.now(), ttl);
        } catch (error) {
            console.error('Error setting session:', error);
        }
    }
    
    /**
     * Get session data if valid
     * @returns {Object|null} Session data or null if invalid
     */
    getSession() {
        try {
            const token = this.get(config.STORAGE_KEYS.TOKEN);
            const userData = this.get(config.STORAGE_KEYS.USER_INFO);
            const userType = this.get(config.STORAGE_KEYS.USER_TYPE);
            const rememberMe = this.get('session_remember', false);
            const timestamp = this.get('session_timestamp');
            
            if (!token || !userData || !userType) {
                return null;
            }
            
            // Check if session is still valid
            if (this.isSessionExpired(token, timestamp, rememberMe)) {
                this.clearSession();
                return null;
            }
            
            return {
                token,
                userData,
                userType,
                rememberMe,
                timestamp
            };
        } catch (error) {
            console.error('Error getting session:', error);
            this.clearSession();
            return null;
        }
    }

    /**
     * Check if session is expired
     * @param {string} token - JWT token
     * @param {number} timestamp - Session timestamp
     * @param {boolean} rememberMe - Remember me flag
     * @returns {boolean} True if expired
     */
    isSessionExpired(token, timestamp, rememberMe) {
        if (!token || !timestamp) return true;
        
        try {
            // Decode JWT to check expiration
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const payload = JSON.parse(window.atob(base64));
            
            const now = Date.now() / 1000;
            
            // Check JWT expiration
            if (payload.exp && payload.exp < now) {
                return true;
            }
            
            // Check session timeout based on remember me
            const sessionDuration = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
            const sessionExpiry = timestamp + sessionDuration;
            
            return Date.now() > sessionExpiry;
        } catch (error) {
            console.error('Error checking session expiry:', error);
            return true;
        }
    }
    
    /**
     * Update session timestamp
     */
    updateSessionActivity() {
        try {
            const session = this.getSession();
            if (session) {
                this.set('session_timestamp', Date.now(), session.rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60);
            }
        } catch (error) {
            console.error('Error updating session activity:', error);
        }
    }
    
    /**
     * Clear all session data
     */
    clearSession() {
        try {
            console.log('Clearing session data...');
            
            // Clear session-specific items
            this.remove(config.STORAGE_KEYS.TOKEN);
            this.remove(config.STORAGE_KEYS.USER_INFO);
            this.remove(config.STORAGE_KEYS.USER_TYPE);
            this.remove('session_remember');
            this.remove('session_timestamp');
            
            // Clear any other auth-related items
            this.remove('authToken');
            this.remove('userToken');
            this.remove('refreshToken');
            
            console.log('Session data cleared successfully');
        } catch (error) {
            console.error('Error clearing session:', error);
            
            // Force clear using direct localStorage calls as fallback
            try {
                const keysToRemove = [
                    this.prefix + config.STORAGE_KEYS.TOKEN,
                    this.prefix + config.STORAGE_KEYS.USER_INFO,
                    this.prefix + config.STORAGE_KEYS.USER_TYPE,
                    this.prefix + 'session_remember',
                    this.prefix + 'session_timestamp',
                    this.prefix + 'authToken',
                    this.prefix + 'userToken',
                    this.prefix + 'refreshToken'
                ];
                
                keysToRemove.forEach(key => {
                    this.storage.removeItem(key);
                });
                
                console.log('Fallback session clear completed');
            } catch (fallbackError) {
                console.error('Fallback session clear failed:', fallbackError);
            }
        }
    }
}

// Export a singleton instance
export const storage = new SecureStorage();
