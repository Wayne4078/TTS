export interface QuizLine {
  id: string;
  order: number;
  category: 'opening' | 'correct' | 'encourage' | 'challenge' | 'title';
  categoryLabel: string;
  title: string;
  originalText: string;
  broadcastText: string;
  stageCue: string;
  toneStyle: string;
  bgGradient: string;
  borderGlow: string;
  badgeColor: string;
  iconName: string;
  tip: string;
}

export const OPENING_LINE: QuizLine = {
  id: 'opening',
  order: 0,
  category: 'opening',
  categoryLabel: '오프닝',
  title: '오프닝 인사',
  originalText: '네, 시청자 여러분 안녕하십니까! 오늘도 힘차고 시원하게 외쳐드립니다!',
  broadcastText: '네, 시청자 여러분 안녕하십니까! 오늘도 힘차고 시원하게 외쳐드립니다!',
  stageCue: '인자하면서도 활기찬 미소를 머금고, 마이크를 고쳐 쥐며 힘차고 또박또박 외칩니다',
  toneStyle: 'A warm, welcoming, and vibrant greeting by a beloved Korean broadcast veteran MC.',
  bgGradient: 'from-amber-950/40 via-amber-900/20 to-slate-900/60',
  borderGlow: 'hover:border-amber-400/60 border-amber-500/30',
  badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  iconName: 'Mic',
  tip: '스튜디오의 막이 오르며 50~60대 안방 시청자에게 신뢰와 반가움을 전하는 오프닝입니다.',
};

