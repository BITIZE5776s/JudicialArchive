import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Theme = 'light' | 'dark';
export type Language = 'ar' | 'en' | 'fr';

interface SettingsContextType {
  theme: Theme;
  language: Language;
  notifications: {
    enabled: boolean;
    permission: NotificationPermission;
  };
  privacy: {
    analyticsEnabled: boolean;
    dataCollection: boolean;
  };
  display: {
    compactMode: boolean;
    showAnimations: boolean;
    fontSize: 'small' | 'medium' | 'large';
  };
  setTheme: (theme: Theme) => void;
  setLanguage: (language: Language) => void;
  toggleNotifications: () => Promise<void>;
  updatePrivacySetting: (key: keyof SettingsContextType['privacy'], value: boolean) => void;
  updateDisplaySetting: (key: keyof SettingsContextType['display'], value: any) => void;
  resetSettings: () => void;
}

const defaultSettings: Omit<SettingsContextType, 'setTheme' | 'setLanguage' | 'toggleNotifications' | 'updatePrivacySetting' | 'updateDisplaySetting' | 'resetSettings'> = {
  theme: 'light',
  language: 'ar',
  notifications: {
    enabled: false,
    permission: 'default',
  },
  privacy: {
    analyticsEnabled: true,
    dataCollection: false,
  },
  display: {
    compactMode: false,
    showAnimations: true,
    fontSize: 'medium',
  },
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('app-settings');
    if (saved) {
      try {
        return { ...defaultSettings, ...JSON.parse(saved) };
      } catch {
        return defaultSettings;
      }
    }
    return defaultSettings;
  });

  const saveSettings = (newSettings: typeof settings) => {
    setSettings(newSettings);
    localStorage.setItem('app-settings', JSON.stringify(newSettings));
  };

  const setTheme = (theme: Theme) => {
    const newSettings = { ...settings, theme };
    saveSettings(newSettings);
    
    // Apply theme to document
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const setLanguage = (language: Language) => {
    const newSettings = { ...settings, language };
    saveSettings(newSettings);
    
    // Apply language direction
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  };

  const toggleNotifications = async () => {
    if (!settings.notifications.enabled) {
      // Request permission
      try {
        const permission = await Notification.requestPermission();
        const newSettings = {
          ...settings,
          notifications: {
            enabled: permission === 'granted',
            permission,
          },
        };
        saveSettings(newSettings);
        
        if (permission === 'granted') {
          // Show test notification
          new Notification('تم تفعيل الإشعارات', {
            body: 'ستتلقى إشعارات من نظام الأرشيف القضائي',
            icon: '/favicon.ico',
          });
        }
      } catch (error) {
        console.error('Error requesting notification permission:', error);
      }
    } else {
      // Disable notifications
      const newSettings = {
        ...settings,
        notifications: {
          enabled: false,
          permission: settings.notifications.permission,
        },
      };
      saveSettings(newSettings);
    }
  };

  const updatePrivacySetting = (key: keyof SettingsContextType['privacy'], value: boolean) => {
    const newSettings = {
      ...settings,
      privacy: {
        ...settings.privacy,
        [key]: value,
      },
    };
    saveSettings(newSettings);
  };

  const updateDisplaySetting = (key: keyof SettingsContextType['display'], value: any) => {
    const newSettings = {
      ...settings,
      display: {
        ...settings.display,
        [key]: value,
      },
    };
    saveSettings(newSettings);
    
    // Apply display settings
    if (key === 'fontSize') {
      document.documentElement.style.fontSize = 
        value === 'small' ? '14px' : value === 'large' ? '18px' : '16px';
    }
    
    if (key === 'showAnimations') {
      document.documentElement.style.setProperty(
        '--animation-duration', 
        value ? '0.3s' : '0s'
      );
    }
  };

  const resetSettings = () => {
    saveSettings(defaultSettings);
    // Reset DOM changes
    document.documentElement.classList.remove('dark');
    document.documentElement.lang = 'ar';
    document.documentElement.dir = 'rtl';
    document.documentElement.style.fontSize = '16px';
    document.documentElement.style.removeProperty('--animation-duration');
  };

  // Apply settings on load
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    }
    
    document.documentElement.lang = settings.language;
    document.documentElement.dir = settings.language === 'ar' ? 'rtl' : 'ltr';
    
    document.documentElement.style.fontSize = 
      settings.display.fontSize === 'small' ? '14px' : 
      settings.display.fontSize === 'large' ? '18px' : '16px';
      
    if (!settings.display.showAnimations) {
      document.documentElement.style.setProperty('--animation-duration', '0s');
    }
  }, []);

  const value: SettingsContextType = {
    ...settings,
    setTheme,
    setLanguage,
    toggleNotifications,
    updatePrivacySetting,
    updateDisplaySetting,
    resetSettings,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}