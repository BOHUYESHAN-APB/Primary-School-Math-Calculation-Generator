export type Locale = 'zh-CN' | 'en-US';

const dict: Record<Locale, Record<string, string>> = {
  'zh-CN': {
    appName: '数字芽算（MathBud）',
    subtitle: '重写中：先把前后端跑通',
    language: '语言',
    grade: '年级',
    difficulty: '难度',
    easy: '简单',
    normal: '标准',
    hard: '挑战',
    knowledge: '知识点',
    count: '题目数量',
    generate: '生成题目',
    selectAll: '全选',
    clearAll: '全不选',
    showAnswers: '显示答案',
    includeMeta: '显示知识点ID',
    export: '导出',
    exportHtml: '导出 HTML',
    exportJson: '导出 JSON',
    exportCsv: '导出 CSV',
    printPdf: '打印 / 保存为 PDF',
    backend: '后端状态',
    ok: '正常',
    fail: '异常',
    empty: '没有匹配的知识点/题目'
  },
  'en-US': {
    appName: 'MathBud',
    subtitle: 'Rewrite in progress: get web+api running first',
    language: 'Language',
    grade: 'Grade',
    difficulty: 'Difficulty',
    easy: 'Easy',
    normal: 'Normal',
    hard: 'Hard',
    knowledge: 'Knowledge',
    count: 'Count',
    generate: 'Generate',
    selectAll: 'Select all',
    clearAll: 'Clear',
    showAnswers: 'Show answers',
    includeMeta: 'Show knowledge IDs',
    export: 'Export',
    exportHtml: 'Export HTML',
    exportJson: 'Export JSON',
    exportCsv: 'Export CSV',
    printPdf: 'Print / Save PDF',
    backend: 'Backend',
    ok: 'OK',
    fail: 'Down',
    empty: 'No matched knowledge/questions'
  }
};

export function t(locale: Locale, key: string) {
  return dict[locale]?.[key] ?? key;
}
