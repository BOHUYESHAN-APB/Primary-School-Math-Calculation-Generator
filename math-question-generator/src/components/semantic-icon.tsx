import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  Star,
  Zap,
  Settings,
  Globe,
  Hash,
  Shield,
  Play,
  Eye,
  Download,
  RotateCcw,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export type IconStyle = 'lucide' | 'emoji';

const ICON_STORAGE_KEY = 'iconStyle';

export function getIconStyle(): IconStyle {
  const stored = localStorage.getItem(ICON_STORAGE_KEY);
  if (stored === 'emoji' || stored === 'lucide') return stored;
  return 'lucide';
}

export function setIconStyle(style: IconStyle) {
  localStorage.setItem(ICON_STORAGE_KEY, style);
  window.dispatchEvent(new CustomEvent<IconStyleChangeDetail>('icon-style-change', { detail: { style } }));
}

interface IconStyleChangeDetail {
  style: IconStyle;
}

/**
 * 语义化图标名称
 * quickStart, difficultyEasy, difficultyNormal, difficultyHard,
 * educationSystem, questionCount, autoVerify, settings,
 * generate, preview, export, reset, success, error
 */
export type SemanticIconName =
  | 'quickStart'
  | 'difficultyEasy'
  | 'difficultyNormal'
  | 'difficultyHard'
  | 'educationSystem'
  | 'questionCount'
  | 'autoVerify'
  | 'settings'
  | 'generate'
  | 'preview'
  | 'export'
  | 'reset'
  | 'success'
  | 'error';

const emojiMap: Record<SemanticIconName, string> = {
  quickStart: '🚀',
  difficultyEasy: '😊',
  difficultyNormal: '🧠',
  difficultyHard: '🔥',
  educationSystem: '🌐',
  questionCount: '#️⃣',
  autoVerify: '✅',
  settings: '⚙️',
  generate: '⚡',
  preview: '👁️',
  export: '📤',
  reset: '♻️',
  success: '✅',
  error: '❌'
};

const lucideMap: Record<SemanticIconName, React.ReactNode> = {
  quickStart: <BookOpen className="w-full h-full" />,
  difficultyEasy: <Star className="w-full h-full" />,
  difficultyNormal: <BookOpen className="w-full h-full" />,
  difficultyHard: <Zap className="w-full h-full" />,
  educationSystem: <Globe className="w-full h-full" />,
  questionCount: <Hash className="w-full h-full" />,
  autoVerify: <Shield className="w-full h-full" />,
  settings: <Settings className="w-full h-full" />,
  generate: <Play className="w-full h-full" />,
  preview: <Eye className="w-full h-full" />,
  export: <Download className="w-full h-full" />,
  reset: <RotateCcw className="w-full h-full" />,
  success: <CheckCircle className="w-full h-full" />,
  error: <AlertCircle className="w-full h-full" />
};

export interface SemanticIconProps {
  name: SemanticIconName;
  className?: string;
  /**
   * 强制风格（忽略全局设置），用于局部测试或对比
   */
  forceStyle?: IconStyle;
  /**
   * 显示辅助文本（仅无障碍/屏幕阅读器）
   */
  label?: string;
}

export const SemanticIcon: React.FC<SemanticIconProps> = ({
  name,
  className = 'w-4 h-4',
  forceStyle,
  label
}) => {
  const [style, setStyle] = useState<IconStyle>(forceStyle || getIconStyle());

  useEffect(() => {
    if (forceStyle) return;
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<IconStyleChangeDetail>).detail;
      if (detail?.style) setStyle(detail.style);
    };
    window.addEventListener('icon-style-change', handler as EventListener);
    return () => window.removeEventListener('icon-style-change', handler as EventListener);
  }, [forceStyle]);

  if (style === 'emoji') {
    return (
      <span
        className={`inline-flex items-center justify-center select-none ${className}`}
        role="img"
        aria-label={label || name}
        data-icon-style="emoji"
      >
        {emojiMap[name]}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center justify-center ${className}`}
      aria-label={label || name}
      data-icon-style="lucide"
    >
      {lucideMap[name]}
    </span>
  );
};

/**
 * Hook: 返回当前图标风格及切换函数
 */
export function useIconStyle(): [IconStyle, (s: IconStyle) => void] {
  const [style, setStyleState] = useState<IconStyle>(getIconStyle());

  const update = (s: IconStyle) => {
    setIconStyle(s);
    setStyleState(s);
  };

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<IconStyleChangeDetail>).detail;
      if (detail?.style) setStyleState(detail.style);
    };
    window.addEventListener('icon-style-change', handler as EventListener);
    return () => window.removeEventListener('icon-style-change', handler as EventListener);
  }, []);

  return [style, update];
}

/**
 * 小型切换组件 (可嵌入到设置页)
 */
export const IconStyleToggle: React.FC<{
  labels?: { lucide: string; emoji: string };
  className?: string;
}> = ({ labels = { lucide: 'Lucide', emoji: 'Emoji' }, className }) => {
  const [style, setStyle] = useIconStyle();
  return (
    <div className={`flex items-center gap-2 ${className || ''}`}>
      <button
        type="button"
        onClick={() => setStyle('lucide')}
        className={`px-3 py-1 rounded border text-sm transition ${
          style === 'lucide'
            ? 'bg-blue-600 text-white border-blue-600'
            : 'bg-white hover:bg-blue-50 border-gray-300'
        }`}
      >
        {labels.lucide}
      </button>
      <button
        type="button"
        onClick={() => setStyle('emoji')}
        className={`px-3 py-1 rounded border text-sm transition ${
          style === 'emoji'
            ? 'bg-blue-600 text-white border-blue-600'
            : 'bg-white hover:bg-blue-50 border-gray-300'
        }`}
      >
        {labels.emoji}
      </button>
    </div>
  );
};