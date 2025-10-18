import "@testing-library/jest-dom";

import { vi } from "vitest";

// Setup FontAwesome icons for tests (same as _app.tsx)
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { library } = require("@fortawesome/fontawesome-svg-core");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { fab } = require("@fortawesome/free-brands-svg-icons");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { far } = require("@fortawesome/free-regular-svg-icons");
// eslint-disable-next-line @typescript-eslint/no-require-imports
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
