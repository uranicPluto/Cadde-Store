const { PrismaClient } = require("@prisma/client");
const { SignJWT } = require("jose");
const http = require("http");

const prisma = new PrismaClient();
const AUTH_SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || "cadde-store-super-secret-jwt-key-stage-08"
);
const TEST_PORT = process.env.TEST_PORT || 3099;
const BASE_URL = process.env.TEST_BASE_URL || `http://localhost:${TEST_PORT}`;

/**
 * Creates a signed JWT session token for the given payload.
 */
async function createAuthToken(payload) {
  const defaultPayload = {
    id: "admin-1",
    email: "admin@cadde-store.com",
    firstName: "Sistem",
    lastName: "Yöneticisi",
    role: "ADMIN",
    ...payload,
  };
  return await new SignJWT(defaultPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(AUTH_SECRET);
}

/**
 * Convenience helper to generate auth headers for standard test roles.
 */
async function getAuthHeaders(roleOrPayload = "ADMIN") {
  let payload;
  if (typeof roleOrPayload === "string") {
    if (roleOrPayload === "ADMIN") {
      // Find or use admin from DB
      const adminUser = await prisma.user.findFirst({ where: { role: "ADMIN" } });
      payload = {
        id: adminUser ? adminUser.id : "admin-user-id",
        email: adminUser ? adminUser.email : "admin@cadde-store.com",
        firstName: adminUser ? adminUser.firstName : "Sistem",
        lastName: adminUser ? adminUser.lastName : "Yöneticisi",
        role: "ADMIN",
      };
    } else if (roleOrPayload === "SELLER") {
      const sellerUser = await prisma.user.findFirst({
        where: { role: "SELLER" },
        include: { sellerProfile: true },
      });
      payload = {
        id: sellerUser ? sellerUser.id : "seller-user-id",
        email: sellerUser ? sellerUser.email : "seller@cadde-store.com",
        firstName: sellerUser ? sellerUser.firstName : "Trendy",
        lastName: sellerUser ? sellerUser.lastName : "Fashion",
        role: "SELLER",
        sellerSlug: sellerUser?.sellerProfile?.slug || "trend-fashion-magazasi",
      };
    } else if (roleOrPayload === "CUSTOMER") {
      const custUser = await prisma.user.findFirst({ where: { role: "CUSTOMER" } });
      payload = {
        id: custUser ? custUser.id : "customer-user-id",
        email: custUser ? custUser.email : "customer@cadde-store.com",
        firstName: custUser ? custUser.firstName : "Ahmet",
        lastName: custUser ? custUser.lastName : "Yılmaz",
        role: "CUSTOMER",
      };
    } else {
      payload = {
        id: `user-${Date.now()}`,
        email: `user-${Date.now()}@cadde.store`,
        firstName: "Test",
        lastName: "User",
        role: "CUSTOMER",
      };
    }
  } else {
    payload = roleOrPayload;
  }

  const token = await createAuthToken(payload);
  return {
    "Content-Type": "application/json",
    Cookie: `cadde_store_session=${token}`,
  };
}

/**
 * Universal HTTP request wrapper against the running application server.
 */
async function request(endpoint, options = {}, retryCount = 0) {
  const url = endpoint.startsWith("http") ? endpoint : `${BASE_URL}${endpoint}`;
  const method = options.method || "GET";
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  const fetchOptions = {
    method,
    headers,
  };

  if (options.body && method !== "GET" && method !== "HEAD") {
    fetchOptions.body =
      typeof options.body === "string" ? options.body : JSON.stringify(options.body);
  }

  // Small delay to allow Next.js dev server compiler to settle
  await new Promise((r) => setTimeout(r, 25));

  const startTime = Date.now();
  try {
    const response = await fetch(url, fetchOptions);
    const duration = Date.now() - startTime;

    let data;
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    // Retry if Next.js internal dev server webpack compilation race occurred (HTML 500 response)
    if (response.status === 500 && typeof data === "string" && data.includes("<!DOCTYPE html>") && retryCount < 3) {
      await new Promise((r) => setTimeout(r, 250));
      return await request(endpoint, options, retryCount + 1);
    }

    return {
      status: response.status,
      ok: response.ok,
      headers: response.headers,
      data,
      duration,
    };
  } catch (error) {
    if (retryCount < 3) {
      await new Promise((r) => setTimeout(r, 250));
      return await request(endpoint, options, retryCount + 1);
    }
    throw new Error(`Request failed to ${url} (${method}): ${error.message}`);
  }
}

/**
 * Assertion helpers
 */
function assert(condition, message) {
  if (!condition) {
    throw new Error(`Assertion Failed: ${message || "Expected condition to be truthy"}`);
  }
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(
      `Assertion Failed: ${message || "Values do not match"}\n  Expected: ${JSON.stringify(
        expected
      )}\n  Actual:   ${JSON.stringify(actual)}`
    );
  }
}

function assertDeepEqual(actual, expected, message) {
  const actStr = JSON.stringify(actual);
  const expStr = JSON.stringify(expected);
  if (actStr !== expStr) {
    throw new Error(
      `Assertion Failed: ${message || "Objects do not match"}\n  Expected: ${expStr}\n  Actual:   ${actStr}`
    );
  }
}

function assertContains(haystack, needle, message) {
  const contains =
    typeof haystack === "string"
      ? haystack.includes(needle)
      : Array.isArray(haystack)
      ? haystack.includes(needle)
      : haystack && typeof haystack === "object"
      ? needle in haystack
      : false;

  if (!contains) {
    throw new Error(
      `Assertion Failed: ${message || "Substring or element not found"}\n  Needle:   ${JSON.stringify(
        needle
      )}\n  Haystack: ${typeof haystack === "string" ? haystack.slice(0, 200) : JSON.stringify(haystack).slice(0, 200)}`
    );
  }
}

function assertMatches(str, regex, message) {
  if (!regex.test(str)) {
    throw new Error(
      `Assertion Failed: ${message || "String does not match pattern"}\n  Pattern: ${regex}\n  String:  ${str}`
    );
  }
}

/**
 * Health check helper to ensure the test server is responding.
 */
async function ensureServerReady(timeoutMs = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(`${BASE_URL}/api/products`);
      if (res.status === 200) {
        return true;
      }
    } catch (e) {
      // Wait a bit before retrying
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`Server at ${BASE_URL} failed to respond within ${timeoutMs}ms.`);
}

module.exports = {
  prisma,
  BASE_URL,
  TEST_PORT,
  createAuthToken,
  getAuthHeaders,
  request,
  assert,
  assertEqual,
  assertDeepEqual,
  assertContains,
  assertMatches,
  ensureServerReady,
};
