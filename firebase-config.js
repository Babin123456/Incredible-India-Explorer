// firebase-config.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getAnalytics, isSupported } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js";

const defaultFirebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_PROJECT.firebasestorage.app",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};

function normalizeMeasurementId(measurementId) {
  if (!measurementId) return undefined;

  const value = String(measurementId).trim().replace(/\s+/g, "");
  if (!value || value === "YOUR_MEASUREMENT_ID") return undefined;

  return value.replace(/[Øø]/g, "0");
}

function sanitizeFirebaseConfig(config) {
  if (!config || typeof config !== "object") {
    return {};
  }

  const sanitized = { ...config };

  for (const key of Object.keys(sanitized)) {
    if (typeof sanitized[key] === "string") {
      sanitized[key] = sanitized[key].trim();
    }
  }

  if (sanitized.measurementId) {
    sanitized.measurementId = normalizeMeasurementId(sanitized.measurementId);
  }

  if (!sanitized.measurementId) {
    delete sanitized.measurementId;
  }

  return sanitized;
}

function readRuntimeFirebaseConfig() {
  const globalScope = typeof globalThis !== "undefined" ? globalThis : {};
  const runtimeConfig =
    globalScope.__FIREBASE_CONFIG__ ||
    globalScope.__ENV__?.firebase ||
    globalScope.__ENV__?.FIREBASE_CONFIG ||
    null;

  if (runtimeConfig) {
    return sanitizeFirebaseConfig(runtimeConfig);
  }

  const metaEnv = typeof import.meta !== "undefined" && import.meta.env ? import.meta.env : null;
  if (metaEnv) {
    return sanitizeFirebaseConfig({
      apiKey: metaEnv.VITE_FIREBASE_API_KEY || metaEnv.FIREBASE_API_KEY || metaEnv.NEXT_PUBLIC_FIREBASE_API_KEY || undefined,
      authDomain: metaEnv.VITE_FIREBASE_AUTH_DOMAIN || metaEnv.FIREBASE_AUTH_DOMAIN || undefined,
      projectId: metaEnv.VITE_FIREBASE_PROJECT_ID || metaEnv.FIREBASE_PROJECT_ID || undefined,
      storageBucket: metaEnv.VITE_FIREBASE_STORAGE_BUCKET || metaEnv.FIREBASE_STORAGE_BUCKET || undefined,
      messagingSenderId: metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || metaEnv.FIREBASE_MESSAGING_SENDER_ID || undefined,
      appId: metaEnv.VITE_FIREBASE_APP_ID || metaEnv.FIREBASE_APP_ID || undefined,
      measurementId: metaEnv.VITE_FIREBASE_MEASUREMENT_ID || metaEnv.FIREBASE_MEASUREMENT_ID || undefined
    });
  }

  return sanitizeFirebaseConfig(defaultFirebaseConfig);
}

async function loadFirebaseConfig() {
  const runtimeConfig = readRuntimeFirebaseConfig();
  const hasPlaceholderValues =
    !runtimeConfig?.apiKey ||
    runtimeConfig.apiKey === "YOUR_API_KEY" ||
    !runtimeConfig?.projectId ||
    runtimeConfig.projectId === "YOUR_PROJECT";

  if (!hasPlaceholderValues) {
    return runtimeConfig;
  }

  try {
    const response = await fetch("/api/firebase-config", { cache: "no-store" });
    if (response.ok) {
      const remoteConfig = await response.json();
      if (remoteConfig?.apiKey && remoteConfig.apiKey !== "YOUR_API_KEY") {
        return sanitizeFirebaseConfig(remoteConfig);
      }
    }
  } catch (error) {
    console.warn("Firebase config could not be loaded from /api/firebase-config.", error);
  }

  return runtimeConfig;
}

const firebaseConfig = await loadFirebaseConfig();

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

isSupported().then((supported) => {
  if (supported) {
    getAnalytics(app);
  }
});

export { app, auth, googleProvider };