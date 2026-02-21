import { useEffect, useMemo, useState } from 'react';
import type { Locale } from './i18n';
import { t } from './i18n';
import { generateMath, getHealth, getKnowledgePoints, type ArithmeticQuestion, type KnowledgePoint } from './api';
import { exportAsCsv, exportAsHtml, exportAsJson, makeWorksheetHtml, openPrintPreview } from './exporters';

type Difficulty = 'easy' | 'normal' | 'hard';

function safeFilename(name: string) {
  const trimmed = name.trim() || 'MathBud';
  return trimmed.replace(/[\\/:*?"<>|]/g, '_').slice(0, 80);
}

function Segmented(props: {
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
  ariaLabel: string;
}) {
  return (
    <div className="segmented" role="tablist" aria-label={props.ariaLabel}>
      {props.options.map(opt => (
        <button
          key={opt.value}
          className={`segment ${props.value === opt.value ? 'active' : ''}`}
          onClick={() => props.onChange(opt.value)}
          type="button"
          role="tab"
          aria-selected={props.value === opt.value}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export default function App() {
  const [locale, setLocale] = useState<Locale>('zh-CN');
  const [grade, setGrade] = useState(1);
  const [count, setCount] = useState(10);
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [showAnswers, setShowAnswers] = useState(false);
  const [includeMeta, setIncludeMeta] = useState(false);
  const [paperTitle, setPaperTitle] = useState<string>('');

  const [backendOk, setBackendOk] = useState<boolean | null>(null);
  const [knowledgePoints, setKnowledgePoints] = useState<KnowledgePoint[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [questions, setQuestions] = useState<ArithmeticQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const localeLabel = useMemo(() => (locale === 'zh-CN' ? '中文' : 'English'), [locale]);
  const defaultPaperTitle = useMemo(() => {
    if (paperTitle.trim()) return paperTitle;
    return locale === 'zh-CN' ? `${grade}年级数学练习` : `Grade ${grade} Math Worksheet`;
  }, [grade, locale, paperTitle]);

  useEffect(() => {
    let mounted = true;
    getHealth().then(ok => {
      if (mounted) setBackendOk(ok);
    });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    setError('');
    getKnowledgePoints({ locale, grade })
      .then(items => {
        if (!mounted) return;
        setKnowledgePoints(items);
        // default select all
        setSelectedIds(items.map(x => x.id));
      })
      .catch((e: unknown) => {
        if (!mounted) return;
        setKnowledgePoints([]);
        setSelectedIds([]);
        setError(e instanceof Error ? e.message : String(e));
      });
    return () => {
      mounted = false;
    };
  }, [locale, grade]);

  const onGenerate = async () => {
    setLoading(true);
    setError('');
    try {
      const qs = await generateMath({ locale, grade, difficulty, knowledgePointIds: selectedIds, count });
      setQuestions(qs);
      if (qs.length === 0) setError(t(locale, 'empty'));
    } catch (e: unknown) {
      setQuestions([]);
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  const exportBaseName = useMemo(() => {
    const date = new Date().toISOString().slice(0, 10);
    return safeFilename(`${defaultPaperTitle}-${date}`);
  }, [defaultPaperTitle]);

  const doExportHtml = () => {
    const html = makeWorksheetHtml({
      locale,
      title: defaultPaperTitle,
      subtitle: locale === 'zh-CN' ? `难度：${t(locale, difficulty)} · 共 ${questions.length} 题` : `Difficulty: ${t(locale, difficulty)} · ${questions.length} questions`,
      questions,
      showAnswers,
      includeMeta
    });
    exportAsHtml({ filename: `${exportBaseName}.html`, html });
  };

  const doExportJson = () => {
    exportAsJson({
      filename: `${exportBaseName}.json`,
      data: {
        meta: {
          title: defaultPaperTitle,
          locale,
          grade,
          difficulty,
          knowledgePointIds: selectedIds
        },
        questions
      }
    });
  };

  const doExportCsv = () => {
    exportAsCsv({ filename: `${exportBaseName}.csv`, questions });
  };

  const doPrint = () => {
    const html = makeWorksheetHtml({
      locale,
      title: defaultPaperTitle,
      subtitle: locale === 'zh-CN' ? `打印：浏览器里 Ctrl+P 保存为 PDF` : `Print: use Ctrl+P to save as PDF`,
      questions,
      showAnswers,
      includeMeta
    });
    openPrintPreview(html);
  };

  return (
    <div>
      <div className="topbar">
        <div className="brand">
          {/* NOTE: served from repo-root `res/` via Vite publicDir */}
          <img src="/logo.png" alt="MathBud logo" />
          <div className="title">{t(locale, 'appName')}</div>
          <div className="subtitle">{t(locale, 'subtitle')}</div>
        </div>
        <div className="row">
          <div className="muted">
            {t(locale, 'backend')}: {backendOk === null ? '...' : backendOk ? t(locale, 'ok') : t(locale, 'fail')}
          </div>
          <Segmented
            ariaLabel={t(locale, 'language')}
            value={locale}
            options={[
              { value: 'zh-CN', label: '中文' },
              { value: 'en-US', label: 'EN' }
            ]}
            onChange={(v) => setLocale(v as Locale)}
          />
        </div>
      </div>

      <div className="container">
        <div className="grid">
          <div className="card">
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <div style={{ fontWeight: 800 }}>{locale === 'zh-CN' ? '设置' : 'Settings'}</div>
              <div className="muted">{localeLabel}</div>
            </div>

            <div className="divider" />

            <div className="row">
              <div className="field" style={{ flex: '1 1 260px' }}>
                <label>{locale === 'zh-CN' ? '试卷标题' : 'Title'}</label>
                <input value={paperTitle} onChange={e => setPaperTitle(e.target.value)} placeholder={defaultPaperTitle} />
              </div>
            </div>

            <div className="row">
              <div className="field">
                <label>{t(locale, 'grade')}</label>
                <select value={grade} onChange={e => setGrade(Number(e.target.value))}>
                  {[1, 2, 3, 4, 5, 6].map(g => (
                    <option key={g} value={g}>
                      {locale === 'zh-CN' ? `${g}年级` : `Grade ${g}`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field" style={{ minWidth: 220 }}>
                <label>{t(locale, 'difficulty')}</label>
                <Segmented
                  ariaLabel={t(locale, 'difficulty')}
                  value={difficulty}
                  options={[
                    { value: 'easy', label: t(locale, 'easy') },
                    { value: 'normal', label: t(locale, 'normal') },
                    { value: 'hard', label: t(locale, 'hard') }
                  ]}
                  onChange={(v) => setDifficulty(v as Difficulty)}
                />
              </div>

              <div className="field">
                <label>{t(locale, 'count')}</label>
                <input
                  type="number"
                  min={1}
                  max={200}
                  value={count}
                  onChange={e => setCount(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="divider" />

            <div className="row" style={{ justifyContent: 'space-between' }}>
              <label style={{ margin: 0 }}>{t(locale, 'knowledge')}</label>
              <div className="row" style={{ gap: 8 }}>
                <button className="btn" type="button" onClick={() => setSelectedIds(knowledgePoints.map(x => x.id))}>
                  {t(locale, 'selectAll')}
                </button>
                <button className="btn" type="button" onClick={() => setSelectedIds([])}>
                  {t(locale, 'clearAll')}
                </button>
              </div>
            </div>

            <div style={{ marginTop: 10 }}>
              <div className="pills">
                {knowledgePoints.map(kp => {
                  const selected = selectedIds.includes(kp.id);
                  return (
                    <button
                      key={kp.id}
                      type="button"
                      className={`pill ${selected ? 'selected' : ''}`}
                      onClick={() => {
                        setSelectedIds(prev => (prev.includes(kp.id) ? prev.filter(x => x !== kp.id) : [...prev, kp.id]));
                      }}
                      title={kp.id}
                    >
                      {kp.name}
                    </button>
                  );
                })}
              </div>
              <div className="muted" style={{ marginTop: 8 }}>
                {locale === 'zh-CN'
                  ? `已选 ${selectedIds.length} / ${knowledgePoints.length}`
                  : `Selected ${selectedIds.length} / ${knowledgePoints.length}`}
              </div>
            </div>

            <div className="divider" />

            <div className="row">
              <button className="btn" type="button" onClick={() => setShowAnswers(v => !v)}>
                {t(locale, 'showAnswers')}: {showAnswers ? (locale === 'zh-CN' ? '开' : 'On') : (locale === 'zh-CN' ? '关' : 'Off')}
              </button>
              <button className="btn" type="button" onClick={() => setIncludeMeta(v => !v)}>
                {t(locale, 'includeMeta')}: {includeMeta ? (locale === 'zh-CN' ? '开' : 'On') : (locale === 'zh-CN' ? '关' : 'Off')}
              </button>
            </div>

            <div className="divider" />

            <div className="row">
              <button
                className="btn primary"
                onClick={onGenerate}
                disabled={loading || !backendOk || selectedIds.length === 0}
                type="button"
              >
                {loading ? '...' : t(locale, 'generate')}
              </button>
              <div className="muted">
                {backendOk === false ? (locale === 'zh-CN' ? '后端不可用' : 'Backend down') : ''}
              </div>
            </div>

            {error ? <div style={{ marginTop: 12, color: '#b91c1c' }}>{error}</div> : null}
          </div>

          <div className="card">
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <div style={{ fontWeight: 800 }}>{locale === 'zh-CN' ? '预览' : 'Preview'}</div>
              <div className="row" style={{ gap: 8 }}>
                <button className="btn" type="button" onClick={doExportHtml} disabled={questions.length === 0}>
                  {t(locale, 'exportHtml')}
                </button>
                <button className="btn" type="button" onClick={doExportJson} disabled={questions.length === 0}>
                  {t(locale, 'exportJson')}
                </button>
                <button className="btn" type="button" onClick={doExportCsv} disabled={questions.length === 0}>
                  {t(locale, 'exportCsv')}
                </button>
                <button className="btn" type="button" onClick={doPrint} disabled={questions.length === 0}>
                  {t(locale, 'printPdf')}
                </button>
              </div>
            </div>

            {questions.length === 0 ? (
              <div className="empty">
                <img src="/open.png" alt="Splash" />
                <div>{locale === 'zh-CN' ? '选择知识点并生成题目' : 'Pick knowledge points and generate questions'}</div>
              </div>
            ) : (
              <div className="questions">
                {questions.map((q, idx) => (
                  <div key={q.id} className="q">
                    <div>
                      <div className="stem">
                        {idx + 1}. {q.stem}
                      </div>
                      {includeMeta ? <div className="muted">{q.knowledgePointId}</div> : null}
                    </div>
                    {showAnswers ? (
                      <div className="muted">{locale === 'zh-CN' ? `答案：${q.answer}` : `Ans: ${q.answer}`}</div>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
