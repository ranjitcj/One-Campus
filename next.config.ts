/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove experimental section entirely
  images: {
    domains: ['res.cloudinary.com'],
  },
  webpack: (config) => {
    config.resolve.fallback = { 
      fs: false, 
      net: false, 
      tls: false 
    };
    return config;
  },
}

module.exports = nextConfig