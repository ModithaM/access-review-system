import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}`;

export interface LoginResponse {
    success: boolean;
    result: {
        token: string;
        user: {
            id: string;
            name: string;
            isLoggedIn: boolean;
            userType: "user" | "admin" | "moderator";
        };
    };
    message: string;
}

interface StoredUser {
  token: string;
  user: {
    id: string;
    name: string;
    isLoggedIn: boolean;
    userType: string;
  };
}

class AuthService {
  login(username: string, password: string) {
    return axios
      .post<LoginResponse>(API_URL + "login", {
        email: username,
        password
      })
      .then(response => {
        if (response.data.success && response.data.result) {
          const userData: StoredUser = {
            token: response.data.result.token,
            user: response.data.result.user
          };
          localStorage.setItem("user", JSON.stringify(userData));
        }

        return response.data;
      });
  }

  logout() {
    localStorage.removeItem("user");
  }

  register(email: string, name: string, password: string, surname?: string, passwordCheck?: string) {
    return axios.post(API_URL + "register", {
      email,
      name,
      surname,
      password,
      passwordCheck: passwordCheck || password
    });
  }

  getCurrentUser(): StoredUser | null {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }

    return null;
  }

  isLoggedIn(): boolean {
    const user = this.getCurrentUser();
    return !!(user && user.token && user.user?.isLoggedIn);
  }

  getToken(): string | null {
    const user = this.getCurrentUser();
    return user?.token || null;
  }
}

export default new AuthService();
