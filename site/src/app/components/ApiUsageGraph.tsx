'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface UsageData {
  recorded_at: string;
  tokens_in: string;
  tokens_out: string;
  usage_percent: number;
  reset_in: string;
  model: string;
}

export default function ApiUsageGraph() {
  const [data, setData] = useState<UsageData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/usage')
      .then(res => res.json())
      .then(d => {
        setData(d.reverse());
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  if (loading || data.length === 0) return <div className="text-neutral-500 animate-pulse">Initializing telemetry...</div>;

  const maxTokens = Math.max(...data.map(d => parseInt(d.tokens_in) + parseInt(d.tokens_out)));
  const width = 800;
  const height = 200;
  const padding = 20;

  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * (width - padding * 2) + padding;
    const total = parseInt(d.tokens_in) + parseInt(d.tokens_out);
    const y = height - ((total / (maxTokens || 1)) * (height - padding * 2) + padding);
    return `${x},${y}`;
  }).join(' ');

  const currentUsage = data[data.length - 1];
  const totalTokens = parseInt(currentUsage.tokens_in) + parseInt(currentUsage.tokens_out);
  const estimatedCost = (totalTokens * 0.000015).toFixed(4);

  return (
    <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-6 backdrop-blur-xl">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-white font-bold text-lg flex items-center gap-2">
            <span className="w-2 h-2 bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
            Live API Telemetry
          </h3>
          <p className="text-neutral-500 text-sm">Real-time token distribution & cost analysis</p>
        </div>
        <div className="text-right">
          <div className="text-red-500 font-mono font-bold text-xl">${estimatedCost}</div>
          <div className="text-neutral-500 text-xs uppercase tracking-widest">Est. Cost / Session</div>
        </div>
      </div>

      <div className="relative h-[200px] w-full mb-6">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
          {/* Grid Lines */}
          {[0, 0.5, 1].map(p => (
            <line 
              key={p}
              x1={padding} 
              y1={padding + p * (height - padding * 2)} 
              x2={width - padding} 
              y2={padding + p * (height - padding * 2)} 
              stroke="#262626" 
              strokeDasharray="4 4"
            />
          ))}
          
          {/* Line Path */}
          <motion.polyline
            fill="none"
            stroke="url(#gradient)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
          
          <defs>
            <linearGradient id="gradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="grid grid-cols-3 gap-4 border-t border-neutral-800 pt-6">
        <div>
          <div className="text-neutral-500 text-xs uppercase mb-1">Tokens In</div>
          <div className="text-white font-mono">{parseInt(currentUsage.tokens_in).toLocaleString()}</div>
        </div>
        <div>
          <div className="text-neutral-500 text-xs uppercase mb-1">Tokens Out</div>
          <div className="text-white font-mono">{parseInt(currentUsage.tokens_out).toLocaleString()}</div>
        </div>
        <div>
          <div className="text-neutral-500 text-xs uppercase mb-1">Reset In</div>
          <div className="text-red-400 font-mono">{currentUsage.reset_in}</div>
        </div>
      </div>
    </div>
  );
}
