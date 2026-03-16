// Achievements.tsx - Achievement system with unlock notifications
import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Trophy, Award, Star, Zap, Target, Globe, Medal, Crown } from "lucide-react";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress?: number;
  total?: number;
}

interface AchievementNotificationProps {
  achievement: Achievement;
  onClose: () => void;
}

export function AchievementNotification({ achievement, onClose }: AchievementNotificationProps) {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'trophy': return <Trophy className="w-12 h-12" />;
      case 'award': return <Award className="w-12 h-12" />;
      case 'star': return <Star className="w-12 h-12" />;
      case 'zap': return <Zap className="w-12 h-12" />;
      case 'target': return <Target className="w-12 h-12" />;
      case 'globe': return <Globe className="w-12 h-12" />;
      case 'medal': return <Medal className="w-12 h-12" />;
      case 'crown': return <Crown className="w-12 h-12" />;
      default: return <Award className="w-12 h-12" />;
    }
  };

  return (
    <motion.div
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      transition={{ type: "spring", damping: 20 }}
      className="fixed top-24 right-6 z-50 pointer-events-auto"
    >
      <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 p-1 rounded-2xl shadow-2xl">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 min-w-[300px]">
          <div className="flex items-start gap-4">
            <div className="text-yellow-500">
              {getIcon(achievement.icon)}
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-yellow-600 dark:text-yellow-400 uppercase tracking-wider mb-1">
                Achievement Unlocked!
              </p>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                {achievement.title}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {achievement.description}
              </p>
            </div>
          </div>
          {/* Progress bar */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 4 }}
            className="h-1 bg-yellow-500 rounded-full mt-4"
          />
        </div>
      </div>
    </motion.div>
  );
}

interface AchievementsListProps {
  achievements: Achievement[];
  isOpen: boolean;
  onClose: () => void;
}

export function AchievementsList({ achievements, isOpen, onClose }: AchievementsListProps) {
  if (!isOpen) return null;

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;
  const progressPercentage = (unlockedCount / totalCount) * 100;

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'trophy': return <Trophy className="w-8 h-8" />;
      case 'award': return <Award className="w-8 h-8" />;
      case 'star': return <Star className="w-8 h-8" />;
      case 'zap': return <Zap className="w-8 h-8" />;
      case 'target': return <Target className="w-8 h-8" />;
      case 'globe': return <Globe className="w-8 h-8" />;
      case 'medal': return <Medal className="w-8 h-8" />;
      case 'crown': return <Crown className="w-8 h-8" />;
      default: return <Award className="w-8 h-8" />;
    }
  };

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
        className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 p-6 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                🏆 Achievements
              </h2>
              <p className="text-white/90 text-sm">
                {unlockedCount} of {totalCount} unlocked ({progressPercentage.toFixed(0)}%)
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors text-white text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-3">
          {achievements.map((achievement) => (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`
                rounded-2xl p-4 border-2 transition-all
                ${achievement.unlocked
                  ? 'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-400 dark:border-yellow-600'
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 opacity-60'
                }
              `}
            >
              <div className="flex items-start gap-4">
                <div className={`
                  ${achievement.unlocked
                    ? 'text-yellow-600 dark:text-yellow-400'
                    : 'text-slate-400 dark:text-slate-600'
                  }
                `}>
                  {getIcon(achievement.icon)}
                </div>
                <div className="flex-1">
                  <h3 className={`
                    text-lg font-bold mb-1
                    ${achievement.unlocked
                      ? 'text-slate-900 dark:text-white'
                      : 'text-slate-600 dark:text-slate-400'
                    }
                  `}>
                    {achievement.title}
                  </h3>
                  <p className={`
                    text-sm mb-2
                    ${achievement.unlocked
                      ? 'text-slate-700 dark:text-slate-300'
                      : 'text-slate-500 dark:text-slate-500'
                    }
                  `}>
                    {achievement.description}
                  </p>
                  
                  {/* Progress bar for locked achievements */}
                  {!achievement.unlocked && achievement.progress !== undefined && achievement.total !== undefined && (
                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 mb-1">
                        <span>Progress</span>
                        <span>{achievement.progress}/{achievement.total}</span>
                      </div>
                      <div className="w-full bg-slate-300 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all"
                          style={{ width: `${(achievement.progress / achievement.total) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                  
                  {achievement.unlocked && (
                    <div className="inline-flex items-center gap-1 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      ✓ Unlocked
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 dark:border-slate-800">
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

// Predefined achievements
export const defaultAchievements: Achievement[] = [
  {
    id: 'first_country',
    title: 'First Steps',
    description: 'Find your first country',
    icon: 'star',
    unlocked: false,
  },
  {
    id: 'five_countries',
    title: 'Explorer',
    description: 'Find 5 countries',
    icon: 'globe',
    unlocked: false,
    progress: 0,
    total: 5,
  },
  {
    id: 'ten_countries',
    title: 'Traveler',
    description: 'Find 10 countries',
    icon: 'award',
    unlocked: false,
    progress: 0,
    total: 10,
  },
  {
    id: 'fifty_countries',
    title: 'World Explorer',
    description: 'Find 50 countries',
    icon: 'trophy',
    unlocked: false,
    progress: 0,
    total: 50,
  },
  {
    id: 'streak_5',
    title: 'On Fire',
    description: 'Get 5 correct answers in a row',
    icon: 'zap',
    unlocked: false,
    progress: 0,
    total: 5,
  },
  {
    id: 'streak_10',
    title: 'Unstoppable',
    description: 'Get 10 correct answers in a row',
    icon: 'medal',
    unlocked: false,
    progress: 0,
    total: 10,
  },
  {
    id: 'no_hints',
    title: 'Geography Master',
    description: 'Find 10 countries without using any hints',
    icon: 'crown',
    unlocked: false,
    progress: 0,
    total: 10,
  },
  {
    id: 'perfect_accuracy',
    title: 'Perfect Score',
    description: 'Achieve 100% accuracy with at least 20 guesses',
    icon: 'target',
    unlocked: false,
  },
];