export const QUIZ_LINES: QuizLine[] = [
  {
    id: 'correct-1',
    order: 1,
    category: 'correct',
    categoryLabel: '정답 선언',
    title: '명쾌한 정답',
    originalText: '정답입니다!',
    broadcastText: '정답입니다—!',
    stageCue: '끝을 시원하게 올리며 명쾌하게',
    toneStyle: 'Crisp, decisive, and wonderfully uplifting with an exhilarating final rise.',
    bgGradient: 'from-emerald-950/50 via-teal-900/20 to-slate-900/60',
    borderGlow: 'hover:border-emerald-400/60 border-emerald-500/30',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    iconName: 'CheckCircle2',
    tip: '퀴즈쇼의 백미! 가슴을 뻥 뚫어주는 통쾌한 정답 판정입니다.',
  },
  {
    id: 'correct-2',
    order: 2,
    category: 'correct',
    categoryLabel: '정답 공감',
    title: '다정한 호응',
    originalText: '맞았어요!',
    broadcastText: '맞았어요—!',
    stageCue: '두 눈을 반짝이며 다정하고 힘차게',
    toneStyle: 'Warm, supportive, and delightedly affirmative like a proud mentor.',
    bgGradient: 'from-cyan-950/50 via-blue-900/20 to-slate-900/60',
    borderGlow: 'hover:border-cyan-400/60 border-cyan-500/30',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    iconName: 'Smile',
    tip: '출연자의 눈을 맞추며 부모님 같은 온화함으로 맞장구쳐주는 멘트입니다.',
  },
  {
    id: 'encourage-1',
    order: 3,
    category: 'encourage',
    categoryLabel: '위로와 격려',
    title: '안타까운 탄식',
    originalText: '아~ 아깝습니다!',
    broadcastText: '아~ 아깝습니다—!',
    stageCue: '가슴 깊이 안타까운 탄식을 담아 다독이듯',
    toneStyle: 'Empathetic, soothing, yet hopeful with genuine warmth and comfort.',
    bgGradient: 'from-rose-950/50 via-orange-900/20 to-slate-900/60',
    borderGlow: 'hover:border-rose-400/60 border-rose-500/30',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    iconName: 'HeartHandshake',
    tip: '탈락한 도전자가 기죽지 않도록 따스하게 등을 토닥여주는 어른의 목소리입니다.',
  },
  {
    id: 'correct-3',
    order: 4,
    category: 'correct',
    categoryLabel: '특급 축제',
    title: '전원 정답 환호',
    originalText: '대박! 전원 정답!',
    broadcastText: '대박! 전원 정답—!',
    stageCue: '두 주먹을 불끈 쥐며 우렁차게',
    toneStyle: 'Explosive, booming, jubilant celebration with theatrical grandeur.',
    bgGradient: 'from-amber-950/60 via-yellow-900/30 to-slate-900/60',
    borderGlow: 'hover:border-yellow-400/70 border-yellow-500/40',
    badgeColor: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
    iconName: 'Sparkles',
    tip: '모든 방청객과 출연진이 하나 되어 함성을 지를 때 터져 나오는 클라이맥스 멘트!',
  },
  {
    id: 'challenge-1',
    order: 5,
    category: 'challenge',
    categoryLabel: '난제 도전',
    title: '긴장감 고조',
    originalText: '오늘의 난제! 도전하시겠습니까?',
    broadcastText: '오늘의 난제! 도전하시겠습니까—?!',
    stageCue: '무게감 있으면서도 호기심을 한껏 끌어올리며',
    toneStyle: 'Suspenseful, dramatic, dignified with an intriguing rising question at the end.',
    bgGradient: 'from-purple-950/50 via-indigo-900/20 to-slate-900/60',
    borderGlow: 'hover:border-purple-400/60 border-purple-500/30',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    iconName: 'Flame',
    tip: '스튜디오 조명이 어두워지며 숨죽이는 순간, 도전자의 결단을 촉구하는 명대사입니다.',
  },
  {
    id: 'encourage-2',
    order: 6,
    category: 'encourage',
    categoryLabel: '골인 축하',
    title: '도착 완료',
    originalText: '도착! 정말 잘하셨어요!',
    broadcastText: '도착! 정말 잘하셨어요—!',
    stageCue: '따뜻한 박수와 함께 온화하고 든든하게',
    toneStyle: 'Warm applause, profound satisfaction and fatherly proud encouragement.',
    bgGradient: 'from-blue-950/50 via-indigo-900/20 to-slate-900/60',
    borderGlow: 'hover:border-blue-400/60 border-blue-500/30',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    iconName: 'Flag',
    tip: '긴 여정을 끝마친 참가자에게 뜨거운 위로와 찬사를 건네는 든든한 마무리입니다.',
  },
  {
    id: 'title-1',
    order: 7,
    category: 'title',
    categoryLabel: '명예 칭호',
    title: '박식가 헌정',
    originalText: '축하합니다! 박식가!',
    broadcastText: '축하합니다! 박식가—!',
    stageCue: '시원하고 당당하게 울려 퍼지는 목소리로',
    toneStyle: 'Resonant, grand, majestic fanfare of words celebrating intellectual prowess.',
    bgGradient: 'from-violet-950/50 via-fuchsia-900/20 to-slate-900/60',
    borderGlow: 'hover:border-violet-400/60 border-violet-500/30',
    badgeColor: 'bg-violet-500/20 text-violet-300 border-violet-500/40',
    iconName: 'BookOpen',
    tip: '방대한 지식을 겸비한 도전자에게 부여하는 품격 높은 영예의 호칭입니다.',
  },
  {
    id: 'title-2',
    order: 8,
    category: 'title',
    categoryLabel: '명예 칭호',
    title: '상식왕 등극',
    originalText: '축하합니다! 상식왕!',
    broadcastText: '축하합니다! 상식왕—!',
    stageCue: '엄지를 척 치켜세우며 쩌렁쩌렁하게',
    toneStyle: 'Enthusiastic, thunderous congratulations honoring the king of common sense.',
    bgGradient: 'from-amber-950/50 via-orange-900/20 to-slate-900/60',
    borderGlow: 'hover:border-amber-400/70 border-amber-500/40',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    iconName: 'Crown',
    tip: '전국민이 인정하는 상식의 제왕에게 선사하는 쩌렁쩌렁한 등극 선언!',
  },
  {
    id: 'title-3',
    order: 9,
    category: 'title',
    categoryLabel: '명예 칭호',
    title: '상식 박사 수여',
    originalText: '축하합니다! 상식 박사!',
    broadcastText: '축하합니다! 상식 박사—!',
    stageCue: '진심 어린 존경과 환희를 담아',
    toneStyle: 'Deep respect, joyful admiration, and distinguished academic authority.',
    bgGradient: 'from-emerald-950/50 via-cyan-900/20 to-slate-900/60',
    borderGlow: 'hover:border-emerald-400/60 border-emerald-500/30',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    iconName: 'GraduationCap',
    tip: '어려운 관문을 모두 뚫고 박사 칭호를 거머쥔 주인공에게 바치는 헌사입니다.',
  },
  {
    id: 'title-4',
    order: 10,
    category: 'title',
    categoryLabel: '명예 칭호',
    title: 'OX 명인 탄생',
    originalText: '축하합니다! OX 명인!',
    broadcastText: '축하합니다! OX 명인—!',
    stageCue: '스튜디오를 가득 채우듯 가장 크고 시원하게',
    toneStyle: 'The grandest, most booming, studio-shaking crescendo of victory.',
    bgGradient: 'from-fuchsia-950/60 via-rose-900/30 to-slate-900/60',
    borderGlow: 'hover:border-fuchsia-400/70 border-fuchsia-500/40',
    badgeColor: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/40',
    iconName: 'Trophy',
    tip: '아슬아슬한 OX 관문을 완벽히 통과한 명인을 향한 대망의 피날레 축포입니다.',
  },
];

