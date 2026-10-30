import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Shared Gemini Client
function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set. Please set it in Settings > Secrets.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Check status endpoint
app.get('/api/status', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    model: 'gemini-3.8-flash-tts',
  });
});

// TTS Endpoint using gemini-3.8-flash-tts
app.post('/api/tts', async (req, res) => {
  try {
    const {
      text,
      voice = 'Fenrir',
      style = 'A warm, resonant, energetic, and dignified veteran Korean TV quiz show host in his 50s-60s. Clear, crisp pronunciation, uplifting ending inflection with confidence, warmth, and vitality.',
      stageCue,
    } = req.body;

    if (!text || typeof text !== 'string') {
      res.status(400).json({ error: 'Text prompt is required.' });
      return;
    }

    const ai = getGeminiClient();

    // Incorporate stage cue if provided into speechMetadata or text
    const fullStyleDescription = stageCue
      ? `${style}. Emotional cue: ${stageCue}`
      : style;

    // Use gemini-3.8-flash-tts as specified by instructions
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: text.trim(),
              speechMetadata: {
                style: fullStyleDescription,
                speaker: 'Host',
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: voice,
            },
          },
        },
      },
    });

    // Extract audio data
    const part = response.candidates?.[0]?.content?.parts?.[0];
    const base64Audio = part?.inlineData?.data;

    if (!base64Audio) {
      console.error('No audio returned in response:', JSON.stringify(response, null, 2));
      res.status(502).json({
        error: 'No audio data received from Gemini 3.8 Flash TTS.',
        details: response.text || 'Empty response part',
      });
      return;
    }

    res.json({
      audioBase64: base64Audio,
      mimeType: part?.inlineData?.mimeType || 'audio/wav',
      text,
      voice,
    });
  } catch (error: any) {
    console.error('Error generating TTS:', error);
    const status = error?.status || 500;
    const message = error?.message || 'Failed to synthesize speech';
    res.status(status).json({
      error: message,
      code: error?.code,
      status: error?.status,
    });
  }
});

// Dynamic Script Generation Endpoint using gemini-3.8-flash
app.post('/api/generate-line', async (req, res) => {
  try {
    const { situation, emotion = 'warm-enthusiastic' } = req.body;
    const ai = getGeminiClient();

    const prompt = `당신은 50~60대 시청자가 가장 신뢰하고 사랑하는 대한민국 전설의 TV 퀴즈쇼(골든벨, 장학퀴즈, 1대100 스타일) 베테랑 남성 아나운서 진행자입니다.
상황: "${situation || '결승전 진출자 발표'}"
분위기/감정: "${emotion}"

요구사항:
1. 50~60대 시청자에게 친근하고 품격 있으며, 우렁차고 명쾌한 어조.
2. 한눈에 들어오는 1~2줄의 강렬한 멘트 (끝을 시원하게 올리는 느낌).
3. 괄호 안에 연기 지도 지문(stage cue)을 포함할 것. 예: "(두 주먹을 불끈 쥐며 힘차고 시원하게) 정답입니다—!"

반드시 아래 JSON 형식으로만 답해주세요:
{
  "cue": "연기 지문",
  "line": "외칠 대사",
  "explanation": "이 멘트의 톤앤매너 설명"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Error generating line:', error);
    res.status(500).json({ error: error.message || 'Failed to generate quiz line' });
  }
});

// Setup Vite or Static File Serving
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Quiz Show Host Studio server listening on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
