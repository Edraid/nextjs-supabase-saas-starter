import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    // Required for React Email in App Router
    serverComponentsExternalPackages: ['@react-email/components', 'react-email'],
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'eu.ui-avatars.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' }, // Google OAuth avatars
    ],
  },
}

export default nextConfig
