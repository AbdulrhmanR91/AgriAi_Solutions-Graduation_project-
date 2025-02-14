export const storage = {
    get(key) {
        try {
            const item = localStorage.getItem(key);
            if (!item || item === 'undefined' || item === 'null') {
                return null;
            }
            return JSON.parse(item);
        } catch {
            localStorage.removeItem(key);
            return null;
        }
    },

    set(key, value) {
        try {
            if (value === undefined || value === null) {
                localStorage.removeItem(key);
                return;
            }
            localStorage.setItem(key, JSON.stringify(value));
        } catch {
            localStorage.removeItem(key);
        }
    },

    remove(key) {
        localStorage.removeItem(key);
    }
};
