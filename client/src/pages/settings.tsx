import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSettings } from "@/contexts/settings-context";
import { useTranslation } from "@/contexts/language-context";
import { Link } from "wouter";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const {
    theme,
    language,
    notifications,
    privacy,
    display,
    setTheme,
    setLanguage,
    toggleNotifications,
    updatePrivacySetting,
    updateDisplaySetting,
    resetSettings,
  } = useSettings();

  const [isResetting, setIsResetting] = useState(false);

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    toast({
      title: t('settings'),
      description: `تم تغيير السمة إلى ${newTheme === 'dark' ? 'الوضع الداكن' : 'الوضع الفاتح'}`,
    });
  };

  const handleLanguageChange = (newLanguage: 'ar' | 'en' | 'fr') => {
    setLanguage(newLanguage);
    toast({
      title: t('settings'),
      description: language === 'ar' ? 'تم تغيير اللغة' : 'Language changed',
    });
  };

  const handleNotificationToggle = async () => {
    await toggleNotifications();
    const message = notifications.enabled ? 
      'تم إلغاء تفعيل الإشعارات' : 
      notifications.permission === 'granted' ? 'تم تفعيل الإشعارات' : 'تم رفض إذن الإشعارات';
    
    toast({
      title: t('notifications'),
      description: message,
      variant: notifications.permission === 'denied' ? 'destructive' : 'default',
    });
  };

  const handleReset = async () => {
    setIsResetting(true);
    setTimeout(() => {
      resetSettings();
      setIsResetting(false);
      toast({
        title: t('resetSettings'),
        description: 'تم إعادة تعيين جميع الإعدادات إلى الافتراضية',
      });
    }, 1000);
  };

  const getPermissionStatus = (permission: NotificationPermission) => {
    switch (permission) {
      case 'granted':
        return { text: 'مسموح', color: 'text-green-600 bg-green-100' };
      case 'denied':
        return { text: 'مرفوض', color: 'text-red-600 bg-red-100' };
      default:
        return { text: 'لم يتم السؤال', color: 'text-yellow-600 bg-yellow-100' };
    }
  };

  const permissionStatus = getPermissionStatus(notifications.permission);

  return (
    <MainLayout>
      <div className="p-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 space-x-reverse text-sm text-gray-600">
            <li><Link href="/dashboard" className="hover:text-primary-600">{t('dashboard')}</Link></li>
            <li><i className="fas fa-chevron-left text-xs"></i></li>
            <li className="text-gray-900 font-medium">{t('settings')}</li>
          </ol>
        </nav>

        {/* Settings Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('settings')}</h1>
          <p className="text-gray-600">
            قم بتخصيص تفضيلاتك وإعداداتك الشخصية
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Appearance & Language */}
          <div className="space-y-6">
            {/* Appearance Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 space-x-reverse">
                  <i className="fas fa-palette text-purple-600"></i>
                  <span>{t('appearance')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Theme Selection */}
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-3">
                    {t('theme')}
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleThemeChange('light')}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        theme === 'light' 
                          ? 'border-primary-500 bg-primary-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="w-full h-12 bg-white rounded mb-2 shadow-sm"></div>
                      <span className="text-sm font-medium">{t('lightTheme')}</span>
                    </button>
                    <button
                      onClick={() => handleThemeChange('dark')}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        theme === 'dark' 
                          ? 'border-primary-500 bg-primary-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="w-full h-12 bg-gray-800 rounded mb-2"></div>
                      <span className="text-sm font-medium">{t('darkTheme')}</span>
                    </button>
                  </div>
                </div>

                {/* Language Selection */}
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-3">
                    {t('language')}
                  </label>
                  <Select value={language} onValueChange={handleLanguageChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ar">
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <span className="text-lg">🇸🇦</span>
                          <span>العربية</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="en">
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <span className="text-lg">🇺🇸</span>
                          <span>English</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="fr">
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <span className="text-lg">🇫🇷</span>
                          <span>Français</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Display Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 space-x-reverse">
                  <i className="fas fa-desktop text-blue-600"></i>
                  <span>{t('display')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Font Size */}
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    {t('fontSize')}
                  </label>
                  <Select 
                    value={display.fontSize} 
                    onValueChange={(value) => updateDisplaySetting('fontSize', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">{t('small')}</SelectItem>
                      <SelectItem value="medium">{t('medium')}</SelectItem>
                      <SelectItem value="large">{t('large')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Compact Mode */}
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      {t('compactMode')}
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      تقليل المسافات بين العناصر
                    </p>
                  </div>
                  <Switch
                    checked={display.compactMode}
                    onCheckedChange={(checked) => updateDisplaySetting('compactMode', checked)}
                  />
                </div>

                {/* Show Animations */}
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      {t('showAnimations')}
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      عرض الحركات والانتقالات
                    </p>
                  </div>
                  <Switch
                    checked={display.showAnimations}
                    onCheckedChange={(checked) => updateDisplaySetting('showAnimations', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Middle Column - Notifications & Privacy */}
          <div className="space-y-6">
            {/* Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 space-x-reverse">
                  <i className="fas fa-bell text-green-600"></i>
                  <span>{t('notifications')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Enable Notifications */}
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      {t('enableNotifications')}
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      تلقي إشعارات الوثائق والتحديثات
                    </p>
                  </div>
                  <Switch
                    checked={notifications.enabled}
                    onCheckedChange={handleNotificationToggle}
                  />
                </div>

                {/* Notification Permission Status */}
                <div className="p-3 rounded-lg bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      {t('notificationPermission')}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${permissionStatus.color}`}>
                      {permissionStatus.text}
                    </span>
                  </div>
                  
                  {notifications.permission === 'denied' && (
                    <div className="text-xs text-red-600 mt-2">
                      <i className="fas fa-exclamation-triangle ml-1"></i>
                      تم رفض الإذن. يمكنك تفعيله من إعدادات المتصفح
                    </div>
                  )}
                  
                  {notifications.permission === 'default' && (
                    <div className="text-xs text-yellow-600 mt-2">
                      <i className="fas fa-info-circle ml-1"></i>
                      قم بتفعيل الإشعارات للحصول على الإذن
                    </div>
                  )}
                  
                  {notifications.enabled && notifications.permission === 'granted' && (
                    <div className="text-xs text-green-600 mt-2">
                      <i className="fas fa-check-circle ml-1"></i>
                      جميع الإشعارات مفعلة ومسموحة
                    </div>
                  )}
                </div>

                {/* Notification Types */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-sm font-medium text-gray-700">أنواع الإشعارات</h4>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">وثائق جديدة</span>
                      <Switch defaultChecked disabled={!notifications.enabled} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">تذكيرات المهام</span>
                      <Switch defaultChecked disabled={!notifications.enabled} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">تحديثات النظام</span>
                      <Switch disabled={!notifications.enabled} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Privacy Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 space-x-reverse">
                  <i className="fas fa-shield-alt text-red-600"></i>
                  <span>{t('privacy')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Analytics */}
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      {t('analytics')}
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      المساعدة في تحسين الأداء
                    </p>
                  </div>
                  <Switch
                    checked={privacy.analyticsEnabled}
                    onCheckedChange={(checked) => updatePrivacySetting('analyticsEnabled', checked)}
                  />
                </div>

                {/* Data Collection */}
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      {t('dataCollection')}
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      جمع البيانات لأغراض البحث
                    </p>
                  </div>
                  <Switch
                    checked={privacy.dataCollection}
                    onCheckedChange={(checked) => updatePrivacySetting('dataCollection', checked)}
                  />
                </div>

                <div className="p-3 rounded-lg bg-blue-50 mt-4">
                  <div className="flex items-start space-x-2 space-x-reverse">
                    <i className="fas fa-info-circle text-blue-600 mt-0.5"></i>
                    <div>
                      <p className="text-sm text-blue-800 font-medium mb-1">
                        سياسة الخصوصية
                      </p>
                      <p className="text-xs text-blue-700">
                        نحن نحترم خصوصيتك. جميع البيانات محمية ومشفرة.
                      </p>
                      <button className="text-xs text-blue-600 underline mt-1">
                        اقرأ المزيد
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Advanced Settings & Actions */}
          <div className="space-y-6">
            {/* System Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 space-x-reverse">
                  <i className="fas fa-info-circle text-orange-600"></i>
                  <span>معلومات النظام</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">إصدار التطبيق:</span>
                  <span className="font-medium">v2.1.0</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">المتصفح:</span>
                  <span className="font-medium">{navigator.userAgent.split(' ')[0]}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">اللغة الحالية:</span>
                  <span className="font-medium">
                    {language === 'ar' ? 'العربية' : language === 'en' ? 'English' : 'Français'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">السمة الحالية:</span>
                  <span className="font-medium">
                    {theme === 'dark' ? 'داكن' : 'فاتح'}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Advanced Options */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 space-x-reverse">
                  <i className="fas fa-cogs text-gray-600"></i>
                  <span>خيارات متقدمة</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <i className="fas fa-download ml-2"></i>
                  تصدير الإعدادات
                </Button>
                
                <Button variant="outline" className="w-full justify-start">
                  <i className="fas fa-upload ml-2"></i>
                  استيراد الإعدادات
                </Button>
                
                <Button variant="outline" className="w-full justify-start">
                  <i className="fas fa-sync ml-2"></i>
                  مزامنة الإعدادات
                </Button>
                
                <Button variant="outline" className="w-full justify-start">
                  <i className="fas fa-bug ml-2"></i>
                  تقرير خطأ
                </Button>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 space-x-reverse text-red-700">
                  <i className="fas fa-exclamation-triangle"></i>
                  <span>منطقة خطيرة</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-red-600">
                  ستؤدي هذه الإجراءات إلى تغييرات لا يمكن التراجع عنها.
                </p>
                
                <Button 
                  variant="destructive" 
                  className="w-full"
                  onClick={handleReset}
                  disabled={isResetting}
                >
                  {isResetting ? (
                    <>
                      <i className="fas fa-spinner fa-spin ml-2"></i>
                      جاري إعادة التعيين...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-undo ml-2"></i>
                      {t('resetSettings')}
                    </>
                  )}
                </Button>
                
                <p className="text-xs text-gray-500 text-center">
                  سيتم إعادة جميع الإعدادات إلى القيم الافتراضية
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}