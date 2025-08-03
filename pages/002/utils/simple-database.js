/**
 * Module that exports `SimpleDatabase`
 * - Simplified IndexedDB wrapper
 * - Only accepts string keys and values
 * 
 * @module simple-database
 * @author Ben Scarletti
 * @see {@link https://github.com/scarletti-ben}
 * @license MIT
 */

// < ======================================================
// < Internal Functions
// < ======================================================

/**
 * Evaluate arguments to check all are valid strings
 * 
 * @param {...any} args - The arguments to evaluate
 * @returns {boolean} True if all arguments are valid strings
 */
function validString(...args) {
    for (const arg of args) {
        if (typeof arg !== 'string' || arg.trim() === '') {
            return false;
        }
    }
    return true;
}

// < ========================================================
// < SimpleDatabase Class
// < ========================================================

/**
 * IndexedDB wrapper class for simple database operations
 * - Converts IndexedDB event-driven API into awaitable Promises
 * - Uses a fixed dbName and storeName for simplicity
 * - Only accepts strings for keys and values for simplicity
 * - Safe: Expected errors in methods passed to result objects
 * 
 * @example
 * const db = new SimpleDatabase(APP_NAME);
 * let result = await db.open();
 * if (result.success) {
 *     console.log('Database opened');
 * } else {
 *     console.error('Database failed to open:', result.message, result.error);
 * }
 */
class SimpleDatabase {

    /** @type {string} */
    _dbName;

    /** @type {string[]} */
    _storeNames = ['default'];

    /** @type {string} */
    _storeName = 'default';

    /** @type {IDBDatabase | null} */
    _db = null;

    /**
     * @param {string} dbName - Database name
     */
    constructor(dbName) {
        if (!validString(dbName)) {
            throw new Error(`Expected non-empty string for dbName`);
        }
        this._dbName = dbName;
    }

    /**
     * Open and link IndexedDB database safely via Promise
     * - Converts IndexedDB event-driven API into an awaitable Promise
     * - If the database exists, it is returned and stored in the instance
     * - If the database does not exist, creates it with given storeName
     * - Safe: Expected errors passed to result object
     * 
     * @returns {Promise<{
     *   success: boolean,
     *   message?: string,
     *   error?: Error
     * }>} The result of the open attempt
     */
    open() {

        // Return all-resolve promise
        return new Promise((resolve) => {

            // Check that this._db is already open
            if (this._db) {
                return resolve({
                    success: true
                });
            }

            // Generate event-driven request to open database
            const request = indexedDB.open(this._dbName);

            // Event that fires if the database does not exist
            request.onupgradeneeded = (event) => {

                /** @type {IDBDatabase} */
                const db = event.target.result;

                // Create all object stores
                this._storeNames.forEach(storeName => {
                    if (!db.objectStoreNames.contains(storeName)) {
                        db.createObjectStore(storeName);
                    }
                });

                console.log(`Database created / upgraded: ${db.name} version ${db.version}`)

            };

            request.onsuccess = () => {

                // Add valid IDBDatabase to this instance
                this._db = request.result;

                // Pass request success result to Promise resolve
                resolve({
                    success: true
                });

            };

            request.onerror = () => {

                // Pass request error result to Promise resolve
                resolve({
                    success: false,
                    message: `Error in the opening process: ${request.error?.name}`,
                    error: request.error
                });

            };

        });

    }

    /**
     * Save string to the linked IndexedDB safely via Promise
     * - Converts IndexedDB event-driven API into an awaitable Promise
     * - Key and value must be strings
     * - Safe: Expected errors passed to result object
     * 
     * @param {string} key - The string key to store data at
     * @param {string} value - The string to be saved
     * @returns {Promise<{
     *   success: boolean,
     *   message?: string,
     *   error?: Error
     * }>} The result of the save attempt
     */
    save(key, value) {

        // Return all-resolve promise
        return new Promise((resolve) => {

            // Check that this._db is linked
            if (!this._db) {
                return resolve({
                    success: false,
                    message: 'Database not currently linked'
                });
            }

            // Validate required arguments
            if (!validString(key, value)) {
                return resolve({
                    success: false,
                    message: 'Expected a non-empty string'
                });
            }

            // Generate event-driven transaction and request
            const transaction = this._db.transaction(this._storeNames, 'readwrite');
            const store = transaction.objectStore(this._storeName);
            const request = store.put(value, key);

            request.onsuccess = () => {

                // Pass request success result to Promise resolve
                resolve({
                    success: true
                });

            };

            request.onerror = () => {

                // Pass request error result to Promise resolve
                resolve({
                    success: false,
                    message: `Error in the saving process: ${request.error?.name}`,
                    error: request.error
                });

            };

            transaction.onerror = () => {

                // Pass transaction error result to Promise resolve
                resolve({
                    success: false,
                    message: `Error in the saving process: ${transaction.error?.name}`,
                    error: transaction.error
                });

            };

            transaction.onabort = () => {

                // Pass transaction abort result to Promise resolve
                let error = new Error('Transaction aborted');
                resolve({
                    success: false,
                    message: `Error in the saving process: ${error.name}`,
                    error
                });

            };

        });
    }

