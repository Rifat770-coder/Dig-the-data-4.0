// app/Footer/page.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';

export default function Footer() {
  const [isVisible, setIsVisible] = useState(false);
  // Set to true for "Registration Open" or false for "Registration Closed"
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const footerElement = document.getElementById('footer');
    if (footerElement) {
      observer.observe(footerElement);
    }

    return () => {
      if (footerElement) {
        observer.unobserve(footerElement);
      }
    };
  }, []);

  const socialLinks = [
    {
      name: 'LinkedIn',
      href: 'https://www.linkedin.com/company/niter-computer-club-ncc/',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
        </svg>
      ),
      color: 'hover:bg-blue-600'
    },
    {
      name: 'Facebook',
      href: 'https://www.facebook.com/share/1D6oFcJ5RA/',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
        </svg>
      ),
      color: 'hover:bg-blue-500'
    }
  ];

  const contactInfo = [
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      label: 'Email',
      value: 'minhajulislamrifat14@niter.edu.bd',
      href: 'minhajulislamrifat14@niter.edu.bd'
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
      label: 'Phone',
      value: '+8801988935650',
      href: 'tel:+8801988935650'
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      label: 'Location',
      value: 'NITER, Savar, Dhaka',
      href: 'https://www.niter.edu.bd'
    }
  ];

  const quickLinks = [
    { name: 'Home', href: '/' },
    { name: 'Gallery', href: '#features' },
    { name: 'Legacy', href: '#legacy' },
    { name: 'Register', href: '/register' },
    { name: 'Login', href: '/login' }
  ];

  return (
    <footer id="footer" className="relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-linear-to-t from-slate-900 via-slate-800/95 to-slate-900/90"></div>
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/3 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/3 rounded-full blur-3xl"></div>
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 grid-pattern"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Main Footer Content */}
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12 mb-12 transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          
          {/* Brand Section */}
          <div className="lg:col-span-2">
            {/* Mobile-Optimized Logo Section */}
            <div className="flex flex-col items-center sm:items-start gap-6 mb-8">
              {/* Logo Container - Side by side on mobile */}
              <div className="flex flex-row items-center justify-center sm:justify-start gap-4 sm:gap-6 w-full">
                {/* NCC Logo - Clickable Link */}
                 <Link
                   href="https://www.niter.edu.bd"
                   target="_blank"
                   rel="noopener noreferrer"
                   className="logo-link relative group focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-900 rounded-2xl transition-all duration-300"
                   aria-label="Visit NITER Computer Club website"
                 >
                   <div className="relative">
                     <Image
                       src="/ncc logo new    ncc.png"
                       alt="NITER Computer Club - Official website link"
                       width={80}
                       height={80}
                       className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-2xl shadow-lg transition-all duration-300 group-hover:scale-105 group-focus:scale-105 object-cover"
                       priority
                     />
                     <div className="absolute inset-0 rounded-2xl bg-linear-to-r from-cyan-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-300"></div>
                     {/* Touch-friendly overlay for mobile */}
                     <div className="absolute inset-0 rounded-2xl bg-transparent group-active:bg-cyan-500/10 transition-colors duration-150"></div>
                   </div>
                 </Link>

                 {/* Dig The Data Logo - Clickable Link */}
                 <Link
                   href="/"
                   className="logo-link relative group focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-900 rounded-2xl transition-all duration-300"
                   aria-label="Go to Dig The Data 4.0 homepage"
                 >
                   <div className="relative">
                     <Image
                       src="/20251018_003312.jpg"
                       alt="Dig The Data 4.0 - Competition homepage link"
                       width={80}
                       height={80}
                       className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-2xl shadow-lg transition-all duration-300 group-hover:scale-105 group-focus:scale-105 object-cover"
                       priority
                     />
                     <div className="absolute inset-0 rounded-2xl bg-linear-to-r from-cyan-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-300"></div>
                     {/* Touch-friendly overlay for mobile */}
                     <div className="absolute inset-0 rounded-2xl bg-transparent group-active:bg-cyan-500/10 transition-colors duration-150"></div>
                   </div>
                 </Link>
              </div>

              {/* Event Description */}
              <div className="text-center sm:text-left w-full">
                <h3 className="text-xl sm:text-2xl font-bold gradient-text mb-2">
                  Dig The Data 4.0
                </h3>
                <p className="text-gray-300 text-sm mb-4 max-w-md mx-auto sm:mx-0">
                  Organized by NITER Computer Club (NCC). An exclusive data analytics competition for NITER 15th batch students.
                </p>
                <div className="flex items-center justify-center sm:justify-start gap-2 text-sm text-cyan-400">
                  <div className={`w-2 h-2 rounded-full animate-pulse ${
                    isRegistrationOpen ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  <span>{isRegistrationOpen ? 'Registration Open' : 'Registration Closed'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links - Horizontal Layout for Mobile */}
          <div className="col-span-full lg:col-span-1">
            <h4 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-6 relative inline-block">
              Quick Links
              <div className="absolute -bottom-1 sm:-bottom-2 left-0 w-16 sm:w-20 h-0.5 bg-linear-to-r from-cyan-500 to-blue-500 rounded-full"></div>
            </h4>
            {/* Mobile: Single row with separators, Desktop: Vertical */}
            <div className="flex flex-wrap items-center gap-x-3 sm:gap-x-4 gap-y-2 md:flex-col md:items-start md:space-y-3">
              {quickLinks.map((link, index) => (
                <div key={index} className="flex items-center">
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-cyan-400 transition-colors duration-300 text-sm sm:text-base font-normal"
                  >
                    {link.name}
                  </Link>
                  {index < quickLinks.length - 1 && (
                    <span className="text-gray-500 mx-3 sm:mx-4 md:hidden">|</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Contact Info - Two Column Layout for Mobile */}
          <div className="col-span-full lg:col-span-2">
            <h4 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-6 relative inline-block">
              Contact Us
              <div className="absolute -bottom-1 sm:-bottom-2 left-0 w-16 sm:w-20 h-0.5 bg-linear-to-r from-cyan-500 to-blue-500 rounded-full"></div>
            </h4>
            {/* Mobile: 1 column, Desktop: 1 column (vertical stack) */}
            <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:gap-y-4">
              {contactInfo.map((contact, index) => (
                <a
                  key={index}
                  href={contact.href}
                  target={contact.href.startsWith('http') ? '_blank' : undefined}
                  rel={contact.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="flex items-start gap-2.5 sm:gap-3 text-gray-300 hover:text-cyan-400 transition-colors duration-300 group"
                >
                  <div className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400 group-hover:text-cyan-300 transition-colors duration-300 shrink-0 mt-0.5">
                    {contact.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] sm:text-xs text-gray-400 uppercase tracking-wide mb-0.5 font-semibold">
                      {contact.label}
                    </div>
                    <div className="text-sm sm:text-base text-gray-200 wrap-break-word leading-tight">
                      {contact.value}
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Follow Us Section - Circular Icons */}
          <div className="col-span-full lg:col-span-1">
            <h4 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-6 relative inline-block">
              Follow Us
              <div className="absolute -bottom-1 sm:-bottom-2 left-0 w-16 sm:w-20 h-0.5 bg-linear-to-r from-cyan-500 to-blue-500 rounded-full"></div>
            </h4>
            {/* Circular social icons */}
            <div className="flex items-center gap-4 sm:gap-5">
              {socialLinks.map((social, index) => (
                <div key={index} className="flex flex-col items-center gap-2">
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-cyan-400 flex items-center justify-center text-cyan-400 hover:bg-cyan-400 hover:text-slate-900 transition-all duration-300 group"
                    aria-label={social.name}
                  >
                    <div className="w-7 h-7 sm:w-9 sm:h-9 flex items-center justify-center">
                      {social.icon}
                    </div>
                  </a>
                  <span className="text-xs sm:text-sm text-gray-300">{social.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className={`pt-8 border-t border-gray-700/50 transition-all duration-1000 delay-500 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          {/* Mobile-Optimized Layout */}
          <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between md:items-center md:gap-6">
            {/* Copyright Section - Mobile Stacked */}
            <div className="text-center md:text-left space-y-2 w-full md:w-auto">
              {/* Year and Event Name */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-2 text-sm">
                <span className="text-gray-300">© 2025</span>
                <span className="text-cyan-400 font-bold">Dig The Data 4.0</span>
              </div>
              
              {/* Rights Reserved - Mobile Friendly */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-1.5 text-xs sm:text-sm">
                <span className="text-gray-400">All rights reserved by</span>
                <a 
                  target='_blank' 
                  href="https://www.linkedin.com/in/minhajul-islam-rifat-986992342/" 
                  className="text-cyan-400 font-semibold hover:text-cyan-300 transition-colors whitespace-nowrap inline-flex items-center gap-1"
                >
                  <span>Minhajul Islam Rifat</span>
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                    <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                  </svg>
                </a>
              </div>
              
              {/* Organizer Info */}
              <div className="flex items-center justify-center md:justify-start gap-1.5 text-xs">
                <span className="text-gray-400">Organized by</span>
                <span className="text-cyan-400 font-semibold whitespace-nowrap">NITER Computer Club (NCC)</span>
              </div>
            </div>

          </div>
        </div>

        {/* Scroll to Top Button */}
        <div className="absolute bottom-8 right-8">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="w-12 h-12 bg-linear-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 hover:scale-110 group"
            aria-label="Scroll to top"
          >
            <svg className="w-5 h-5 transition-transform duration-300 group-hover:-translate-y-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </button>
        </div>
      </div>
    </footer>
  );
}

