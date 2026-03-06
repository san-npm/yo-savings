'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

interface Milestone {
  pct: number;
  emoji: string;
  label: string;
  celebration: string;
}

const MILESTONES: Milestone[] = [
  { pct: 100, emoji: '🏁', label: 'GOAL REACHED!', celebration: 'You did it! 🎉' },
  { pct: 90,  emoji: '⭐', label: 'Almost there!', celebration: 'You\'re so close!' },
  { pct: 75,  emoji: '🔥', label: 'On fire!', celebration: 'Crushing it!' },
  { pct: 50,  emoji: '💪', label: 'Halfway hero!', celebration: 'Halfway there!' },
  { pct: 25,  emoji: '🌱', label: 'Growing strong!', celebration: 'Momentum building!' },
  { pct: 10,  emoji: '🎯', label: 'First step!', celebration: 'Great start!' },
  { pct: 0,   emoji: '🚀', label: 'Launch!', celebration: 'Your journey begins!' },
];

interface GoalLadderProps {
  currentAmount: number;
  targetAmount: number;
  goalEmoji: string;
  lastDepositDate?: string; // ISO date string of last deposit
}

function getMotivationalMessage(pct: number, nextMilestone: Milestone | null, targetAmount: number, currentAmount: number): string {
  if (pct >= 100) return 'You\'ve reached your goal! 🎉 Consider setting a new one!';
  if (!nextMilestone) return 'Keep going!';
  
  const amountNeeded = (targetAmount * nextMilestone.pct / 100) - currentAmount;
  if (amountNeeded <= 0) return `Almost at ${nextMilestone.pct}%!`;

  if (amountNeeded < 50) {
    return `Just $${amountNeeded.toFixed(0)} more to reach ${nextMilestone.emoji} ${nextMilestone.label}!`;
  }
  
  const percentToNext = nextMilestone.pct - pct;
  if (percentToNext <= 5) {
    return `So close! Only $${amountNeeded.toFixed(0)} to reach ${nextMilestone.emoji}!`;
  }
  
  return `Next milestone: ${nextMilestone.emoji} ${nextMilestone.label} at ${nextMilestone.pct}%`;
}

function getDaysSinceDeposit(lastDepositDate?: string): number | null {
  if (!lastDepositDate) return null;
  const last = new Date(lastDepositDate).getTime();
  const now = Date.now();
  return Math.floor((now - last) / (1000 * 60 * 60 * 24));
}

