'use client';

interface LanguageSwitcherProps {
  currentLanguage: 'en' | 'es';
  onLanguageChange: (language: 'en' | 'es') => void;
}

export default function LanguageSwitcher({
  currentLanguage,
  onLanguageChange,
}: LanguageSwitcherProps) {
  return (
    <div className="absolute top-4 right-4">
      <select
        value={currentLanguage}
        onChange={(e) => onLanguageChange(e.target.value as 'en' | 'es')}
        className="px-3 py-1 border rounded-lg bg-white shadow-sm"
      >
        <option value="en">English</option>
        <option value="es">Español</option>
      </select>
    </div>
  );
}
