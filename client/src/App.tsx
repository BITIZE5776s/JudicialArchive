import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { SettingsProvider } from "@/contexts/settings-context";
import { LanguageProvider } from "@/contexts/language-context";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import Documents from "@/pages/documents";
import DocumentEditor from "@/pages/document-editor";
import UserManagement from "@/pages/user-management";
import Profile from "@/pages/profile";
import Settings from "@/pages/settings";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }
  
  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { canManageUsers } = useAuth();
  
  if (!canManageUsers()) {
    return <Redirect to="/dashboard" />;
  }
  
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  
  if (isAuthenticated) {
    return <Redirect to="/dashboard" />;
  }
  
  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/login">
        <PublicRoute>
          <Login />
        </PublicRoute>
      </Route>
      
      {/* Protected routes */}
      <Route path="/">
        <ProtectedRoute>
          <Redirect to="/dashboard" />
        </ProtectedRoute>
      </Route>
      
      <Route path="/dashboard">
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </Route>
      
      <Route path="/documents">
        <ProtectedRoute>
          <Documents />
        </ProtectedRoute>
      </Route>
      
      <Route path="/documents/:id">
        {(params) => (
          <ProtectedRoute>
            <DocumentEditor documentId={params.id} />
          </ProtectedRoute>
        )}
      </Route>
      
      <Route path="/recent">
        <ProtectedRoute>
          <Documents />
        </ProtectedRoute>
      </Route>
      
      <Route path="/favorites">
        <ProtectedRoute>
          <Documents />
        </ProtectedRoute>
      </Route>
      
      <Route path="/pending">
        <ProtectedRoute>
          <Documents />
        </ProtectedRoute>
      </Route>
      
      <Route path="/users">
        <ProtectedRoute>
          <AdminRoute>
            <UserManagement />
          </AdminRoute>
        </ProtectedRoute>
      </Route>
      
      <Route path="/reports">
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </Route>
      
      <Route path="/settings">
        <ProtectedRoute>
          <Settings />
        </ProtectedRoute>
      </Route>
      
      <Route path="/profile">
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      </Route>
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <SettingsProvider>
            <LanguageProvider>
              <Toaster />
              <Router />
            </LanguageProvider>
          </SettingsProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
