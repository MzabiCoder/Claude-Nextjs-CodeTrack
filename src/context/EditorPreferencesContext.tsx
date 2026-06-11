'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import { type EditorPreferences, DEFAULT_EDITOR_PREFERENCES } from '@/types/editor';

interface EditorPreferencesContextValue {
  preferences: EditorPreferences;
  updatePreferences: (prefs: EditorPreferences) => void;
}

const EditorPreferencesContext = createContext<EditorPreferencesContextValue>({
  preferences: DEFAULT_EDITOR_PREFERENCES,
  updatePreferences: () => {},
});

export function EditorPreferencesProvider({
  children,
  initial,
}: {
  children: React.ReactNode;
  initial: EditorPreferences;
}) {
  const [preferences, setPreferences] = useState<EditorPreferences>(initial);

  const updatePreferences = useCallback((prefs: EditorPreferences) => {
    setPreferences(prefs);
  }, []);

  return (
    <EditorPreferencesContext.Provider value={{ preferences, updatePreferences }}>
      {children}
    </EditorPreferencesContext.Provider>
  );
}

export function useEditorPreferences() {
  return useContext(EditorPreferencesContext);
}
