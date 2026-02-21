import Fastify from 'fastify';
import cors from '@fastify/cors';
import { KNOWLEDGE_POINTS } from './knowledge/knowledge.js';
import type {
  GenerateMathRequest,
  GenerateMathResponse,
  Difficulty,
  Locale,
  VerifyMathRequest,
  VerifyMathResponse
} from './types.js';
import { generateArithmeticQuestion, verifyArithmeticAnswer } from './math/arithmetic.js';

const server = Fastify({ logger: true });

await server.register(cors, {
  origin: true
});

server.get('/api/health', async () => {
  return { ok: true, time: new Date().toISOString() };
});

server.get('/api/knowledge-points', async (req) => {
  const query = (req.query ?? {}) as Partial<{ locale: Locale; grade: string; subject: string }>;
  const locale = (query.locale ?? 'zh-CN') as Locale;
  const grade = query.grade ? Number(query.grade) : undefined;
  const subject = query.subject ?? 'math';

  const filtered = KNOWLEDGE_POINTS.filter(kp => {
    if (kp.subject !== subject) return false;
    if (grade === undefined) return true;
    return grade >= kp.gradeRange[0] && grade <= kp.gradeRange[1];
  });

  return {
    knowledgePoints: filtered.map(kp => ({
      id: kp.id,
      subject: kp.subject,
      gradeRange: kp.gradeRange,
      name: kp.names[locale] ?? kp.names['zh-CN']
    }))
  };
});

server.post('/api/math/generate', async (req): Promise<GenerateMathResponse> => {
  const body = (req.body ?? {}) as Partial<GenerateMathRequest>;
  const locale = (body.locale ?? 'zh-CN') as Locale;
  const grade = Number(body.grade ?? 1);
  const count = Math.max(1, Math.min(200, Number(body.count ?? 10)));
  const requestedIds = Array.isArray(body.knowledgePointIds) ? body.knowledgePointIds : [];
  const difficulty: Difficulty = body.difficulty === 'easy' || body.difficulty === 'hard' ? body.difficulty : 'normal';

  const selectable = KNOWLEDGE_POINTS.filter(kp => {
    if (kp.subject !== 'math') return false;
    const inGrade = grade >= kp.gradeRange[0] && grade <= kp.gradeRange[1];
    if (!inGrade) return false;
    if (requestedIds.length === 0) return true;
    return requestedIds.includes(kp.id);
  });

  if (selectable.length === 0) {
    // Return an empty set rather than throwing for now; frontend will show message.
    return { questions: [] };
  }

  const questions = Array.from({ length: count }).map(() => {
    const kp = selectable[Math.floor(Math.random() * selectable.length)];
    return generateArithmeticQuestion({ locale, grade, kp, difficulty });
  });

  // Self-check (independent from generation logic) for safety.
  for (const q of questions) {
    const v = verifyArithmeticAnswer(q, q.answer);
    if (!v.correct) {
      server.log.warn({ q, v }, 'Generated question failed verification');
    }
  }

  return { questions };
});

server.post('/api/math/verify', async (req): Promise<VerifyMathResponse> => {
  const body = (req.body ?? {}) as Partial<VerifyMathRequest>;
  if (!body.question) {
    return { correct: false, expectedAnswer: NaN };
  }
  return verifyArithmeticAnswer(body.question, body.userAnswer ?? '');
});

const port = Number(process.env.PORT ?? 3001);
const host = process.env.HOST ?? '127.0.0.1';

await server.listen({ port, host });
