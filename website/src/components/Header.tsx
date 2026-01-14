'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SearchInput } from './SearchInput';

type Theme = 'dark' | 'light';

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'dark';
  const savedTheme = document.documentElement.getAttribute('data-theme') as Theme | null;
  return savedTheme || 'dark';
}

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const pathname = usePathname();

  // Handle scroll for sticky header effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // Enable smooth transitions after initial load (prevents FOUC)
  useEffect(() => {
    // Small delay to ensure initial render is complete
    const timer = setTimeout(() => {
      document.documentElement.classList.add('theme-transition');
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    // Persist preference
    try {
      localStorage.setItem('libertas-theme', newTheme);
    } catch {
      // localStorage might not be available
    }
  }, [theme]);

  const navLinks = [
    { href: '/posts', label: 'Posts' },
    { href: '/search', label: 'Search' },
    { href: '/intake', label: 'Submit' },
    { href: '/feeds', label: 'Feeds' },
  ];

  const isActiveLink = (href: string) => {
    if (href === '/posts') {
      return pathname === '/posts' || pathname.startsWith('/posts/');
    }
    return pathname === href;
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-[var(--bg-primary)]/80 backdrop-blur-md border-b border-[var(--border-subtle)]'
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        <div className="container">
          <nav className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link
              href="/"
              onClick={closeMobileMenu}
              className="text-mono text-[var(--accent-primary)] hover:glow-text transition-all group"
            >
              <span className="group-hover:animate-pulse">{'>'}</span> libertas
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              {navLinks.filter(link => link.href !== '/search').map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors ${
                    isActiveLink(link.href)
                      ? 'text-[var(--accent-primary)]'
                      : 'text-[var(--fg-secondary)] hover:text-[var(--fg-primary)]'
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              {/* Search Input */}
              <SearchInput compact placeholder="Search..." />

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-md text-[var(--fg-secondary)] hover:text-[var(--fg-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
                aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              >
                {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-[var(--fg-secondary)] hover:text-[var(--fg-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </nav>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-opacity duration-300 ${
          isMobileMenuOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-[var(--bg-primary)]/90 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />

        {/* Menu Content */}
        <nav
          className={`absolute top-16 left-0 right-0 bg-[var(--bg-secondary)] border-b border-[var(--border-subtle)] transform transition-transform duration-300 ${
            isMobileMenuOpen ? 'translate-y-0' : '-translate-y-full'
          }`}
        >
          <div className="container py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMobileMenu}
                className={`block py-3 px-4 rounded-md text-base font-medium transition-colors ${
                  isActiveLink(link.href)
                    ? 'text-[var(--accent-primary)] bg-[var(--accent-muted)]'
                    : 'text-[var(--fg-secondary)] hover:text-[var(--fg-primary)] hover:bg-[var(--bg-tertiary)]'
                }`}
              >
                {link.label}
              </Link>
            ))}

            {/* Theme Toggle in Mobile Menu */}
            <button
              onClick={toggleTheme}
              className="w-full flex items-center gap-3 py-3 px-4 rounded-md text-base font-medium text-[var(--fg-secondary)] hover:text-[var(--fg-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
            >
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
              <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
          </div>
        </nav>
      </div>

      {/* Spacer to prevent content from going under fixed header */}
      <div className="h-16" />
    </>
  );
}

// Icons
function SunIcon() {
  return (
    <svg
      className="w-5 h-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="5" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      className="w-5 h-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg
      className="w-6 h-6"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12h18M3 6h18M3 18h18" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      className="w-6 h-6"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}
