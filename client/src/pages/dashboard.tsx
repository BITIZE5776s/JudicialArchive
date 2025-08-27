import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/main-layout";
import { StatsCard } from "@/components/stats-card";
import { DocumentListItem } from "@/components/document-list-item";
import { CaseListItem } from "@/components/case-list-item";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { type DashboardStats, type DocumentWithDetails } from "@shared/schema";
import { Link } from "wouter";

export default function Dashboard() {
  const { user } = useAuth();

  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats", user?.id],
    queryFn: () => fetch(`/api/dashboard/stats?userId=${user?.id}`).then(res => res.json()),
    enabled: !!user?.id,
  });

  const { data: recentDocuments = [] } = useQuery<DocumentWithDetails[]>({
    queryKey: ["/api/dashboard/recent-documents", user?.id],
    queryFn: () => fetch(`/api/dashboard/recent-documents?limit=5&userId=${user?.id}`).then(res => res.json()),
    enabled: !!user?.id,
  });

  const { data: recentCases = [] } = useQuery<DocumentWithDetails[]>({
    queryKey: ["/api/dashboard/recent-cases", user?.id],
    queryFn: () => fetch(`/api/dashboard/recent-documents?limit=3&userId=${user?.id}`).then(res => res.json()),
    enabled: !!user?.id,
  });

  const { data: userProgress } = useQuery<{
    documentsCreated: number;
    documentsThisMonth: number;
    documentsThisWeek: number;
    averageProcessingTime: number;
    lastActivity: Date | null;
    categoryBreakdown: { [category: string]: number };
    recentActivity: Array<{
      action: string;
      document: string;
      date: Date;
    }>;
  }>({
    queryKey: ["/api/dashboard/user-progress", user?.id],
    queryFn: () => fetch(`/api/dashboard/user-progress?userId=${user?.id}`).then(res => res.json()),
    enabled: !!user?.id,
  });

  return (
    <MainLayout>
      <div className="p-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 space-x-reverse text-sm text-gray-600">
            <li><Link href="/dashboard" className="hover:text-primary-600">الرئيسية</Link></li>
            <li><i className="fas fa-chevron-left text-xs"></i></li>
            <li className="text-gray-900 font-medium">لوحة التحكم</li>
          </ol>
        </nav>

        {/* Dashboard Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3 space-x-reverse mb-2">
                <h1 className="text-2xl font-bold text-gray-900">
                  مرحباً، {user?.fullName}
                </h1>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-700">
                  {user?.role === 'admin' ? 'مدير النظام' : 
                   user?.role === 'archivist' ? 'أمين الأرشيف' : 'مستعرض'}
                </span>
              </div>
              <p className="text-gray-600">
                إليك نظرة عامة على تقدمك ووثائقك الحديثة.
              </p>
              {userProgress?.lastActivity && (
                <p className="text-sm text-gray-500 mt-1">
                  آخر نشاط: {new Date(userProgress.lastActivity).toLocaleDateString('ar-SA')}
                </p>
              )}
            </div>
            <div className="text-left">
              <div className="text-sm text-gray-600">
                إجمالي الوثائق المُنشأة
              </div>
              <div className="text-3xl font-bold text-primary-600">
                {userProgress?.documentsCreated || 0}
              </div>
              <div className="text-xs text-gray-500">
                +{userProgress?.documentsThisMonth || 0} هذا الشهر
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title={user?.role === 'admin' ? 'إجمالي القضايا' : 'قضاياي'}
            value={stats?.totalCases || 0}
            icon="fas fa-folder"
            iconBgColor="bg-primary-100"
            iconColor="text-primary-600"
            trend={{
              value: `+${userProgress?.documentsThisMonth || 0}`,
              label: "هذا الشهر",
              positive: true,
            }}
          />

          <StatsCard
            title={user?.role === 'admin' ? 'الوثائق المعالجة' : 'وثائقي النشطة'}
            value={stats?.processedDocs || 0}
            icon="fas fa-file-check"
            iconBgColor="bg-secondary-100"
            iconColor="text-secondary-600"
            trend={{
              value: `+${userProgress?.documentsThisWeek || 0}`,
              label: "هذا الأسبوع",
              positive: true,
            }}
          />

          <StatsCard
            title={user?.role === 'admin' ? 'في الانتظار' : 'معلقة'}
            value={stats?.pendingDocs || 0}
            icon="fas fa-clock"
            iconBgColor="bg-accent-100"
            iconColor="text-accent-600"
            trend={{
              value: stats?.pendingDocs ? `${stats.pendingDocs}` : '0',
              label: "تحتاج مراجعة",
              positive: false,
            }}
          />

          <StatsCard
            title={user?.role === 'admin' ? 'مؤرشفة' : 'مؤرشفة'}
            value={stats?.archivedCases || 0}
            icon="fas fa-archive"
            iconBgColor="bg-gray-100"
            iconColor="text-gray-600"
            trend={{
              value: `${Math.round((userProgress?.averageProcessingTime || 0) * 10) / 10}ي`,
              label: "متوسط المعالجة",
            }}
          />
        </div>

        {/* User Progress Section */}
        {userProgress && (
          <div className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle>تقدم المستخدم</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 mb-1">
                      {userProgress.documentsThisWeek}
                    </div>
                    <div className="text-sm text-blue-700">هذا الأسبوع</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 mb-1">
                      {userProgress.averageProcessingTime}
                    </div>
                    <div className="text-sm text-green-700">متوسط وقت المعالجة (أيام)</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600 mb-1">
                      {Object.keys(userProgress.categoryBreakdown).length}
                    </div>
                    <div className="text-sm text-purple-700">فئات مختلفة</div>
                  </div>
                </div>
                
                {userProgress.recentActivity.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-medium text-gray-900 mb-3">النشاط الأخير</h4>
                    <div className="space-y-2">
                      {userProgress.recentActivity.slice(0, 3).map((activity, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span className="text-gray-900">{activity.action}: {activity.document}</span>
                          <span className="text-gray-500">
                            {new Date(activity.date).toLocaleDateString('ar-SA')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Documents */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>الوثائق الحديثة</CardTitle>
                  <Link href="/documents">
                    <Button variant="ghost" size="sm" className="text-primary-600 hover:text-primary-700">
                      عرض الكل
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {recentDocuments.map((document) => (
                    <DocumentListItem 
                      key={document.id} 
                      document={document}
                      onViewDocument={(id) => console.log('View document:', id)}
                    />
                  ))}
                </div>
                {recentDocuments.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    لا توجد وثائق حديثة
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions & Recent Cases */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>إجراءات سريعة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/documents/new">
                  <Button variant="ghost" className="w-full justify-start">
                    <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center ml-3">
                      <i className="fas fa-plus text-primary-600 text-sm"></i>
                    </div>
                    إنشاء قضية جديدة
                  </Button>
                </Link>
                
                <Button variant="ghost" className="w-full justify-start">
                  <div className="w-8 h-8 bg-secondary-100 rounded-lg flex items-center justify-center ml-3">
                    <i className="fas fa-upload text-secondary-600 text-sm"></i>
                  </div>
                  رفع وثيقة
                </Button>
                
                <Link href="/documents">
                  <Button variant="ghost" className="w-full justify-start">
                    <div className="w-8 h-8 bg-accent-100 rounded-lg flex items-center justify-center ml-3">
                      <i className="fas fa-search text-accent-600 text-sm"></i>
                    </div>
                    بحث متقدم
                  </Button>
                </Link>
                
                <Link href="/reports">
                  <Button variant="ghost" className="w-full justify-start">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center ml-3">
                      <i className="fas fa-chart-line text-purple-600 text-sm"></i>
                    </div>
                    إنشاء تقرير
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Recent Cases */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>القضايا الحديثة</CardTitle>
                  <Link href="/documents">
                    <Button variant="ghost" size="sm" className="text-primary-600 hover:text-primary-700">
                      عرض الكل
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentCases.map((caseDoc) => (
                    <CaseListItem key={caseDoc.id} document={caseDoc} />
                  ))}
                </div>
                {recentCases.length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    لا توجد قضايا حديثة
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
