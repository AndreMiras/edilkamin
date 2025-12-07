import "@testing-library/jest-dom";

import { vi } from "vitest";

// Setup FontAwesome icons for tests (same as _app.tsx)

const { library } = require("@fortawesome/fontawesome-svg-core");

const { fab } = require("@fortawesome/free-brands-svg-icons");

const { far } = require("@fortawesome/free-regular-svg-icons");

const { fas } = require("@fortawesome/free-solid-svg-icons");

library.add(fab, far, fas);

// Mock Next.js router globally
vi.mock("next/router", () => ({
  useRouter: () => ({
    push: vi.fn(),
    pathname: "/",
    query: {},
    asPath: "/",
    route: "/",
  }),
}));
