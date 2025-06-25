import { User } from "@shared/schema";

interface AuthUser {
  id: number;
  username: string;
  balance: string;
}

interface AuthResponse {
  user: AuthUser;
}

export class AuthService {
  private currentUser: AuthUser | null = null;

  async login(username: string, pin: string): Promise<AuthUser> {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, pin }),
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Error de autenticación");
    }

    const data: AuthResponse = await response.json();
    this.currentUser = data.user;
    return data.user;
  }

  async register(username: string, pin: string, confirmPin: string): Promise<AuthUser> {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, pin, confirmPin }),
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Error de registro");
    }

    const data: AuthResponse = await response.json();
    this.currentUser = data.user;
    return data.user;
  }

  async logout(): Promise<void> {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    this.currentUser = null;
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    if (this.currentUser) {
      return this.currentUser;
    }

    try {
      const response = await fetch("/api/auth/me", {
        credentials: "include",
      });

      if (response.ok) {
        const data: AuthResponse = await response.json();
        this.currentUser = data.user;
        return data.user;
      }
    } catch (error) {
      // Ignore error, user is not authenticated
    }

    return null;
  }

  setCurrentUser(user: AuthUser | null) {
    this.currentUser = user;
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }
}

export const authService = new AuthService();
