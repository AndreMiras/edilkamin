import { beforeEach, describe, expect, it } from "vitest";

import {
  getTokenLocalStorage,
  isValidFireplace,
  normalizeFireplace,
  removeTokenLocalStorage,
  setTokenLocalStorage,
} from "./helpers";

describe("isValidFireplace", () => {
  describe("12-character hex format", () => {
    it("should accept valid lowercase MAC address", () => {
      expect(isValidFireplace("aabbccddeeff")).toBe(true);
    });

    it("should accept valid uppercase MAC address", () => {
      expect(isValidFireplace("AABBCCDDEEFF")).toBe(true);
    });

    it("should accept valid mixed-case MAC address", () => {
      expect(isValidFireplace("AaBbCcDdEeFf")).toBe(true);
    });

    it("should accept valid MAC with numeric values", () => {
      expect(isValidFireplace("a8032afed508")).toBe(true);
    });

    it("should reject MAC with only 11 characters", () => {
      expect(isValidFireplace("aabbccddeef")).toBe(false);
    });

    it("should reject MAC with 13 characters", () => {
      expect(isValidFireplace("aabbccddeeffe")).toBe(false);
    });

    it("should reject MAC with invalid characters", () => {
      expect(isValidFireplace("gghhiijjkkll")).toBe(false);
    });

    it("should reject MAC with special characters", () => {
      expect(isValidFireplace("aa-bb-cc-dd-ee-ff")).toBe(false);
    });

    it("should reject MAC with spaces", () => {
      expect(isValidFireplace("aa bb cc dd ee ff")).toBe(false);
    });
  });

  describe("colon-separated format", () => {
    it("should accept valid lowercase colon-separated MAC", () => {
      expect(isValidFireplace("aa:bb:cc:dd:ee:ff")).toBe(true);
    });

    it("should accept valid uppercase colon-separated MAC", () => {
      expect(isValidFireplace("AA:BB:CC:DD:EE:FF")).toBe(true);
    });

    it("should accept valid mixed-case colon-separated MAC", () => {
      expect(isValidFireplace("Aa:Bb:Cc:Dd:Ee:Ff")).toBe(true);
    });

    it("should accept colon-separated MAC with numeric values", () => {
      expect(isValidFireplace("a8:03:2a:fe:d5:08")).toBe(true);
    });

    it("should reject colon-separated MAC with only 5 segments", () => {
      expect(isValidFireplace("aa:bb:cc:dd:ee")).toBe(false);
    });

    it("should reject colon-separated MAC with 7 segments", () => {
      expect(isValidFireplace("aa:bb:cc:dd:ee:ff:00")).toBe(false);
    });

    it("should reject colon-separated MAC with 3-char segments", () => {
      expect(isValidFireplace("aaa:bbb:ccc:ddd:eee:fff")).toBe(false);
    });

    it("should reject colon-separated MAC with 1-char segments", () => {
      expect(isValidFireplace("a:b:c:d:e:f")).toBe(false);
    });

    it("should reject colon-separated MAC with invalid characters", () => {
      expect(isValidFireplace("gg:hh:ii:jj:kk:ll")).toBe(false);
    });
  });

  describe("edge cases", () => {
    it("should reject empty string", () => {
      expect(isValidFireplace("")).toBe(false);
    });

    it("should reject random text", () => {
      expect(isValidFireplace("invalid")).toBe(false);
    });

    it("should reject undefined input", () => {
      expect(isValidFireplace(undefined as any)).toBe(false);
    });

    it("should reject null input", () => {
      expect(isValidFireplace(null as any)).toBe(false);
    });

    it("should accept numeric input that stringifies to valid hex", () => {
      // Note: Numbers are coerced to strings by regex.test()
      // 123456789012 becomes "123456789012" which is 12 hex chars

      expect(isValidFireplace(123456789012 as any)).toBe(true);
    });
  });
});

