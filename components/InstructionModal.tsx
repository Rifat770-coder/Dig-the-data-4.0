'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface InstructionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const InstructionModal: React.FC<InstructionModalProps> = ({ isOpen, onClose }) => {
  // Handle escape key press
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
      // Focus the modal when it opens
      const modal = document.getElementById('instruction-modal');
      if (modal) {
        modal.focus();
      }
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <div 
        id="instruction-modal"
        className="relative w-full max-w-4xl max-h-[90vh] mx-4 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-2xl overflow-hidden border border-cyan-500/30"
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-cyan-500/30 bg-gradient-to-r from-slate-800 to-slate-700">
          <h2 id="modal-title" className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center">
              📖
            </div>
            Game Instructions
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            aria-label="Close instruction modal"
          >
            <X size={24} aria-hidden="true" />
          </button>
        </div>

        {/* Content */}
        <div id="modal-description" className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="space-y-6 text-gray-300">
            {/* Welcome Section */}
            <section aria-labelledby="welcome-heading">
              <h3 id="welcome-heading" className="text-xl font-semibold text-cyan-400 mb-3">🎮 Welcome to Mystery Quest!</h3>
              <p className="leading-relaxed">
                Get ready for an exciting adventure that combines logic, teamwork, and mystery-solving! 
                This interactive experience will challenge your problem-solving skills through both indoor puzzles and outdoor exploration.
              </p>
            </section>

            {/* Game Overview */}
            <section aria-labelledby="overview-heading">
              <h3 id="overview-heading" className="text-xl font-semibold text-cyan-400 mb-3">📋 Game Overview</h3>
              <ul className="space-y-2 list-disc list-inside" role="list">
                <li>Two main mission types: Indoor and Outdoor challenges</li>
                <li>Team-based gameplay encouraging collaboration</li>
                <li>Progressive difficulty with multiple puzzle types</li>
                <li>Real-world exploration combined with digital challenges</li>
              </ul>
            </section>

            {/* General Instructions */}
            <section aria-labelledby="instructions-heading">
              <h3 id="instructions-heading" className="text-xl font-semibold text-cyan-400 mb-3">General Instructions</h3>
              <ul className="space-y-2 list-disc list-inside" role="list">
                <li>Read the instruction book properly. Best of luck for your team!</li>
                <li>Work together as a team to solve puzzles and challenges</li>
                <li>Pay attention to details - every clue matters</li>
                <li>Communicate effectively with your team members</li>
                <li>Think outside the box when approaching problems</li>
              </ul>
            </section>

            {/* Indoor Mission */}
            <section>
              <h3 className="text-xl font-semibold text-yellow-400 mb-3">💡 Indoor Mission</h3>
              <div className="bg-slate-800/50 p-4 rounded-lg border border-yellow-400/20">
                <p className="mb-3">
                  <strong>Objective:</strong> Solve data puzzles, quizzes, and IQ challenges inside our investigation room.
                </p>
                <p className="mb-3">
                  <strong>Requirements:</strong> Solve at least 5 problems to start indoor missions.
                </p>
                <ul className="space-y-1 list-disc list-inside text-sm">
                  <li>Use logical thinking and analytical skills</li>
                  <li>Work systematically through each puzzle</li>
                  <li>Don&apos;t hesitate to ask for hints if stuck</li>
                  <li>Time management is crucial</li>
                </ul>
              </div>
            </section>

            {/* Outdoor Mission */}
            <section>
              <h3 className="text-xl font-semibold text-red-400 mb-3">🗺️ Outdoor Mission</h3>
              <div className="bg-slate-800/50 p-4 rounded-lg border border-red-400/20">
                <p className="mb-3">
                  <strong>Objective:</strong> Step outside, hunt for real-world clues, and uncover mysteries in the field.
                </p>
                <p className="mb-3">
                  <strong>Requirements:</strong> Carefully follow all instructions. Best of Luck!
                </p>
                <ul className="space-y-1 list-disc list-inside text-sm">
                  <li>Stay together as a team at all times</li>
                  <li>Follow safety protocols and guidelines</li>
                  <li>Document your findings with photos/notes</li>
                  <li>Be observant of your surroundings</li>
                </ul>
              </div>
            </section>

            {/* Tips for Success */}
            <section>
              <h3 className="text-xl font-semibold text-green-400 mb-3">🎯 Tips for Success</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-slate-800/30 p-4 rounded-lg">
                  <h4 className="font-semibold text-white mb-2">Communication</h4>
                  <p className="text-sm">Share ideas openly and listen to all team members&apos; perspectives.</p>
                </div>
                <div className="bg-slate-800/30 p-4 rounded-lg">
                  <h4 className="font-semibold text-white mb-2">Time Management</h4>
                  <p className="text-sm">Keep track of time and prioritize tasks effectively.</p>
                </div>
                <div className="bg-slate-800/30 p-4 rounded-lg">
                  <h4 className="font-semibold text-white mb-2">Problem Solving</h4>
                  <p className="text-sm">Break complex problems into smaller, manageable parts.</p>
                </div>
                <div className="bg-slate-800/30 p-4 rounded-lg">
                  <h4 className="font-semibold text-white mb-2">Observation</h4>
                  <p className="text-sm">Pay attention to details that others might overlook.</p>
                </div>
              </div>
            </section>

            {/* Safety Guidelines */}
            <section>
              <h3 className="text-xl font-semibold text-orange-400 mb-3">⚠️ Safety Guidelines</h3>
              <div className="bg-orange-900/20 p-4 rounded-lg border border-orange-400/30">
                <ul className="space-y-2 list-disc list-inside">
                  <li>Always inform the game master of your location during outdoor missions</li>
                  <li>Stay within designated areas unless specifically instructed otherwise</li>
                  <li>Report any safety concerns immediately</li>
                  <li>Follow all local laws and regulations</li>
                  <li>Respect private property and public spaces</li>
                </ul>
              </div>
            </section>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-cyan-500/30 bg-gradient-to-r from-slate-800 to-slate-700">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-400">
              Good luck with your missions! 🍀
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors duration-200 font-medium"
            >
              Got it!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructionModal;