/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: false,
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
