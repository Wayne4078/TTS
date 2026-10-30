import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  Square,
  SkipForward,
  SkipBack,
  Download,
  Sparkles,
  Volume2,
  Mic,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Award,
  RefreshCw,
} from 'lucide-react';
import { QuizLine, QUIZ_LINES, OPENING_LINE, HOST_VOICES } from '../data/quizLines';
import { AudioVisualizer } from './AudioVisualizer';
import { sfx, downloadWav } from '../utils/audioUtils';

interface BroadcastStageProps {
  selectedVoice: string;
  playbackSpeed: number;
  sfxEnabled: boolean;
  audioCache: Record<string, string>; // id -> base64
  onCacheAudio: (id: string, base64: string) => void;
  fetchTTSAudio: (text: string, stageCue: string, voice?: string) => Promise<string>;
}

export const BroadcastStage: React.FC<BroadcastStageProps> = ({
  selectedVoice,
  playbackSpeed,
  sfxEnabled,
  audioCache,
  onCacheAudio,
  fetchTTSAudio,
}) => {
  // All lines including opening
  const allLines: QuizLine[] = [OPENING_LINE, ...QUIZ_LINES];

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPlayingAll, setIsPlayingAll] = useState<boolean>(false);
  const [isCurrentlySpeaking, setIsCurrentlySpeaking] = useState<boolean>(false);
  const [isPaused1Sec, setIsPaused1Sec] = useState<boolean>(false);
  const [pauseCountdown, setPauseCountdown] = useState<number>(1.0);
  const [loadingLineId, setLoadingLineId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [preGeneratingAll, setPreGeneratingAll] = useState<boolean>(false);
  const [preGenProgress, setPreGenProgress] = useState<{ done: number; total: number }>({ done: 0, total: allLines.length });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentLine = allLines[currentIndex];
  const isPlayingAllRef = useRef<boolean>(false);
  isPlayingAllRef.current = isPlayingAll;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Play SFX for line
  const triggerLineSfx = (line: QuizLine) => {
    if (!sfxEnabled) return;
    if (line.category === 'correct') {
      if (line.id === 'correct-3') {
        sfx.playGrandFanfare();
      } else {
        sfx.playCorrectChime();
      }
    } else if (line.category === 'encourage') {
      sfx.playWrongBuzzer();
    } else if (line.category === 'challenge') {
      sfx.playTensionBoom();
    } else if (line.category === 'title') {
      sfx.playGrandFanfare();
    }
  };

  // Play a single line audio
  const playLineAudio = async (line: QuizLine): Promise<void> => {
    try {
      setErrorMessage(null);
      let base64 = audioCache[`${line.id}-${selectedVoice}`];

      if (!base64) {
        setLoadingLineId(line.id);
        base64 = await fetchTTSAudio(line.broadcastText, line.stageCue, selectedVoice);
        onCacheAudio(`${line.id}-${selectedVoice}`, base64);
        setLoadingLineId(null);
      }

      // Stop previous
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      const audio = new Audio(`data:audio/wav;base64,${base64}`);
      audio.playbackRate = playbackSpeed;
      audioRef.current = audio;

      triggerLineSfx(line);

      return new Promise((resolve) => {
        audio.onplay = () => {
          setIsCurrentlySpeaking(true);
        };
        audio.onended = () => {
          setIsCurrentlySpeaking(false);
          resolve();
        };
        audio.onerror = (e) => {
          console.error('Audio playback error:', e);
          setIsCurrentlySpeaking(false);
          resolve();
        };
        audio.play().catch((err) => {
          console.error('Failed to play audio:', err);
          setIsCurrentlySpeaking(false);
          resolve();
        });
      });
    } catch (err: any) {
      setLoadingLineId(null);
      setIsCurrentlySpeaking(false);
      setErrorMessage(err.message || '음성 합성에 실패했습니다.');
      console.error(err);
    }
  };

  // Continuous Playback logic with exact 1-second pause
  const startContinuousBroadcast = async (startIdx = 0) => {
    setIsPlayingAll(true);
    setCurrentIndex(startIdx);

    for (let i = startIdx; i < allLines.length; i++) {
      if (!isPlayingAllRef.current) break;

      setCurrentIndex(i);
      const line = allLines[i];

      // 1. Play line
      await playLineAudio(line);

      if (!isPlayingAllRef.current) break;

      // 2. Exactly 1 second pause between lines (unless it's the very last line)
      if (i < allLines.length - 1) {
        setIsPaused1Sec(true);
        setPauseCountdown(1.0);

        // 1000ms countdown in 100ms steps
        for (let step = 10; step > 0; step--) {
          if (!isPlayingAllRef.current) break;
          setPauseCountdown(step / 10);
          await new Promise((res) => setTimeout(res, 100));
        }

        setIsPaused1Sec(false);
      }
    }

    setIsPlayingAll(false);
    setIsCurrentlySpeaking(false);
    setIsPaused1Sec(false);
  };

  const stopBroadcast = () => {
    setIsPlayingAll(false);
    setIsCurrentlySpeaking(false);
    setIsPaused1Sec(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  };

  // Play just current line
  const handlePlayCurrent = async () => {
    if (isCurrentlySpeaking) {
      stopBroadcast();
    } else {
      await playLineAudio(currentLine);
    }
  };

  // Pre-generate all 11 lines
  const handlePreGenerateAll = async () => {
    try {
      setPreGeneratingAll(true);
      setErrorMessage(null);
      let count = 0;

      for (const line of allLines) {
        const cacheKey = `${line.id}-${selectedVoice}`;
        if (!audioCache[cacheKey]) {
          setLoadingLineId(line.id);
          const base64 = await fetchTTSAudio(line.broadcastText, line.stageCue, selectedVoice);
          onCacheAudio(cacheKey, base64);
        }
        count++;
        setPreGenProgress({ done: count, total: allLines.length });
      }
      setLoadingLineId(null);
      setPreGeneratingAll(false);
    } catch (err: any) {
      setLoadingLineId(null);
      setPreGeneratingAll(false);
      setErrorMessage(err.message || '전체 음성 생성 중 오류가 발생했습니다.');
    }
  };

  const voiceObj = HOST_VOICES.find((v) => v.id === selectedVoice);

  return (
    <div className="space-y-6">
      {/* Studio Stage Header / Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 p-6 sm:p-8 shadow-2xl shadow-amber-950/20">
        {/* Stage Spotlights Effect */}
        <div className="pointer-events-none absolute -top-24 left-1/4 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -top-24 right-1/4 h-72 w-72 rounded-full bg-yellow-500/10 blur-3xl" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="text-center lg:text-left space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 text-xs font-bold">
              <Mic className="w-3.5 h-3.5 text-amber-400" />
              <span>TV 퀴즈쇼 연속 방송 송출 시스템</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              50~60대 국민 애청 퀴즈쇼 진행 10선
            </h2>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              &quot;각 대사 사이에 <strong>1초씩 정확히 쉬며</strong>, 너무 빠르지 않게, 끝을 시원하게 올려&quot;
              우렁차고 명쾌하게 방송하는 베테랑 아나운서의 호흡을 그대로 구현했습니다.
            </p>
          </div>

          {/* Quick Stats / Voice Status */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl px-4 py-3 text-center">
              <span className="block text-[11px] font-medium text-slate-400">선택된 진행자</span>
              <span className="text-sm font-bold text-amber-300">{voiceObj?.name}</span>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl px-4 py-3 text-center">
              <span className="block text-[11px] font-medium text-slate-400">대사 간 휴식</span>
              <span className="text-sm font-bold text-emerald-400">정확히 1.0초 휴식</span>
            </div>

            <button
              onClick={handlePreGenerateAll}
              disabled={preGeneratingAll}
              className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-slate-200 text-xs sm:text-sm font-bold transition disabled:opacity-50"
              title="11개 전체 대사 음성을 미리 생성하여 딜레이 없이 재생합니다"
            >
              <RefreshCw className={`w-4 h-4 text-amber-400 ${preGeneratingAll ? 'animate-spin' : ''}`} />
              <span>{preGeneratingAll ? `생성 중 (${preGenProgress.done}/${preGenProgress.total})` : '전체 음성 미리 캐싱'}</span>
            </button>
          </div>
        </div>

        {/* Big Teleprompter Monitor */}
        <div className="mt-8 relative rounded-2xl border-2 border-amber-500/40 bg-black/90 p-6 sm:p-10 shadow-inner">
          {/* Teleprompter Top Status Bar */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 text-xs font-semibold">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              <span className="text-red-400 tracking-wider font-mono">TELEPROMPTER # {currentLine.order === 0 ? 'INTRO' : `CUE-${currentLine.order}`}</span>
              <span className="text-slate-400">| {currentLine.categoryLabel}</span>
            </div>
            
            <div className="flex items-center gap-3">
              {isPaused1Sec && (
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-300 text-xs font-bold animate-pulse">
                  <Clock className="w-3.5 h-3.5" />
                  <span>1초간 숨 고르는 중... ({pauseCountdown.toFixed(1)}s)</span>
                </div>
              )}
              <span className="text-slate-400 font-mono">
                진행: {currentIndex + 1} / {allLines.length}
              </span>
            </div>
          </div>

          {/* Main Stage Text Display */}
          <div className="py-8 sm:py-12 text-center space-y-4">
            {/* Stage Direction Cue (연기 지문) */}
            <div className="inline-block px-4 py-1.5 rounded-xl bg-amber-500/15 border border-amber-400/30 text-amber-300 text-xs sm:text-sm font-medium tracking-wide">
              🎭 {currentLine.stageCue}
            </div>

            {/* Broadcast Big Line (끝을 시원하게 올리는 대사) */}
            <div className="px-2">
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-100 via-amber-300 to-yellow-400 tracking-tight leading-tight drop-shadow-md">
                &ldquo;{currentLine.broadcastText}&rdquo;
              </h1>
            </div>

            {/* Sub description */}
            <p className="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto">
              {currentLine.tip}
            </p>
          </div>

          {/* Audio Visualizer & Waveform Display */}
          <div className="flex items-center justify-center my-4">
            <AudioVisualizer isPlaying={isCurrentlySpeaking} isPausedTimer={isPaused1Sec} />
          </div>

          {/* Main Playback Control Bar */}
          <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
            {/* Step Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  stopBroadcast();
                  setCurrentIndex((prev) => Math.max(0, prev - 1));
                }}
                disabled={currentIndex === 0}
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-40 transition"
                title="이전 대사"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  stopBroadcast();
                  setCurrentIndex((prev) => Math.min(allLines.length - 1, prev + 1));
                }}
                disabled={currentIndex === allLines.length - 1}
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-40 transition"
                title="다음 대사"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>

            {/* Center: Hero Action Buttons */}
            <div className="flex items-center gap-3">
              {/* Play Current Line */}
              <button
                onClick={handlePlayCurrent}
                disabled={loadingLineId !== null}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-sm shadow-md transition disabled:opacity-50"
              >
                {loadingLineId === currentLine.id ? (
                  <RefreshCw className="w-4 h-4 text-amber-400 animate-spin" />
                ) : isCurrentlySpeaking && !isPlayingAll ? (
                  <Pause className="w-4 h-4 text-amber-400" />
                ) : (
                  <Play className="w-4 h-4 text-amber-400 fill-amber-400" />
                )}
                <span>{isCurrentlySpeaking && !isPlayingAll ? '일시 정지' : '현재 대사만 외치기'}</span>
              </button>

              {/* Play All Sequentially with 1-second pause */}
              {isPlayingAll ? (
                <button
                  onClick={stopBroadcast}
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black text-sm shadow-lg shadow-red-600/30 transition"
                >
                  <Square className="w-4 h-4 fill-white" />
                  <span>연속 방송 중단</span>
                </button>
              ) : (
                <button
                  onClick={() => startContinuousBroadcast(currentIndex)}
                  disabled={loadingLineId !== null}
                  className="flex items-center gap-2 px-7 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 font-black text-sm sm:text-base shadow-xl shadow-amber-500/30 hover:scale-[1.02] active:scale-[0.98] transition"
                >
                  <Play className="w-5 h-5 fill-slate-950" />
                  <span>전체 10선 연속 방송 시작 (1초 간격)</span>
                </button>
              )}
            </div>

            {/* Download Current WAV */}
            <div className="flex items-center gap-2">
              {audioCache[`${currentLine.id}-${selectedVoice}`] && (
                <button
                  onClick={() => downloadWav(audioCache[`${currentLine.id}-${selectedVoice}`], `quiz_line_${currentLine.order}_${currentLine.title}`)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition"
                  title="현재 대사 WAV 다운로드"
                >
                  <Download className="w-3.5 h-3.5 text-amber-400" />
                  <span>WAV 저장</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {errorMessage && (
          <div className="mt-4 p-4 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Sequential Cue List Timeline */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-5 sm:p-6 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <h3 className="text-base font-bold text-white">방송 대본 타임라인 (클릭하여 즉시 이동)</h3>
          </div>
          <span className="text-xs text-slate-400">대사 사이 1초 숨 고르기 자동 적용</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {allLines.map((line, idx) => {
            const isSelected = currentIndex === idx;
            const isCached = Boolean(audioCache[`${line.id}-${selectedVoice}`]);

            return (
              <button
                key={line.id}
                onClick={() => {
                  stopBroadcast();
                  setCurrentIndex(idx);
                  playLineAudio(line);
                }}
                className={`text-left p-3.5 rounded-2xl border transition relative overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? 'border-amber-400 bg-amber-500/10 shadow-lg shadow-amber-500/10'
                    : 'border-slate-800/80 bg-slate-950/40 hover:border-slate-700 hover:bg-slate-900/50'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${line.badgeColor}`}>
                    {line.order === 0 ? '오프닝' : `${line.order}번`} · {line.categoryLabel}
                  </span>
                  {isCached && (
                    <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      준비완료
                    </span>
                  )}
                </div>

                <div className="font-bold text-sm text-slate-100 truncate mb-1">
                  &ldquo;{line.broadcastText}&rdquo;
                </div>

                <div className="text-[11px] text-slate-400 truncate">
                  {line.stageCue}
                </div>

                {isSelected && isCurrentlySpeaking && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-400 animate-pulse" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
