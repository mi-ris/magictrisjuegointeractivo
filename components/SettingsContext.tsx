
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppSettings } from '../types';
import { setSpeechRate, stopCurrentVoice } from './AudioUtils';

interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (partial: Partial<AppSettings>) => void;
  getSessionMinutes: () => number;
  showBreakReminder: boolean;
  dismissBreakReminder: () => void;
}

const defaultSettings: AppSettings = {
  soundEnabled: true,
  reduceAnimations: false,
  autoPlayVoice: true,
  speechRate: 'slow',
  sessionStartTime: Date.now(),
};

const SettingsContext = createContext<SettingsContextType | null>(null);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem('gumi_settings');
      if (saved) {
        return { ...defaultSettings, ...JSON.parse(saved), sessionStartTime: Date.now() };
      }
    } catch {}
    return { ...defaultSettings, sessionStartTime: Date.now() };
  });

  const [showBreakReminder, setShowBreakReminder] = useState(false);

  useEffect(() => {
    setSpeechRate(settings.speechRate);
  }, [settings.speechRate]);

  useEffect(() => {
    if (!settings.soundEnabled) stopCurrentVoice();
  }, [settings.soundEnabled]);

  useEffect(() => {
    document.documentElement.classList.toggle('reduce-animations', settings.reduceAnimations);
    return () => document.documentElement.classList.remove('reduce-animations');
  }, [settings.reduceAnimations]);

  useEffect(() => {
    try {
      localStorage.setItem('gumi_settings', JSON.stringify({ ...settings, sessionStartTime: undefined }));
    } catch {}
  }, [settings]);

  useEffect(() => {
    const interval = setInterval(() => {
      const minutes = (Date.now() - settings.sessionStartTime) / 60000;
      if (minutes >= 7 && !showBreakReminder) {
        setShowBreakReminder(true);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [settings.sessionStartTime, showBreakReminder]);

  const updateSettings = (partial: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...partial }));
  };

  const getSessionMinutes = () => {
    return Math.floor((Date.now() - settings.sessionStartTime) / 60000);
  };

  const dismissBreakReminder = () => {
    setShowBreakReminder(false);
    setSettings(prev => ({ ...prev, sessionStartTime: Date.now() }));
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, getSessionMinutes, showBreakReminder, dismissBreakReminder }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) return { settings: defaultSettings, updateSettings: () => {}, getSessionMinutes: () => 0, showBreakReminder: false, dismissBreakReminder: () => {} };
  return ctx;
};
