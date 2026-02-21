import type { KnowledgePoint } from '../types.js';

export const KNOWLEDGE_POINTS: KnowledgePoint[] = [
  {
    id: 'math:addition:within10',
    subject: 'math',
    gradeRange: [1, 1],
    names: { 'zh-CN': '10以内加法', 'en-US': 'Addition within 10' },
    generator: { kind: 'arithmetic', operator: '+', maxOperand: 10, maxResult: 10 }
  },
  {
    id: 'math:subtraction:within10',
    subject: 'math',
    gradeRange: [1, 1],
    names: { 'zh-CN': '10以内减法', 'en-US': 'Subtraction within 10' },
    generator: { kind: 'arithmetic', operator: '-', maxOperand: 10, maxResult: 10, allowNegative: false }
  },
  {
    id: 'math:addition:within20',
    subject: 'math',
    gradeRange: [1, 2],
    names: { 'zh-CN': '20以内加法', 'en-US': 'Addition within 20' },
    generator: { kind: 'arithmetic', operator: '+', maxOperand: 20, maxResult: 20 }
  },
  {
    id: 'math:subtraction:within20',
    subject: 'math',
    gradeRange: [1, 2],
    names: { 'zh-CN': '20以内减法', 'en-US': 'Subtraction within 20' },
    generator: { kind: 'arithmetic', operator: '-', maxOperand: 20, maxResult: 20, allowNegative: false }
  }
];

