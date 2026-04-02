/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        workerThreads: false,
        cpus: 1
    },
    webpack: (config, { dev, isServer }) => {
        // Disable cache to avoid "Unable to snapshot resolve dependencies" on the server
        if (!dev) {
            config.cache = false;
        }
        return config;
    }
};

export default nextConfig;
