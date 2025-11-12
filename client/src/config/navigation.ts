// Marketing navigation - for public pages
export const MARKETING_NAV_ITEMS = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Pricing', to: '/pricing' },
  { label: 'FAQ', to: '/faq' },
  { label: 'Contact', to: '/app/support' },
] as const;

// App navigation - for authenticated pages
export const APP_NAV_ITEMS = [
  { label: 'Dashboard', to: '/app' },
  { label: 'Account Settings', to: '/app/account' },
  { label: 'Service Docs', to: '/app/api-docs' },
  { label: 'Support', to: '/app/support' },
  { label: 'PDF Test', to: '/test.html' },
] as const;

// Admin navigation items for the admin panel
export const ADMIN_ACCESS_ITEM = { label: 'Admin Panel', to: '/admin' } as const;

// Footer navigation items
export const FOOTER_NAV_ITEMS = {
  services: [
    { label: 'Vehicle Lookup', to: '/' },
    { label: 'Credit Packages', to: '/pricing' },
    { label: 'Dashboard', to: '/app' },
  ],
  company: [
    { label: 'About Us', to: '/about' },
    { label: 'FAQ', to: '/faq' },
    { label: 'Support', to: '/app/support' },
    { label: 'Privacy Policy', to: '/privacy' },
    { label: 'Terms of Service', to: '/terms' },
    { label: 'Accessibility', to: '/accessibility' },
  ],
} as const;