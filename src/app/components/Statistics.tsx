// Statistics.tsx - Player statistics dashboard
import React from "react";
import { motion } from "motion/react";
import { X, Trophy, Target, Clock, TrendingUp, Award, Zap } from "lucide-react";

interface StatisticsProps {
  isOpen: boolean;
  onClose: () => void;
  stats: {
    totalGuesses: number;
    correctGuesses: number;
    wrongGuesses: number;
    hintsUsed: number;
    currentStreak: number;
    bestStreak: number;
    countriesFound: number;
    totalCountries: number;
    accuracy: number;
    averageHintsPerCountry: number;
  };
}

export function Statistics({ isOpen, onClose, stats }: StatisticsProps) {
  if (!isOpen) return null;

  const {
    totalGuesses,
    correctGuesses,
    wrongGuesses,
    hintsUsed,
    currentStreak,
    bestStreak,
    countriesFound,
    totalCountries,
    accuracy,
    averageHintsPerCountry,
  } = stats;

  const progressPercentage = (countriesFound / totalCountries) * 100;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", damping: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Trophy className="w-8 h-8 text-yellow-300" />
              <h2 className="text-2xl md:text-3xl font-bold text-white">Your Statistics</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Progress Bar */}
          <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Overall Progress
              </span>
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {countriesFound}/{totalCountries}
              </span>
            </div>
            <div className="w-full bg-slate-300 dark:bg-slate-700 rounded-full h-4 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
              />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              {progressPercentage.toFixed(1)}% of the world discovered
            </p>
          </div>

          {/* Main Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Accuracy */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-5 border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span className="text-sm font-semibold text-green-900 dark:text-green-100">
                  Accuracy
                </span>
              </div>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {accuracy.toFixed(1)}%
              </p>
              <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                {correctGuesses} correct / {totalGuesses} total
              </p>
            </div>

            {/* Current Streak */}
            <div className="bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-2xl p-5 border border-orange-200 dark:border-orange-800">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                <span className="text-sm font-semibold text-orange-900 dark:text-orange-100">
                  Current Streak
                </span>
              </div>
              <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                {currentStreak}
              </p>
              <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">
                Best: {bestStreak}
              </p>
            </div>

            {/* Hints Used */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl p-5 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                  Hints Used
                </span>
              </div>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {hintsUsed}
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                {averageHintsPerCountry.toFixed(1)} per country
              </p>
            </div>

            {/* Wrong Guesses */}
            <div className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-2xl p-5 border border-red-200 dark:border-red-800">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-red-600 dark:text-red-400" />
                <span className="text-sm font-semibold text-red-900 dark:text-red-100">
                  Mistakes
                </span>
              </div>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                {wrongGuesses}
              </p>
              <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                Room to improve!
              </p>
            </div>
          </div>

          {/* Fun Facts */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-5 border border-purple-200 dark:border-purple-800">
            <h3 className="font-bold text-purple-900 dark:text-purple-100 mb-3 flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Your Journey
            </h3>
            <div className="space-y-2 text-sm text-purple-800 dark:text-purple-200">
              <p>
                🌍 You've explored <strong>{progressPercentage.toFixed(0)}%</strong> of the world
              </p>
              <p>
                🎯 Your accuracy is <strong>{accuracy > 80 ? "excellent" : accuracy > 60 ? "good" : "improving"}</strong>
              </p>
              <p>
                🔥 {currentStreak > 5 ? `Amazing ${currentStreak} country streak!` : "Keep going to build a streak!"}
              </p>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold shadow-md transition-all active:scale-95"
          >
            Continue Playing
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}