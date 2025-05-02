/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // API configuration should be under the 'serverRuntimeConfig' in Next.js 14
  serverRuntimeConfig: {
    // Will only be available on the server side
    bodyParserSizeLimit: '1mb',
  },
  publicRuntimeConfig: {
    // Will be available on both server and client
    staticFolder: '/static',
  },
}

module.exports = nextConfig
