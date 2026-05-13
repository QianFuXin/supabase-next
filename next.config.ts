import type { NextConfig } from 'next'

const nextConfig: NextConfig = { cacheComponents: true }
module.exports = {
  allowedDevOrigins: ['127.0.0.1'],
}
export default nextConfig
