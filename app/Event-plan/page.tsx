// app/Event-plan/page.tsx
'use client';

import Link from 'next/link';

export default function EventPlanPage() {
  const events = [
    {
      date: "02",
      month: "NOV",
      title: "DIGITAL MARKETING WORKSHOP",
      time: "10:00 AM - 12:00 PM",
      location: "123 Anywhere St., Any City"
    },
    {
      date: "09",
      month: "NOV", 
      title: "HEALTH AND WELLNESS EXPO",
      time: "8:00 AM - 4:00 PM",
      location: "123 Anywhere St., Any City"
    },
    {
      date: "15",
      month: "NOV",
      title: "CHARITY RUN FOR EDUCATION", 
      time: "6:00 AM - 12:00 PM",
      location: "123 Anywhere St., Any City"
    },
    {
      date: "22",
      month: "NOV",
      title: "CULTURAL ARTS FESTIVAL",
      time: "3:00 PM - 9:00 PM", 
      location: "123 Anywhere St., Any City"
    }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden" style={{backgroundColor: '#000D32'}}>
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-32 h-32">
        <div className="grid grid-cols-6 gap-2 p-4">
          {[...Array(24)].map((_, i) => (
            <div key={i} className="w-2 h-2 bg-white rounded-full opacity-30"></div>
          ))}
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 w-32 h-32">
        <div className="grid grid-cols-6 gap-2 p-4">
          {[...Array(24)].map((_, i) => (
            <div key={i} className="w-2 h-2 bg-white rounded-full opacity-30"></div>
          ))}
        </div>
      </div>

      {/* Geometric Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-64 h-64 bg-blue-500/20 rounded-lg transform rotate-45"></div>
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-purple-500/20 rounded-lg transform -rotate-12"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          
          <h1 className="text-6xl md:text-8xl font-black text-yellow-400 mb-4 leading-tight">
             EVENT
          </h1>
          <h2 className="text-4xl md:text-6xl font-black text-yellow-400 mb-8">
            UPCOMING PLAN 
          </h2>
        </div>

        {/* Events List */}
        <div className="max-w-4xl mx-auto space-y-6">
          {events.map((event, index) => (
            <div key={index} className="flex items-center">
              {/* Date Card */}
              <div className="bg-white rounded-l-2xl p-6 text-center min-w-[120px] shadow-lg">
                <div className="text-4xl font-black text-blue-900">{event.date}</div>
                <div className="text-lg font-bold text-blue-900">{event.month}</div>
              </div>
              
              {/* Event Details */}
              <div className="bg-blue-700 rounded-r-2xl p-6 flex-1 shadow-lg">
                <h3 className="text-2xl font-black text-yellow-400 mb-3">
                  {event.title}
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center text-white">
                    <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">{event.time}</span>
                  </div>
                  <div className="flex items-center text-white">
                    <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">{event.location}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Website Footer */}
        <div className="text-center mt-16">
       
        </div>

        {/* Back to Home Button */}
        <div className="text-center mt-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-400 text-blue-900 rounded-lg font-bold hover:bg-yellow-300 transition-colors shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
