import React, { useState } from 'react';
import {
  Mic,
  Play,
  Square,
  Sparkles,
  Download,
  Trash2,
  Volume2,
  RefreshCw,
  Send,
  MessageSquare,
} from 'lucide-react';
import { HOST_VOICES } from '../data/quizLines';
import { downloadWav, sfx } from '../utils/audioUtils';

interface CustomStudioProps {
  selectedVoice: string;
  playbackSpeed: number;
  sfxEnabled: boolean;
  fetchTTSAudio: (text: string, stageCue: string, voice?: string) => Promise<string>;
}

interface CustomClip {
  id: string;
  text: string;
  stageCue: string;
  voice: string;
  audioBase64: string;
  timestamp: string;
}

const PRESET_IDEAS = [
  {
    cue: '두 팔을 번쩍 치켜들며 스튜디오가 떠나갈 듯',
    text: '골든벨을 힘차게 울려주세요—!',
  },
  {
    cue: '숨 막히는 긴장감 속에 낮은 목소리로 속삭이듯',
    text: '최후의 1인, 대망의 50번 문제입니다!',
  },
  {
    cue: '간절한 마음을 담아 두 손을 모으며',
    text: '패자부활전! 전원 부활의 기적을 기대합니다!',
  },
  {
    cue: '우렁찬 박수와 함께 만면에 미소를 띠며',
    text: '정답판을 머리 위로 번쩍 들어주세요!',
  },
  {
    cue: '벅차오르는 감격을 주체하지 못하며 쩌렁쩌렁하게',
    text: '장학금 천만 원의 영예로운 주인공 탄생입니다—!',
  },
];

