import { Search, Bell, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "@/contexts/language-context";
import { useLocation } from "wouter";

interface HeaderProps {
  onSearch?: (query: string) => void;
  searchQuery?: string;
}

export function Header({ onSearch, searchQuery = "" }: HeaderProps) {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    logout();
    setLocation("/login");
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-50 h-16">
      <div className="flex items-center justify-between px-6 h-full">
        <div className="flex items-center space-x-4 space-x-reverse">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
              <i className="fas fa-balance-scale text-white text-lg"></i>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">الأرشيف القضائي</h1>
              <p className="text-xs text-gray-600">محكمة الاستئناف بالمغرب</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-6 space-x-reverse">
          {/* Search Bar */}
          <div className="relative hidden md:block">
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <Input
              type="text"
              placeholder={t('search') + ' في الوثائق والقضايا...'}
              className="w-80 pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-gray-50"
              value={searchQuery}
              onChange={(e) => onSearch?.(e.target.value)}
            />
          </div>
          
          {/* Notifications */}
          <Button
            variant="ghost"
            size="sm"
            className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -left-1 w-5 h-5 bg-accent-500 text-white text-xs rounded-full flex items-center justify-center">
              3
            </span>
          </Button>
          
          {/* User Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-3 space-x-reverse">
                <div className="text-right hidden lg:block">
                  <p className="text-sm font-medium text-gray-900">{user?.fullName}</p>
                  <p className="text-xs text-gray-600">
                    {user?.role === 'admin' ? t('admin') : 
                     user?.role === 'archivist' ? t('archivist') : t('viewer')}
                  </p>
                </div>
                <div className="w-10 h-10 bg-secondary-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {user?.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </span>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => setLocation("/profile")}>
                <i className="fas fa-user ml-2"></i>
                الملف الشخصي
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLocation("/settings")}>
                <i className="fas fa-cog ml-2"></i>
                الإعدادات
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                <i className="fas fa-sign-out-alt ml-2"></i>
                تسجيل الخروج
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
