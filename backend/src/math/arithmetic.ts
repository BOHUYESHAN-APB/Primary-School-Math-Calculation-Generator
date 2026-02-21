import type { ArithmeticQuestion, Difficulty, KnowledgePoint, Locale } from '../types.js';

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function makeId() {
  return `q_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

function compute(operator: '+' | '-' | '*' | '/', a: number, b: number) {
  switch (operator) {
    case '+':
      return a + b;
    case '-':
      return a - b;
    case '*':
      return a * b;
    case '/':
      return b === 0 ? NaN : a / b;
    default:
      return NaN;
  }
}

export function generateArithmeticQuestion(params: {
  locale: Locale;
  grade: number;
  kp: KnowledgePoint;
  difficulty: Difficulty;
}): ArithmeticQuestion {
  const { locale, grade, kp, difficulty } = params;
  const { operator, maxOperand, maxResult, allowNegative } = kp.generator;

  // For now, only generate 2-operand arithmetic.
  let a = 0;
  let b = 0;
  let answer = 0;

  const operandCap =
    difficulty === 'easy' ? Math.max(1, Math.floor(maxOperand * 0.6)) : maxOperand;
  const operandMin =
    difficulty === 'hard' ? Math.max(0, Math.floor(maxOperand * 0.5)) : 0;

  // Simple bounded sampling with a hard cap to avoid infinite loops.
  for (let i = 0; i < 500; i++) {
    a = randomInt(operandMin, operandCap);
    b = randomInt(operandMin, operandCap);

    // Prevent division by zero for now.
    if (operator === '/' && b === 0) continue;

    answer = compute(operator, a, b);
    if (!Number.isFinite(answer)) continue;

    if (typeof maxResult === 'number' && Math.abs(answer) > maxResult) continue;
    if (allowNegative === false && answer < 0) continue;

    // For grade 1..2, keep division integer-only for now.
    if (operator === '/' && grade <= 2 && answer % 1 !== 0) continue;

    // Small “hard” constraints to reduce trivial questions.
    if (difficulty === 'hard') {
      if (a === 0 || b === 0) continue;
      if (operator === '-' && answer === 0) continue;
      if (operator === '+' && typeof maxResult === 'number' && answer < Math.floor(maxResult * 0.6)) continue;
    }

    break;
  }

  const stem = locale === 'zh-CN' ? `${a} ${operator} ${b} = ？` : `${a} ${operator} ${b} = ?`;

  return {
    id: makeId(),
    subject: 'math',
    kind: 'arithmetic',
    knowledgePointId: kp.id,
    grade,
    locale,
    operator,
    operands: [a, b],
    stem,
    answer
  };
}

export function verifyArithmeticAnswer(question: ArithmeticQuestion, userAnswer: number | string) {
  const [a, b] = question.operands;
  const expected = compute(question.operator, a, b);
  const normalizedUser = typeof userAnswer === 'number' ? userAnswer : Number(String(userAnswer).trim());

  // Tolerate small floating errors (future-proof).
  const correct = Number.isFinite(normalizedUser) && Math.abs(normalizedUser - expected) < 1e-9;

  return { correct, expectedAnswer: expected };
}