    /**
     * Load data from the linked IndexedDB safely via Promise
     * - Converts IndexedDB event-driven API into an awaitable Promise
     * - Key and value must be a string
     * - Safe: Expected errors passed to result object
     * 
     * @param {string} key - The string key to retrieve data from
     * @returns {Promise<{
     *   success: boolean,
     *   data?: string,
     *   message?: string,
     *   error?: Error
     * }>} The result of the load attempt
     */
    load(key) {

        // Return all-resolve promise
        return new Promise((resolve) => {

            // Check that this._db is linked
            if (!this._db) {
                return resolve({
                    success: false,
                    message: 'Database not currently linked'
                });
            }

            // Validate required arguments
            if (!validString(key)) {
                return resolve({
                    success: false,
                    message: 'Expected a non-empty string'
                });
            }

            // Generate event-driven transaction and request
            const transaction = this._db.transaction(this._storeNames, 'readonly');
            const store = transaction.objectStore(this._storeName);
            const request = store.get(key);

            request.onsuccess = () => {

                if (request.result != null) {

                    // Pass request success result to Promise resolve
                    resolve({
                        success: true,
                        data: request.result
                    });

                } else {

                    // Pass request failure result to Promise resolve
                    resolve({
                        success: false,
                        message: `Data was nullish`
                    });

                }

            };

            request.onerror = () => {

                // Pass request error result to Promise resolve
                resolve({
                    success: false,
                    message: `Error in the loading process: ${request.error?.name}`,
                    error: request.error
                });

            };

            transaction.onerror = () => {

                // Pass transaction error result to Promise resolve
                resolve({
                    success: false,
                    message: `Error in the loading process: ${transaction.error?.name}`,
                    error: transaction.error
                });

            };

            transaction.onabort = () => {

                // Pass transaction abort result to Promise resolve
                let error = new Error('Transaction aborted');
                resolve({
                    success: false,
                    message: `Error in the loading process: ${error.name}`,
                    error
                });

            };

        });

    }

    /**
     * Load all keys from the linked IndexedDB safely via Promise
     * - Converts IndexedDB event-driven API into an awaitable Promise
     * - Returns all keys from the database
     * - Safe: Expected errors passed to result object
     * 
     * @returns {Promise<{
     *   success: boolean,
     *   data?: string[],
     *   message?: string,
     *   error?: Error
     * }>} The result of the load attempt
     */
    _loadAllKeys() {

        // Return all-resolve promise
        return new Promise((resolve) => {

            // Check that this._db is linked
            if (!this._db) {
                return resolve({
                    success: false,
                    message: 'Database not currently linked'
                });
            }

            // Generate event-driven transaction and request
            const transaction = this._db.transaction(this._storeName, 'readonly');
            const store = transaction.objectStore(this._storeName);
            const request = store.getAllKeys();

            request.onsuccess = () => {

                if (request.result != null) {

                    // Pass request success result to Promise resolve
                    resolve({
                        success: true,
                        data: request.result
                    });

                } else {

                    // Pass request failure result to Promise resolve
                    resolve({
                        success: false,
                        message: `Data was nullish`
                    });

                }

            };

            request.onerror = () => {

                // Pass request error result to Promise resolve
                resolve({
                    success: false,
                    message: `Error in the loading process: ${request.error?.name}`,
                    error: request.error
                });

            };

            transaction.onerror = () => {

                // Pass transaction error result to Promise resolve
                resolve({
                    success: false,
                    message: `Error in the loading process: ${transaction.error?.name}`,
                    error: transaction.error
                });

            };

            transaction.onabort = () => {

                // Pass transaction abort result to Promise resolve
                let error = new Error('Transaction aborted');
                resolve({
                    success: false,
                    message: `Error in the loading process: ${error.name}`,
                    error
                });

            };

        });

    }

    /**
     * Load all values from the linked IndexedDB safely via Promise
     * - Converts IndexedDB event-driven API into an awaitable Promise
     * - Returns all values from the database
     * - Safe: Expected errors passed to result object
     * 
     * @returns {Promise<{
     *   success: boolean,
     *   data?: string[],
     *   message?: string,
     *   error?: Error
     * }>} The result of the load attempt
     */
    _loadAllValues() {

        // Return all-resolve promise
        return new Promise((resolve) => {

            // Check that this._db is linked
            if (!this._db) {
                return resolve({
                    success: false,
                    message: 'Database not currently linked'
                });
            }

            // Generate event-driven transaction and request
            const transaction = this._db.transaction(this._storeName, 'readonly');
            const store = transaction.objectStore(this._storeName);
            const request = store.getAll();

            request.onsuccess = () => {

                if (request.result != null) {

                    // Pass request success result to Promise resolve
                    resolve({
                        success: true,
                        data: request.result
                    });

                } else {

                    // Pass request failure result to Promise resolve
                    resolve({
                        success: false,
                        message: `Data was nullish`
                    });

                }

            };

            request.onerror = () => {

                // Pass request error result to Promise resolve
                resolve({
                    success: false,
                    message: `Error in the loading process: ${request.error?.name}`,
                    error: request.error
                });

            };

            transaction.onerror = () => {

                // Pass transaction error result to Promise resolve
                resolve({
                    success: false,
                    message: `Error in the loading process: ${transaction.error?.name}`,
                    error: transaction.error
                });

            };

            transaction.onabort = () => {

                // Pass transaction abort result to Promise resolve
                let error = new Error('Transaction aborted');
                resolve({
                    success: false,
                    message: `Error in the loading process: ${error.name}`,
                    error
                });

            };

        });

    }

