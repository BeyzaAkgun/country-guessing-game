// HintStack.tsx - Updated: Added "Get Next Hint" button for hint-based mode
import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Lightbulb, ChevronDown, ChevronUp, X, Sparkles } from "lucide-react";

export interface Hint {
  id: string;
  countryName: string;
  text: string;
  type: "continent" | "fact" | "capital" | "flag";
  timestamp: number;
}

interface HintStackProps {
  hints?: Hint[];
  onClose?: (hintId: string) => void;
  onRequestHint?: () => void;  // NEW: For hint-based mode
  showRequestButton?: boolean;  // NEW: Show "Get Next Hint" button
  hintsAvailable?: boolean;     // NEW: Check if hints available
}

export function HintStack({ 
  hints = [], 
  onClose,
  onRequestHint,
  showRequestButton = false,
  hintsAvailable = true
}: HintStackProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedHintId, setSelectedHintId] = useState<string | null>(null);

  if (!hints || hints.length === 0) {
    // Show empty state with request button in hint-based mode
    if (showRequestButton && onRequestHint) {
      return (
        <motion.div
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="absolute top-20 right-4 z-30 w-80 max-w-[calc(100vw-2rem)]"
        >
          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg rounded-2xl border border-white/30 shadow-lg p-6 text-center">
            <Lightbulb className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-4">
              No hints yet. Click below to get your first hint!
            </p>
            {hintsAvailable ? (
              <button
                onClick={onRequestHint}
                className="w-full px-4 py-2.5 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white rounded-xl font-semibold shadow-md flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <Sparkles className="w-4 h-4" />
                Get Next Hint
              </button>
            ) : (
              <div className="px-4 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-xl font-medium">
                No more hints available
              </div>
            )}
          </div>
        </motion.div>
      );
    }
    return null;
  }

  const toggleHint = (hintId: string) => {
    setSelectedHintId(selectedHintId === hintId ? null : hintId);
  };

  return (
    <motion.div
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="absolute top-20 right-4 z-30 w-80 max-w-[calc(100vw-2rem)]"
    >
      {/* Header */}
      <div className={`bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg shadow-lg ${isExpanded ? 'rounded-t-2xl border border-b-0 border-white/30' : 'rounded-2xl border border-white/30'}`}>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${isExpanded ? 'rounded-t-2xl' : 'rounded-2xl'}`}        >
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            <span className="font-semibold text-sm">Hint Stack</span>
            <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
              {hints.length}
            </span>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </button>
      </div>

      {/* Hint Cards */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg rounded-b-2xl border border-t-0 border-white/30 shadow-lg overflow-hidden"
          >
            <div className="max-h-96 overflow-y-auto p-2 space-y-2">
              {hints.map((hint, index) => {
                const isSelected = selectedHintId === hint.id;
                const isLatest = index === hints.length - 1;

                return (
                  <motion.div
                    key={hint.id}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className={`
                      rounded-xl border transition-all cursor-pointer
                      ${isLatest 
                        ? 'bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-800/50' 
                        : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50'
                      }
                      ${isSelected ? 'ring-2 ring-blue-500' : ''}
                      hover:shadow-md
                    `}
                    onClick={() => toggleHint(hint.id)}
                  >
                    {/* Card Header */}
                    <div className="p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`
                              text-xs font-semibold px-2 py-0.5 rounded-full
                              ${hint.type === 'continent' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' : ''}
                              ${hint.type === 'fact' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' : ''}
                              ${hint.type === 'capital' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' : ''}
                              ${hint.type === 'flag' ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' : ''}
                            `}>
                              {hint.type}
                            </span>
                            {isLatest && (
                              <span className="text-xs bg-yellow-200 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300 px-2 py-0.5 rounded-full font-semibold">
                                NEW
                              </span>
                            )}
                          </div>
                          
                          {/* Hint Text */}
                          <p className={`
                            text-sm font-medium text-slate-700 dark:text-slate-300
                            ${isSelected ? '' : 'line-clamp-2'}
                          `}>
                            {hint.text}
                          </p>
                        </div>
                        
                        {onClose && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onClose(hint.id);
                            }}
                            className="text-muted-foreground hover:text-red-500 transition-colors p-1"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {/* Expanded Details */}
                      <AnimatePresence>
                        {isSelected && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700"
                          >
                            <div className="text-xs text-muted-foreground space-y-1">
                              <p><strong>Unlocked:</strong> {new Date(hint.timestamp).toLocaleTimeString()}</p>
                              <p className="text-xs italic opacity-75">💡 Use these hints to find the country on the map</p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Get Next Hint Button - For Hint-Based Mode */}
            {showRequestButton && onRequestHint && (
              <div className="p-3 border-t border-white/20">
                {hintsAvailable ? (
                  <button
                    onClick={onRequestHint}
                    className="w-full px-4 py-2.5 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white rounded-xl font-semibold shadow-md flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    <Sparkles className="w-4 h-4" />
                    Get Next Hint
                  </button>
                ) : (
                  <div className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-xl font-medium text-center text-sm">
                    No more hints available
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}