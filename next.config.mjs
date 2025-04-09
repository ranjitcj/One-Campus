/** @type {import('next').NextConfig} */
import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = process.env.ANALYZE === 'true'
  ? bundleAnalyzer({ enabled: true })
  : (config) => config;

const nextConfig = {
  images: {
    domains: ['res.cloudinary.com'],
    formats: ['image/avif', 'image/webp'],
  },
  webpack: (config) => {
    config.resolve.fallback = { 
      fs: false, 
      net: false, 
      tls: false 
    };
    return config;
  },
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true
}

export default withBundleAnalyzer(nextConfig); 