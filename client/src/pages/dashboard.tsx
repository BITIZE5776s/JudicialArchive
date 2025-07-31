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
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: recentDocuments = [] } = useQuery<DocumentWithDetails[]>({
    queryKey: ["/api/dashboard/recent-documents"],
    queryFn: () => fetch("/api/dashboard/recent-documents?limit=5").then(res => res.json()),
  });

  const { data: recentCases = [] } = useQuery<DocumentWithDetails[]>({
    queryKey: ["/api/dashboard/recent-cases"],
    queryFn: () => fetch("/api/dashboard/recent-documents?limit=3").then(res => res.json()),
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            مرحباً، {user?.fullName}
          </h1>
          <p className="text-gray-600">
            إليك نظرة عامة على قضاياك ووثائقك الحديثة.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="إجمالي القضايا"
            value={stats?.totalCases || 0}
            icon="fas fa-folder"
            iconBgColor="bg-primary-100"
            iconColor="text-primary-600"
            trend={{
              value: "+12%",
              label: "هذا الشهر",
              positive: true,
            }}
          />

          <StatsCard
            title="الوثائق المعالجة"
            value={stats?.processedDocs || 0}
            icon="fas fa-file-check"
            iconBgColor="bg-secondary-100"
            iconColor="text-secondary-600"
            trend={{
              value: "+8%",
              label: "هذا الأسبوع",
              positive: true,
            }}
          />

          <StatsCard
            title="في الانتظار"
            value={stats?.pendingDocs || 0}
            icon="fas fa-clock"
            iconBgColor="bg-accent-100"
            iconColor="text-accent-600"
            trend={{
              value: "+3",
              label: "اليوم",
              positive: false,
            }}
          />

          <StatsCard
            title="مؤرشفة"
            value={stats?.archivedCases || 0}
            icon="fas fa-archive"
            iconBgColor="bg-gray-100"
            iconColor="text-gray-600"
            trend={{
              value: "+5",
              label: "هذا الشهر",
            }}
          />
        </div>

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
