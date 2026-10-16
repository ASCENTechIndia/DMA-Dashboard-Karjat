// src/utils/auth.js

export const TARGET_ACCESS_CODE = "QGthcmphdA==";
export const AUTH_STORAGE_KEY = "karjat_dashboard_auth_token";
export const ACTIVE_CODE_STORAGE_KEY = "karjat_dashboard_active_code";

/**
 * Normalizes input string (decodes URI component, trims, removes wrapping quotes/slashes)
 */
function cleanString(str) {
  if (!str || typeof str !== "string") return "";
  try {
    return decodeURIComponent(str).trim();
  } catch {
    return str.trim();
  }
}

/**
 * Checks if a string or URL contains the target access code.
 * Handles:
 * - Direct code: "QGthcmphdA=="
 * - URL encoded code: "QGthcmphdA%3D%3D"
 * - Full URLs: "https://karjatdashbaord.nagarkaryavalinew.com/QGthcmphdA=="
 * - Query strings: "?code=QGthcmphdA=="
 * - Paths: "/QGthcmphdA=="
 */
export function containsAccessCode(input) {
  if (!input) return false;
  const raw = String(input);
  const cleaned = cleanString(raw);

  // Exact match
  if (raw === TARGET_ACCESS_CODE || cleaned === TARGET_ACCESS_CODE) return true;

  // Contains exact code
  if (raw.includes(TARGET_ACCESS_CODE) || cleaned.includes(TARGET_ACCESS_CODE)) return true;

  // Encoded match (%3D%3D for ==)
  if (raw.includes("QGthcmphdA%3D%3D") || raw.includes("QGthcmphdA%3d%3d")) return true;

  // Path with leading/trailing slash check
  const pathPart = cleaned.replace(/^\/+|\/+$/g, "");
  if (pathPart === TARGET_ACCESS_CODE) return true;

  return false;
}

/**
 * Returns the currently active access code for dynamic navigation
 */
export function getAuthorizedCode() {
  try {
    if (typeof window !== "undefined" && window.sessionStorage) {
      return window.sessionStorage.getItem(ACTIVE_CODE_STORAGE_KEY) || TARGET_ACCESS_CODE;
    }
  } catch {
    // ignore
  }
  return TARGET_ACCESS_CODE;
}

/**
 * Returns dynamic home route path (e.g. "/QGthcmphdA==")
 */
export function getHomePath() {
  const code = getAuthorizedCode();
  return code ? `/${code}` : `/${TARGET_ACCESS_CODE}`;
}

/**
 * Validates whether the user is authorized.
 * Checks:
 * 1. Active session in sessionStorage
 * 2. Route param (e.g. from react-router useParams)
 * 3. window.location (pathname, search, hash, href)
 */
export function isAuthorized(routeParamCode = "") {
  try {
    // 1. Check existing session authorization
    if (typeof window !== "undefined" && window.sessionStorage) {
      const stored = window.sessionStorage.getItem(AUTH_STORAGE_KEY);
      if (stored === TARGET_ACCESS_CODE) {
        return true;
      }
    }

    // 2. Check route parameter (from URL path)
    if (routeParamCode && containsAccessCode(routeParamCode)) {
      grantSessionAuth(routeParamCode);
      return true;
    }

    // 3. Check browser window location
    if (typeof window !== "undefined" && window.location) {
      const { href, pathname, search, hash } = window.location;

      if (
        containsAccessCode(href) ||
        containsAccessCode(pathname) ||
        containsAccessCode(search) ||
        containsAccessCode(hash)
      ) {
        grantSessionAuth(pathname.replace(/^\/+|\/+$/g, "") || TARGET_ACCESS_CODE);
        return true;
      }

      // Check URL query parameters (e.g. ?code=..., ?auth=..., ?token=...)
      if (search) {
        const params = new URLSearchParams(search);
        for (const [, val] of params.entries()) {
          if (containsAccessCode(val)) {
            grantSessionAuth(val || TARGET_ACCESS_CODE);
            return true;
          }
        }
      }
    }
  } catch (err) {
    console.error("Authorization check error:", err);
  }

  return false;
}

/**
 * Grants session authorization and persists active code
 */
export function grantSessionAuth(code = TARGET_ACCESS_CODE) {
  try {
    if (typeof window !== "undefined" && window.sessionStorage) {
      window.sessionStorage.setItem(AUTH_STORAGE_KEY, TARGET_ACCESS_CODE);
      const cleanCode = cleanString(code) || TARGET_ACCESS_CODE;
      window.sessionStorage.setItem(ACTIVE_CODE_STORAGE_KEY, cleanCode);
    }
  } catch (err) {
    console.error("Error setting session auth:", err);
  }
}

/**
 * Clears session authorization
 */
export function revokeSessionAuth() {
  try {
    if (typeof window !== "undefined" && window.sessionStorage) {
      window.sessionStorage.removeItem(AUTH_STORAGE_KEY);
      window.sessionStorage.removeItem(ACTIVE_CODE_STORAGE_KEY);
    }
  } catch (err) {
    console.error("Error revoking session auth:", err);
  }
}
