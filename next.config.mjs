/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "mzisaubxyuavofqjfk.supabase.co",
      },
    ],
  },
};

export default nextConfig;