describe("normalizeFireplace", () => {
  it("should remove colons from colon-separated MAC", () => {
    expect(normalizeFireplace("aa:bb:cc:dd:ee:ff")).toBe("aabbccddeeff");
  });

  it("should convert uppercase to lowercase", () => {
    expect(normalizeFireplace("AABBCCDDEEFF")).toBe("aabbccddeeff");
  });

  it("should handle mixed-case colon-separated MAC", () => {
    expect(normalizeFireplace("Aa:Bb:Cc:Dd:Ee:Ff")).toBe("aabbccddeeff");
  });

  it("should handle already normalized MAC (no-op)", () => {
    expect(normalizeFireplace("aabbccddeeff")).toBe("aabbccddeeff");
  });

  it("should handle uppercase MAC without colons", () => {
    expect(normalizeFireplace("AABBCCDDEEFF")).toBe("aabbccddeeff");
  });

  it("should handle MAC with numeric values", () => {
    expect(normalizeFireplace("A8:03:2A:FE:D5:08")).toBe("a8032afed508");
  });
});

describe("localStorage helpers", () => {
  const TEST_TOKEN = "test-auth-token-12345";
  const TOKEN_KEY = "edilkamin-token";

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  describe("getTokenLocalStorage", () => {
    it("should return token when it exists", () => {
      localStorage.setItem(TOKEN_KEY, TEST_TOKEN);
      expect(getTokenLocalStorage()).toBe(TEST_TOKEN);
    });

    it("should return null when token does not exist", () => {
      expect(getTokenLocalStorage()).toBeNull();
    });

    it("should return correct token after multiple sets", () => {
      localStorage.setItem(TOKEN_KEY, "first-token");
      localStorage.setItem(TOKEN_KEY, TEST_TOKEN);
      expect(getTokenLocalStorage()).toBe(TEST_TOKEN);
    });
  });

  describe("setTokenLocalStorage", () => {
    it("should store token in localStorage", () => {
      setTokenLocalStorage(TEST_TOKEN);
      expect(localStorage.getItem(TOKEN_KEY)).toBe(TEST_TOKEN);
    });

    it("should overwrite existing token", () => {
      localStorage.setItem(TOKEN_KEY, "old-token");
      setTokenLocalStorage(TEST_TOKEN);
      expect(localStorage.getItem(TOKEN_KEY)).toBe(TEST_TOKEN);
    });

    it("should store empty string token", () => {
      setTokenLocalStorage("");
      expect(localStorage.getItem(TOKEN_KEY)).toBe("");
    });
  });

  describe("removeTokenLocalStorage", () => {
    it("should remove token from localStorage", () => {
      localStorage.setItem(TOKEN_KEY, TEST_TOKEN);
      removeTokenLocalStorage();
      expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
    });

    it("should not throw when token does not exist", () => {
      expect(() => removeTokenLocalStorage()).not.toThrow();
    });

    it("should only remove the specific token key", () => {
      localStorage.setItem(TOKEN_KEY, TEST_TOKEN);
      localStorage.setItem("other-key", "other-value");
      removeTokenLocalStorage();
      expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
      expect(localStorage.getItem("other-key")).toBe("other-value");
    });
  });

  describe("integration scenarios", () => {
    it("should handle full auth lifecycle", () => {
      // Initially no token
      expect(getTokenLocalStorage()).toBeNull();

      // Set token
      setTokenLocalStorage(TEST_TOKEN);
      expect(getTokenLocalStorage()).toBe(TEST_TOKEN);

      // Remove token
      removeTokenLocalStorage();
      expect(getTokenLocalStorage()).toBeNull();
    });

    it("should handle token updates", () => {
      setTokenLocalStorage("token-v1");
      expect(getTokenLocalStorage()).toBe("token-v1");

      setTokenLocalStorage("token-v2");
      expect(getTokenLocalStorage()).toBe("token-v2");
    });
  });
});
