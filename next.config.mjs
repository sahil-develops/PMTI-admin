/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        // This helps with EAGAIN errors on resource-constrained servers
        workerThreads: false,
        cpus: 1
    }
};

export default nextConfig;
