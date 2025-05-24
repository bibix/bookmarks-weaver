import type { NextConfig } from "next";

const commitHash = require('child_process')
  .execSync('git rev-parse --short HEAD')
  .toString()
  .trim();

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  basePath: process.env.NODE_ENV === 'production' ? '' : '',
  compress: process.env.NODE_ENV === 'production' ? true : false,
  distDir: 'build',
  env: {
    "APP_GIT_SHA": commitHash
  },
  // build specific
  output: 'export',
  trailingSlash: true,
  skipTrailingSlashRedirect: false,
  images: { unoptimized: true }
};


export default nextConfig