export const CustomStudio: React.FC<CustomStudioProps> = ({
  selectedVoice,
  playbackSpeed,
  sfxEnabled,
  fetchTTSAudio,
}) => {
  const [inputText, setInputText] = useState<string>('골든벨을 힘차게 울려주세요—!');
  const [stageCue, setStageCue] = useState<string>('두 팔을 번쩍 치켜들며 스튜디오가 떠나갈 듯');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isAiPolishing, setIsAiPolishing] = useState<boolean>(false);
  const [customClips, setCustomClips] = useState<CustomClip[]>([]);
  const [playingClipId, setPlayingClipId] = useState<string | null>(null);

  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  const handleGenerateTTS = async () => {
    if (!inputText.trim()) return;

    try {
      setIsGenerating(true);
      const base64 = await fetchTTSAudio(inputText.trim(), stageCue.trim(), selectedVoice);

      const newClip: CustomClip = {
        id: Date.now().toString(),
        text: inputText.trim(),
        stageCue: stageCue.trim(),
        voice: selectedVoice,
        audioBase64: base64,
        timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      };

      setCustomClips((prev) => [newClip, ...prev]);

      // Play immediately
      playClip(newClip);
      setIsGenerating(false);
    } catch (err) {
      console.error(err);
      setIsGenerating(false);
    }
  };

  const handleAiPolish = async () => {
    try {
      setIsAiPolishing(true);
      const res = await fetch('/api/generate-line', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          situation: inputText || '골든벨 최후의 순간',
          emotion: 'warm, highly enthusiastic 50s Korean announcer',
        }),
      });
      const data = await res.json();
      if (data.line) {
        setInputText(data.line);
      }
      if (data.cue) {
        setStageCue(data.cue);
      }
      setIsAiPolishing(false);
    } catch (err) {
      console.error(err);
      setIsAiPolishing(false);
    }
  };

  const playClip = (clip: CustomClip) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    if (playingClipId === clip.id) {
      setPlayingClipId(null);
      return;
    }

    if (sfxEnabled) {
      sfx.playCorrectChime();
    }

    const audio = new Audio(`data:audio/wav;base64,${clip.audioBase64}`);
    audio.playbackRate = playbackSpeed;
    audioRef.current = audio;
    setPlayingClipId(clip.id);

    audio.onended = () => {
      setPlayingClipId(null);
      audioRef.current = null;
    };
    audio.onerror = () => {
      setPlayingClipId(null);
      audioRef.current = null;
    };

    audio.play();
  };

  const voiceObj = HOST_VOICES.find((v) => v.id === selectedVoice);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Studio Banner */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-amber-500/30">
        <div className="flex items-center gap-2 mb-2">
          <Mic className="w-5 h-5 text-amber-400" />
          <h2 className="text-xl font-bold text-white">나만의 퀴즈 대사 맞춤 녹음실</h2>
        </div>
        <p className="text-slate-400 text-xs sm:text-sm">
          원하는 어떤 퀴즈 멘트라도 입력하세요. Gemini 3.8 Flash TTS가 따뜻하고 우렁찬 국민 아나운서의 목소리로 즉시 녹음해 드립니다.
        </p>

        {/* Preset quick buttons */}
        <div className="mt-4 pt-3 border-t border-slate-800">
          <span className="text-xs font-semibold text-slate-400 block mb-2">추천 방송 프리셋:</span>
          <div className="flex flex-wrap gap-2">
            {PRESET_IDEAS.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setInputText(preset.text);
                  setStageCue(preset.cue);
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 transition"
              >
                {preset.text}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Input Form */}
        <div className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-amber-300 mb-1.5">
              🎭 연기 지문 / 분위기 가이드 (Stage Cue)
            </label>
            <input
              type="text"
              value={stageCue}
              onChange={(e) => setStageCue(e.target.value)}
              placeholder="예: 두 주먹을 불끈 쥐며 우렁차게, 끝을 시원하게 올리며"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-amber-300">
                📢 외칠 대사 텍스트
              </label>
              <button
                onClick={handleAiPolish}
                disabled={isAiPolishing}
                className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-semibold"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isAiPolishing ? 'AI 작성 중...' : 'AI로 멘트 다듬기'}</span>
              </button>
            </div>
            <textarea
              rows={3}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="외치고 싶은 대사를 입력하세요 (예: 50번 문제! 정답판을 들어주세요!)"
              className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-slate-100 text-base focus:outline-none focus:ring-2 focus:ring-amber-400 font-semibold"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <span className="text-xs text-slate-400">
              현재 보이스: <strong className="text-amber-300">{voiceObj?.name}</strong>
            </span>

            <button
              onClick={handleGenerateTTS}
              disabled={isGenerating || !inputText.trim()}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/25 transition disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Gemini 3.8 Flash TTS 녹음 중...</span>
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4 text-slate-950" />
                  <span>이 대사로 또박또박 외치기</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Generated Clips History */}
      {customClips.length > 0 && (
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>녹음된 커스텀 대사 보관함</span>
              <span className="text-xs px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-mono">
                {customClips.length}개
              </span>
            </h3>
            <button
              onClick={() => setCustomClips([])}
              className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>전체 삭제</span>
            </button>
          </div>

          <div className="space-y-3">
            {customClips.map((clip) => {
              const isPlaying = playingClipId === clip.id;
              return (
                <div
                  key={clip.id}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-amber-400/50 transition"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold">
                        🎭 {clip.stageCue || '일반 톤'}
                      </span>
                      <span className="text-slate-500 font-mono">{clip.timestamp}</span>
                      <span className="text-amber-400 font-semibold">{clip.voice}</span>
                    </div>
                    <div className="text-base font-bold text-white">
                      &ldquo;{clip.text}&rdquo;
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => playClip(clip)}
                      className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition ${
                        isPlaying
                          ? 'bg-amber-400 text-slate-950'
                          : 'bg-slate-800 text-white hover:bg-amber-500 hover:text-slate-950'
                      }`}
                    >
                      {isPlaying ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                      <span>{isPlaying ? '정지' : '재생'}</span>
                    </button>

                    <button
                      onClick={() => downloadWav(clip.audioBase64, `custom_clip_${clip.id}`)}
                      className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white transition"
                      title="WAV 다운로드"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
