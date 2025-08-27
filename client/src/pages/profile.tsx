import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";

const Label = ({ children, ...props }: { children: React.ReactNode }) => (
  <label className="text-sm font-medium text-gray-700" {...props}>{children}</label>
);
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { useState } from "react";

interface ProfileData {
  user: {
    id: string;
    username: string;
    email: string;
    fullName: string;
    role: string;
    isActive: boolean;
    createdAt: string;
  };
  statistics: {
    totalDocuments: number;
    documentsThisMonth: number;
    documentsThisWeek: number;
    averageProcessingTime: number;
    completionRate: number;
    categoryProgress: { [category: string]: number };
  };
  activityCalendar: {
    [date: string]: number;
  };
  recentActivities: Array<{
    action: string;
    document: string;
    date: string;
    category: string;
  }>;
}

export default function Profile() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  const { data: profileData } = useQuery<ProfileData>({
    queryKey: ["/api/profile", user?.id],
    queryFn: () => fetch(`/api/profile?userId=${user?.id}`).then(res => res.json()),
    enabled: !!user?.id,
  });

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return "bg-green-500";
    if (percentage >= 60) return "bg-blue-500";
    if (percentage >= 40) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getActivityColor = (count: number) => {
    if (count === 0) return "bg-gray-100";
    if (count <= 2) return "bg-green-200";
    if (count <= 4) return "bg-green-400";
    return "bg-green-600";
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const CircularProgress = ({ percentage, size = 100, strokeWidth = 8, color = "stroke-primary-500" }: {
    percentage: number;
    size?: number;
    strokeWidth?: number;
    color?: string;
  }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;

    return (
      <div className="relative inline-flex items-center justify-center">
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={strokeDasharray}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dasharray 0.5s ease-in-out',
            }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-semibold text-gray-700">{Math.round(percentage)}%</span>
        </div>
      </div>
    );
  };

  const ActivityCalendar = () => {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setMonth(startDate.getMonth() - 3);
    
    const weeks = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= today) {
      const week = [];
      for (let i = 0; i < 7; i++) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const activityCount = profileData?.activityCalendar[dateStr] || 0;
        
        week.push({
          date: new Date(currentDate),
          count: activityCount,
          dateStr
        });
        
        currentDate.setDate(currentDate.getDate() + 1);
        if (currentDate > today) break;
      }
      weeks.push(week);
    }

    return (
      <div className="space-y-1">
        <div className="grid grid-cols-7 gap-1 text-xs text-gray-500 mb-2">
          {['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'].map(day => (
            <div key={day} className="text-center">{day}</div>
          ))}
        </div>
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 gap-1">
            {week.map((day, dayIndex) => (
              <div
                key={dayIndex}
                className={`w-3 h-3 rounded-sm ${getActivityColor(day.count)} border border-gray-200`}
                title={`${day.date.toLocaleDateString('ar-SA')}: ${day.count} وثائق`}
              />
            ))}
          </div>
        ))}
        <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
          <span>أقل</span>
          <div className="flex space-x-1 space-x-reverse">
            <div className="w-3 h-3 bg-gray-100 rounded-sm border border-gray-200"></div>
            <div className="w-3 h-3 bg-green-200 rounded-sm border border-gray-200"></div>
            <div className="w-3 h-3 bg-green-400 rounded-sm border border-gray-200"></div>
            <div className="w-3 h-3 bg-green-600 rounded-sm border border-gray-200"></div>
          </div>
          <span>أكثر</span>
        </div>
      </div>
    );
  };

  if (!profileData) {
    return (
      <MainLayout>
        <div className="p-8 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">جاري تحميل بيانات الملف الشخصي...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 space-x-reverse text-sm text-gray-600">
            <li><Link href="/dashboard" className="hover:text-primary-600">الرئيسية</Link></li>
            <li><i className="fas fa-chevron-left text-xs"></i></li>
            <li className="text-gray-900 font-medium">الملف الشخصي</li>
          </ol>
        </nav>

        {/* Profile Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6 space-x-reverse">
              <div className="w-20 h-20 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-2xl">
                  {profileData.user.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {profileData.user.fullName}
                </h1>
                <div className="flex items-center space-x-4 space-x-reverse">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-700">
                    {profileData.user.role === 'admin' ? 'مدير النظام' : 
                     profileData.user.role === 'archivist' ? 'أمين الأرشيف' : 'مستعرض'}
                  </span>
                  <span className="text-sm text-gray-500">
                    عضو منذ {formatDate(profileData.user.createdAt)}
                  </span>
                </div>
              </div>
            </div>
            <Button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center space-x-2 space-x-reverse"
            >
              <i className="fas fa-edit"></i>
              <span>{isEditing ? 'حفظ التغييرات' : 'تعديل الملف'}</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - User Info & Settings */}
          <div className="space-y-6">
            {/* User Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 space-x-reverse">
                  <i className="fas fa-user text-primary-600"></i>
                  <span>المعلومات الشخصية</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>الاسم الكامل</Label>
                  {isEditing ? (
                    <Input defaultValue={profileData.user.fullName} className="mt-1" />
                  ) : (
                    <p className="mt-1 text-gray-900">{profileData.user.fullName}</p>
                  )}
                </div>
                <div>
                  <Label>اسم المستخدم</Label>
                  <p className="mt-1 text-gray-900 font-mono">{profileData.user.username}</p>
                </div>
                <div>
                  <Label>البريد الإلكتروني</Label>
                  {isEditing ? (
                    <Input defaultValue={profileData.user.email} className="mt-1" />
                  ) : (
                    <p className="mt-1 text-gray-900">{profileData.user.email}</p>
                  )}
                </div>
                <div>
                  <Label>الدور</Label>
                  <p className="mt-1 text-gray-900">
                    {profileData.user.role === 'admin' ? 'مدير النظام' : 
                     profileData.user.role === 'archivist' ? 'أمين الأرشيف' : 'مستعرض'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 space-x-reverse">
                  <i className="fas fa-bolt text-secondary-600"></i>
                  <span>إجراءات سريعة</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <i className="fas fa-key ml-2"></i>
                  تغيير كلمة المرور
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <i className="fas fa-download ml-2"></i>
                  تصدير البيانات
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <i className="fas fa-bell ml-2"></i>
                  إعدادات الإشعارات
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <i className="fas fa-palette ml-2"></i>
                  تخصيص الواجهة
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Middle Column - Progress & Statistics */}
          <div className="space-y-6">
            {/* Circular Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 space-x-reverse">
                  <i className="fas fa-chart-pie text-accent-600"></i>
                  <span>معدل الإنجاز</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CircularProgress 
                  percentage={profileData.statistics.completionRate} 
                  size={120}
                  color="stroke-primary-500"
                />
                <p className="mt-4 text-gray-600">معدل إنجاز الوثائق الشهري</p>
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{profileData.statistics.documentsThisMonth}</div>
                    <div className="text-sm text-gray-600">هذا الشهر</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{profileData.statistics.documentsThisWeek}</div>
                    <div className="text-sm text-gray-600">هذا الأسبوع</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Category Progress Bars */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 space-x-reverse">
                  <i className="fas fa-tasks text-purple-600"></i>
                  <span>التقدم حسب الفئة</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(profileData.statistics.categoryProgress).map(([category, percentage]) => (
                  <div key={category}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        {category === 'legal' ? 'قانونية' :
                         category === 'financial' ? 'مالية' :
                         category === 'administrative' ? 'إدارية' :
                         category === 'civil' ? 'مدنية' :
                         category === 'criminal' ? 'جنائية' :
                         category === 'commercial' ? 'تجارية' :
                         category === 'family' ? 'أسرية' : category}
                      </span>
                      <span className="text-sm text-gray-500">{Math.round(percentage)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getProgressColor(percentage)} transition-all duration-300`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Activity & Calendar */}
          <div className="space-y-6">
            {/* Activity Calendar */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 space-x-reverse">
                  <i className="fas fa-calendar text-green-600"></i>
                  <span>نشاط إنشاء الوثائق</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ActivityCalendar />
                <div className="mt-4 p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-800">
                    <i className="fas fa-info-circle ml-1"></i>
                    أنت نشط لمدة {Object.values(profileData.activityCalendar).filter(count => count > 0).length} يوماً في آخر 3 أشهر
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activities */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 space-x-reverse">
                  <i className="fas fa-history text-orange-600"></i>
                  <span>الأنشطة الأخيرة</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {profileData.recentActivities.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3 space-x-reverse">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <i className="fas fa-file-alt text-primary-600 text-sm"></i>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">
                          <span className="font-medium">{activity.action}</span>: {activity.document}
                        </p>
                        <div className="flex items-center space-x-2 space-x-reverse mt-1">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                            {activity.category === 'legal' ? 'قانونية' :
                             activity.category === 'financial' ? 'مالية' :
                             activity.category === 'administrative' ? 'إدارية' : activity.category}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDate(activity.date)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Performance Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 space-x-reverse">
                  <i className="fas fa-chart-line text-blue-600"></i>
                  <span>إحصائيات الأداء</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-lg font-bold text-blue-600">
                      {profileData.statistics.totalDocuments}
                    </div>
                    <div className="text-xs text-blue-700">إجمالي الوثائق</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-lg font-bold text-green-600">
                      {profileData.statistics.averageProcessingTime}د
                    </div>
                    <div className="text-xs text-green-700">متوسط المعالجة</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}