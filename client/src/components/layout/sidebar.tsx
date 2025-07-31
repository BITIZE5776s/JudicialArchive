import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

interface SidebarProps {
  onNewDocument?: () => void;
}

export function Sidebar({ onNewDocument }: SidebarProps) {
  const [location] = useLocation();
  const { canManageDocuments, canManageUsers } = useAuth();

  const navigation = [
    {
      name: "لوحة التحكم",
      href: "/dashboard",
      icon: "fas fa-tachometer-alt",
      current: location === "/dashboard",
    },
    {
      name: "جميع القضايا",
      href: "/documents",
      icon: "fas fa-folder",
      current: location === "/documents",
      badge: "247",
    },
    {
      name: "الوثائق الحديثة",
      href: "/recent",
      icon: "fas fa-file-alt",
      current: location === "/recent",
    },
    {
      name: "الوثائق المفضلة",
      href: "/favorites",
      icon: "fas fa-star",
      current: location === "/favorites",
    },
    {
      name: "في انتظار الموافقة",
      href: "/pending",
      icon: "fas fa-clock",
      current: location === "/pending",
      badge: "12",
      badgeColor: "bg-accent-500 text-white",
    },
  ];

  const categories = [
    { name: "القضايا المدنية", icon: "fas fa-balance-scale", href: "/documents?category=مدنية" },
    { name: "القضايا الجنائية", icon: "fas fa-gavel", href: "/documents?category=جنائية" },
    { name: "القضايا التجارية", icon: "fas fa-handshake", href: "/documents?category=تجارية" },
    { name: "القضايا العائلية", icon: "fas fa-users", href: "/documents?category=أسرية" },
    { name: "القضايا الإدارية", icon: "fas fa-building", href: "/documents?category=إدارية" },
  ];

  const adminNavigation = [
    {
      name: "إدارة المستخدمين",
      href: "/users",
      icon: "fas fa-users-cog",
      current: location === "/users",
    },
    {
      name: "التقارير",
      href: "/reports",
      icon: "fas fa-chart-bar",
      current: location === "/reports",
    },
    {
      name: "الإعدادات",
      href: "/settings",
      icon: "fas fa-cog",
      current: location === "/settings",
    },
  ];

  return (
    <aside className="w-80 bg-white shadow-sm border-r border-gray-200 flex-shrink-0">
      <nav className="p-6 space-y-2">
        <div className="mb-6">
          {canManageDocuments() && (
            <Button
              onClick={onNewDocument}
              className="w-full bg-primary-500 hover:bg-primary-600 text-white px-4 py-3 rounded-lg font-medium flex items-center justify-center space-x-2 space-x-reverse transition-colors"
            >
              <i className="fas fa-plus"></i>
              <span>وثيقة جديدة</span>
            </Button>
          )}
        </div>

        <div className="space-y-1">
          {navigation.map((item) => (
            <Link key={item.name} href={item.href}>
              <div
                className={cn(
                  "flex items-center space-x-3 space-x-reverse px-4 py-3 rounded-lg transition-colors",
                  item.current
                    ? "text-primary-600 bg-primary-50 font-medium"
                    : "text-gray-700 hover:bg-gray-50"
                )}
              >
                <i className={`${item.icon} w-5`}></i>
                <span className="flex-1">{item.name}</span>
                {item.badge && (
                  <span
                    className={cn(
                      "text-xs px-2 py-1 rounded-full",
                      item.badgeColor || "bg-gray-200 text-gray-700"
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>

        <div className="pt-6">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            الفئات
          </h3>
          <div className="space-y-1">
            {categories.map((category) => (
              <Link key={category.name} href={category.href}>
                <div className="flex items-center space-x-3 space-x-reverse px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                  <i className={`${category.icon} text-sm w-4`}></i>
                  <span className="text-sm">{category.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {canManageUsers() && (
          <div className="pt-6">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              الإدارة
            </h3>
            <div className="space-y-1">
              {adminNavigation.map((item) => (
                <Link key={item.name} href={item.href}>
                  <div
                    className={cn(
                      "flex items-center space-x-3 space-x-reverse px-4 py-2 rounded-lg transition-colors",
                      item.current
                        ? "text-primary-600 bg-primary-50 font-medium"
                        : "text-gray-600 hover:bg-gray-50"
                    )}
                  >
                    <i className={`${item.icon} text-sm w-4`}></i>
                    <span className="text-sm">{item.name}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>
    </aside>
  );
}
