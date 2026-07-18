/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{
      protocol: 'https',
      hostname: 'firebasestorage.googleapis.com',
      port: '',
      pathname: '/**'
    }]
  },
  eslint: {
    ignoreDuringBuilds: true
  }
}

export default nextConfig
