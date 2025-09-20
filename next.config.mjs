/**
 * Next.js configuration with basic security headers applied to all routes.
 * Adjust CSP separately after auditing external resources to avoid breakage.
 */

const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'off' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Limit powerful APIs by default; extend per your needs
  {
    key: 'Permissions-Policy',
    value: [
      "camera=()",
      "microphone=()",
      "geolocation=()",
      "fullscreen=(self)",
      "payment=()",
      "autoplay=(self)",
    ].join(', '),
  },
  // HSTS: only effective over HTTPS; keep includeSubDomains/preload if you own the domain
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
]

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ]
  },
}

export default nextConfig

