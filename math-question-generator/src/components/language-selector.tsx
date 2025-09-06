import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Globe } from 'lucide-react';
import { 
  supportedLanguages as allSupportedLanguages,
  saveLanguageToStorage, 
  loadLanguageFromStorage,
  detectBrowserLanguage 
} from '@/lib/i18n';

interface LanguageSelectorProps {
  onLanguageChange: (language: string) => void;
  currentLanguage: string;
}

export function LanguageSelector({ onLanguageChange, currentLanguage }: LanguageSelectorProps) {
  const [selectedLanguage, setSelectedLanguage] = useState(currentLanguage);

  useEffect(() => {
    // Load saved language or detect browser language on initial load
    const savedLanguage = loadLanguageFromStorage();
    if (!savedLanguage) {
      const browserLanguage = detectBrowserLanguage();
      setSelectedLanguage(browserLanguage);
      onLanguageChange(browserLanguage);
    }
  }, [onLanguageChange]);
 
  useEffect(() => {
    // Sync with external language changes
    if (currentLanguage !== selectedLanguage) {
      setSelectedLanguage(currentLanguage);
    }
  }, [currentLanguage, selectedLanguage]);

  const handleLanguageChange = (value: string) => {
    setSelectedLanguage(value);
    saveLanguageToStorage(value);
    onLanguageChange(value);
  };

  return (
    <div className="flex items-center space-x-2">
      <Globe className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
      <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
        <SelectTrigger className="w-24 sm:w-32 h-8 bg-background border-border text-xs sm:text-sm">
          <SelectValue placeholder="Language" />
        </SelectTrigger>
        <SelectContent>
          {allSupportedLanguages.map((language) => (
            <SelectItem key={language.code} value={language.code} className="text-xs sm:text-sm">
              {language.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}