import "@testing-library/jest-dom";

// Mock IndexedDB / structuredClone if needed in jsdom
if (typeof globalThis.structuredClone !== "function") {
  globalThis.structuredClone = <T>(obj: T): T => JSON.parse(JSON.stringify(obj));
}
