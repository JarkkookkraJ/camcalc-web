
import { defineConfig } from "vite";

// If deploying to https://<user>.github.io/<repo>/ set base to "/<repo>/".
// For user/organization pages at root, keep base as "/".
export default defineConfig({
  base: "/camcalc-web/",
});
