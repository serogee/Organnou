import { getLocalIP } from '@/lib/getLocalIP';
import type { NextConfig } from 'next';

const ip = getLocalIP();
console.log('Detected IP:', ip);

const nextConfig: NextConfig = {
    /* config options here */
    allowedDevOrigins: [`${ip}`, `http://${ip}:3000`, 'http://localhost:3000'],
};

export default nextConfig;
