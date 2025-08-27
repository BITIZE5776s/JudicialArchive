import { createContext, useContext, ReactNode } from "react";
import { useSettings } from "./settings-context";

interface Translation {
  [key: string]: string | Translation;
}

const translations: Record<string, Translation> = {
  ar: {
    // Navigation & Common
    dashboard: "لوحة التحكم",
    documents: "الوثائق",
    profile: "الملف الشخصي",
    settings: "الإعدادات",
    logout: "تسجيل الخروج",
    login: "تسجيل الدخول",
    username: "اسم المستخدم",
    password: "كلمة المرور",
    email: "البريد الإلكتروني",
    fullName: "الاسم الكامل",
    save: "حفظ",
    cancel: "إلغاء",
    edit: "تعديل",
    delete: "حذف",
    search: "البحث",
    
    // Dashboard
    welcome: "مرحباً",
    totalCases: "إجمالي القضايا",
    processedDocs: "الوثائق المعالجة",
    pendingDocs: "في الانتظار",
    archivedCases: "مؤرشفة",
    recentDocuments: "الوثائق الحديثة",
    recentCases: "القضايا الحديثة",
    quickActions: "إجراءات سريعة",
    
    // Settings
    appearance: "المظهر",
    language: "اللغة",
    notifications: "الإشعارات",
    privacy: "الخصوصية",
    display: "العرض",
    general: "عام",
    theme: "السمة",
    lightTheme: "فاتح",
    darkTheme: "داكن",
    enableNotifications: "تفعيل الإشعارات",
    notificationPermission: "إذن الإشعارات",
    analytics: "التحليلات",
    dataCollection: "جمع البيانات",
    compactMode: "الوضع المضغوط",
    showAnimations: "عرض الحركات",
    fontSize: "حجم الخط",
    small: "صغير",
    medium: "متوسط",
    large: "كبير",
    resetSettings: "إعادة تعيين الإعدادات",
    
    // Roles
    admin: "مدير النظام",
    archivist: "أمين الأرشيف",
    viewer: "مستعرض",
    
    // Categories
    legal: "قانونية",
    financial: "مالية",
    administrative: "إدارية",
    civil: "مدنية",
    criminal: "جنائية",
    commercial: "تجارية",
    family: "أسرية",
  },
  
  en: {
    // Navigation & Common
    dashboard: "Dashboard",
    documents: "Documents",
    profile: "Profile",
    settings: "Settings",
    logout: "Logout",
    login: "Login",
    username: "Username",
    password: "Password",
    email: "Email",
    fullName: "Full Name",
    save: "Save",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    search: "Search",
    
    // Dashboard
    welcome: "Welcome",
    totalCases: "Total Cases",
    processedDocs: "Processed Documents",
    pendingDocs: "Pending",
    archivedCases: "Archived",
    recentDocuments: "Recent Documents",
    recentCases: "Recent Cases",
    quickActions: "Quick Actions",
    
    // Settings
    appearance: "Appearance",
    language: "Language",
    notifications: "Notifications",
    privacy: "Privacy",
    display: "Display",
    general: "General",
    theme: "Theme",
    lightTheme: "Light",
    darkTheme: "Dark",
    enableNotifications: "Enable Notifications",
    notificationPermission: "Notification Permission",
    analytics: "Analytics",
    dataCollection: "Data Collection",
    compactMode: "Compact Mode",
    showAnimations: "Show Animations",
    fontSize: "Font Size",
    small: "Small",
    medium: "Medium",
    large: "Large",
    resetSettings: "Reset Settings",
    
    // Roles
    admin: "Administrator",
    archivist: "Archivist",
    viewer: "Viewer",
    
    // Categories
    legal: "Legal",
    financial: "Financial",
    administrative: "Administrative",
    civil: "Civil",
    criminal: "Criminal",
    commercial: "Commercial",
    family: "Family",
  },
  
  fr: {
    // Navigation & Common
    dashboard: "Tableau de bord",
    documents: "Documents",
    profile: "Profil",
    settings: "Paramètres",
    logout: "Déconnexion",
    login: "Connexion",
    username: "Nom d'utilisateur",
    password: "Mot de passe",
    email: "Email",
    fullName: "Nom complet",
    save: "Enregistrer",
    cancel: "Annuler",
    edit: "Modifier",
    delete: "Supprimer",
    search: "Rechercher",
    
    // Dashboard
    welcome: "Bienvenue",
    totalCases: "Total des Affaires",
    processedDocs: "Documents Traités",
    pendingDocs: "En Attente",
    archivedCases: "Archivées",
    recentDocuments: "Documents Récents",
    recentCases: "Affaires Récentes",
    quickActions: "Actions Rapides",
    
    // Settings
    appearance: "Apparence",
    language: "Langue",
    notifications: "Notifications",
    privacy: "Confidentialité",
    display: "Affichage",
    general: "Général",
    theme: "Thème",
    lightTheme: "Clair",
    darkTheme: "Sombre",
    enableNotifications: "Activer les Notifications",
    notificationPermission: "Permission de Notification",
    analytics: "Analytiques",
    dataCollection: "Collecte de Données",
    compactMode: "Mode Compact",
    showAnimations: "Afficher les Animations",
    fontSize: "Taille de Police",
    small: "Petit",
    medium: "Moyen",
    large: "Grand",
    resetSettings: "Réinitialiser les Paramètres",
    
    // Roles
    admin: "Administrateur",
    archivist: "Archiviste",
    viewer: "Visualiseur",
    
    // Categories
    legal: "Légal",
    financial: "Financier",
    administrative: "Administratif",
    civil: "Civil",
    criminal: "Pénal",
    commercial: "Commercial",
    family: "Familial",
  },
};

interface LanguageContextType {
  t: (key: string, params?: Record<string, string>) => string;
  currentLanguage: string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { language } = useSettings();

  const t = (key: string, params?: Record<string, string>): string => {
    const keys = key.split('.');
    let translation: any = translations[language] || translations.ar;
    
    for (const k of keys) {
      if (translation && typeof translation === 'object' && k in translation) {
        translation = translation[k];
      } else {
        return key; // Return key if translation not found
      }
    }
    
    let result = typeof translation === 'string' ? translation : key;
    
    // Replace parameters
    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        result = result.replace(`{${param}}`, value);
      });
    }
    
    return result;
  };

  const value: LanguageContextType = {
    t,
    currentLanguage: language,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
}