/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
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
