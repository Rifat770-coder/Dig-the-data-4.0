"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import Footer from "./Footer/page";
import BannerSection from "./Banner-Section/page";
import LegacyPage from "./Legacy/page";

// Modern Navigation Component
function ModernNavigation() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled
          ? "glass-nav shadow-2xl shadow-cyan-500/10"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 md:h-20">
          {/* Logo Section */}
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4 group">
            <div className="relative">
              <Image
                src="/20251018_003312.jpg"
                alt="Dig The Data Logo"
                width={40}
                height={40}
                className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-lg sm:rounded-xl shadow-lg transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 rounded-lg sm:rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <div>
              <h1 className="text-base sm:text-xl md:text-2xl font-bold gradient-text">Dig The Data</h1>
              <p className="text-[10px] sm:text-xs text-cyan-400/80 font-medium">4.0</p>
            </div>
          </div>

          {/* Navigation Links - Hidden on mobile, shown on desktop */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="#features"
              className="text-gray-300 hover:text-cyan-400 transition-colors duration-300 font-medium"
            >
              Gallery
            </Link>
            <Link
              href="#legacy"
              className="text-gray-300 hover:text-cyan-400 transition-colors duration-300 font-medium"
            >
              Legacy
            </Link>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
            {/* Login button - Optimized for mobile */}
            <Link
              href="/login"
              className="px-2 py-1.5 sm:px-4 sm:py-2 md:px-6 md:py-2.5 text-cyan-400 border border-cyan-500/30 rounded-lg sm:rounded-xl font-semibold hover:bg-cyan-500/10 transition-all duration-300 text-xs sm:text-sm md:text-base min-h-[36px] sm:min-h-[40px] md:min-h-[44px] min-w-[60px] sm:min-w-[80px] md:min-w-[100px] flex items-center justify-center"
            >
              Login
            </Link>
            {/* Register button - Consistent text across all devices */}
            <Link
              href="/register"
              className="btn-primary px-3 py-1.5 sm:px-4 sm:py-2 md:px-6 md:py-2.5 text-white rounded-lg sm:rounded-xl font-semibold text-xs sm:text-sm md:text-base min-h-[36px] sm:min-h-[40px] md:min-h-[44px] min-w-[100px] sm:min-w-[110px] md:min-w-[130px] flex items-center justify-center whitespace-nowrap"
            >
              Register Now
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

// Enhanced Hero Section
function ModernHeroSection() {
  return (
    <section className="relative min-h-[30vh] sm:min-h-[40vh] md:min-h-[50vh] flex items-center justify-center overflow-hidden py-8 sm:py-12 md:py-16 bg-gradient-to-b from-slate-900 via-blue-900/40 to-slate-900">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-blue-900/50 to-slate-900/80"></div>

      {/* Animated Background Shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 sm:w-80 md:w-96 h-64 sm:h-80 md:h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 sm:w-80 md:w-96 h-64 sm:h-80 md:h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 text-center">
        <div className="space-y-4 sm:space-y-6 md:space-y-8 animate-fade-in-up">
          {/* Main Heading */}
          <div className="space-y-1 sm:space-y-2">
            <h1 className="text-responsive-xl gradient-text">Welcome to</h1>
            <h2 className="text-responsive-xl text-white font-black tracking-tight">
              Dig The Data 4.0
            </h2>
          </div>

          {/* Subtitle */}
          <p className="text-responsive-md text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Where <span className="text-cyan-400 font-semibold">Logic </span>{" "}
            Meets <span className="text-blue-400 font-semibold">Mystery</span>
          </p>
        </div>
      </div>
    </section>
  );
}

// Event Plan Component
function EventPlanComponent() {
  const events = [
    {
      date: "09",
      month: "NOV",
      title: "Registration Deadline",
      time: "11:59 PM",
      location: "Dig the data website",
    },

    {
      date: "10",
      month: "NOV",
      title: "Preliminary Round",
      time: "4.00pm - 6.00 pm",
      location: "AC-101, AC-116, AC-104",
    },
    {
      date: "11",
      month: "NOV",
      title: "Finalist Announcement",
      time: "12.00 pm-4.00 pm",
      location: "Dig the data website",
    },
    {
      date: "12",
      month: "NOV",
      title: "Final Round",
      time: "12.00 pm-5.00 pm",
      location: "AD 202, NITER",
    },
  ];

  return (
    <div className="mb-0 relative overflow-hidden bg-gray-900/80 backdrop-blur-xl border-y border-cyan-500/30 shadow-2xl">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-32 h-32">
        <div className="grid grid-cols-6 gap-2 p-4">
          {[...Array(24)].map((_, i) => (
            <div key={i} className="w-2 h-2 bg-cyan-500/30 rounded-full"></div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 w-32 h-32">
        <div className="grid grid-cols-6 gap-2 p-4">
          {[...Array(24)].map((_, i) => (
            <div key={i} className="w-2 h-2 bg-cyan-500/30 rounded-full"></div>
          ))}
        </div>
      </div>

      {/* Geometric Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-64 h-64 bg-cyan-500/10 rounded-lg transform rotate-45"></div>
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-blue-500/10 rounded-lg transform -rotate-12"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/5 rounded-full"></div>
      </div>

      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-6xl md:text-8xl font-black bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-4 leading-tight">
            EVENT
          </h1>
          <h2 className="text-4xl md:text-6xl font-black bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-8">
            PLAN
          </h2>
        </div>

        {/* Events List */}
        <div className="max-w-4xl mx-auto space-y-6">
          {events.map((event, index) => (
            <div key={index} className="flex items-center">
              {/* Date Card */}
              <div className="bg-gray-900/80 backdrop-blur-xl border border-cyan-500/30 rounded-l-2xl p-6 text-center min-w-[120px] shadow-lg shadow-cyan-500/25">
                <div className="text-4xl font-black bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  {event.date}
                </div>
                <div className="text-lg font-bold text-cyan-400">
                  {event.month}
                </div>
              </div>

              {/* Event Details */}
              <div className="bg-gray-800/80 backdrop-blur-xl border border-cyan-500/20 rounded-r-2xl p-6 flex-1 shadow-lg hover:border-cyan-500/40 transition-all duration-300">
                <h3 className="text-2xl font-black text-white mb-3">
                  {event.title}
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center text-gray-300">
                    <svg
                      className="w-5 h-5 mr-3 text-cyan-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="font-medium">{event.time}</span>
                  </div>
                  <div className="flex items-center text-gray-300">
                    <svg
                      className="w-5 h-5 mr-3 text-cyan-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="font-medium">{event.location}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Enhanced Previous Events Gallery Component with Slide System
function PreviousEventsGallery() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState("next");

  const events = [
    {
      id: 1,
      title: "Dig The Data 3.0",
      year: "2023",
      image: "/pic/486622421_1181400177010081_6001979446675449849_n.jpg",
      participants: "150+",
      description:
        "The most challenging data competition yet with advanced analytics and real-world problem solving",
      highlights: [
        "Advanced ML Challenges",
        "Industry Partnerships",
        "Record Participation",
      ],
    },
    {
      id: 2,
      title: "Dig The Data 3.0",
      year: "2023",
      image: "/pic/486600275_1181399473676818_6195513654514764220_n.jpg",
      participants: "150+",
      description:
        "Advanced analytics and machine learning competition that pushed boundaries",
      highlights: [
        "Deep Learning Focus",
        "Real-time Analytics",
        "Innovation Awards",
      ],
    },
    {
      id: 3,
      title: "Dig The Data 3.0",
      year: "2023",
      image: "/pic/486319433_1181398037010295_1831553890189172005_n.jpg",
      participants: "150+",
      description: "The beginning of our data journey - where it all started",
      highlights: [
        "Foundation Event",
        "Community Building",
        "Data Exploration",
      ],
    },
    {
      id: 4,
      title: "Dig The Data 3.0",
      year: "2023",
      image: "/pic/486704338_1181399120343520_6773020276819131375_n.jpg",
      participants: "150+",
      description:
        "The inaugural event that sparked the data revolution at NITER",
      highlights: [
        "First Edition",
        "Concept Introduction",
        "Student Engagement",
      ],
    },
    {
      id: 5,
      title: "Dig The Data 2.0",
      year: "2022",
      image: "/pic/2.0.jpg",
      participants: "150+",
      description:
        "The most challenging data competition yet with advanced analytics and real-world problem solving",
      highlights: [
        "Advanced ML Challenges",
        "Industry Partnerships",
        "Record Participation",
      ],
    },
    {
      id: 6,
      title: "Dig The Data 2.0",
      year: "2022",
      image: "/pic/2.0 (1).jpg",
      participants: "150+",
      description:
        "Advanced analytics and machine learning competition that pushed boundaries",
      highlights: [
        "Deep Learning Focus",
        "Real-time Analytics",
        "Innovation Awards",
      ],
    },
    {
      id: 7,
      title: "Dig The Data 2.0",
      year: "2021",
      image: "/pic/2.0(2).jpg",
      participants: "150+",
      description: "The beginning of our data journey - where it all started",
      highlights: [
        "Foundation Event",
        "Community Building",
        "Data Exploration",
      ],
    },
    {
      id: 8,
      title: "Dig The Data1.0",
      year: "2021",
      image: "/pic/1.0.jpg",
      participants: "150+",
      description:
        "The inaugural event that sparked the data revolution at NITER",
      highlights: [
        "First Edition",
        "Concept Introduction",
        "Student Engagement",
      ],
    },
    {
      id: 9,
      title: "Dig The Data 1.0",
      year: "2022",
      image: "/pic/1.0(1).jpg",
      participants: "150+",
      description:
        "The most challenging data competition yet with advanced analytics and real-world problem solving",
      highlights: [
        "Advanced ML Challenges",
        "Industry Partnerships",
        "Record Participation",
      ],
    },
    {
      id: 10,
      title: "Dig The Data 1.0",
      year: "2022",
      image: "/pic/1.0(2).jpg",
      participants: "150+",
      description:
        "Advanced analytics and machine learning competition that pushed boundaries",
      highlights: [
        "Deep Learning Focus",
        "Real-time Analytics",
        "Innovation Awards",
      ],
    },
    {
      id: 11,
      title: "Dig The Data 1.0",
      year: "2021",
      image: "/pic/1.0(3).jpg",
      participants: "150+",
      description: "The beginning of our data journey - where it all started",
      highlights: [
        "Foundation Event",
        "Community Building",
        "Data Exploration",
      ],
    },
  ];

  // Auto-slide functionality
  useEffect(() => {
    const interval = setInterval(() => {
      handleNext();
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, []); // Empty dependency array to prevent infinite re-renders

  const handleNext = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setDirection("next");

    setTimeout(() => {
      setCurrentSlide((prev) => (prev + 1) % events.length);
      setIsAnimating(false);
    }, 300);
  };

  const handlePrev = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setDirection("prev");

    setTimeout(() => {
      setCurrentSlide((prev) => (prev - 1 + events.length) % events.length);
      setIsAnimating(false);
    }, 300);
  };

  const goToSlide = (index: number) => {
    if (isAnimating || index === currentSlide) return;
    setIsAnimating(true);
    setDirection(index > currentSlide ? "next" : "prev");

    setTimeout(() => {
      setCurrentSlide(index);
      setIsAnimating(false);
    }, 300);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      {/* Header */}
      <div className="text-center mb-16">
        <h2 className="text-6xl md:text-8xl font-black bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-4 leading-tight">
          PREVIOUS
        </h2>
        <h3 className="text-4xl md:text-6xl font-black bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-8">
          EVENTS
        </h3>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          Relive the excitement and innovation from our past events
        </p>
      </div>

      {/* Main Slideshow Container */}
      <div className="relative max-w-6xl mx-auto">
        {/* Slide Container */}
        <div className="relative overflow-hidden rounded-3xl bg-gray-900/80 backdrop-blur-xl border border-cyan-500/30 shadow-2xl">
          {/* Current Slide */}
          <div className={`transition-all duration-500 ease-in-out ${isAnimating ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}>
            <div className="grid md:grid-cols-2 gap-8 p-8 md:p-12">
              {/* Image Section */}
              <div className="relative group">
                <div className="aspect-video rounded-2xl overflow-hidden shadow-2xl">
                  <Image
                    src={events[currentSlide].image}
                    alt={events[currentSlide].title}
                    width={600}
                    height={400}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                </div>
                
                {/* Image Overlay Info */}
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center justify-between text-white">
                    <span className="bg-cyan-500/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold">
                      {events[currentSlide].year}
                    </span>
                    <span className="bg-blue-500/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold">
                      {events[currentSlide].participants} Participants
                    </span>
                  </div>
                </div>
              </div>

              {/* Content Section */}
              <div className="flex flex-col justify-center space-y-6">
                <div>
                  <h4 className="text-4xl md:text-5xl font-black text-white mb-4">
                    {events[currentSlide].title}
                  </h4>
                  <p className="text-lg text-gray-300 leading-relaxed">
                    {events[currentSlide].description}
                  </p>
                </div>

                {/* Highlights */}
                <div>
                  <h5 className="text-xl font-bold text-cyan-400 mb-3">Event Highlights</h5>
                  <div className="space-y-2">
                    {events[currentSlide].highlights.map((highlight, index) => (
                      <div key={index} className="flex items-center text-gray-300">
                        <div className="w-2 h-2 bg-cyan-400 rounded-full mr-3"></div>
                        <span>{highlight}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Event Stats */}
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="bg-gray-800/50 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-cyan-400">{events[currentSlide].participants}</div>
                    <div className="text-sm text-gray-400">Participants</div>
                  </div>
                  <div className="bg-gray-800/50 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-blue-400">{events[currentSlide].year}</div>
                    <div className="text-sm text-gray-400">Year</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={handlePrev}
            disabled={isAnimating}
            className="absolute left-1 md:left-4 top-1/2 transform -translate-y-1/2 bg-gray-900/80 backdrop-blur-sm border border-cyan-500/30 rounded-full p-2 md:p-3 text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={handleNext}
            disabled={isAnimating}
            className="absolute right-1 md:right-4 top-1/2 transform -translate-y-1/2 bg-gray-900/80 backdrop-blur-sm border border-cyan-500/30 rounded-full p-2 md:p-3 text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Slide Indicators */}
        <div className="flex justify-center mt-8 space-x-2">
          {events.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              disabled={isAnimating}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? 'bg-cyan-400 scale-125'
                  : 'bg-gray-600 hover:bg-gray-500'
              } disabled:cursor-not-allowed`}
            />
          ))}
        </div>

        {/* Progress Bar */}
        <div className="mt-6 bg-gray-800 rounded-full h-1 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300"
            style={{ width: `${((currentSlide + 1) / events.length) * 100}%` }}
          />
        </div>

        {/* Slide Counter */}
        <div className="text-center mt-4">
          <span className="text-gray-400 text-sm">
            {currentSlide + 1} of {events.length}
          </span>
        </div>
      </div>
    </div>
  );
}

// Modern CTA Section
function ModernCTASection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-900/50 via-blue-900/30 to-slate-900/50">
      <div className="max-w-4xl mx-auto">
        <div className="modern-card p-12 text-center relative overflow-hidden bg-gray-900/90 backdrop-blur-xl border border-cyan-500/30 rounded-3xl shadow-2xl">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 grid-pattern"></div>
          </div>

          <div className="relative z-10">
            <h2 className="text-responsive-lg text-white mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-responsive-md text-gray-300 mb-8 max-w-2xl mx-auto">
              Join us today and unlock the full potential of data analytics. Be
              part of the most exciting data competition at NITER.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="btn-primary px-10 py-4 text-white text-lg rounded-2xl font-bold min-w-[200px] pulse-glow"
              >
                Register Now
              </Link>
              <Link
                href="/login"
                className="btn-secondary px-10 py-4 text-lg rounded-2xl font-semibold min-w-[200px]"
              >
                Already Registered?
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-transparent via-slate-900/30 to-transparent text-white">
      {/* Modern Navigation */}
      <ModernNavigation />

      {/* Modern Hero Section */}
      <ModernHeroSection />

      {/* Banner Section */}
      <BannerSection />

      {/* Event Plan Section */}
      <EventPlanComponent />

      {/* Features Section */}
      <section id="features" className="bg-gradient-to-b from-slate-900/50 via-blue-900/20 to-slate-900/50">
        <PreviousEventsGallery />
      </section>

      {/* Legacy Section */}
      <section id="legacy">
        <LegacyPage />
      </section>

      {/* Modern CTA Section */}
      <ModernCTASection />

      {/* Footer */}
      <Footer />
    </div>
  );
}
