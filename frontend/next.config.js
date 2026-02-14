/** @type {import('next').NextConfig} */
const createNextIntlPlugin = require('next-intl/plugin');
require('dotenv').config({ path: './.env.local' });

const withNextIntl = createNextIntlPlugin();

const nextConfig = {
    reactStrictMode: true,
    images: {
        domains: ['res.cloudinary.com', 'lh3.googleusercontent.com'],
    },
    env: {
        NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    },
};

module.exports = withNextIntl(nextConfig);
