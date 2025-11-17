'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { CheckCircle2, Clock, Award, ArrowLeft, Lightbulb } from 'lucide-react';
import { getTeamSession, isTeamSessionValid } from '@/lib/auth-api';
import { syncTeamScoreToAppwrite } from '@/lib/score-sync';
import { databases, DATABASE_ID, QUESTION_SET_COLLECTION_ID } from '@/lib/appwrite';
import { Query } from 'appwrite';
import { getTeamByCode } from '@/lib/teams';

// Question type definition
interface Question {
  id: string;
  question: string;
  correctAnswer: string; // Changed to string for text answers
  alternativeAnswers?: string[]; // Array of alternative correct answers
  points: number;
  hint?: string; // Optional hint
}

// Answer state type
interface AnswerState {
  [key: string]: {
    answered: boolean;
    correct: boolean;
    userAnswer: string;
  };
}

export default function IndoorMissionPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answerStates, setAnswerStates] = useState<AnswerState>({});
  const [loading, setLoading] = useState(true);
  const [userAnswers, setUserAnswers] = useState<{ [key: string]: string }>({});
  const [showHint, setShowHint] = useState<{ [key: string]: boolean }>({});
  const [totalScore, setTotalScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [teamCode, setTeamCode] = useState<string | null>(null);
  const [isTeamLoggedIn, setIsTeamLoggedIn] = useState(false);
  const [showHintModal, setShowHintModal] = useState(false);
  const [pendingHintQuestionId, setPendingHintQuestionId] = useState<string | null>(null);
  const [errorShake, setErrorShake] = useState<{ [key: string]: boolean }>({});

  const loadAnswerStates = (teamCodeParam?: string, questionsParam?: Question[]) => {
    try {
      // Use team-specific storage key if team is logged in
      const storageKey = teamCodeParam 
        ? `indoorMissionAnswers_${teamCodeParam}` 
        : 'indoorMissionAnswers';
      
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
        
        // Load hint usage and deduct points
        const hintsKey = teamCodeParam 
          ? `indoorMissionHints_${teamCodeParam}` 
          : 'indoorMissionHints';
        const storedHints = localStorage.getItem(hintsKey);
        if (storedHints) {
          const hintsUsed = JSON.parse(storedHints);
          setShowHint(hintsUsed);
          
          // Deduct 2 points for each hint used
          const hintCount = Object.keys(hintsUsed).length;
          score = Math.max(0, score - (hintCount * 2));
        }
        
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
            console.log(`[Indoor Mission] Initializing sync for team ${currentTeamCode}, current score: ${currentScore}`);
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
      // Get team's indoor question set filter if team is logged in
      let questionSetFilter: string | null = null;
      let hasNoSetAssigned = false;
      
      if (currentTeamCode) {
        try {
          const team = await getTeamByCode(currentTeamCode);
          if (team && team.indoorQuestionSetId && String(team.indoorQuestionSetId).trim() !== '') {
            questionSetFilter = team.indoorQuestionSetId;
            console.log(`[Indoor Mission] Team ${currentTeamCode} assigned to indoor question set: ${questionSetFilter}`);
          } else {
            // Team has no question set assigned - should see NO questions
            hasNoSetAssigned = true;
            console.log(`[Indoor Mission] Team ${currentTeamCode} has no indoor question set assigned (showing no questions)`);
          }
        } catch (error) {
          console.error('Error fetching team indoor question set:', error);
        }
      }

      // If team has no set assigned, return empty array immediately
      if (hasNoSetAssigned) {
        console.log(`[Indoor Mission] Returning 0 questions - team has no set assigned`);
        setQuestions([]);
        setTotalQuestions(0);
        setLoading(false);
        return [];
      }

      // Build query with optional question set filter
      const queries = [Query.orderDesc('$createdAt')];
      // Only filter by set if a specific set is assigned
      if (questionSetFilter && questionSetFilter.trim() !== '') {
        queries.push(Query.equal('set', questionSetFilter));
        console.log(`[Indoor Mission] Filtering questions by set: ${questionSetFilter}`);
      } else {
        // No team logged in - show all questions for individual players
        console.log(`[Indoor Mission] No team logged in - showing all questions`);
      }

      // Fetch questions from Appwrite
      const response = await databases.listDocuments(
        DATABASE_ID,
        QUESTION_SET_COLLECTION_ID,
        queries
      );

      if (response.documents.length > 0) {
        // Transform Appwrite documents to Question format
        const loadedQuestions: Question[] = response.documents.map((doc) => ({
          id: doc.$id,
          question: Array.isArray(doc.question) ? doc.question[0] : doc.question,
          correctAnswer: doc.correctAnswer as string,
          alternativeAnswers: (doc.alternativeAnswers as string[]) || [],
          points: doc.points as number,
          hint: doc.hint && Array.isArray(doc.hint) && doc.hint.length > 0 ? doc.hint[0] : undefined
        }));

        console.log(`[Indoor Mission] Loaded ${loadedQuestions.length} questions${questionSetFilter ? ` from set '${questionSetFilter}'` : ''}`);
        
        setQuestions(loadedQuestions);
        setTotalQuestions(loadedQuestions.length);
        setLoading(false);
        return loadedQuestions;
      } else {
        // No questions in Appwrite
        console.log(`[Indoor Mission] No questions found${questionSetFilter ? ` for set '${questionSetFilter}'` : ''}`);
        setQuestions([]);
        setTotalQuestions(0);
        setLoading(false);
        return [];
      }
    } catch (error) {
      console.error('Error loading questions from Appwrite:', error);
      // If Appwrite fails, show empty state
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
    
    // Check if answer matches correct answer or any alternative answer
    let isCorrect = normalizedUserAnswer === normalizedCorrectAnswer;
    
    // If not correct, check alternative answers
    if (!isCorrect && question.alternativeAnswers && question.alternativeAnswers.length > 0) {
      isCorrect = question.alternativeAnswers.some(
        altAnswer => altAnswer.trim().toLowerCase() === normalizedUserAnswer
      );
    }

    // If incorrect, trigger error animation and clear input
    if (!isCorrect) {
      setErrorShake({ ...errorShake, [questionId]: true });
      
      // Clear the input field
      setUserAnswers(prev => ({
        ...prev,
        [questionId]: ''
      }));
      
      // Remove shake animation after 600ms
      setTimeout(() => {
        setErrorShake({ ...errorShake, [questionId]: false });
      }, 600);
      
      return; // Don't update answer states for incorrect answers
    }

    // Update answer states for correct answers only
    const newAnswerStates = {
      ...answerStates,
      [questionId]: {
        answered: true,
        correct: isCorrect,
        userAnswer: userAnswer
      }
    };

    setAnswerStates(newAnswerStates);

    // Recalculate total score from scratch (to account for hints)
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
      
      // Deduct points for hints used
      const hintsKey = teamCode 
        ? `indoorMissionHints_${teamCode}` 
        : 'indoorMissionHints';
      const storedHints = localStorage.getItem(hintsKey);
      if (storedHints) {
        const hintsUsed = JSON.parse(storedHints);
        const hintCount = Object.keys(hintsUsed).length;
        newTotalScore = Math.max(0, newTotalScore - (hintCount * 2));
      }
      
      setTotalScore(newTotalScore);
      
      // Update team's score in Appwrite if team is logged in
      if (isTeamLoggedIn && teamCode) {
        try {
          // Sync the total score to Appwrite
          await syncTeamScoreToAppwrite(teamCode);
          console.log(`Updated team ${teamCode} indoor score`);
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
      ? `indoorMissionAnswers_${teamCode}` 
      : 'indoorMissionAnswers';
    localStorage.setItem(storageKey, JSON.stringify(newAnswerStates));
  };

  const handleShowHint = (questionId: string) => {
    setPendingHintQuestionId(questionId);
    setShowHintModal(true);
  };

  const confirmShowHint = async () => {
    if (!pendingHintQuestionId) return;

    // Calculate new score after deduction
    const newScore = Math.max(0, totalScore - 2);
    
    // Deduct 2 points from local score
    setTotalScore(newScore);

    // Show the hint
    setShowHint(prev => ({
      ...prev,
      [pendingHintQuestionId]: true
    }));

    // Save hint usage to localStorage with team-specific key
    const storageKey = teamCode 
      ? `indoorMissionHints_${teamCode}` 
      : 'indoorMissionHints';
    
    // Get existing hints
    const existingHints = JSON.parse(localStorage.getItem(storageKey) || '{}');
    existingHints[pendingHintQuestionId] = true;
    localStorage.setItem(storageKey, JSON.stringify(existingHints));

    // If team is logged in, sync the new score to Appwrite
    if (isTeamLoggedIn && teamCode) {
      try {
        // Sync the new total score to Appwrite
        await syncTeamScoreToAppwrite(teamCode);
        console.log(`Deducted 2 points from team ${teamCode}, new score: ${newScore}`);
      } catch (error) {
        console.error('Error deducting points from team:', error);
      }
    }

    // Close modal and reset
    setShowHintModal(false);
    setPendingHintQuestionId(null);
  };

  const cancelShowHint = () => {
    setShowHintModal(false);
    setPendingHintQuestionId(null);
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
                Indoor Mission
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
              <Lightbulb className="w-6 h-6 text-cyan-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-2">Mission Objective</h2>
              <p className="text-gray-300 leading-relaxed">
                Welcome to the Indoor Mission! Type your answers in the text boxes below to test your knowledge and skills. 
                Each correct answer earns you points. Use the <span className="text-yellow-400 font-semibold">Hint</span> button if you need help, 
                but be aware that using a hint will <span className="text-red-400 font-semibold">deduct 2 points</span> from your score. 
                Once you submit a correct answer, the box will turn 
                <span className="text-green-400 font-semibold"> green </span> and you cannot change it. 
                For incorrect answers, you can try again. Good luck!
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
              const hintShown = showHint[question.id] || false;

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
                      <h3 className="text-xl font-semibold text-white leading-relaxed whitespace-pre-wrap break-words">
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
                          : errorShake[question.id]
                          ? 'bg-red-900/30 border-red-500 text-red-300 placeholder-red-400 animate-shake'
                          : 'bg-gray-800/50 border-gray-600 text-white placeholder-gray-500 focus:border-cyan-500 focus:ring-cyan-500/30'
                      }`}
                    />
                  </div>

                  {/* Hint Display */}
                  {hintShown && question.hint && !isCorrect && (
                    <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                      <div className="flex items-start gap-2">
                        <Lightbulb className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-yellow-400 font-medium text-sm mb-1">Hint:</p>
                          <p className="text-gray-300 text-sm">{question.hint}</p>
                        </div>
                      </div>
                    </div>
                  )}

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
                      
                      {question.hint && !hintShown && (
                        <button
                          onClick={() => handleShowHint(question.id)}
                          className="px-6 py-3 rounded-xl font-semibold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/30 transition-all duration-300"
                        >
                          <Lightbulb className="w-4 h-4 inline-block mr-2" />
                          Hint
                        </button>
                      )}
                    </div>
                  )}

                  {/* Success Message */}
                  {isCorrect && (
                    <div className="mt-4 p-4 rounded-xl border bg-green-900/20 border-green-500/30 text-green-300">
                      <div className="flex items-center gap-2">
                        <Award className="w-5 h-5" />
                        <span className="font-medium">
                          Excellent! You earned {question.points} points
                          {hintShown && <span className="text-yellow-300"> (-2 for hint = {question.points - 2} net points)</span>}! 🎉
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

      {/* Hint Confirmation Modal */}
      {showHintModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border border-yellow-500/30 rounded-2xl p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="text-center">
              {/* Warning Icon */}
              <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lightbulb className="w-8 h-8 text-yellow-400" />
              </div>

              {/* Title */}
              <h3 className="text-2xl font-bold text-white mb-3">
                Use Hint?
              </h3>

              {/* Message */}
              <p className="text-gray-300 mb-2">
                Using a hint will deduct <span className="text-red-400 font-bold">2 points</span> from your score.
              </p>
              <p className="text-gray-400 text-sm mb-6">
                Are you sure you want to continue?
              </p>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={cancelShowHint}
                  className="flex-1 px-6 py-3 bg-gray-700 text-white rounded-xl hover:bg-gray-600 transition-all font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmShowHint}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl hover:from-yellow-400 hover:to-orange-400 transition-all font-semibold shadow-lg"
                >
                  Yes, I&apos;m Sure
                </button>
              </div>

              {/* Note */}
              <p className="text-xs text-gray-500 mt-4">
                Current Score: <span className="text-cyan-400 font-semibold">{totalScore} points</span>
                {totalScore >= 2 ? (
                  <span className="text-gray-400"> → Will become {totalScore - 2} points</span>
                ) : (
                  <span className="text-red-400"> → Will become 0 points (minimum)</span>
                )}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