export interface HostVoiceOption {
  id: string;
  name: string;
  gender: 'male' | 'female';
  toneDesc: string;
  recommendedRole: string;
  isDefault?: boolean;
}

export const HOST_VOICES: HostVoiceOption[] = [
  {
    id: 'Fenrir',
    name: '펜리르 (Fenrir)',
    gender: 'male',
    toneDesc: '중후하고 깊은 울림, 호탕하고 힘찬 50대 남성 아나운서',
    recommendedRole: '골든벨·장학퀴즈 명MC (적극 권장)',
    isDefault: true,
  },
  {
    id: 'Charon',
    name: '카론 (Charon)',
    gender: 'male',
    toneDesc: '지적이고 신뢰감 넘치는 표준어 앵커, 부드러운 카리스마',
    recommendedRole: '교양·시사 퀴즈 정통 진행자',
  },
  {
    id: 'Puck',
    name: '퍽 (Puck)',
    gender: 'male',
    toneDesc: '밝고 쾌활한 하이톤 에너지, 재치 있는 진행',
    recommendedRole: '청춘 스튜디오·예능 퀴즈쇼 MC',
  },
  {
    id: 'Kore',
    name: '코레 (Kore)',
    gender: 'female',
    toneDesc: '단아하고 또렷한 발음, 온화하면서도 절도 있는 여성 아나운서',
    recommendedRole: '우리말 겨루기 스타일 명품 여성 진행자',
  },
  {
    id: 'Zephyr',
    name: '제피르 (Zephyr)',
    gender: 'female',
    toneDesc: '생동감 있고 박진감 넘치는 당당한 목소리',
    recommendedRole: '생방송 현장 퀴즈 진행자',
  },
];

// Fun Mini Quiz for the live host interactive simulation
export interface MiniQuizQuestion {
  id: number;
  type: 'OX' | 'CHOICE';
  question: string;
  options?: string[];
  correctAnswer: string | number; // 'O' | 'X' or index
  explanation: string;
  difficulty: '쉬움' | '보통' | '난제';
}

export const SAMPLE_QUIZZES: MiniQuizQuestion[] = [
  {
    id: 1,
    type: 'OX',
    question: '지구상에서 가장 큰 포유류는 흰긴수염고래(대왕고래)이다.',
    correctAnswer: 'O',
    explanation: '흰긴수염고래는 최대 몸길이 30m, 무게 180톤에 달하는 지구 역사상 가장 거대한 동물입니다.',
    difficulty: '쉬움',
  },
  {
    id: 2,
    type: 'CHOICE',
    question: '훈민정음 해례본(국보 제70호)이 유네스코 세계기록유산에 등재된 연도는?',
    options: ['1995년', '1997년', '2001년', '2005년'],
    correctAnswer: 1, // 1997년
    explanation: '훈민정음 해례본은 조선왕조실록과 함께 1997년 유네스코 세계기록유산에 최초 등재되었습니다.',
    difficulty: '보통',
  },
  {
    id: 3,
    type: 'OX',
    question: '토마토는 채소류가 아니라 순수한 과일로 법적 분류된다.',
    correctAnswer: 'X',
    explanation: '식물학적으로는 열매 채소(과채류)이며, 법적 및 관세상으로도 채소로 분류됩니다.',
    difficulty: '보통',
  },
  {
    id: 4,
    type: 'CHOICE',
    question: '한국 전통 국악기 중 줄이 12줄로 이루어진 현악기는 무엇일까요?',
    options: ['거문고', '가야금', '아쟁', '해금'],
    correctAnswer: 1, // 가야금 (기본 12줄, 거문고는 6줄)
    explanation: '가야금의 전통 산조/정악 가야금은 12현으로 구성되어 있습니다.',
    difficulty: '보통',
  },
  {
    id: 5,
    type: 'CHOICE',
    question: '[오늘의 난제] 조선시대 왕실의 행사와 의식을 글과 그림으로 상세히 기록한 서책은?',
    options: ['경국대전', '조선왕조실록', '조선왕조의궤', '승정원일기'],
    correctAnswer: 2, // 조선왕조의궤
    explanation: '조선왕조의궤는 주요 국가 의례를 그림(반차도)과 상세 글으로 남긴 귀중한 기록유산입니다.',
    difficulty: '난제',
  },
];
