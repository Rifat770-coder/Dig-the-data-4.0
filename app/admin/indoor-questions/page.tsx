'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Trash2, Edit2, Save, X, Eye, Download, Upload } from 'lucide-react';
import { databases, DATABASE_ID, QUESTION_SET_COLLECTION_ID } from '@/lib/appwrite';
import { ID, Query } from 'appwrite';

interface QuestionSet {
  $id?: string;
  set: string; // Question set name
  question: string[]; // Array type in Appwrite
  correctAnswer: string; // Changed to string for text answers
  alternativeAnswers?: string[]; // Array of alternative correct answers
  points: number;
  hint?: string[]; // Array type in Appwrite
}

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState<QuestionSet[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [editingQuestion, setEditingQuestion] = useState<QuestionSet | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedSetFilter, setSelectedSetFilter] = useState<string>('All Sets');

  // Form states for new/edit question
  const [formData, setFormData] = useState({
    set: 'Default Set',
    question: '',
    correctAnswer: '',
    alternativeAnswers: '',
    hint: '',
    points: 20
  });

  const ADMIN_PASSWORD = 'nccrifat';

  useEffect(() => {
    const authenticated = sessionStorage.getItem('adminQuestionsAuth');
    if (authenticated === 'true') {
      setIsAuthenticated(true);
      loadQuestions();
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setAuthError('');
      sessionStorage.setItem('adminQuestionsAuth', 'true');
      loadQuestions();
    } else {
      setAuthError('Invalid password. Please try again.');
      setPassword('');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('adminQuestionsAuth');
    setPassword('');
  };

  const loadQuestions = async () => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        QUESTION_SET_COLLECTION_ID,
        [Query.orderDesc('$createdAt')]
      );
      setQuestions(response.documents as unknown as QuestionSet[]);
    } catch (error) {
      console.error('Error loading questions:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.log('Database ID:', DATABASE_ID);
      console.log('Collection ID:', QUESTION_SET_COLLECTION_ID);
      alert(`Failed to load questions from Appwrite.\n\nError: ${errorMessage}\n\nPlease check Appwrite collection permissions allow "Any" role to Read documents.`);
    }
  };

  const handleAddQuestion = async () => {
    if (!formData.question || !formData.correctAnswer) {
      alert('Please fill in both the question and the correct answer!');
      return;
    }

    try {
      const alternativeAnswersArray = formData.alternativeAnswers
        .split('\n')
        .map(ans => ans.trim())
        .filter(ans => ans.length > 0);

      const newQuestion = {
        set: formData.set,
        question: [formData.question], // Array format for Appwrite
        correctAnswer: formData.correctAnswer,
        alternativeAnswers: alternativeAnswersArray,
        points: formData.points,
        hint: formData.hint ? [formData.hint] : [] // Array format for Appwrite
      };

      await databases.createDocument(
        DATABASE_ID,
        QUESTION_SET_COLLECTION_ID,
        ID.unique(),
        newQuestion
      );

      await loadQuestions();
      resetForm();
      setShowAddForm(false);
      alert('Question added successfully!');
    } catch (error) {
      console.error('Error adding question:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to add question to Appwrite.\n\nError: ${errorMessage}\n\nPlease check:\n1. Appwrite collection permissions allow "Any" role to Create documents\n2. Database and Collection IDs are correct\n3. All required fields are provided`);
    }
  };

  const handleEditQuestion = async () => {
    if (!editingQuestion || !editingQuestion.$id) return;

    try {
      const alternativeAnswersArray = formData.alternativeAnswers
        .split('\n')
        .map(ans => ans.trim())
        .filter(ans => ans.length > 0);

      const updatedQuestion = {
        set: formData.set,
        question: [formData.question], // Array format for Appwrite
        correctAnswer: formData.correctAnswer,
        alternativeAnswers: alternativeAnswersArray,
        points: formData.points,
        hint: formData.hint ? [formData.hint] : [] // Array format for Appwrite
      };

      await databases.updateDocument(
        DATABASE_ID,
        QUESTION_SET_COLLECTION_ID,
        editingQuestion.$id,
        updatedQuestion
      );

      await loadQuestions();
      setEditingQuestion(null);
      resetForm();
      alert('Question updated successfully!');
    } catch (error) {
      console.error('Error updating question:', error);
      alert('Failed to update question in Appwrite');
    }
  };

  const handleDeleteQuestion = async (docId: string) => {
    if (confirm('Are you sure you want to delete this question?')) {
      try {
        await databases.deleteDocument(
          DATABASE_ID,
          QUESTION_SET_COLLECTION_ID,
          docId
        );
        
        await loadQuestions();
        alert('Question deleted successfully!');
      } catch (error) {
        console.error('Error deleting question:', error);
        alert('Failed to delete question from Appwrite');
      }
    }
  };

  const startEditing = (question: QuestionSet) => {
    setEditingQuestion(question);
    setFormData({
      set: question.set,
      question: question.question[0] || '', // Get first element from array
      correctAnswer: question.correctAnswer,
      alternativeAnswers: question.alternativeAnswers ? question.alternativeAnswers.join('\n') : '',
      hint: question.hint && question.hint.length > 0 ? question.hint[0] : '', // Get first element from array
      points: question.points
    });
    setShowAddForm(false);
  };

  const resetForm = () => {
    setFormData({
      set: 'Default Set',
      question: '',
      correctAnswer: '',
      alternativeAnswers: '',
      hint: '',
      points: 20
    });
  };

  const cancelEditing = () => {
    setEditingQuestion(null);
    setShowAddForm(false);
    resetForm();
  };

  const exportQuestions = () => {
    const dataStr = JSON.stringify(questions, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `questions-${Date.now()}.json`;
    link.click();
  };

  const importQuestions = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        if (Array.isArray(imported)) {
          // Import each question to Appwrite
          for (const question of imported) {
            try {
              await databases.createDocument(
                DATABASE_ID,
                QUESTION_SET_COLLECTION_ID,
                ID.unique(),
                {
                  set: question.set,
                  question: Array.isArray(question.question) ? question.question : [question.question],
                  correctAnswer: question.correctAnswer,
                  points: question.points,
                  hint: question.hint ? (Array.isArray(question.hint) ? question.hint : [question.hint]) : []
                }
              );
            } catch (error) {
              console.error('Error importing question:', error);
            }
          }
          await loadQuestions();
          alert('Questions imported successfully!');
        } else {
          alert('Invalid file format!');
        }
      } catch {
        alert('Error parsing file!');
      }
    };
    reader.readAsText(file);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center p-4">
        <div className="bg-gray-800/80 backdrop-blur-xl border border-cyan-500/20 rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2">
              Question Admin Access
            </h1>
            <p className="text-gray-300">Enter password to manage questions</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-cyan-300 mb-2">
                Admin Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                placeholder="Enter admin password"
              />
            </div>

            {authError && (
              <div className="p-4 rounded-lg border bg-red-900/30 text-red-300 border-red-500/30">
                {authError}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-3 rounded-lg font-semibold hover:from-cyan-400 hover:to-blue-400 transition-all"
            >
              Access Dashboard
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/admin" className="text-cyan-400 hover:text-cyan-300 transition-colors text-sm">
              ← Back to Admin
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Indoor Questions Management
            </h1>
            <p className="text-gray-400 mt-2">Manage Indoor Mission Questions</p>
          </div>
          
          <div className="flex gap-3 flex-wrap">
            <Link
              href="/indoor-mission"
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              Preview Mission
            </Link>
            <button
              onClick={exportQuestions}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <label className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 cursor-pointer">
              <Upload className="w-4 h-4" />
              Import
              <input
                type="file"
                accept=".json"
                onChange={importQuestions}
                className="hidden"
              />
            </label>
            <Link
              href="/admin"
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              ← Admin Panel
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="flex justify-center mb-8">
          <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-8 shadow-xl">
            <h3 className="text-cyan-300 text-sm font-medium uppercase tracking-wider text-center">Total Questions</h3>
            <p className="text-5xl font-bold text-white mt-3 text-center">{questions.length}</p>
          </div>
        </div>

        {/* Set Filter */}
        {questions.length > 0 && !showAddForm && !editingQuestion && (
          <div className="mb-6 bg-gray-800/50 backdrop-blur-xl border border-cyan-500/20 rounded-xl p-4">
            <label className="block text-sm font-medium text-cyan-300 mb-3">
              Filter by Set
            </label>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSelectedSetFilter('All Sets')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedSetFilter === 'All Sets'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                All Sets ({questions.length})
              </button>
              {Array.from(new Set(questions.map(q => q.set))).map((setName, idx) => {
                const count = questions.filter(q => q.set === setName).length;
                return (
                  <button
                    key={`set-${setName}-${idx}`}
                    onClick={() => setSelectedSetFilter(setName)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      selectedSetFilter === setName
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {setName} ({count})
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Add Question Button */}
        {!showAddForm && !editingQuestion && (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full mb-6 p-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-semibold hover:from-cyan-400 hover:to-blue-400 transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add New Question
          </button>
        )}

        {/* Add/Edit Form */}
        {(showAddForm || editingQuestion) && (
          <div className="bg-gray-800/50 backdrop-blur-xl border border-cyan-500/20 rounded-xl p-6 mb-6">
            <h2 className="text-2xl font-bold text-white mb-6">
              {editingQuestion ? 'Edit Question' : 'Add New Question'}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-cyan-300 mb-2">
                  Set *
                </label>
                <input
                  type="text"
                  value={formData.set}
                  onChange={(e) => setFormData({ ...formData, set: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500"
                  placeholder="Enter question set name (e.g., Indoor Mission, Quiz 1)"
                  list="set-suggestions"
                />
                <datalist id="set-suggestions">
                  {Array.from(new Set(questions.map(q => q.set))).map((setName, idx) => (
                    <option key={`datalist-${setName}-${idx}`} value={setName} />
                  ))}
                </datalist>
                <p className="text-xs text-gray-400 mt-1">Group related questions together using the same set name</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-cyan-300 mb-2">
                  Question Text *
                </label>
                <textarea
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 resize-none"
                  rows={3}
                  placeholder="Enter your question here..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-cyan-300 mb-2">
                  Correct Answer (Text) *
                </label>
                <input
                  type="text"
                  value={formData.correctAnswer}
                  onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500"
                  placeholder="Enter the exact correct answer"
                />
                <p className="text-xs text-gray-400 mt-1">Type the exact answer (case-insensitive matching)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-cyan-300 mb-2">
                  Alternative Answers (Optional)
                </label>
                <textarea
                  value={formData.alternativeAnswers}
                  onChange={(e) => setFormData({ ...formData, alternativeAnswers: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 resize-none"
                  rows={4}
                  placeholder="Enter alternative correct answers (one per line)&#10;Example:&#10;answer 1&#10;answer 2&#10;answer 3"
                />
                <p className="text-xs text-gray-400 mt-1">Add alternative correct answers, one per line. Any of these will be accepted as correct.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-cyan-300 mb-2">
                  Hint (Optional)
                </label>
                <textarea
                  value={formData.hint}
                  onChange={(e) => setFormData({ ...formData, hint: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 resize-none"
                  rows={2}
                  placeholder="Provide a hint to help users..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-cyan-300 mb-2">
                  Points *
                </label>
                <input
                  type="number"
                  value={formData.points}
                  onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500"
                  min="0"
                  step="5"
                  placeholder="10"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={editingQuestion ? handleEditQuestion : handleAddQuestion}
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-3 rounded-lg font-semibold hover:from-cyan-400 hover:to-blue-400 transition-all flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  {editingQuestion ? 'Update Question' : 'Add Question'}
                </button>
                <button
                  onClick={cancelEditing}
                  className="px-6 bg-gray-700 text-white py-3 rounded-lg font-semibold hover:bg-gray-600 transition-all flex items-center gap-2"
                >
                  <X className="w-5 h-5" />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Questions List */}
        <div className="space-y-4">
          {questions.length === 0 ? (
            <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-12 text-center">
              <p className="text-gray-400 text-lg">No questions yet. Add your first question!</p>
            </div>
          ) : (
            <>
              {selectedSetFilter !== 'All Sets' && (
                <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 text-center">
                  <p className="text-purple-300">
                    Showing {questions.filter(q => q.set === selectedSetFilter).length} question(s) from set: <span className="font-bold">{selectedSetFilter}</span>
                  </p>
                </div>
              )}
              {questions
                .filter(q => selectedSetFilter === 'All Sets' || q.set === selectedSetFilter)
                .map((question, index) => (
                  <div
                    key={question.$id || index}
                    className="bg-gray-800/50 backdrop-blur-xl border border-cyan-500/20 rounded-xl p-6 hover:border-cyan-500/40 transition-all"
                  >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="bg-cyan-500/20 text-cyan-400 px-3 py-1 rounded-full text-sm font-semibold">
                        Q{index + 1}
                      </span>
                      <span className="bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full text-sm font-semibold">
                        {question.set || 'No Set'}
                      </span>
                      <span className="text-gray-400 text-sm">{question.points} pts</span>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-3">{question.question[0]}</h3>
                    <div className="space-y-2">
                      <div className="p-3 rounded-lg bg-green-500/20 border border-green-500/30">
                        <span className="text-xs text-green-300 font-medium uppercase tracking-wide">Correct Answer:</span>
                        <p className="text-green-100 mt-1 font-medium">{question.correctAnswer}</p>
                      </div>
                      
                      {question.hint && question.hint.length > 0 && (
                        <div className="p-3 rounded-lg bg-blue-500/20 border border-blue-500/30">
                          <span className="text-xs text-blue-300 font-medium uppercase tracking-wide">Hint:</span>
                          <p className="text-blue-100 mt-1">{question.hint[0]}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => startEditing(question)}
                      className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => question.$id && handleDeleteQuestion(question.$id)}
                      className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
                ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
