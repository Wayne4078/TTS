import React, { useState } from 'react';
import {
  Trophy,
  CheckCircle2,
  XCircle,
  Sparkles,
  Play,
  RotateCcw,
  Volume2,
  Award,
  Crown,
  GraduationCap,
  Flame,
} from 'lucide-react';
import { SAMPLE_QUIZZES, MiniQuizQuestion, QUIZ_LINES } from '../data/quizLines';
import { sfx } from '../utils/audioUtils';

interface InteractiveQuizStageProps {
  selectedVoice: string;
  playbackSpeed: number;
  sfxEnabled: boolean;
  audioCache: Record<string, string>;
  onCacheAudio: (id: string, base64: string) => void;
  fetchTTSAudio: (text: string, stageCue: string, voice?: string) => Promise<string>;
}

export const InteractiveQuizStage: React.FC<InteractiveQuizStageProps> = ({
  selectedVoice,
  playbackSpeed,
  sfxEnabled,
  audioCache,
  onCacheAudio,
  fetchTTSAudio,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [hostAnnouncing, setHostAnnouncing] = useState<string | null>(null);

  const currentQuiz = SAMPLE_QUIZZES[currentStep];

  // Helper to trigger specific quiz line
  const speakLine = async (lineId: string) => {
    const line = QUIZ_LINES.find((l) => l.id === lineId);
    if (!line) return;

    try {
      setHostAnnouncing(line.broadcastText);
      const cacheKey = `${line.id}-${selectedVoice}`;
      let base64 = audioCache[cacheKey];

      if (!base64) {
        base64 = await fetchTTSAudio(line.broadcastText, line.stageCue, selectedVoice);
        onCacheAudio(cacheKey, base64);
      }

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
      audio.onended = () => setHostAnnouncing(null);
      audio.onerror = () => setHostAnnouncing(null);
      await audio.play();
    } catch (e) {
      console.error(e);
      setHostAnnouncing(null);
    }
  };

  const handleSelectAnswer = async (ans: string | number) => {
    if (isAnswerSubmitted) return;
    setSelectedAnswer(ans);
    setIsAnswerSubmitted(true);

    const isCorrect = ans === currentQuiz.correctAnswer;

    if (isCorrect) {
      setScore((prev) => prev + 1);
      // Pick random celebratory line
      if (currentStep === 4) {
        // Last question
        await speakLine('correct-3'); // 대박! 전원 정답!
      } else if (currentStep % 2 === 0) {
        await speakLine('correct-1'); // 정답입니다!
      } else {
        await speakLine('correct-2'); // 맞았어요!
      }
    } else {
      await speakLine('encourage-1'); // 아~ 아깝습니다!
    }
  };

  const handleNextQuestion = () => {
    if (currentStep < SAMPLE_QUIZZES.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      setSelectedAnswer(null);
      setIsAnswerSubmitted(false);

      // If next is question 5 ("오늘의 난제"), automatically cue the tension!
      if (nextStep === 4) {
        speakLine('challenge-1'); // 오늘의 난제! 도전하시겠습니까?
      }
    } else {
      setIsFinished(true);
      // Final Title announcement
      const finalScore = score + (selectedAnswer === currentQuiz.correctAnswer ? 0 : 0);
      if (finalScore >= 5) {
        speakLine('title-2'); // 축하합니다! 상식왕!
      } else if (finalScore >= 4) {
        speakLine('title-1'); // 축하합니다! 박식가!
      } else if (finalScore >= 3) {
        speakLine('title-3'); // 축하합니다! 상식 박사!
      } else {
        speakLine('encourage-2'); // 도착! 정말 잘하셨어요!
      }
    }
  };

  const handleRestart = () => {
    setCurrentStep(0);
    setSelectedAnswer(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    setIsFinished(false);
    setHostAnnouncing(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Quiz Game Container */}
      <div className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-slate-900/90 p-6 sm:p-8 shadow-2xl backdrop-blur-md">
        
        {/* Host Live Reaction Banner */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-amber-300">진행자 실시간 리액션 퀴즈쇼</span>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs text-slate-400">
            <span>현재 점수:</span>
            <span className="text-amber-400 font-bold">{score} / {SAMPLE_QUIZZES.length}</span>
          </div>
        </div>

        {/* Live Host Speech Callout */}
        {hostAnnouncing && (
          <div className="my-4 p-4 rounded-2xl bg-amber-500/20 border-2 border-amber-400 text-center animate-bounce">
            <span className="text-xs font-bold text-amber-300 block mb-1">🎤 베테랑 진행자의 외침!</span>
            <span className="text-xl sm:text-2xl font-black text-white">&ldquo;{hostAnnouncing}&rdquo;</span>
          </div>
        )}

        {!isFinished ? (
          <div className="py-6 space-y-6">
            {/* Question Progress & Difficulty */}
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-xl bg-slate-800 text-xs font-bold text-slate-300">
                문제 {currentStep + 1} / {SAMPLE_QUIZZES.length}
              </span>

              {currentQuiz.difficulty === '난제' ? (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/40 text-xs font-extrabold animate-pulse">
                  <Flame className="w-3.5 h-3.5 text-purple-400" />
                  오늘의 난제 (최종 관문)
                </span>
              ) : (
                <span className="px-3 py-1 rounded-xl bg-blue-500/10 text-blue-300 border border-blue-500/20 text-xs font-semibold">
                  난이도: {currentQuiz.difficulty}
                </span>
              )}
            </div>

            {/* Question Text */}
            <div className="text-center py-4">
              <h3 className="text-xl sm:text-3xl font-black text-white leading-snug">
                {currentQuiz.question}
              </h3>
            </div>

            {/* Answer Options */}
            {currentQuiz.type === 'OX' ? (
              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                {['O', 'X'].map((choice) => {
                  const isSelected = selectedAnswer === choice;
                  const isCorrect = isAnswerSubmitted && currentQuiz.correctAnswer === choice;
                  const isWrong = isAnswerSubmitted && isSelected && currentQuiz.correctAnswer !== choice;

                  return (
                    <button
                      key={choice}
                      onClick={() => handleSelectAnswer(choice)}
                      disabled={isAnswerSubmitted}
                      className={`h-28 rounded-2xl text-4xl sm:text-5xl font-black transition flex items-center justify-center border-2 shadow-lg ${
                        isCorrect
                          ? 'bg-emerald-600/30 border-emerald-400 text-emerald-300 ring-4 ring-emerald-500/30'
                          : isWrong
                          ? 'bg-rose-600/30 border-rose-400 text-rose-300 ring-4 ring-rose-500/30'
                          : isSelected
                          ? 'bg-amber-500/30 border-amber-400 text-amber-300'
                          : 'bg-slate-800/80 hover:bg-slate-700/80 border-slate-700 text-slate-100 hover:border-amber-400/60'
                      }`}
                    >
                      {choice}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto">
                {currentQuiz.options?.map((opt, idx) => {
                  const isSelected = selectedAnswer === idx;
                  const isCorrect = isAnswerSubmitted && currentQuiz.correctAnswer === idx;
                  const isWrong = isAnswerSubmitted && isSelected && currentQuiz.correctAnswer !== idx;

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectAnswer(idx)}
                      disabled={isAnswerSubmitted}
                      className={`p-4 rounded-2xl text-left font-bold text-sm sm:text-base transition border-2 flex items-center justify-between ${
                        isCorrect
                          ? 'bg-emerald-600/30 border-emerald-400 text-emerald-200'
                          : isWrong
                          ? 'bg-rose-600/30 border-rose-400 text-rose-200'
                          : isSelected
                          ? 'bg-amber-500/30 border-amber-400 text-amber-200'
                          : 'bg-slate-800/80 hover:bg-slate-700/80 border-slate-700 text-slate-100 hover:border-amber-400/50'
                      }`}
                    >
                      <span>{idx + 1}. {opt}</span>
                      {isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
                      {isWrong && <XCircle className="w-5 h-5 text-rose-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Answer Explanation & Next Button */}
            {isAnswerSubmitted && (
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-center space-y-3 animate-fade-in">
                <p className="text-slate-300 text-xs sm:text-sm">
                  💡 <strong>해설:</strong> {currentQuiz.explanation}
                </p>

                <button
                  onClick={handleNextQuestion}
                  className="px-8 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/20 transition hover:scale-105"
                >
                  {currentStep === SAMPLE_QUIZZES.length - 1 ? '최종 결과 및 칭호 수여식' : '다음 문제 도전'}
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Quiz Results Celebration Screen */
          <div className="py-10 text-center space-y-6">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center shadow-xl shadow-amber-500/30">
              <Trophy className="w-10 h-10 text-slate-950" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                최종 칭호 수여식
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white">
                {score === 5 ? '축하합니다! 상식왕·OX 명인 등극!' : score >= 3 ? '축하합니다! 박식가 등극!' : '도착! 정말 잘하셨어요!'}
              </h2>
              <p className="text-slate-300 text-sm max-w-md mx-auto">
                총 {SAMPLE_QUIZZES.length}문제 중 <strong>{score}문제</strong>를 맞히셨습니다!
                베테랑 진행자가 온 마음을 다해 아낌없는 박수와 환호를 보냅니다.
              </p>
            </div>

            {/* Soundboard Shortcuts to Replay Honors */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={() => speakLine('title-2')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300 font-bold text-xs hover:bg-amber-500/30 transition"
              >
                <Crown className="w-4 h-4 text-amber-400" />
                <span>&ldquo;축하합니다! 상식왕!&rdquo; 듣기</span>
              </button>

              <button
                onClick={() => speakLine('title-4')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-fuchsia-500/20 border border-fuchsia-400/40 text-fuchsia-300 font-bold text-xs hover:bg-fuchsia-500/30 transition"
              >
                <Trophy className="w-4 h-4 text-fuchsia-400" />
                <span>&ldquo;축하합니다! OX 명인!&rdquo; 듣기</span>
              </button>

              <button
                onClick={() => speakLine('title-1')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-500/20 border border-violet-400/40 text-violet-300 font-bold text-xs hover:bg-violet-500/30 transition"
              >
                <Award className="w-4 h-4 text-violet-400" />
                <span>&ldquo;축하합니다! 박식가!&rdquo; 듣기</span>
              </button>
            </div>

            <div className="pt-4">
              <button
                onClick={handleRestart}
                className="flex items-center gap-2 mx-auto px-6 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm border border-slate-700 transition"
              >
                <RotateCcw className="w-4 h-4" />
                <span>처음부터 다시 도전하기</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
