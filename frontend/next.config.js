/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  },
  // Transpile backend code for API routes
  transpilePackages: [],
  experimental: {
    externalDir: true,
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Permitir importación de archivos TypeScript desde backend
      config.module.rules.push({
        test: /\.ts$/,
        include: /backend\/src/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
            },
          },
        ],
      });
    }
    return config;
  },
}

module.exports = nextConfig
