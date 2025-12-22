/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: false, // 开启 ESLint 检查
  },
  typescript: {
    ignoreBuildErrors: false, // 开启 TS 类型检查
  },
};

export default nextConfig;
