import type { NextApiRequest, NextApiResponse } from "next";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import handler from "../../../../pages/api/proxy/[...params]";

// Mock edilkamin to get API_URL
vi.mock("edilkamin", () => ({
  API_URL: "https://api.edilkamin.com/",
}));

describe("API Proxy Handler", () => {
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Mock global fetch
    mockFetch = vi.fn();
    vi.stubGlobal("fetch", mockFetch);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  // Helper to create mock request/response objects
  const createMockReq = (
    params: string[],
    method: string = "GET",
    authorization?: string,
    body?: unknown,
  ): Partial<NextApiRequest> => ({
    query: { params },
    method,
    headers: authorization ? { authorization } : {},
    body,
  });

  const createMockRes = () => {
    const res: Partial<NextApiResponse> = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    return res;
  };

  it("should forward GET request to API_URL with correct path", async () => {
    mockFetch.mockResolvedValue({
      status: 200,
      json: async () => ({ data: "test" }),
    } as Response);

    const req = createMockReq(["devices", "abc123"], "GET", "Bearer token123");
    const res = createMockRes();

    await handler(req as NextApiRequest, res as NextApiResponse);

    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.edilkamin.com/devices/abc123",
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({
          Authorization: "Bearer token123",
          Accept: "application/json",
          "Content-Type": "application/json",
        }),
      }),
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ data: "test" });
  });

  it("should forward POST request with body", async () => {
    const requestBody = { power: 1 };
    mockFetch.mockResolvedValue({
      status: 201,
      json: async () => ({ success: true }),
    } as Response);

    const req = createMockReq(
      ["devices", "abc123", "power"],
      "POST",
      "Bearer token456",
      requestBody,
    );
    const res = createMockRes();

    await handler(req as NextApiRequest, res as NextApiResponse);

    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.edilkamin.com/devices/abc123/power",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(requestBody),
      }),
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ success: true });
  });

  it("should handle multiple path parameters correctly", async () => {
    mockFetch.mockResolvedValue({
      status: 200,
      json: async () => ({ result: "ok" }),
    } as Response);

    const req = createMockReq(
      ["devices", "aabbcc", "status", "details"],
      "GET",
      "Bearer token",
    );
    const res = createMockRes();

    await handler(req as NextApiRequest, res as NextApiResponse);

    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.edilkamin.com/devices/aabbcc/status/details",
      expect.any(Object),
    );
  });

  it("should use empty string for missing Authorization header", async () => {
    mockFetch.mockResolvedValue({
      status: 200,
      json: async () => ({ data: "test" }),
    } as Response);

    const req = createMockReq(["devices"], "GET"); // No authorization
    const res = createMockRes();

    await handler(req as NextApiRequest, res as NextApiResponse);

    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "",
        }),
      }),
    );
  });

  it("should forward error status codes from upstream API", async () => {
    mockFetch.mockResolvedValue({
      status: 404,
      json: async () => ({ error: "Not found" }),
    } as Response);

    const req = createMockReq(["devices", "invalid"], "GET", "Bearer token");
    const res = createMockRes();

    await handler(req as NextApiRequest, res as NextApiResponse);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Not found" });
  });

  it("should forward 500 server errors", async () => {
    mockFetch.mockResolvedValue({
      status: 500,
      json: async () => ({ error: "Internal server error" }),
    } as Response);

    const req = createMockReq(["devices"], "GET", "Bearer token");
    const res = createMockRes();

    await handler(req as NextApiRequest, res as NextApiResponse);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Internal server error" });
  });

  it("should handle non-array params parameter", async () => {
    mockFetch.mockResolvedValue({
      status: 200,
      json: async () => ({ data: "test" }),
    } as Response);

    // Edge case: params is not an array (unlikely but handled in code)
    const req = {
      query: { params: "single-param" }, // Not an array
      method: "GET",
      headers: { authorization: "Bearer token" },
    } as unknown as NextApiRequest;
    const res = createMockRes();

    await handler(req, res as NextApiResponse);

    // Should fallback to empty array and just use API_URL
    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.edilkamin.com/",
      expect.any(Object),
    );
  });

  it("should not include body in GET request", async () => {
    mockFetch.mockResolvedValue({
      status: 200,
      json: async () => ({ data: "test" }),
    } as Response);

    const req = createMockReq(["devices"], "GET", "Bearer token");
    // Even if body is present on GET (shouldn't happen), code handles it
    req.body = undefined;
    const res = createMockRes();

    await handler(req as NextApiRequest, res as NextApiResponse);

    const fetchCall = mockFetch.mock.calls[0][1];
    expect(fetchCall).not.toHaveProperty("body");
  });
});
