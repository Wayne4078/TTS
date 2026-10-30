import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { BroadcastStage } from './components/BroadcastStage';
import { SoundboardGrid } from './components/SoundboardGrid';
import { InteractiveQuizStage } from './components/InteractiveQuizStage';
import { CustomStudio } from './components/CustomStudio';
import { Sparkles, Radio, Mic, Info, CheckCircle2, AlertCircle } from 'lucide-react';

export default function App() {
  const [selectedVoice, setSelectedVoice] = useState<string>('Fenrir');
  const [sfxEnabled, setSfxEnabled] = useState<boolean>(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [activeTab, setActiveTab] = useState<'broadcast' | 'soundboard' | 'custom' | 'game'>('broadcast');

  // Audio Cache in Memory (key: `${lineId}-${voice}`)
  const [audioCache, setAudioCache] = useState<Record<string, string>>({});
  const [serverStatus, setServerStatus] = useState<{
    status: string;
    hasApiKey: boolean;
    model: string;
  } | null>(null);

  // Check server status on mount
  useEffect(() => {
    fetch('/api/status')
      .then((res) => res.json())
      .then((data) => setServerStatus(data))
      .catch((err) => console.error('Status check failed:', err));
  }, []);

  const handleCacheAudio = useCallback((key: string, base64: string) => {
    setAudioCache((prev) => ({ ...prev, [key]: base64 }));
  }, []);

  // Fetch TTS from server using gemini-3.8-flash-tts
  const fetchTTSAudio = useCallback(async (
    text: string,
    stageCue: string,
    voice: string = selectedVoice
  ): Promise<string> => {
    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        voice,
        stageCue,
        style: 'A warm, resonant, energetic, and dignified veteran Korean TV quiz show host in his 50s-60s. Clear, crisp pronunciation, uplifting ending inflection with confidence, warmth, and vitality.',
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `서버 에러 (${res.status}): 음성 합성 실패`);
    }

    const data = await res.json();
    if (!data.audioBase64) {
      throw new Error('음성 데이터를 수신하지 못했습니다.');
    }
    return data.audioBase64;
  }, [selectedVoice]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Broadcast Studio Header */}
      <Header
        selectedVoice={selectedVoice}
        onSelectVoice={setSelectedVoice}
        sfxEnabled={sfxEnabled}
        onToggleSfx={() => setSfxEnabled((prev) => !prev)}
        playbackSpeed={playbackSpeed}
        onChangeSpeed={setPlaybackSpeed}
        activeTab={activeTab}
        onChangeTab={setActiveTab}
      />

      {/* Main Studio Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Status Callout if API key note */}
        {serverStatus && !serverStatus.hasApiKey && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                Gemini API Key가 설정되지 않았습니다. AI Studio <strong>Settings &gt; Secrets</strong>에서 GEMINI_API_KEY를 등록해 주세요.
              </span>
            </div>
          </div>
        )}

        {/* Tab 1: Continuous Broadcast Stage */}
        {activeTab === 'broadcast' && (
          <BroadcastStage
            selectedVoice={selectedVoice}
            playbackSpeed={playbackSpeed}
            sfxEnabled={sfxEnabled}
            audioCache={audioCache}
            onCacheAudio={handleCacheAudio}
            fetchTTSAudio={fetchTTSAudio}
          />
        )}

        {/* Tab 2: Instant Soundboard Grid */}
        {activeTab === 'soundboard' && (
          <SoundboardGrid
            selectedVoice={selectedVoice}
            playbackSpeed={playbackSpeed}
            sfxEnabled={sfxEnabled}
            audioCache={audioCache}
            onCacheAudio={handleCacheAudio}
            fetchTTSAudio={fetchTTSAudio}
          />
        )}

        {/* Tab 3: Interactive Quiz Stage Simulation */}
        {activeTab === 'game' && (
          <InteractiveQuizStage
            selectedVoice={selectedVoice}
            playbackSpeed={playbackSpeed}
            sfxEnabled={sfxEnabled}
            audioCache={audioCache}
            onCacheAudio={handleCacheAudio}
            fetchTTSAudio={fetchTTSAudio}
          />
        )}

        {/* Tab 4: Custom Quiz Line Studio */}
        {activeTab === 'custom' && (
          <CustomStudio
            selectedVoice={selectedVoice}
            playbackSpeed={playbackSpeed}
            sfxEnabled={sfxEnabled}
            fetchTTSAudio={fetchTTSAudio}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950/90 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="font-semibold text-slate-400">골든벨 퀴즈 명진행자 음성 스튜디오</span>
            <span>·</span>
            <span>50~60대 맞춤 따뜻하고 힘찬 아나운서 말투</span>
          </div>

          <div className="flex items-center gap-2 text-slate-400">
            <span>Powered by</span>
            <span className="font-bold text-amber-400">Gemini 3.8 Flash TTS</span>
            <span>(@google/genai)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
