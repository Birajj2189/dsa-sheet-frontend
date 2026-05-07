'use client'

import { motion } from 'framer-motion'

interface ProgressRingProps {
  value: number        // 0–100
  size?: number        // diameter in px
  strokeWidth?: number
  color?: string
  trackColor?: string
  label?: string
  sublabel?: string
  className?: string
}

export function ProgressRing({
  value,
  size = 80,
  strokeWidth = 6,
  color = '#6366f1',
  trackColor = 'rgba(255,255,255,0.06)',
  label,
  sublabel,
  className = '',
}: ProgressRingProps) {
  const r          = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * r
  const progress   = Math.min(Math.max(value, 0), 100)
  const dashOffset = circumference * (1 - progress / 100)

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: dashOffset }}
          transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.1 }}
        />
      </svg>

      {(label !== undefined || sublabel !== undefined) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          {label !== undefined && (
            <span className="text-sm font-semibold text-zinc-200 leading-none">{label}</span>
          )}
          {sublabel !== undefined && (
            <span className="text-[10px] text-zinc-500 mt-0.5 leading-none">{sublabel}</span>
          )}
        </div>
      )}
    </div>
  )
}
