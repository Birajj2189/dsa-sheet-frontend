'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { BackendProgress } from '@/types/api'

interface ActivityHeatmapProps {
  progressList: BackendProgress[]
  weeks?: number
}

// Cell dimensions — keep in sync between day labels and cells
const CELL_SIZE = 11   // px
const CELL_GAP  = 2    // px gap between cells
const CELL_STEP = CELL_SIZE + CELL_GAP  // 13px per slot

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
// Only render labels on Mon / Wed / Fri to avoid crowding
const DAY_LABEL_ROWS = [null, 'Mon', null, 'Wed', null, 'Fri', null]

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function intensityClass(count: number) {
  if (count === 0) return 'bg-zinc-800/50'
  if (count === 1) return 'bg-emerald-900'
  if (count === 2) return 'bg-emerald-700/90'
  if (count <= 4)  return 'bg-emerald-500/80'
  return 'bg-emerald-400'
}

export function ActivityHeatmap({ progressList, weeks = 12 }: ActivityHeatmapProps) {
  const { columns, monthLabels, totalActive } = useMemo(() => {
    const totalDays = weeks * 7

    // Build a map: "YYYY-MM-DD" → count
    const countMap: Record<string, number> = {}
    progressList.forEach(p => {
      if (!p.completedAt || !p.completed) return
      const key = new Date(p.completedAt).toISOString().slice(0, 10)
      countMap[key] = (countMap[key] ?? 0) + 1
    })

    // Walk from (today - totalDays + 1) through today
    const today = new Date()
    today.setHours(23, 59, 59, 999)

    const cells: { key: string; count: number; date: Date }[] = []
    for (let i = totalDays - 1; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(today.getDate() - i)
      const key = d.toISOString().slice(0, 10)
      cells.push({ key, count: countMap[key] ?? 0, date: new Date(d) })
    }

    // Group into columns (each column = 1 week starting on Sunday)
    const cols: (typeof cells)[] = []
    for (let i = 0; i < cells.length; i += 7) cols.push(cells.slice(i, i + 7))

    // Month labels: for each column, if the first cell is in a new month relative
    // to the previous column's first cell, record it
    const monthLabels: (string | null)[] = cols.map((col, idx) => {
      if (!col[0]) return null
      if (idx === 0) return MONTH_NAMES[col[0].date.getMonth()]
      const prevMonth = cols[idx - 1]?.[0]?.date.getMonth()
      const curMonth  = col[0].date.getMonth()
      return curMonth !== prevMonth ? MONTH_NAMES[curMonth] : null
    })

    const totalActive = cells.filter(c => c.count > 0).length
    return { columns: cols, monthLabels, totalActive }
  }, [progressList, weeks])

  const DAY_COL_WIDTH = 30  // px — fixed width for day-label column

  return (
    <div className="space-y-2">
      {/* Legend row */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-zinc-500">
          <span className="text-zinc-300 font-medium">{totalActive}</span> active days in the last {weeks} weeks
        </p>
        <div className="flex items-center gap-1.5 text-[10px] text-zinc-600">
          <span>Less</span>
          {[0, 1, 2, 4, 5].map((v, i) => (
            <div key={i} className={`h-[10px] w-[10px] rounded-[3px] flex-shrink-0 ${intensityClass(v)}`} />
          ))}
          <span>More</span>
        </div>
      </div>

      {/* Heatmap table — overflow-x for small screens */}
      <div className="overflow-x-auto pb-1">
        <div style={{ minWidth: columns.length * CELL_STEP + DAY_COL_WIDTH }}>

          {/* ── Row 1: month labels ── */}
          <div className="flex" style={{ paddingLeft: DAY_COL_WIDTH, marginBottom: 4 }}>
            {columns.map((_, colIdx) => (
              <div
                key={colIdx}
                style={{ width: CELL_SIZE, marginRight: CELL_GAP, flexShrink: 0, position: 'relative' }}
              >
                {monthLabels[colIdx] && (
                  <span
                    className="text-[9px] text-zinc-500 absolute left-0 top-0 whitespace-nowrap"
                    style={{ lineHeight: '12px' }}
                  >
                    {monthLabels[colIdx]}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* ── Row 2: day labels + cells ── */}
          <div className="flex">
            {/* Day label column */}
            <div
              className="flex flex-col flex-shrink-0"
              style={{ width: DAY_COL_WIDTH, gap: CELL_GAP }}
            >
              {DAY_LABEL_ROWS.map((label, dayIdx) => (
                <div
                  key={dayIdx}
                  style={{ height: CELL_SIZE, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 6 }}
                >
                  {label && (
                    <span className="text-[9px] text-zinc-600 leading-none">{label}</span>
                  )}
                </div>
              ))}
            </div>

            {/* Cell columns */}
            <div className="flex" style={{ gap: CELL_GAP }}>
              {columns.map((col, colIdx) => (
                <div key={colIdx} className="flex flex-col" style={{ gap: CELL_GAP }}>
                  {/* Pad columns that start mid-week (first column may not start on Sunday) */}
                  {col.map((cell) => {
                    const dateStr = cell.date.toLocaleDateString('en-US', {
                      weekday: 'short', month: 'short', day: 'numeric',
                    })
                    return (
                      <motion.div
                        key={cell.key}
                        title={cell.count === 0
                          ? `No activity · ${dateStr}`
                          : `${cell.count} problem${cell.count > 1 ? 's' : ''} · ${dateStr}`
                        }
                        whileHover={{ scale: 1.5, zIndex: 10 }}
                        transition={{ duration: 0.1 }}
                        className={`rounded-[3px] cursor-default flex-shrink-0 ${intensityClass(cell.count)}`}
                        style={{ width: CELL_SIZE, height: CELL_SIZE }}
                      />
                    )
                  })}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
