/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  transpilePackages: ['@aws-amplify'],
  // Configure to allow client-side imports of AWS Amplify
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      './runtimeConfig': './runtimeConfig.browser',
    };
    return config;
  },
};

export default nextConfig;