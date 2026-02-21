/** @type {import('next').NextConfig} */
const nextConfig = {
    // Allow server-side fetch to Jina Reader and Gemini
    experimental: {
        serverComponentsExternalPackages: [],
    },
    images: {
        remotePatterns: [
            { protocol: 'https', hostname: '**' },
        ],
    },
    // Required for API route fetch timeouts
    serverRuntimeConfig: {
        apiTimeout: 30000,
    },
};

export default nextConfig;
