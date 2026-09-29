/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Forces Next.js to generate a standalone "out" folder
  images: {
    unoptimized: true, // Required for static exporting
  },
};

export default nextConfig;