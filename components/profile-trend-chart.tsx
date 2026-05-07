'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface ProfileTrendChartProps {
  data: any[]
  tooltipConfig: any
}

export default function ProfileTrendChart({ data, tooltipConfig }: ProfileTrendChartProps) {
  return (
    <ResponsiveContainer width="100%" height={160}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}    />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
        <XAxis 
          dataKey="day" 
          tick={{ fill: '#52525b', fontSize: 10 }} 
          axisLine={false} 
          tickLine={false} 
          interval={4} 
        />
        <YAxis hide allowDecimals={false} />
        <Tooltip {...tooltipConfig} />
        <Area 
          type="monotone" 
          dataKey="problems" 
          stroke="#6366f1" 
          strokeWidth={1.5} 
          fillOpacity={1} 
          fill="url(#areaGrad)" 
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
