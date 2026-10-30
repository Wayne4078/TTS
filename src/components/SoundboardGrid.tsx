import React, { useState } from 'react';
import {
  Play,
  Square,
  Download,
  Copy,
  Check,
  Sparkles,
  Volume2,
  RefreshCw,
  Trophy,
  HeartHandshake,
  CheckCircle2,
  Flame,
  Radio,
} from 'lucide-react';
import { QuizLine, QUIZ_LINES, OPENING_LINE } from '../data/quizLines';
import { sfx, downloadWav } from '../utils/audioUtils';

interface SoundboardGridProps {
  selectedVoice: string;
  playbackSpeed: number;
  sfxEnabled: boolean;
  audioCache: Record<string, string>;
  onCacheAudio: (id: string, base64: string) => void;
  fetchTTSAudio: (text: string, stageCue: string, voice?: string) => Promise<string>;
}

export const SoundboardGrid: React.FC<SoundboardGridProps> = ({
  selectedVoice,
  playbackSpeed,
  sfxEnabled,
  audioCache,
  onCacheAudio,
  fetchTTSAudio,
}) => {
  const allLines = [OPENING_LINE, ...QUIZ_LINES];

  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const audioObjRef = React.useRef<HTMLAudioElement | null>(null);

  const filteredLines = activeFilter === 'all'
    ? allLines
    : allLines.filter((l) => l.category === activeFilter);

  const handlePlayLine = async (line: QuizLine) => {
    try {
      // If currently playing this one, stop
      if (playingId === line.id && audioObjRef.current) {
        audioObjRef.current.pause();
        audioObjRef.current = null;
        setPlayingId(null);
        return;
      }

      // Stop previous
      if (audioObjRef.current) {
        audioObjRef.current.pause();
        audioObjRef.current = null;
        setPlayingId(null);
      }

      const cacheKey = `${line.id}-${selectedVoice}`;
      let base64 = audioCache[cacheKey];

      if (!base64) {
        setLoadingId(line.id);
        base64 = await fetchTTSAudio(line.broadcastText, line.stageCue, selectedVoice);
        onCacheAudio(cacheKey, base64);
        setLoadingId(null);
      }

      // Play SFX
      if (sfxEnabled) {
        if (line.category === 'correct') {
          if (line.id === 'correct-3') sfx.playGrandFanfare();
          else sfx.playCorrectChime();
        } else if (line.category === 'encourage') {
          sfx.playWrongBuzzer();
        } else if (line.category === 'challenge') {
          sfx.playTensionBoom();
        } else if (line.category === 'title') {
          sfx.playGrandFanfare();
        }
      }

      const audio = new Audio(`data:audio/wav;base64,${base64}`);
      audio.playbackRate = playbackSpeed;
      audioObjRef.current = audio;
      setPlayingId(line.id);

      audio.onended = () => {
        setPlayingId(null);
        audioObjRef.current = null;
      };
      audio.onerror = () => {
        setPlayingId(null);
        audioObjRef.current = null;
      };

      await audio.play();
    } catch (err) {
      console.error(err);
      setLoadingId(null);
      setPlayingId(null);
    }
  };

  const handleCopyText = (line: QuizLine) => {
    navigator.clipboard.writeText(`(${line.stageCue}) "${line.broadcastText}"`);
    setCopiedId(line.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Soundboard Header & Filter Pills */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Radio className="w-5 h-5 text-amber-400" />
            <span>원클릭 퀴즈 사운드보드</span>
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
            필요한 멘트를 터치하여 즉시 명쾌한 목소리로 청취하고 다운로드할 수 있습니다.
          </p>
        </div>

        {/* Filter categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {[
            { id: 'all', label: '전체 (11선)' },
            { id: 'correct', label: '정답·환호' },
            { id: 'encourage', label: '위로·격려' },
            { id: 'challenge', label: '난제 도전' },
            { id: 'title', label: '명예 칭호' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveFilter(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                activeFilter === cat.id
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Soundboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {filteredLines.map((line) => {
          const isPlaying = playingId === line.id;
          const isLoading = loadingId === line.id;
          const cacheKey = `${line.id}-${selectedVoice}`;
          const isCached = Boolean(audioCache[cacheKey]);

          return (
            <div
              key={line.id}
              className={`relative rounded-3xl border bg-gradient-to-br ${line.bgGradient} p-5 sm:p-6 transition-all duration-200 flex flex-col justify-between shadow-lg shadow-black/30 hover:scale-[1.01] ${
                isPlaying ? 'border-amber-400 ring-2 ring-amber-400/30' : line.borderGlow
              }`}
            >
              {/* Card Header */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className={`text-[11px] font-extrabold px-2.5 py-1 rounded-lg border ${line.badgeColor}`}>
                    {line.order === 0 ? '오프닝 멘트' : `대사 #${line.order} · ${line.categoryLabel}`}
                  </span>

                  <div className="flex items-center gap-1 text-[11px] text-slate-400">
                    {isCached ? (
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        캐시됨
                      </span>
                    ) : (
                      <span className="text-slate-500">생성 대기</span>
                    )}
                  </div>
                </div>

                {/* Stage Cue (연기 지문) */}
                <div className="mb-2 text-xs font-semibold text-amber-300/90 bg-black/40 px-3 py-1.5 rounded-xl border border-white/5 inline-block">
                  🎭 {line.stageCue}
                </div>

                {/* Big Broadcast Text */}
                <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-snug my-2">
                  &ldquo;{line.broadcastText}&rdquo;
                </h3>

                {/* Tip */}
                <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                  {line.tip}
                </p>
              </div>

              {/* Card Footer Actions */}
              <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between gap-3">
                {/* Main Play Button */}
                <button
                  onClick={() => handlePlayLine(line)}
                  disabled={isLoading}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-black text-sm transition shadow-md ${
                    isPlaying
                      ? 'bg-amber-400 text-slate-950 animate-pulse'
                      : 'bg-white/10 hover:bg-amber-500 hover:text-slate-950 text-white'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                      <span>음성 합성 중...</span>
                    </>
                  ) : isPlaying ? (
                    <>
                      <Square className="w-4 h-4 fill-slate-950" />
                      <span>외치는 중... (정지)</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" />
                      <span>또박또박 외치기</span>
                    </>
                  )}
                </button>

                {/* Utility Buttons: Copy text & Download WAV */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleCopyText(line)}
                    className="p-2.5 rounded-xl bg-black/30 hover:bg-black/50 text-slate-400 hover:text-white transition"
                    title="대본 텍스트 복사"
                  >
                    {copiedId === line.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>

                  {isCached && (
                    <button
                      onClick={() => downloadWav(audioCache[cacheKey], `quiz_${line.order}_${line.title}`)}
                      className="p-2.5 rounded-xl bg-black/30 hover:bg-black/50 text-slate-400 hover:text-white transition"
                      title="WAV 파일 다운로드"
                    >
                      <Download className="w-4 h-4 text-amber-400" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
