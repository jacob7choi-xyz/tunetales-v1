import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// Unmount everything after every test. Without this, React work scheduled
// by still-mounted components can fire after the jsdom environment is torn
// down between test files, crashing CI with "window is not defined" on
// slower machines even though every assertion passed.
afterEach(() => {
  cleanup();
});