export function GoalLadder({ currentAmount, targetAmount, goalEmoji, lastDepositDate }: GoalLadderProps) {
  const [seenMilestones, setSeenMilestones] = useState<Set<number>>(new Set());
  const [celebratingMilestone, setCelebratingMilestone] = useState<number | null>(null);

  const pct = targetAmount > 0 ? Math.min((currentAmount / targetAmount) * 100, 100) : 0;

  // Find which milestones are reached
  const reachedMilestones = MILESTONES.filter(m => pct >= m.pct);
  const nextMilestone = MILESTONES.slice().reverse().find(m => pct < m.pct) ?? null;

  // Celebrate newly reached milestones
  useEffect(() => {
    const newlyReached = reachedMilestones.filter(m => !seenMilestones.has(m.pct) && m.pct > 0);
    if (newlyReached.length > 0) {
      const topNew = newlyReached[newlyReached.length - 1];
      setCelebratingMilestone(topNew.pct);
      setSeenMilestones(prev => {
        const next = new Set(prev);
        reachedMilestones.forEach(m => next.add(m.pct));
        return next;
      });
      setTimeout(() => setCelebratingMilestone(null), 3000);
    } else {
      setSeenMilestones(prev => {
        const next = new Set(prev);
        reachedMilestones.forEach(m => next.add(m.pct));
        return next;
      });
    }
  }, [pct]);

  const daysSince = getDaysSinceDeposit(lastDepositDate);
  const showStreakWarning = daysSince !== null && daysSince >= 7 && pct < 100;

  const motivationalMsg = getMotivationalMessage(pct, nextMilestone, targetAmount, currentAmount);

  // Height of the ladder in px (compact)
  const LADDER_HEIGHT = 200;

  return (
    <div className="space-y-3">
      {/* Celebration banner */}
      <AnimatePresence>
        {celebratingMilestone !== null && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            className="p-3 rounded-xl bg-[#ECFDF5] border border-[#10B981]/30 text-center"
          >
            <p className="text-sm font-semibold text-[#10B981]">
              {MILESTONES.find(m => m.pct === celebratingMilestone)?.celebration ?? '🎉'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Streak warning */}
      {showStreakWarning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="px-3 py-2 rounded-lg bg-amber-50 border border-amber-200"
        >
          <p className="text-xs text-amber-700">🔥 Don&apos;t let your streak cool down! Last deposit was {daysSince} days ago.</p>
        </motion.div>
      )}

      {/* Ladder visualization */}
      <div className="flex gap-3 items-stretch" style={{ height: LADDER_HEIGHT }}>
        {/* Vertical track */}
        <div className="relative flex-shrink-0 w-8 flex flex-col items-center">
          {/* Track background */}
          <div className="absolute inset-x-0 mx-auto w-1 bg-[#E9ECEF] rounded-full" style={{ top: 8, bottom: 8 }} />

          {/* Filled track (progress) */}
          <motion.div
            className="absolute inset-x-0 mx-auto w-1 bg-[#10B981] rounded-full origin-bottom"
            style={{
              bottom: 8,
              top: 'auto',
            }}
            initial={{ height: 0 }}
            animate={{ height: `${pct}%` }}
            transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
          />

          {/* Milestone dots */}
          {MILESTONES.map((m) => {
            const isReached = pct >= m.pct;
            // Position: 0% at bottom, 100% at top
            const posFromBottom = (m.pct / 100) * (LADDER_HEIGHT - 16); // subtract padding
            const topPos = LADDER_HEIGHT - 16 - posFromBottom + 8;

            return (
              <motion.div
                key={m.pct}
                className={`absolute z-10 w-3 h-3 rounded-full border-2 transition-all ${
                  isReached
                    ? 'bg-[#10B981] border-[#10B981]'
                    : 'bg-white border-[#E9ECEF]'
                }`}
                style={{ top: topPos, left: '50%', transform: 'translateX(-50%)' }}
                animate={isReached ? { scale: [1, 1.3, 1] } : { scale: 1 }}
                transition={{ duration: 0.4 }}
              />
            );
          })}

          {/* Current position pulsing indicator */}
          {pct > 0 && pct < 100 && (
            <motion.div
              className="absolute z-20 w-5 h-5 flex items-center justify-center"
              style={{
                bottom: `calc(${pct}% - 10px + 8px)`,
                left: '50%',
                transform: 'translateX(-50%)',
              }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1.5, type: 'spring', stiffness: 400, damping: 20 }}
            >
              <motion.div
                className="w-5 h-5 bg-[#10B981] rounded-full shadow-sm flex items-center justify-center text-xs"
                animate={{ boxShadow: ['0 0 0 0 rgba(16,185,129,0.4)', '0 0 0 6px rgba(16,185,129,0)', '0 0 0 0 rgba(16,185,129,0)'] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span style={{ fontSize: '10px' }}>{goalEmoji}</span>
              </motion.div>
            </motion.div>
          )}
        </div>

        {/* Milestone labels */}
        <div className="flex-1 relative">
          {MILESTONES.map((m) => {
            const isReached = pct >= m.pct;
            const posFromBottom = (m.pct / 100) * (LADDER_HEIGHT - 16);
            const topPos = LADDER_HEIGHT - 16 - posFromBottom + 8 - 8; // offset to center on dot

            return (
              <div
                key={m.pct}
                className="absolute flex items-center gap-1.5"
                style={{ top: topPos, left: 0, right: 0 }}
              >
                <span className={`text-sm transition-all ${isReached ? '' : 'opacity-30'}`}>
                  {m.emoji}
                </span>
                <span className={`text-xs font-medium transition-all truncate ${
                  isReached ? 'text-[#1A1A2E]' : 'text-[#ADB5BD]'
                }`}>
                  {m.label}
                </span>
                {m.pct > 0 && (
                  <span className={`text-xs ml-auto flex-shrink-0 tabular-nums ${
                    isReached ? 'text-[#10B981]' : 'text-[#ADB5BD]'
                  }`}>
                    {m.pct}%
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Motivational message */}
      <div className="px-3 py-2 bg-[#F8F9FA] rounded-lg border border-[#E9ECEF]">
        <p className="text-xs text-[#6C757D]">{motivationalMsg}</p>
      </div>

      {/* Earned badges (reached milestones) */}
      {reachedMilestones.filter(m => m.pct > 0).length > 0 && (
        <div className="flex flex-wrap gap-1">
          {reachedMilestones.filter(m => m.pct > 0).map(m => (
            <motion.span
              key={m.pct}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-sm px-1.5 py-0.5 bg-[#ECFDF5] rounded-md border border-[#10B981]/20"
              title={m.label}
            >
              {m.emoji}
            </motion.span>
          ))}
        </div>
      )}

      {/* Social proof */}
      <p className="text-xs text-[#ADB5BD] text-center">
        You&apos;re doing better than 73% of savers 💚
      </p>
    </div>
  );
}
