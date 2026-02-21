import type { Locale } from './i18n';

export type KnowledgePoint = {
  id: string;
  subject: string;
  gradeRange: [number, number];
  name: string;
};

export type ArithmeticQuestion = {
  id: string;
  subject: 'math';
  kind: 'arithmetic';
  knowledgePointId: string;
  grade: number;
  locale: Locale;
  operator: '+' | '-' | '*' | '/';
  operands: [number, number];
  stem: string;
  answer: number;
};

export async function getHealth(): Promise<boolean> {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) return false;
    const json = await res.json();
    return Boolean(json?.ok);
  } catch {
    return false;
  }
}

export async function getKnowledgePoints(params: { locale: Locale; grade: number }): Promise<KnowledgePoint[]> {
  const url = new URL('/api/knowledge-points', window.location.origin);
  url.searchParams.set('subject', 'math');
  url.searchParams.set('locale', params.locale);
  url.searchParams.set('grade', String(params.grade));

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error('Failed to fetch knowledge points');
  const json = await res.json();
  return (json?.knowledgePoints ?? []) as KnowledgePoint[];
}

export async function generateMath(params: {
  locale: Locale;
  grade: number;
  knowledgePointIds: string[];
  difficulty: 'easy' | 'normal' | 'hard';
  count: number;
}): Promise<ArithmeticQuestion[]> {
  const res = await fetch('/api/math/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  if (!res.ok) throw new Error('Failed to generate');
  const json = await res.json();
  return (json?.questions ?? []) as ArithmeticQuestion[];
}
