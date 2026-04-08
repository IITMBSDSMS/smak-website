/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "mzisaubxyuoavofqjfkd.supabase.co",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co", // Catch-all for any other supabase projects
      },
      {
        protocol: "https",
        hostname: "**", // Extreme fallback for random external images
      }
    ],
  },
};

export default nextConfig;
