"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";

export default function BannerSection() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="relative py-20 overflow-hidden">
      {/* Modern Background with Gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900/50 to-slate-900"></div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/3 rounded-full blur-3xl"></div>
      </div>

      {/* Subtle Grid Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 grid-pattern"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div
          className={`text-center mb-16 transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="relative group">
              <Image
                src="/ncc logo new    ncc.png"
                alt="NITER Computer Club"
                width={80}
                height={80}
                className="object-contain rounded-2xl shadow-lg transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                NITER Computer Club
              </h2>
              <p className="text-cyan-400 font-medium">Presents</p>
            </div>
          </div>
        </div>

        {/* Main Banner Card */}
        <div
          className={`transition-all duration-1000 delay-300 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
          }`}
        >
          <div className="modern-card overflow-hidden">
            <div className="grid lg:grid-cols-2 gap-0">
              {/* Left Side - Logo/Image */}
              <div className="relative p-8 md:p-12 lg:p-16 flex items-center justify-center bg-gradient-to-br from-slate-800/50 to-slate-900/50">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative w-full max-w-md aspect-square flex items-center justify-center">
                    <Image
                      src="/20251018_003312.jpg"
                      alt="Dig The Data 4.0 Logo"
                      width={400}
                      height={400}
                      className="object-contain drop-shadow-2xl rounded-2xl transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                </div>
              </div>

              {/* Right Side - Content */}
              <div className="relative p-8 md:p-12 lg:p-16 flex flex-col justify-center">
                {/* Decorative Elements */}
                <div className="absolute top-8 right-8 w-20 h-20 border-2 border-cyan-500/20 rounded-2xl rotate-12 opacity-50"></div>
                <div className="absolute bottom-8 left-8 w-16 h-16 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-full"></div>

                {/* Title */}
                <div className="mb-8">
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-black gradient-text mb-4 tracking-tight">
                    Dig The Data
                  </h1>
                  <div className="flex items-center gap-4">
                    <span className="text-3xl md:text-4xl font-bold text-white">
                      4.0
                    </span>
                    <div className="h-1 flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"></div>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-4 mb-10">
                  <p className="text-gray-300 text-lg md:text-xl leading-relaxed">
                    Organized by{" "}
                    <span className="text-cyan-400 font-semibold">
                      NCC (NITER Computer Club)
                    </span>
                    , an exclusive event for the{" "}
                    <span className="text-blue-400 font-semibold">
                      NITER 15th batch
                    </span>
                    .
                  </p>
                  <p className="text-gray-300 text-lg md:text-xl leading-relaxed">
                    This time, we bring you an event with a twist
                    <span className="text-cyan-400 font-semibold">
                      {" "}
                      unlike never seen before
                    </span>
                    .
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center sm:justify-start items-stretch sm:items-center">
                  <a
                    href="/Rulebook of DTD 4.0.pdf"
                    download="Dig The Data 4.0 Rulebook.pdf"
                    className="btn-primary px-6 sm:px-8 py-3 sm:py-4 text-white text-base sm:text-lg font-bold rounded-2xl min-w-[160px] sm:min-w-[180px] lg:min-w-[200px] text-center group relative overflow-hidden transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-cyan-500/50 active:scale-95"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      <svg
                        className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:rotate-12"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <span className="whitespace-nowrap">Rules Book</span>
                    </span>
                    {/* Hover effect overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/20 to-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                  </a>

                  <a
                    href="/Registration Book of DTD 4.0 Final.pdf"
                    download="Dig The Data 4.0 Registration Rules.pdf"
                    className="btn-primary px-6 sm:px-8 py-3 sm:py-4 text-white text-base sm:text-lg font-bold rounded-2xl min-w-[160px] sm:min-w-[180px] lg:min-w-[200px] text-center group relative overflow-hidden transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-cyan-500/50 active:scale-95"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      <svg
                        className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:rotate-12"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <span className="whitespace-nowrap">Registration Rules</span>
                    </span>
                    {/* Hover effect overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/20 to-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                  </a>
                </div>

                {/* Event Stats */}
                <div className="grid grid-cols-3 gap-4 mt-12 pt-8 border-t border-gray-700/50">
                  <div className="text-center">
                    <div className="text-2xl font-bold gradient-text mb-1">
                      4.0
                    </div>
                    <p className="text-gray-400 text-sm">Edition</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold gradient-text mb-1">
                      15th
                    </div>
                    <p className="text-gray-400 text-sm">Batch</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold gradient-text mb-1">
                      NCC
                    </div>
                    <p className="text-gray-400 text-sm">Organizer</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div
          className={`mt-16 transition-all duration-1000 delay-600 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <Link
              href="/register"
              className="btn-primary px-8 py-4 text-white text-lg rounded-2xl font-bold min-w-[200px] animate-slide-in-right"
            >
              Join the Challenge
            </Link>
            <Link
              href="#features"
              className="btn-secondary px-8 py-4 text-lg rounded-2xl font-semibold min-w-[200px] animate-slide-in-right delay-150"
            >
              Explore Gallery
            </Link>
          </div>
        </div>

        {/* Stats or Info Cards */}
        <div
          className={`mt-16 transition-all duration-1000 delay-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16 max-w-4xl mx-auto">
            <div className="modern-card p-6 text-center">
              <div className="text-3xl font-bold gradient-text mb-2">4.0</div>
              <p className="text-gray-300">Latest Edition</p>
            </div>
            <div className="modern-card p-6 text-center">
              <div className="text-3xl font-bold gradient-text mb-2">NCC</div>
              <p className="text-gray-300">Organized by</p>
            </div>
            <div className="modern-card p-6 text-center">
              <div className="text-3xl font-bold gradient-text mb-2">15th</div>
              <p className="text-gray-300">Batch Exclusive</p>
            </div>
          </div>
        </div>

        {/* Floating Action Elements */}
        <div
          className={`mt-16 text-center transition-all duration-1000 delay-800 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="inline-flex items-center gap-4 modern-card px-8 py-4">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-gray-300 font-medium">Registration Open</span>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-cyan-400/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-cyan-400 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>

      {/* Decorative Floating Elements */}
      <div className="absolute top-20 right-10 w-4 h-4 bg-cyan-500/30 rounded-full animate-bounce delay-1000"></div>
      <div className="absolute bottom-20 left-10 w-6 h-6 border-2 border-blue-500/30 rounded-lg rotate-45 animate-pulse"></div>
      <div className="absolute top-1/2 right-20 w-8 h-8 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full animate-pulse delay-500"></div>
    </section>
  );
}
