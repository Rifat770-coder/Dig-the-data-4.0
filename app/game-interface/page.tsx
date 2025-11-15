'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { User, LogOut, Book, Play, MapPin } from 'lucide-react';
import InstructionModal from '../../components/InstructionModal';

// Navigation Component
function GameNavigation() {
  const [isTeamLoggedIn, setIsTeamLoggedIn] = useState(false);

  const handleTeamLogin = () => {
    setIsTeamLoggedIn(!isTeamLoggedIn);
  };

  return (
    <nav className="bg-gray-900/95 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-40" role="navigation" aria-label="Main navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/game" className="flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded" aria-label="Return to game home">
            <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">MG</span>
            </div>
            <span className="text-white font-semibold text-lg">Mystery Game</span>
          </Link>

          {/* Team Login */}
          <div className="flex items-center space-x-4">
            <button
              onClick={handleTeamLogin}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 ${
                isTeamLoggedIn
                  ? 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500'
                  : 'bg-gray-700 hover:bg-gray-600 text-gray-300 focus:ring-gray-500'
              }`}
              aria-label={isTeamLoggedIn ? 'Team logged in - click to logout' : 'Click to login team'}
            >
              {isTeamLoggedIn ? (
                <>
                  <User size={18} aria-hidden="true" />
                  <span className="hidden sm:inline">Team Online</span>
                  <LogOut size={16} aria-hidden="true" />
                </>
              ) : (
                <>
                  <User size={18} aria-hidden="true" />
                  <span className="hidden sm:inline">Team Login</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default function GameInterface() {
  const [isInstructionModalOpen, setIsInstructionModalOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleInstructionBook = () => {
    setIsInstructionModalOpen(true);
  };

  const handleMissionStart = (missionType: 'indoor' | 'outdoor') => {
    if (missionType === 'indoor') {
      window.location.href = '/indoor-mission';
    } else if (missionType === 'outdoor') {
      window.location.href = '/outdoor-mission';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      {/* Navigation */}
      <GameNavigation />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8" role="main" aria-label="Game interface">
        <div className={`transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {/* Page Title */}
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Game Interface
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Choose your mission and embark on an adventure filled with mystery and excitement
            </p>
          </div>

          {/* Three Horizontal Divisions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            
            {/* First Division - Game Logo & Instructions */}
            <section className="game-card bg-gray-800/50 rounded-2xl p-8 text-center" aria-labelledby="logo-section">
              <h2 id="logo-section" className="sr-only">Game logo and instructions</h2>
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white mb-4">Welcome to</h3>
                <h4 className="text-3xl font-bold text-cyan-400 mb-6">The World of Mystery</h4>
                
                {/* Logo Placeholder */}
                <div className="w-48 h-48 mx-auto mb-6 bg-gray-700 rounded-2xl flex items-center justify-center border-2 border-gray-600">
                  <Image
                  src="/20251018_003312.jpg"
                  alt="Indoor mission illustration showing puzzle-solving activities and investigation room"
                  width={195}
                  height={195}
                  className="w-full rounded-2xl  h-full object-cover"
                  priority
                />
                </div>
                
                <p className="text-gray-300 mb-6 leading-relaxed">
                  Get ready to dive into a world of mystery, logic, and thrill! 
                  To enjoy the game properly, here are some instructions for you and your team. 
                  These instructions are very much important to finish both of the missions.
                </p>
                
                <p className="text-gray-400 text-sm mb-6">
                  Read the instruction book properly. Best of luck for your team!
                </p>
                
                <button
                  onClick={handleInstructionBook}
                  className="mission-button bg-gradient-to-r from-gray-600 to-gray-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-300 hover:from-gray-500 hover:to-gray-600 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-gray-500/50"
                  aria-label="Open instruction book to read game rules and guidelines"
                >
                  <Book className="inline-block w-4 h-4 mr-2" aria-hidden="true" />
                  Instruction Book
                </button>
              </div>
            </section>

            {/* Second Division - Indoor Mission */}
            <section className="game-card bg-gray-800/50 rounded-2xl p-20 text-center" aria-labelledby="indoor-mission">
              <h2 id="indoor-mission" className="text-2xl font-bold text-yellow-400 mb-6">Indoor Mission</h2>
              
              {/* Indoor Mission Image */}
              <div className="w-48 h-48 mx-auto mb-6 rounded-2xl overflow-hidden border-2 border-yellow-400/30">
                <Image
                  src="/indoor.jpg"
                  alt="Indoor mission illustration showing puzzle-solving activities and investigation room"
                  width={192}
                  height={192}
                  className="w-full h-full object-cover"
                  priority
                />
              </div>
              
              <p className="text-gray-300 mb-4 leading-relaxed">
                Solve data puzzles, quizzes, and IQ challenges inside our investigation room.
              </p>
              
              <p className="text-yellow-400 font-medium mb-6">
                Solve at least 5 problems to start indoor missions
              </p>
              
              <div className="flex gap-4 justify-center">
                <button 
                  onClick={() => handleMissionStart('indoor')}
                  className="mission-button bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  aria-label="Start indoor mission with puzzle-solving challenges"
                >
                  <Play className="inline-block w-4 h-4 mr-2" aria-hidden="true" />
                  Step Inside
                </button>
              </div>
            </section>

            {/* Third Division - Outdoor Mission */}
            <section className="game-card bg-gray-800/50 rounded-2xl p-20 text-center" aria-labelledby="outdoor-mission">
              <h2 id="outdoor-mission" className="text-2xl font-bold text-red-400 mb-6">Outdoor Mission</h2>
              
              {/* Outdoor Mission Image */}
              <div className="w-48 h-48 mx-auto mb-6 rounded-2xl overflow-hidden border-2 border-red-400/30">
                <Image
                  src="/outdoor.jpg"
                  alt="Outdoor mission illustration showing exploration and field activities with map markers"
                  width={192}
                  height={192}
                  className="w-full h-full object-cover"
                  priority
                />
              </div>
              
              <p className="text-gray-300 mb-4 leading-relaxed">
                Step outside, hunt for real-world clues, and uncover mysteries in the field.
              </p>
              
              <p className="text-red-400 font-medium mb-6">
                Carefully follow all instructions. Best of Luck!
              </p>
              
              <div className="flex gap-4 justify-center">
                <button 
                  onClick={() => handleMissionStart('outdoor')}
                  className="mission-button bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  aria-label="Start outdoor mission with real-world exploration challenges"
                >
                  <MapPin className="inline-block w-4 h-4 mr-2" aria-hidden="true" />
                  Let&apos;s Explore
                </button>
              </div>
            </section>
          </div>

          {/* Back to Landing Page */}
          <div className="text-center mt-12">
            <Link
              href="/team-dashboard"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/25 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            >
              ← Back to Game Landing
            </Link>
          </div>
        </div>
      </main>

      {/* Instruction Modal */}
      <InstructionModal
        isOpen={isInstructionModalOpen}
        onClose={() => setIsInstructionModalOpen(false)}
      />
    </div>
  );
}