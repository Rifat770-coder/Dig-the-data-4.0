'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { CheckCircle2, Clock, Award, ArrowLeft, MapPin } from 'lucide-react';
import { getTeamSession, isTeamSessionValid } from '@/lib/auth-api';
import { syncTeamScoreToAppwrite } from '@/lib/score-sync';
import { databases, DATABASE_ID } from '@/lib/appwrite';
import { Query } from 'appwrite';

// Question type definition matching Appwrite "outdoor" collection
interface Question {
  $id?: string;
  id: string;
  set: string;
  question: string;
  correctAnswer: string;
  points: number;
}

// Answer state type
interface AnswerState {
  [key: string]: {
    answered: boolean;
    correct: boolean;
    userAnswer: string;
  };
}

export default function OutdoorMissionPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answerStates, setAnswerStates] = useState<AnswerState>({});
  const [loading, setLoading] = useState(true);
  const [userAnswers, setUserAnswers] = useState<{ [key: string]: string }>({});
  const [totalScore, setTotalScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [teamCode, setTeamCode] = useState<string | null>(null);
  const [isTeamLoggedIn, setIsTeamLoggedIn] = useState(false);

  const loadAnswerStates = (teamCodeParam?: string, questionsParam?: Question[]) => {
    try {
      // Use team-specific storage key if team is logged in
      const storageKey = teamCodeParam 
        ? `outdoorMissionAnswers_${teamCodeParam}` 
        : 'outdoorMissionAnswers';
      
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        setAnswerStates(parsed);
        
        // Calculate scores using provided questions or current state
        const questionsToUse = questionsParam || questions;
        let correct = 0;
        let score = 0;
        Object.keys(parsed).forEach((key) => {
          const state = parsed[key] as { answered: boolean; correct: boolean; userAnswer: string };
          if (state.correct) {
            correct++;
            const question = questionsToUse.find(q => q.id === key);
            if (question) score += question.points;
          }
        });
        
        setCorrectAnswers(correct);
        setTotalScore(score);
        
        return score; // Return score for syncing
      }
      return 0;
    } catch (error) {
      console.error('Error loading answer states:', error);
      return 0;
    }
  };

  useEffect(() => {
    const initializeGame = async () => {
      // Check if team is logged in
      let currentTeamCode: string | null = null;
      if (isTeamSessionValid()) {
        const session = getTeamSession();
        if (session) {
          currentTeamCode = session.teamCode;
          setTeamCode(currentTeamCode);
          setIsTeamLoggedIn(true);
        }
      }
      
      // Load questions with team code
      const loadedQuestions = await loadQuestions(currentTeamCode);
      
      // Then load answer states with the questions and team code
      if (loadedQuestions && loadedQuestions.length > 0) {
        const currentScore = loadAnswerStates(currentTeamCode || undefined, loadedQuestions);
        
        // Always sync score to Appwrite if team is logged in (even if 0)
        if (currentTeamCode) {
          try {
            console.log(`[Outdoor Mission] Initializing sync for team ${currentTeamCode}, current score: ${currentScore}`);
            await syncTeamScoreToAppwrite(currentTeamCode);
          } catch (error) {
            console.error('Error syncing initial score:', error);
          }
        }
      }
    };
    
    initializeGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadQuestions = async (currentTeamCode?: string | null): Promise<Question[]> => {
    try {
      // Get team's outdoor question set filter if team is logged in
      let questionSetFilter: string | null = null;
      if (currentTeamCode) {
        try {
          const { getTeamByCode } = await import('@/lib/teams');
          const team = await getTeamByCode(currentTeamCode);
          if (team && team.outdoorQuestionSetId) {
            questionSetFilter = team.outdoorQuestionSetId;
            console.log(`[Outdoor Mission] Team ${currentTeamCode} assigned to outdoor question set: ${questionSetFilter}`);
          } else {
            console.log(`[Outdoor Mission] Team ${currentTeamCode} has no specific outdoor question set (showing all)`);
          }
        } catch (error) {
          console.error('Error fetching team outdoor question set:', error);
        }
      }

      // Fetch questions from Appwrite "outdoor" collection
      const OUTDOOR_COLLECTION_ID = 'outdoor';
      
      // Build query with optional question set filter
      const queries = [
        Query.orderAsc('$createdAt'),
        Query.limit(100)
      ];
      if (questionSetFilter) {
        queries.push(Query.equal('set', questionSetFilter));
      }
      
      const response = await databases.listDocuments(
        DATABASE_ID,
        OUTDOOR_COLLECTION_ID,
        queries
      );

      if (response.documents && response.documents.length > 0) {
        // Map Appwrite documents to Question format
        const loadedQuestions: Question[] = response.documents.map((doc) => ({
          $id: doc.$id,
          id: doc.$id, // Use $id as the question id
          set: doc.set as string,
          question: doc.question as string,
          correctAnswer: doc.correctAnswer as string,
          points: doc.points as number
        }));

        setQuestions(loadedQuestions);
        setTotalQuestions(loadedQuestions.length);
        setLoading(false);
        return loadedQuestions;
      } else {
        // No questions in Appwrite collection
        console.log('No outdoor questions found in Appwrite collection');
        setQuestions([]);
        setTotalQuestions(0);
        setLoading(false);
        return [];
      }
    } catch (error) {
      console.error('Error loading questions from Appwrite:', error);
      setQuestions([]);
      setTotalQuestions(0);
      setLoading(false);
      return [];
    }
  };



  const handleAnswerChange = (questionId: string, answer: string) => {
    // Don't allow changing if already answered correctly
    if (answerStates[questionId]?.correct) {
      return;
    }

    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleSubmitAnswer = async (questionId: string) => {
    const question = questions.find(q => q.id === questionId);
    const userAnswer = userAnswers[questionId];

    if (!question || !userAnswer || userAnswer.trim() === '') {
      alert('Please enter an answer before submitting!');
      return;
    }

    // Normalize answers for comparison (case-insensitive, trim whitespace)
    const normalizedUserAnswer = userAnswer.trim().toLowerCase();
    const normalizedCorrectAnswer = question.correctAnswer.trim().toLowerCase();
    
    const isCorrect = normalizedUserAnswer === normalizedCorrectAnswer;

    // Update answer states
    const newAnswerStates = {
      ...answerStates,
      [questionId]: {
        answered: true,
        correct: isCorrect,
        userAnswer: userAnswer
      }
    };

    setAnswerStates(newAnswerStates);

    // Recalculate total score from scratch
    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
      
      // Calculate score from all correct answers
      let newTotalScore = 0;
      Object.keys(newAnswerStates).forEach((key) => {
        const state = newAnswerStates[key];
        if (state.correct) {
          const q = questions.find(qu => qu.id === key);
          if (q) newTotalScore += q.points;
        }
      });
      
      setTotalScore(newTotalScore);
      
      // Update team's score in Appwrite if team is logged in
      if (isTeamLoggedIn && teamCode) {
        try {
          // Sync the total score to Appwrite
          await syncTeamScoreToAppwrite(teamCode);
          console.log(`Updated team ${teamCode} outdoor score`);
        } catch (error) {
          console.error('Error updating team score:', error);
          // Don't show error to user - points are still tracked locally
        }
      }
      
      // Reload page after correct answer
      setTimeout(() => {
        window.location.reload();
      }, 200); // 0.2 second delay to show success message
    }

    // Save to localStorage with team-specific key
    const storageKey = teamCode 
      ? `outdoorMissionAnswers_${teamCode}` 
      : 'outdoorMissionAnswers';
    localStorage.setItem(storageKey, JSON.stringify(newAnswerStates));
  };

  const getAnswerBoxClass = (questionId: string) => {
    const state = answerStates[questionId];
    if (!state?.answered) {
      return 'bg-gray-800/50 border-cyan-500/20';
    }
    return state.correct 
      ? 'bg-green-900/30 border-green-500/50 ring-2 ring-green-500/30' 
      : 'bg-red-900/30 border-red-500/50 ring-2 ring-red-500/30';
  };

  const getProgressPercentage = () => {
    return totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading mission...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      {/* Header */}
      <div className="bg-gray-900/95 backdrop-blur-sm border-b border-cyan-500/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/game-interface"
                className="flex items-center gap-2 text-gray-300 hover:text-cyan-400 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Game</span>
              </Link>
              <div className="h-6 w-px bg-gray-700"></div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Outdoor Mission
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              {isTeamLoggedIn && teamCode && (
                <div className="text-right">
                  <div className="text-sm text-gray-400">Team</div>
                  <div className="text-sm font-bold text-yellow-400 font-mono">{teamCode}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mission Brief */}
        <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-2xl p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="bg-cyan-500/20 p-3 rounded-lg">
              <MapPin className="w-6 h-6 text-cyan-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-2">Mission Objective</h2>
              <p className="text-gray-300 leading-relaxed">
                Welcome to the Outdoor Mission! Explore the real world, find clues, and answer the questions based on your observations. 
                Type your answers in the text boxes below. Each correct answer earns you points. 
                Once you submit a correct answer, the box will turn 
                <span className="text-green-400 font-semibold"> green </span> and you cannot change it. 
                For incorrect answers, you can try again. Good luck exploring!
              </p>
              {isTeamLoggedIn && teamCode && (
                <div className="mt-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <p className="text-green-300 text-sm flex items-center gap-2">
                    <span className="text-lg">✓</span>
                    <span>
                      <strong>Team Mode Active:</strong> Your points are being automatically added to team <strong className="font-mono">{teamCode}</strong>&apos;s leaderboard score!
                    </span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-gray-800/50 backdrop-blur-xl border border-cyan-500/20 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-300 font-medium">Progress</span>
            <span className="text-cyan-400 font-bold">{getProgressPercentage().toFixed(0)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
            <div
              className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full transition-all duration-500 ease-out"
              style={{ width: `${getProgressPercentage()}%` }}
            ></div>
          </div>
        </div>

        {/* Questions Grid */}
        {questions.length === 0 ? (
          <div className="bg-gray-800/50 backdrop-blur-xl border border-yellow-500/20 rounded-xl p-12 text-center">
            <Clock className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">No Questions Available</h3>
            <p className="text-gray-400 mb-6">
              The admin hasn&apos;t set up any questions yet. Please check back later or contact your game administrator.
            </p>
            <Link
              href="/game-interface"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-medium hover:from-cyan-400 hover:to-blue-400 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Return to Game Interface
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {questions.map((question, index) => {
              const state = answerStates[question.id];
              const isCorrect = state?.correct;
              const userAnswer = userAnswers[question.id] || '';

              return (
                <div
                  key={question.id}
                  className={`backdrop-blur-xl border rounded-2xl p-6 transition-all duration-500 ${getAnswerBoxClass(question.id)}`}
                >
                  {/* Question Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="bg-cyan-500/20 text-cyan-400 px-3 py-1 rounded-full text-sm font-semibold">
                          Question {index + 1}
                        </span>
                        <span className="text-gray-400 text-sm">
                          {question.points} points
                        </span>
                      </div>
                      <h3 className="text-xl font-semibold text-white leading-relaxed">
                        {question.question}
                      </h3>
                    </div>
                    
                    {/* Status Icon */}
                    {isCorrect && (
                      <div className="ml-4">
                        <CheckCircle2 className="w-8 h-8 text-green-400" />
                      </div>
                    )}
                  </div>

                  {/* Answer Input Box */}
                  <div className="mb-4">
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Your Answer:
                    </label>
                    <input
                      type="text"
                      value={userAnswer}
                      onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                      disabled={isCorrect}
                      placeholder="Type your answer here..."
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 ${
                        isCorrect
                          ? 'bg-green-900/20 border-green-500 text-green-300 cursor-not-allowed'
                          : 'bg-gray-800/50 border-gray-600 text-white placeholder-gray-500 focus:border-cyan-500 focus:ring-cyan-500/30'
                      }`}
                    />
                  </div>

                  {/* Action Buttons */}
                  {!isCorrect && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleSubmitAnswer(question.id)}
                        disabled={!userAnswer.trim()}
                        className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
                          userAnswer.trim()
                            ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-400 hover:to-blue-400 hover:shadow-lg hover:shadow-cyan-500/25'
                            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        Submit Answer
                      </button>
                    </div>
                  )}

                  {/* Success Message */}
                  {isCorrect && (
                    <div className="mt-4 p-4 rounded-xl border bg-green-900/20 border-green-500/30 text-green-300">
                      <div className="flex items-center gap-2">
                        <Award className="w-5 h-5" />
                        <span className="font-medium">
                          Excellent! You earned {question.points} points! 🎉
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
