/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['images.unsplash.com', 'm.media-amazon.com', 'rukminim1.flixcart.com'],
    unoptimized: true,
  },
}

export default nextConfig
