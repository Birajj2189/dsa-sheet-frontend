/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    // Determine the backend API URL. We expect NEXT_PUBLIC_API_URL to point to the backend's /api
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'
    
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/:path*`, // Proxy to Backend
      },
    ]
  },
}

export default nextConfig
