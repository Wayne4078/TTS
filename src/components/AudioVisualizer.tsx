import React from 'react';

interface AudioVisualizerProps {
  isPlaying: boolean;
  color?: string;
  isPausedTimer?: boolean;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  isPlaying,
  color = 'bg-amber-400',
  isPausedTimer = false,
}) => {
  return (
    <div className="flex items-center justify-center gap-1.5 h-12 px-4 py-2 bg-slate-900/80 rounded-xl border border-slate-800 backdrop-blur-sm">
      {isPausedTimer ? (
        <div className="flex items-center gap-2 text-amber-400 text-xs font-medium animate-pulse">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span>(1초 숨 고르는 중...)</span>
        </div>
      ) : (
        <>
          {[40, 75, 55, 90, 65, 85, 45, 95, 70, 80, 50, 88, 60, 42].map((height, i) => (
            <div
              key={i}
              className={`w-1 rounded-full transition-all duration-150 ${color} ${
                isPlaying
                  ? 'animate-pulse'
                  : 'h-2 bg-slate-700'
              }`}
              style={{
                height: isPlaying ? `${Math.max(8, height * (0.4 + (i % 3) * 0.25))}%` : '8px',
                animationDelay: `${(i * 0.08) % 0.8}s`,
                opacity: isPlaying ? 0.9 : 0.35,
              }}
            />
          ))}
        </>
      )}
    </div>
  );
};
