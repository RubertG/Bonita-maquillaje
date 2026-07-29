/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['192.168.101.13'],
  images: {
    unoptimized: true,
    remotePatterns: [{
      protocol: 'https',
      hostname: 'firebasestorage.googleapis.com',
      port: '',
      pathname: '/**'
    }]
  }
}

export default nextConfig
