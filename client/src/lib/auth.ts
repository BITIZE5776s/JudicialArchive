import { type User } from "@shared/schema";

export class AuthService {
  private static instance: AuthService;
  private currentUser: User | null = null;

  private constructor() {
    // Load user from localStorage on initialization
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        this.currentUser = JSON.parse(savedUser);
      } catch {
        localStorage.removeItem('currentUser');
      }
    }
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  setCurrentUser(user: User | null): void {
    this.currentUser = user;
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('currentUser');
    }
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  hasRole(role: string): boolean {
    return this.currentUser?.role === role;
  }

  canManageUsers(): boolean {
    return this.hasRole('admin');
  }

  canManageDocuments(): boolean {
    return this.hasRole('admin') || this.hasRole('archivist');
  }

  canViewDocuments(): boolean {
    return this.isAuthenticated();
  }

  logout(): void {
    this.setCurrentUser(null);
  }
}

export const authService = AuthService.getInstance();
