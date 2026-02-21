export type Locale = 'zh-CN' | 'en-US';

export type Subject = 'math';

export type Difficulty = 'easy' | 'normal' | 'hard';

export type KnowledgePoint = {
  id: string;
  subject: Subject;
  gradeRange: [number, number];
  names: Record<Locale, string>;
  generator: {
    kind: 'arithmetic';
    operator: '+' | '-' | '*' | '/';
    maxOperand: number;
    maxResult?: number;
    allowNegative?: boolean;
  };
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

export type GenerateMathRequest = {
  locale: Locale;
  grade: number;
  knowledgePointIds?: string[];
  difficulty?: Difficulty;
  count: number;
};

export type GenerateMathResponse = {
  questions: ArithmeticQuestion[];
};

export type VerifyMathRequest = {
  question: ArithmeticQuestion;
  userAnswer: number | string;
};

export type VerifyMathResponse = {
  correct: boolean;
  expectedAnswer: number;
};
