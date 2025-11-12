import { useState, useEffect, useCallback, useRef } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X, User, Settings, CreditCard, Star, LogOut, Shield } from "lucide-react";
// import logoUrl from "@/assets/car-check-logo-new.jpg"; // Logo file not found
const logoUrl = "/favicon.ico";
import { useAuth } from "@/hooks/useAuth";
import { MARKETING_NAV_ITEMS, APP_NAV_ITEMS, ADMIN_ACCESS_ITEM } from "@/config/navigation";

// Import the navbar styles
import "@/styles/navbar.css";

import CarCheckLogo from "@assets/logo square perfect_1757451903301.png";

interface UniversalNavbarProps {
  variant?: 'marketing' | 'app' | 'admin';
}

interface NavItem {
  label: string;
  to: string;
}

export default function UniversalNavbar({ variant = 'marketing' }: UniversalNavbarProps) {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  // Close mobile menu on Escape key and handle body scroll lock
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (mobileMenuOpen && 
          menuRef.current && 
          !menuRef.current.contains(e.target as Node) &&
          toggleRef.current &&
          !toggleRef.current.contains(e.target as Node)) {
        setMobileMenuOpen(false);
      }
    };

    if (mobileMenuOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleClickOutside);
      // Add scroll lock class without position fixed
      document.documentElement.classList.add('scroll-lock');
      // Update aria-expanded
      if (toggleRef.current) {
        toggleRef.current.setAttribute('aria-expanded', 'true');
      }
    } else {
      // Remove scroll lock
      document.documentElement.classList.remove('scroll-lock');
      if (toggleRef.current) {
        toggleRef.current.setAttribute('aria-expanded', 'false');
      }
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
      // Ensure complete cleanup on unmount
      document.documentElement.classList.remove('scroll-lock');
    };
  }, [mobileMenuOpen]);

  // Clean up any duplicate navbars on mount
  useEffect(() => {
    const cleanup = () => {
      const headers = document.querySelectorAll('header[role="banner"]');
      if (headers.length > 1) {
        console.warn('[NavBar] Multiple headers detected:', headers.length);
        // Keep only the last one (most recent)
        for (let i = 0; i < headers.length - 1; i++) {
          headers[i].remove();
        }
      }
      // Ensure scroll is unlocked on mount
      document.documentElement.classList.remove('scroll-lock');
    };
    
    // Run cleanup after a short delay to ensure DOM is settled
    const timer = setTimeout(cleanup, 100);
    return () => {
      clearTimeout(timer);
      // Final cleanup on unmount
      document.documentElement.classList.remove('scroll-lock');
    };
  }, [variant]);

  const isActive = useCallback((to: string) => {
    if (to === '/' && location === '/') return true;
    if (to !== '/' && location.startsWith(to)) return true;
    return false;
  }, [location]);

  const handleMobileMenuToggle = useCallback((e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    setMobileMenuOpen(prev => !prev);
  }, []);

  const handleMobileMenuClose = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  const handleLogout = useCallback(() => {
    window.location.href = "/api/logout";
  }, []);

  // Determine navigation items based on variant and user state
  const getNavItems = (): NavItem[] => {
    if (variant === 'admin') {
      return [
        { label: 'Dashboard', to: '/admin' },
        { label: 'Users', to: '/admin/users' },
        { label: 'Transactions', to: '/admin/transactions' },
        { label: 'Lookups', to: '/admin/lookups' },
        { label: 'Analytics', to: '/admin/analytics' },
      ];
    }

    if (user) {
      const appItems: NavItem[] = APP_NAV_ITEMS.map(item => ({ label: item.label, to: item.to }));

      // Add Pricing page - CRITICAL for business revenue
      appItems.splice(1, 0, { label: 'Pricing', to: '/pricing' });

      // Add admin panel access for admin users
      if (user.role === 'admin') {
        // Add admin link before the last item (Support)
        appItems.splice(-1, 0, { label: 'Admin Panel', to: '/admin' });
      }

      return appItems;
    }

    return MARKETING_NAV_ITEMS.map(item => ({ label: item.label, to: item.to }));
  };

  const navItems = getNavItems();

  // Brand text based on variant
  const getBrandText = () => {
    if (variant === 'admin') {
      return {
        title: 'Car History Check',
        subtitle: 'Admin Panel'
      };
    }
    return {
      title: 'Car History Check',
      subtitle: 'Vehicle Intelligence'
    };
  };

  const brandText = getBrandText();

  const isHomePage = location === '/';

  return (
    <header 
      className="home-nav"
      role="banner"
      data-variant={variant}
    >
      {/* Clean navbar - no animations or effects */}
      <nav className="nav-container" role="navigation" aria-label="Main navigation">
        <div className="nav-inner">
          <div className="nav-content">
          {/* Logo and Brand */}
          <Link 
            to="/" 
            className="nav-logo-link mt-[0px] mb-[0px] pt-[11px] pb-[11px] ml-[-14px] mr-[-14px]"
            data-testid="navbar-logo"
            onClick={handleMobileMenuClose}
          >
            <div className="nav-logo-wrapper relative">
              <img 
                src={CarCheckLogo} 
                alt="CarCheck Logo" 
                className="nav-logo relative z-10"
                style={{ 
                  imageRendering: 'crisp-edges',
                  filter: 'none',
                  transform: 'translateZ(0) scale(1)',
                  WebkitTransform: 'translateZ(0) scale(1)',
                  opacity: 1,
                  mixBlendMode: 'normal',
                  borderRadius: '5px',
                  width: '70px',
                  height: '70px',
                  objectFit: 'contain'
                }}
              />
            </div>
            <div className="nav-brand-text">
              <div className="sm:hidden">
                {/* Mobile: 4 lines */}
                <div className="nav-brand-title" style={{ 
                  fontFamily: '"Montserrat", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', 
                  color: '#ffffff', 
                  fontWeight: '900', 
                  lineHeight: 1.2,
                  textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  backgroundColor: 'transparent',
                  mixBlendMode: 'normal',
                  WebkitTextStroke: '0px',
                  filter: 'none',
                  fontSize: '1.4rem'
                }}>
                  <div>Car History Check</div>
                </div>
                <div className="nav-brand-subtitle leading-tight mt-1" style={{ 
                  opacity: 1,
                  textShadow: 'none',
                  backgroundColor: 'transparent',
                  mixBlendMode: 'normal',
                  WebkitTextStroke: '0px',
                  filter: 'none'
                }}>
                  <div className="text-sm font-semibold tracking-wide uppercase" style={{ 
                    color: 'rgba(255,255,255,0.85)',
                    textShadow: 'none',
                    backgroundColor: 'transparent',
                    mixBlendMode: 'normal',
                    WebkitTextStroke: '0px',
                    filter: 'none'
                  }}>
                    <div>PROFESSIONAL VEHICLE</div>
                    <div>INTELLIGENCE</div>
                  </div>
                </div>
              </div>
              <div className="hidden sm:block">
                {/* Desktop: Original 2 lines */}
                <h1 className="nav-brand-title" style={{ 
                  fontFamily: '"Montserrat", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', 
                  color: '#ffffff', 
                  fontWeight: '900',
                  textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  backgroundColor: 'transparent',
                  mixBlendMode: 'normal',
                  WebkitTextStroke: '0px',
                  filter: 'none',
                  fontSize: '1.75rem'
                }}>
                  {brandText.title}
                </h1>
                <p className="nav-brand-subtitle" style={{ 
                  opacity: 1,
                  textShadow: 'none',
                  backgroundColor: 'transparent',
                  mixBlendMode: 'normal',
                  WebkitTextStroke: '0px',
                  filter: 'none'
                }}>
                  <span className="text-sm font-semibold tracking-wide uppercase" style={{ 
                    color: 'rgba(255,255,255,0.85)',
                    textShadow: 'none',
                    backgroundColor: 'transparent',
                    mixBlendMode: 'normal',
                    WebkitTextStroke: '0px',
                    filter: 'none'
                  }}>
                    {brandText.subtitle}
                  </span>
                </p>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="nav-desktop">
            <div className="nav-desktop-links">
              {navItems.map((item) => (
                item.to.endsWith('.html') ? (
                  <a
                    key={item.to}
                    href={item.to}
                    className="px-3 py-2 rounded-md font-bold whitespace-nowrap text-sm text-white hover:bg-white/20 hover:text-white transition-all hover:scale-105"
                    data-testid={`navbar-link-${item.label.toLowerCase().replace(' ', '-')}`}
                  >
                    {item.label}
                  </a>
                ) : (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="px-3 py-2 rounded-md font-bold whitespace-nowrap text-sm text-white hover:bg-white/20 hover:text-white transition-all hover:scale-105"
                    data-testid={`navbar-link-${item.label.toLowerCase().replace(' ', '-')}`}
                  >
                    {item.label}
                  </Link>
                )
              ))}
            </div>

            {/* Desktop Auth Buttons */}
            <div className="nav-auth-container">
              {user ? (
                <Button
                  onClick={handleLogout}
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary hover:bg-primary/90 h-10 px-4 py-2 nav-auth-button nav-auth-button-secondary text-[#000000] ml-[-25px] mr-[-25px] pt-[0px] pb-[0px]"
                  data-testid="navbar-logout-button"
                  type="button"
                >
                  Sign Out
                </Button>
              ) : (
                <>
                  <a
                    href="/auth/google"
                    className="nav-auth-button nav-auth-button-secondary"
                    data-testid="navbar-login-button"
                  >
                    <span className="font-semibold tracking-wide">Sign In</span>
                  </a>
                  <a
                    href="/auth/google"
                    className="nav-auth-button nav-auth-button-primary"
                    data-testid="navbar-signup-button"
                  >
                    <span className="font-bold tracking-wide">Get Started</span>
                  </a>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            ref={toggleRef}
            type="button"
            className="nav-mobile-toggle pl-[-4px] pr-[-4px] ml-[3px] mr-[3px]"
            onClick={handleMobileMenuToggle}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            data-testid="navbar-mobile-toggle"
          >
            <span className="nav-sr-only">
              {mobileMenuOpen ? "Close menu" : "Open menu"}
            </span>
            {mobileMenuOpen ? (
              <X className="h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <div 
          ref={menuRef}
          id="mobile-menu"
          className={`nav-mobile-menu ${mobileMenuOpen ? 'nav-mobile-menu-open' : ''}`}
          data-state={mobileMenuOpen ? "open" : "closed"}
          role="menu"
          aria-label="Mobile navigation menu"
        >
          <div className="nav-mobile-content">
            {/* Mobile Header */}
            <div className="nav-mobile-header">
              <div className="nav-brand-text">
                <h2 className="nav-brand-title" style={{ 
                  fontFamily: '"Montserrat", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', 
                  color: '#ffffff', 
                  fontWeight: '900',
                  textShadow: 'none',
                  backgroundColor: 'transparent',
                  mixBlendMode: 'normal',
                  WebkitTextStroke: '0px',
                  filter: 'none'
                }}>{brandText.title}</h2>
                <p className="nav-brand-subtitle" style={{ 
                  color: 'rgba(255,255,255,0.85)',
                  textShadow: 'none',
                  backgroundColor: 'transparent',
                  mixBlendMode: 'normal',
                  WebkitTextStroke: '0px',
                  filter: 'none'
                }}>{brandText.subtitle}</p>
              </div>
              <button
                type="button"
                className="nav-mobile-close"
                onClick={handleMobileMenuClose}
                aria-label="Close menu"
                data-testid="navbar-mobile-close"
              >
                <X className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>

            {/* User Profile Section (Mobile) */}
            {user && (
              <div className="nav-mobile-user-section">
                <div className="nav-mobile-user-header">
                  <div className="nav-mobile-user-avatar">
                    <User className="h-8 w-8" />
                  </div>
                  <div className="nav-mobile-user-info">
                    <h3 className="nav-mobile-user-name">{user.email}</h3>
                    <div className="nav-mobile-user-role">
                      {user.role === 'admin' && (
                        <span className="nav-mobile-admin-badge">
                          <Star className="h-3 w-3" />Admin
                        </span>
                      )}
                      <span className="nav-mobile-credits">Credits: {user.creditBalance || 0}</span>
                    </div>
                  </div>
                </div>
                <div className="nav-mobile-user-actions">
                  <Link
                    to="/app/account"
                    className="nav-mobile-user-action"
                    onClick={handleMobileMenuClose}
                    data-testid="navbar-mobile-account-settings"
                  >
                    <Settings className="h-4 w-4" />
                    Account Settings
                  </Link>
                  <Link
                    to="/pricing"
                    className="nav-mobile-user-action"
                    onClick={handleMobileMenuClose}
                    data-testid="navbar-mobile-buy-credits"
                  >
                    <CreditCard className="h-4 w-4" />
                    Buy Credits
                  </Link>
                </div>
              </div>
            )}

            {/* Mobile Navigation Links */}
            <div className="nav-mobile-links" role="none">
              {navItems.map((item) => (
                item.to.endsWith('.html') ? (
                  <a
                    key={item.to}
                    href={item.to}
                    className={`nav-mobile-link ${isActive(item.to) ? 'nav-mobile-link-active' : ''}`}
                    onClick={handleMobileMenuClose}
                    role="menuitem"
                    data-testid={`navbar-mobile-link-${item.label.toLowerCase().replace(' ', '-')}`}
                  >
                    <span className="nav-mobile-link-text">{item.label}</span>
                  </a>
                ) : (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`nav-mobile-link ${isActive(item.to) ? 'nav-mobile-link-active' : ''}`}
                    onClick={handleMobileMenuClose}
                    role="menuitem"
                    data-testid={`navbar-mobile-link-${item.label.toLowerCase().replace(' ', '-')}`}
                  >
                    <span className="nav-mobile-link-text">{item.label}</span>
                  </Link>
                )
              ))}
            </div>

            {/* Mobile Auth Buttons */}
            <div className="nav-mobile-auth">
              {user ? (
                <Button
                  onClick={() => {
                    handleMobileMenuClose();
                    handleLogout();
                  }}
                  className="nav-mobile-auth-button nav-auth-button-secondary"
                  data-testid="navbar-mobile-logout-button"
                  type="button"
                >
                  Sign Out
                </Button>
              ) : (
                <>
                  <a
                    href="/auth/google"
                    className="nav-mobile-auth-button nav-auth-button-secondary"
                    onClick={handleMobileMenuClose}
                    data-testid="navbar-mobile-login-button"
                  >
                    Sign In
                  </a>
                  <a
                    href="/auth/google"
                    className="nav-mobile-auth-button nav-auth-button-primary"
                    onClick={handleMobileMenuClose}
                    data-testid="navbar-mobile-signup-button"
                  >
                    Get Started
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
        </div>
      </nav>
    </header>
  );
}