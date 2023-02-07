const {i18n} = require('./next-i18next.config')

const tsconfigPath = process.env.NEXTJS_TSCONFIG_PATH
    ? process.env.NEXTJS_TSCONFIG_PATH
    : './tsconfig.json'

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    i18n,
    // basePath: '/local-path',
    typescript: {
        tsconfigPath,
    },
};

module.exports = nextConfig;
