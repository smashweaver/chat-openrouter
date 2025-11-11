import { LocalStorageAdapter, StorageService } from "../utils/storage-adapter";

// Mock localStorage for testing
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

describe("LocalStorageAdapter", () => {
  let adapter;

  beforeEach(() => {
    localStorageMock.clear();
    adapter = new LocalStorageAdapter("test-key");
  });

  test("should read and write data", async () => {
    const testData = "hello world";
    await adapter.write("test-key", testData);
    const result = await adapter.read("test-key");
    expect(result).toBe(testData);
  });

  test("should handle read errors gracefully", async () => {
    // Mock localStorage to throw
    const originalGetItem = localStorageMock.getItem;
    localStorageMock.getItem = () => {
      throw new Error("Storage unavailable");
    };

    const result = await adapter.read();
    expect(result).toBeNull();

    // Restore
    localStorageMock.getItem = originalGetItem;
  });

  test("should check key existence", async () => {
    expect(await adapter.exists("non-existent")).toBe(false);
    await adapter.write("test", "data");
    expect(await adapter.exists("test")).toBe(true);
  });

  test("should delete keys", async () => {
    await adapter.write("test", "data");
    expect(await adapter.exists("test")).toBe(true);

    await adapter.delete("test");
    expect(await adapter.exists("test")).toBe(false);
  });

  test("should handle storage quota errors", async () => {
    const largeData = "x".repeat(10 * 1024 * 1024); // 10MB

    // Track if error handler was called
    let errorCalled = false;
    adapter.onError(() => {
      errorCalled = true;
    });

    try {
      await adapter.write("large", largeData);
    } catch {
      expect(errorCalled).toBe(true);
    }
  });
});

describe("StorageService", () => {
  let service;

  beforeEach(() => {
    // Clear localStorage before each test
    localStorageMock.clear();
    service = new StorageService();
  });

  test("should save and load chat state with version metadata", async () => {
    const testState = {
      active: "chat-1",
      chats: [{ id: "chat-1", messages: [{ type: "prompt", text: "Hello" }] }],
    };

    await service.save(testState);
    const loaded = await service.load();

    expect(loaded).toEqual(testState);
  });

  test("should load null for empty storage", async () => {
    const result = await service.load();
    expect(result).toBeNull();
  });

  test("should handle version migration", async () => {
    // Simulate old version data (v1.0.0)
    const oldData = {
      version: "1.0.0",
      data: {
        chats: [
          {
            id: "chat-1",
            messages: [{ type: "prompt", text: "test" }],
          },
        ],
      },
    };

    localStorageMock.setItem("ai-chat-bot", JSON.stringify(oldData));

    const loaded = await service.load();

    // Should have been migrated to v2.0.0
    expect(loaded).toBeDefined();
    expect(loaded).toHaveProperty("version", "2.0.0");
    expect(loaded).toHaveProperty("data");
    expect(loaded).toHaveProperty("migratedAt");
  });

  test("should handle corrupted data gracefully", async () => {
    localStorageMock.setItem("ai-chat-bot", "invalid json");
    const loaded = await service.load();
    expect(loaded).toBeNull();
  });

  test("should add version metadata to saved data", async () => {
    const testState = { active: null, chats: [] };
    await service.save(testState);

    const raw = localStorageMock.getItem("ai-chat-bot");
    const parsed = JSON.parse(raw);

    expect(parsed).toHaveProperty("version");
    expect(parsed).toHaveProperty("data");
    expect(parsed).toHaveProperty("savedAt");
    expect(parsed.version).toBe("2.0.0");
  });

  test("should not migrate current version data", async () => {
    // Set up current version data
    const currentData = {
      version: "2.0.0",
      data: { active: "chat-1", chats: [] },
      savedAt: new Date().toISOString(),
    };

    localStorageMock.setItem("ai-chat-bot", JSON.stringify(currentData));
    const loaded = await service.load();

    // Should return clean data without version metadata
    expect(loaded).toEqual(currentData.data);
    expect(loaded).not.toHaveProperty("version");
  });
});
