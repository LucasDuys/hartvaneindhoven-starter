/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      // Redirect old locale-prefixed paths to non-prefixed equivalents
      { source: '/nl/:path*', destination: '/:path*', permanent: true },
      { source: '/en/:path*', destination: '/:path*', permanent: true }
    ];
  }
};

export default nextConfig;
