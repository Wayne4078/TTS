import React from 'react';
import { Radio, Mic, Volume2, VolumeX, Sparkles, Sliders } from 'lucide-react';
import { HOST_VOICES, HostVoiceOption } from '../data/quizLines';

interface HeaderProps {
  selectedVoice: string;
  onSelectVoice: (voiceId: string) => void;
  sfxEnabled: boolean;
  onToggleSfx: () => void;
  playbackSpeed: number;
  onChangeSpeed: (speed: number) => void;
  activeTab: 'broadcast' | 'soundboard' | 'custom' | 'game';
  onChangeTab: (tab: 'broadcast' | 'soundboard' | 'custom' | 'game') => void;
}

export const Header: React.FC<HeaderProps> = ({
  selectedVoice,
  onSelectVoice,
  sfxEnabled,
  onToggleSfx,
  playbackSpeed,
  onChangeSpeed,
  activeTab,
  onChangeTab,
}) => {
  const currentVoiceObj = HOST_VOICES.find((v) => v.id === selectedVoice) || HOST_VOICES[0];

  return (
    <header className="relative border-b border-amber-500/20 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
      {/* Top Banner with Studio Glow */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Logo & Persona Badge */}
          <div className="flex items-center gap-3.5">
            <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 via-amber-600 to-yellow-600 shadow-lg shadow-amber-500/25 border border-amber-300/40">
              <Mic className="w-6 h-6 text-slate-950 drop-shadow" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-red-600/90 text-white shadow-sm shadow-red-600/40 animate-pulse">
                  <Radio className="w-3 h-3" />
                  ON AIR
                </span>
                <span className="text-[11px] font-semibold text-amber-400/90 tracking-wide">
                  50~60대 취향저격 국민 아나운서
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                골든벨 퀴즈 명진행자 <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500">TTS 스튜디오</span>
              </h1>
            </div>
          </div>

          {/* Controls: Voice selector, SFX toggle, Speed */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            {/* Model Badge */}
            <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>gemini-3.8-flash-tts</span>
            </div>

            {/* Voice Persona Dropdown */}
            <div className="relative">
              <select
                value={selectedVoice}
                onChange={(e) => onSelectVoice(e.target.value)}
                className="appearance-none bg-slate-900/90 border border-amber-500/30 hover:border-amber-400 text-slate-100 text-xs sm:text-sm font-semibold rounded-xl px-3.5 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-amber-400/50 cursor-pointer shadow-sm transition"
              >
                {HOST_VOICES.map((v) => (
                  <option key={v.id} value={v.id} className="bg-slate-900 text-slate-100">
                    {v.name} ({v.recommendedRole.split('(')[0].trim()})
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-amber-400">
                <Sliders className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Playback Speed */}
            <div className="flex items-center bg-slate-900/90 border border-slate-800 rounded-xl p-0.5 text-xs">
              {[0.8, 1.0, 1.2].map((spd) => (
                <button
                  key={spd}
                  onClick={() => onChangeSpeed(spd)}
                  className={`px-2 py-1 rounded-lg font-bold transition ${
                    playbackSpeed === spd
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title={`재생 속도 ${spd}배속`}
                >
                  {spd}x
                </button>
              ))}
            </div>

            {/* SFX Button */}
            <button
              onClick={onToggleSfx}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                sfxEnabled
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-300'
              }`}
              title="효과음 (딩동댕, 땡, 팡파르) 켜기/끄기"
            >
              {sfxEnabled ? <Volume2 className="w-3.5 h-3.5 text-amber-400" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span>효과음 {sfxEnabled ? 'ON' : 'OFF'}</span>
            </button>
          </div>
        </div>

        {/* Studio Navigation Tabs */}
        <div className="flex items-center gap-1.5 mt-3 pt-2 border-t border-slate-800/80 overflow-x-auto no-scrollbar">
          <button
            onClick={() => onChangeTab('broadcast')}
            className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold tracking-tight whitespace-nowrap transition flex items-center gap-2 ${
              activeTab === 'broadcast'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>생방송 10선 연속 모드 (1초 휴식)</span>
          </button>

          <button
            onClick={() => onChangeTab('soundboard')}
            className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold tracking-tight whitespace-nowrap transition flex items-center gap-2 ${
              activeTab === 'soundboard'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Mic className="w-4 h-4" />
            <span>원클릭 퀴즈 사운드보드</span>
          </button>

          <button
            onClick={() => onChangeTab('game')}
            className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold tracking-tight whitespace-nowrap transition flex items-center gap-2 ${
              activeTab === 'game'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>체험! 생생 퀴즈쇼 스테이지</span>
          </button>

          <button
            onClick={() => onChangeTab('custom')}
            className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold tracking-tight whitespace-nowrap transition flex items-center gap-2 ${
              activeTab === 'custom'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>나만의 퀴즈 멘트 녹음실</span>
          </button>
        </div>
      </div>
    </header>
  );
};
