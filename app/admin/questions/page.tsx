'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Trash2, Edit2, Save, X, Eye, Download, Upload } from 'lucide-react';

interface Question {
  id: string;
  question: string;
  correctAnswer: string; // Changed to string for text answers
  points: number;
  hint?: string; // Optional hint
}

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states for new/edit question
  const [formData, setFormData] = useState({
    question: '',
    correctAnswer: '',
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

  const loadQuestions = () => {
    const stored = localStorage.getItem('indoorMissionQuestions');
    if (stored) {
      setQuestions(JSON.parse(stored));
    }
  };

  const saveQuestions = (updatedQuestions: Question[]) => {
    localStorage.setItem('indoorMissionQuestions', JSON.stringify(updatedQuestions));
    setQuestions(updatedQuestions);
  };

  const handleAddQuestion = () => {
    if (!formData.question || !formData.correctAnswer) {
      alert('Please fill in both the question and the correct answer!');
      return;
    }

    const newQuestion: Question = {
      id: `q${Date.now()}`,
      question: formData.question,
      correctAnswer: formData.correctAnswer,
      points: formData.points,
      hint: formData.hint || undefined
    };

    const updatedQuestions = [...questions, newQuestion];
    saveQuestions(updatedQuestions);
    resetForm();
    setShowAddForm(false);
    alert('Question added successfully!');
  };

  const handleEditQuestion = () => {
    if (!editingQuestion) return;

    const updatedQuestion: Question = {
      ...editingQuestion,
      question: formData.question,
      correctAnswer: formData.correctAnswer,
      points: formData.points,
      hint: formData.hint || undefined
    };

    const updatedQuestions = questions.map(q => 
      q.id === editingQuestion.id ? updatedQuestion : q
    );
    
    saveQuestions(updatedQuestions);
    setEditingQuestion(null);
    resetForm();
    alert('Question updated successfully!');
  };

  const handleDeleteQuestion = (id: string) => {
    if (confirm('Are you sure you want to delete this question?')) {
      const updatedQuestions = questions.filter(q => q.id !== id);
      saveQuestions(updatedQuestions);
      alert('Question deleted successfully!');
    }
  };

  const startEditing = (question: Question) => {
    setEditingQuestion(question);
    setFormData({
      question: question.question,
      correctAnswer: question.correctAnswer,
      hint: question.hint || '',
      points: question.points
    });
    setShowAddForm(false);
  };

  const resetForm = () => {
    setFormData({
      question: '',
      correctAnswer: '',
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

  const importQuestions = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        if (Array.isArray(imported)) {
          saveQuestions(imported);
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
              Question Management
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
            questions.map((question, index) => (
              <div
                key={question.id}
                className="bg-gray-800/50 backdrop-blur-xl border border-cyan-500/20 rounded-xl p-6 hover:border-cyan-500/40 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="bg-cyan-500/20 text-cyan-400 px-3 py-1 rounded-full text-sm font-semibold">
                        Q{index + 1}
                      </span>
                      <span className="text-gray-400 text-sm">{question.points} pts</span>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-3">{question.question}</h3>
                    <div className="space-y-2">
                      <div className="p-3 rounded-lg bg-green-500/20 border border-green-500/30">
                        <span className="text-xs text-green-300 font-medium uppercase tracking-wide">Correct Answer:</span>
                        <p className="text-green-100 mt-1 font-medium">{question.correctAnswer}</p>
                      </div>
                      
                      {question.hint && (
                        <div className="p-3 rounded-lg bg-blue-500/20 border border-blue-500/30">
                          <span className="text-xs text-blue-300 font-medium uppercase tracking-wide">Hint:</span>
                          <p className="text-blue-100 mt-1">{question.hint}</p>
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
                      onClick={() => handleDeleteQuestion(question.id)}
                      className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
