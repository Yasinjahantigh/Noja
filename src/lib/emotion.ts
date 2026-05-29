import { Emotion } from '../types';

const emotionKeywords: Record<Emotion, string[]> = {
  happy: ['شادی', 'عشق', 'خوشحال', 'عالی', 'شگفت‌انگیز', 'زیبا', 'لبخند', 'خنده', 'هیجان‌زده', 'مفتخر', 'فوق‌العاده', 'خوب', 'خوشنود', 'هورا', 'تشکر', 'ممنون', 'قدردانی', 'امید'],
  sad: ['غمگین', 'گریه', 'اشک', 'شکسته', 'درد', 'رنج', 'تنها', 'دلتنگ', 'تنهایی', 'سوگ', 'افسرده', 'پایین', 'ناراحت', 'اندوه', 'دلشکسته', 'غم'],
  angry: ['نفرت', 'عصبانی', 'خشم', 'خشمگین', 'احمق', 'خنگ', 'غضب', 'کلافه', 'اذیت', 'وحشتناک', 'افتضاح', 'بدترین', 'آزار', 'عذاب', 'بد'],
  calm: ['صلح', 'سکوت', 'آرام', 'استراحت', 'نفس', 'ساکن', 'مدیتیشن', 'خواب', 'ملایم', 'نرم', 'نسیم', 'جریان', 'آسان', 'آرامش', 'امن'],
  neutral: []
};

const cache = new Map<string, Emotion>();

export function analyzeEmotion(text: string): Emotion {
  const normalized = text.toLowerCase().trim();
  
  if (cache.has(normalized)) {
    return cache.get(normalized)!;
  }

  const words = normalized.split(/[\s،.؟!]+/);
  
  const scores = {
    happy: 0,
    sad: 0,
    angry: 0,
    calm: 0,
    neutral: 0,
  };

  for (const word of words) {
    if (!word) continue;
    for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
      if (emotion === 'neutral') continue;
      if (keywords.includes(word)) {
        scores[emotion as Emotion]++;
      }
    }
  }

  let maxEmotion: Emotion = 'neutral';
  let maxScore = 0;

  for (const [emotion, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      maxEmotion = emotion as Emotion;
    }
  }

  if (maxScore === 0) {
    maxEmotion = 'calm';
  }

  cache.set(normalized, maxEmotion);
  return maxEmotion;
}
