import type { NextConfig } from "next";
import path from "path";

const isGitHubPages = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },
  ...(isGitHubPages
    ? {
        output: "export" as const,
        basePath: "/ai-psychologist",
        assetPrefix: "/ai-psychologist/",
        images: {
          unoptimized: true,
        },
        trailingSlash: true,
      }
    : {}),
};

export default nextConfig;
