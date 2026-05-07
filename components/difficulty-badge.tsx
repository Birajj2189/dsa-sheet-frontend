'use client'

import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'

type AnyDifficulty = 'easy' | 'medium' | 'hard' | 'Easy' | 'Medium' | 'Hard'

interface DifficultyBadgeProps {
  difficulty: AnyDifficulty
}

const COLOR_MAP: Record<string, string> = {
  easy: 'bg-green-500/20 text-green-400 border-green-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  hard: 'bg-red-500/20 text-red-400 border-red-500/30',
}

export function DifficultyBadge({ difficulty }: DifficultyBadgeProps) {
  const key = difficulty.toLowerCase()
  const label = difficulty.charAt(0).toUpperCase() + difficulty.slice(1).toLowerCase()
  const colorClass = COLOR_MAP[key] ?? 'bg-gray-500/20 text-gray-400 border-gray-500/30'

  return (
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
      <Badge variant="outline" className={colorClass}>
        {label}
      </Badge>
    </motion.div>
  )
}
