/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/intro',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=3600, max-age=3600, stale-while-revalidate=30',
          },
        ],
      },
    ]
  }
};

export default nextConfig;
