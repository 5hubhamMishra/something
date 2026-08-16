import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // react-three-fiber and drei create imperative, non-idempotent resources
  // (GL contexts, DOM roots) during render/memo — Strict Mode's deliberate
  // double-invoke in dev breaks these (e.g. drei's ScrollControls Scroll
  // "html" mode calling ReactDOM.createRoot() twice on the same container).
  // Doesn't affect production, where Strict Mode's double-invoke never runs.
  reactStrictMode: false,
  images: {
    // ChapterFamilyTree's <Image quality={90}> needs 90 explicitly allowed —
    // Next 16 rejects any quality value not in this list.
    qualities: [75, 90],
  },
};

export default nextConfig;