    /**
     * Load all data from the linked IndexedDB safely via Promise
     * - Converts IndexedDB event-driven API into an awaitable Promise
     * - Returns an object with all key-value pairs from the database
     * - Safe: Expected errors passed to result object
     * 
     * @returns {Promise<{
     *   success: boolean,
     *   data?: Record<string, string>,
     *   message?: string,
     *   error?: Error
     * }>} The result of the load attempt
     */
    loadAll() {

        // Return all-resolve promise
        return new Promise((resolve) => {

            // Check that this._db is linked
            if (!this._db) {
                return resolve({
                    success: false,
                    message: 'Database not currently linked'
                });
            }

            // Generate event-driven transaction and request
            const transaction = this._db.transaction(this._storeName, 'readonly');
            const store = transaction.objectStore(this._storeName);
            const data = {};
            const request = store.openCursor();

            request.onsuccess = (event) => {

                const cursor = event.target.result;

                if (cursor) {

                    // Add to the data and continue
                    data[cursor.key] = cursor.value;
                    cursor.continue();

                } else {

                    // Pass data to Promise resolve
                    resolve({
                        success: true,
                        data
                    });

                }

            };

            request.onerror = () => {

                // Pass request error result to Promise resolve
                resolve({
                    success: false,
                    message: `Error in the loading process: ${request.error?.name}`,
                    error: request.error
                });

            };

            transaction.onerror = () => {

                // Pass transaction error result to Promise resolve
                resolve({
                    success: false,
                    message: `Error in the loading process: ${transaction.error?.name}`,
                    error: transaction.error
                });

            };

            transaction.onabort = () => {

                // Pass transaction abort result to Promise resolve
                let error = new Error('Transaction aborted');
                resolve({
                    success: false,
                    message: `Error in the loading process: ${error.name}`,
                    error
                });

            };

        });

    }

    /**
     * Destroy the linked IndexedDB database
     * - Sets `instance.db` to null
     * - Safe: Expected errors passed to result object
     * 
     * @returns {Promise<{
     *   success: boolean,
     *   message?: string,
     *   error?: Error
     * }>} The result of the destroy attempt
     */
    _destroy() {

        // Return all-resolve promise
        return new Promise((resolve) => {

            // Check that this._db is linked
            if (!this._db) {
                return resolve({
                    success: false,
                    message: 'Database not currently linked'
                });
            }

            // Close the database
            this._close();

            // Generate event-driven request
            const request = indexedDB.deleteDatabase(this._dbName);

            request.onsuccess = () => {

                // Pass request success result to Promise resolve
                resolve({
                    success: true
                });

            };

            request.onblocked = () => {

                // Pass request error result to Promise resolve
                const error = new Error("Deletion blocked, other tabs may be accessing data");
                resolve({
                    success: false,
                    message: `Error in the deletion process: ${error.name}`,
                    error
                });

            };

            request.onerror = () => {

                // Pass request error result to Promise resolve
                resolve({
                    success: false,
                    message: `Error in the deletion process: ${request.error?.name}`,
                    error: request.error
                });

            };

        });

    }

    /**
     * Reset the linked IndexedDB 
     * - Destroys and then creates a blank IndexedDB
     * 
     * @returns {Promise<{
     *   success: boolean,
     *   message?: string,
     *   error?: Error
     * }>} The result of the destroy attempt
     */
    async reset() {

        // Destroy the current database instance
        const destroyResult = await this._destroy();
        if (!destroyResult.success) {
            return destroyResult;
        }

        // Create a new database instance
        const openResult = await this.open();
        if (!openResult.success) {
            return openResult;
        }

        return {
            success: true
        };

    }

    /**
     * Close the linked IndexedDB database connection
     * - Synchronous, and not prone to error
     * - Closes the database connection if it exists
     * - Sets `instance.db` to null
     * 
     * @returns {void}
     */
    _close() {

        // Safely close the database, and remove reference
        if (this._db) {
            this._db.close();
            this._db = null;
        }

    }

}

// > ======================================================
// > Exports
// > ======================================================

export { SimpleDatabase }