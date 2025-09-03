import path from "path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // For Static Export
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  sassOptions: {
    includePaths: [path.join(process.cwd(), "styles")],
    // Additional Sass options can go here
  },
};

export default nextConfig;
