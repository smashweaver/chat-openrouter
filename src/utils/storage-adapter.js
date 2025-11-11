/**
 * StorageAdapter Interface Contract
 * @interface StorageAdapter
 * @property {(key: string) => Promise<string | null>} read - Retrieve data by key
 * @property {(key: string, data: string) => Promise<void>} write - Store data with key
 * @property {(key: string) => Promise<boolean>} exists - Check key existence
 * @property {(key: string) => Promise<void>} delete - Remove data by key
 */

/**
 * LocalStorage Adapter Implementation
 * Provides browser localStorage with error handling and quota management
 */
export class LocalStorageAdapter {
  constructor(storageKey = "ai-chat-bot") {
    this.storageKey = storageKey;
    this.errorHandlers = new Set();
  }

  /**
   * Read data from localStorage with error handling
   * @param {string} [key] - Optional specific key, defaults to storageKey
   * @returns {Promise<string | null>} Stored data or null
   */
  async read(key = this.storageKey) {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      this.#handleError("read", error, { key });
      return null;
    }
  }

  /**
   * Write data to localStorage with serialization
   * @param {string} key - Storage key
   * @param {string} data - Stringified data to store
   * @returns {Promise<void>}
   */
  async write(key, data) {
    try {
      // Handle storage quota limits
      if (data.length > this.#getMaxSize()) {
        throw new Error(
          `Data size (${data.length} bytes) exceeds storage limit`
        );
      }

      localStorage.setItem(key, data);
    } catch (error) {
      this.#handleError("write", error, { key, dataSize: data.length });
    }
  }

  /**
   * Check if key exists in localStorage
   * @param {string} key - Storage key
   * @returns {Promise<boolean>} Key existence status
   */
  async exists(key) {
    try {
      return localStorage.getItem(key) !== null;
    } catch (error) {
      this.#handleError("exists", error, { key });
      return false;
    }
  }

  /**
   * Delete key from localStorage
   * @param {string} key - Storage key
   * @returns {Promise<void>}
   */
  async delete(key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      this.#handleError("delete", error, { key });
    }
  }

  /**
   * Get approximate max size for localStorage (typically 5-10MB)
   * @returns {number} Maximum size in bytes
   */
  #getMaxSize() {
    // Conservative estimate accounting for browser variations
    return 5 * 1024 * 1024; // 5MB
  }

  /**
   * Centralized error handling with user feedback
   * @private
   * @param {string} operation - Failed operation name
   * @param {Error} error - Error object
   * @param {Object} context - Additional error context
   */
  #handleError(operation, error, context) {
    const errorEvent = {
      operation,
      error: error.message,
      context,
      timestamp: new Date().toISOString(),
    };

    // Notify error handlers (UI components can subscribe)
    this.errorHandlers.forEach((handler) => {
      try {
        handler(errorEvent);
      } catch (handlerError) {
        console.error("Error in error handler:", handlerError);
      }
    });

    // Log for debugging
    console.error(`Storage ${operation} failed:`, errorEvent);
  }

  /**
   * Subscribe to storage errors
   * @param {(error: Object) => void} handler - Error callback
   * @returns {() => void} Unsubscribe function
   */
  onError(handler) {
    this.errorHandlers.add(handler);
    return () => this.errorHandlers.delete(handler);
  }
}

/**
 * Migration Service for handling versioned data migrations
 * Follows middleware pattern for clean separation of concerns
 */
class MigrationService {
  constructor() {
    this.currentVersion = "2.0.0";
    this.migrations = new Map();
    this.registerDefaultMigrations();
  }

  /**
   * Register a migration handler for a specific version
   * @param {string} version - Target version
   * @param {(data: any) => any} handler - Migration function
   */
  register(version, handler) {
    this.migrations.set(version, handler);
  }

  /**
   * Check if data needs migration
   * @param {any} data - Data to check
   * @returns {boolean} Whether migration is needed
   */
  needsMigration(data) {
    if (!data) return false;

    const dataVersion = data.version || "1.0.0";
    return this.#compareVersions(dataVersion, this.currentVersion) < 0;
  }

  /**
   * Apply migrations to data
   * @param {any} data - Data to migrate
   * @returns {any} Migrated data
   */
  migrate(data) {
    if (!data) return null;

    let migrated = data;

    // Get all versions that need to be applied
    const versionsToMigrate = Array.from(this.migrations.keys())
      .filter((version) =>
        this.#shouldMigrate(data.version || "1.0.0", version)
      )
      .sort((a, b) => this.#compareVersions(a, b));

    // Apply migrations in order
    for (const version of versionsToMigrate) {
      const handler = this.migrations.get(version);
      if (handler) {
        migrated = handler(migrated);
      }
    }

    return migrated;
  }

  /**
   * Register default migration handlers
   * @private
   */
  registerDefaultMigrations() {
    // Example migration: v1.0.0 to v2.0.0
    this.register("2.0.0", (data) => ({
      ...data,
      version: "2.0.0",
      migratedAt: new Date().toISOString(),
      // Future migration logic would go here
    }));
  }

  /**
   * Compare version strings
   * @private
   * @param {string} v1 - First version
   * @param {string} v2 - Second version
   * @returns {number} Comparison result
   */
  #compareVersions(v1, v2) {
    const parts1 = v1.split(".").map(Number);
    const parts2 = v2.split(".").map(Number);

    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const diff = (parts1[i] || 0) - (parts2[i] || 0);
      if (diff !== 0) return diff;
    }
    return 0;
  }

  /**
   * Check if migration from version A to B is needed
   * @private
   * @param {string} current - Current version
   * @param {string} target - Target version
   * @returns {boolean} Whether migration is needed
   */
  #shouldMigrate(current, target) {
    return this.#compareVersions(current, target) < 0;
  }
}

/**
 * Storage Service with integrated migration middleware
 * Handles serialization, deserialization, and migration
 */
export class StorageService {
  constructor(adapter = new LocalStorageAdapter(), migrator = null) {
    this.adapter = adapter;
    this.migrator = migrator || new MigrationService();
  }

  /**
   * Load and migrate chat data
   * @returns {Promise<Object|null>} Migrated chat state or null
   */
  async load() {
    try {
      const rawData = await this.adapter.read();

      if (!rawData) return null;

      const parsed = JSON.parse(rawData);

      // Check if migration is needed
      if (this.migrator.needsMigration(parsed)) {
        const migratedData = this.migrator.migrate(parsed);
        await this.save(migratedData);
        return migratedData;
      }

      // Return clean data (remove version metadata)
      return parsed.data || parsed;
    } catch (error) {
      console.error("StorageService load error:", error);
      return null;
    }
  }

  /**
   * Save chat state with version metadata
   * @param {Object} state - Chat state to persist
   * @returns {Promise<void>}
   */
  async save(state) {
    try {
      // Add version metadata
      const dataWithVersion = {
        version: this.migrator.currentVersion,
        data: state,
        savedAt: new Date().toISOString(),
      };

      const serialized = JSON.stringify(dataWithVersion);
      await this.adapter.write(this.adapter.storageKey, serialized);
    } catch (error) {
      console.error("StorageService save error:", error);
      throw new Error("Failed to persist chat data");
    }
  }
}
