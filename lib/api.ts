import { redirect } from "next/navigation";
import { toast } from "sonner";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3001/api/v1";

// --- Types ---

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface AuthResponse {
  bearerToken?: string;
  token?: string;
  refreshToken?: string;
  expiresAt?: string;
  user?: User;
}

export interface User {
  id: string;
  email: string;
  companyId: string;
  roleId: string;
  personId: string;
  googleCalendarUrl?: string;
  hasGoogleCalendarIntegration?: boolean;
  person?: Person;
  company?: Company;
  role?: Role;
}

export interface Person {
  id: string;
  name: string;
  document: string;
  contacts: Contact[];
  address: Address[];
  // ... other fields
}

export interface Contact {
  type: "EMAIL" | "PHONE" | "MOBILE" | "WHATSAPP" | "OTHER";
  value: string;
  isMain?: boolean;
}

export interface Address {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  isMain?: boolean;
}

export interface Company {
  id: string;
  corporateName: string;
  fantasyName: string;
  document: string;
  isActive: boolean;
}

export interface Role {
  id: string;
  name: string;
  description: string;
}

export interface Student {
  id: string;
  personId: string;
  teacherId: string;
  companyId: string;
  level: string;
  progress: string;
  totalLessons?: number;
  attendedLessons?: number;
  remainingLessons?: number;
  createdAt: Date;
  person?: Person; // Assuming expansion
}

export interface Lesson {
  id: string;
  userId: string;
  studentId: string;
  companyId: string;
  title: string;
  description: string;
  level: string;
  materials: string[];
  createdAt: Date;
}

export interface Class {
  id: string;
  userId: string;
  studentId: string;
  lessonId: string;
  companyId: string;
  date: string; // ISO Date
  time: string;
  status: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  googleEventId?: string;
  createdAt: Date;
  student?: Student; // Assuming expansion
  lesson?: Lesson; // Assuming expansion
}

export interface GoogleCalendarEvent {
  googleEventId: string;
  summary: string;
  description?: string;
  startDateTime: string;
  endDateTime: string;
  status: string;
  source: "google-calendar";
}

export interface ClassesResponse {
  classes: Class[];
  googleCalendarEvents: GoogleCalendarEvent[];
}

export interface Note {
  id: string;
  userId: string;
  classId: string;
  studentId: string;
  companyId: string;
  content: string;
  createdAt: Date;
}

// --- API Client ---

function buildQueryString(params: any) {
  const searchParams = new URLSearchParams();
  if (params) {
    Object.keys(params).forEach(key => {
      const value = params[key];
      if (Array.isArray(value)) {
        value.forEach(v => searchParams.append(key, v));
      } else if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString());
      }
    });
  }
  return searchParams.toString();
}

let isRedirecting = false;

const handleSessionExpired = () => {
  if (isRedirecting) return;
  isRedirecting = true;

  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  toast.error("Sessão expirada. Redirecionando para o login...");
  setTimeout(() => {
    window.location.href = "/login";
  }, 2000);
};

async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  let token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (token === "undefined") token = null;
  
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string>),
  };

  const url = `${API_URL}${endpoint}`;
  console.log(`Fetching: ${url}`);
  if (token) {
    console.log("Token present in request");
  } else {
    console.warn("No token found in localStorage");
  }
  console.log("Request Headers:", headers);

  let response;
  try {
    response = await fetch(url, {
      cache: "no-store",
      ...options,
      headers,
    });
  } catch (error) {
    console.error("Network error:", error);
    toast.error("Erro de conexão. Verifique se o servidor backend está rodando.");
    throw error;
  }

  if (response.status === 401) {
    if (typeof window !== "undefined" && !endpoint.includes("/auth/login")) {
      console.warn("Unauthorized access - attempting refresh");
      
      const refreshToken = localStorage.getItem("refreshToken");
      
      // Avoid infinite loops if the refresh endpoint itself returns 401
      if (refreshToken && !endpoint.includes("/auth/refresh")) {
        try {
          const refreshResponse = await fetch(`${API_URL}/auth/refresh`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ refreshToken }),
          });

          if (refreshResponse.ok) {
            const data = await refreshResponse.json();
            // Handle both direct object and nested data object patterns
            const newBearerToken = data.bearerToken || data.data?.bearerToken;
            const newRefreshToken = data.refreshToken || data.data?.refreshToken;

            if (newBearerToken) {
              console.log("Token refreshed successfully");
              localStorage.setItem("token", newBearerToken);
              if (newRefreshToken) {
                localStorage.setItem("refreshToken", newRefreshToken);
              }
              
              // Retry the original request with the new token
              return fetchAPI<T>(endpoint, options);
            }
          } else {
            console.error("Refresh token failed");
            handleSessionExpired();
          }
        } catch (error) {
          console.error("Error refreshing token:", error);
          handleSessionExpired();
        }
      } else {
        // No refresh token available or we are already in a refresh loop
        handleSessionExpired();
      }
    }
    throw new Error("Unauthorized");
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error("API Error Response:", errorData);
    
    // Handle array of messages (common in NestJS/class-validator)
    const message = Array.isArray(errorData.message) 
      ? errorData.message.join(", ") 
      : errorData.message;

    throw new Error(message || `Error ${response.status}: ${response.statusText}`);
  }

  const responseData = await response.json();
  // console.log(`Response from ${url}:`, responseData); // Debugging
  return responseData;
}

export const api = {
  auth: {
    login: (data: { email: string; password: string }) => 
      fetchAPI<AuthResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    me: () => fetchAPI<User>("/auth/authenticated-user"),
    connectGoogle: async () => {
      try {
        const response = await fetchAPI<{ authUrl: string }>("/auth/google");
        if (response.authUrl) {
          window.location.href = response.authUrl;
        }
      } catch (error) {
        console.error("Failed to initiate Google Auth:", error);
        toast.error("Não foi possível iniciar a conexão com o Google.");
      }
    },
  },

  users: {
    create: (data: any) => fetchAPI("/users", { method: "POST", body: JSON.stringify(data) }),
    list: (params?: any) => {
      return fetchAPI<PaginatedResponse<User>>(`/users?${buildQueryString(params)}`);
    },
    update: (id: string, data: any) => fetchAPI(`/users/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  },

  students: {
    create: (data: any) => fetchAPI("/students", { method: "POST", body: JSON.stringify(data) }),
    list: (params?: any) => {
      return fetchAPI<PaginatedResponse<Student>>(`/students?${buildQueryString(params)}`);
    },
    get: (id: string) => fetchAPI<Student>(`/students/${id}`),
    update: (id: string, data: any) => fetchAPI(`/students/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string) => fetchAPI(`/students/${id}`, { method: "DELETE" }),
    addLessons: (id: string, quantity: number) => fetchAPI(`/students/${id}/add-lessons`, { method: "POST", body: JSON.stringify({ quantity }) }),
    createWithPerson: (data: any) => fetchAPI("/students/with-person", { method: "POST", body: JSON.stringify(data) }),
  },

  lessons: {
    create: (data: any) => fetchAPI("/lessons", { method: "POST", body: JSON.stringify(data) }),
    list: (params?: any) => {
      return fetchAPI<PaginatedResponse<Lesson>>(`/lessons?${buildQueryString(params)}`);
    },
    get: (id: string) => fetchAPI<Lesson>(`/lessons/${id}`),
    update: (id: string, data: any) => fetchAPI(`/lessons/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string) => fetchAPI(`/lessons/${id}`, { method: "DELETE" }),
  },

  classes: {
    create: (data: any) => fetchAPI("/classes", { method: "POST", body: JSON.stringify(data) }),
    list: (params?: any) => {
      return fetchAPI<ClassesResponse>(`/classes?${buildQueryString(params)}`);
    },
    get: (id: string) => fetchAPI<Class>(`/classes/${id}`),
    delete: (id: string) => fetchAPI(`/classes/${id}`, { method: "DELETE" }),
  },

  notes: {
    create: (data: any) => fetchAPI("/notes", { method: "POST", body: JSON.stringify(data) }),
    list: (params?: any) => {
      return fetchAPI<PaginatedResponse<Note>>(`/notes?${buildQueryString(params)}`);
    },
    update: (id: string, data: any) => fetchAPI(`/notes/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  },

  persons: {
    create: (data: any) => fetchAPI("/persons", { method: "POST", body: JSON.stringify(data) }),
    get: (id: string) => fetchAPI<Person>(`/persons/${id}`),
    update: (id: string, data: any) => fetchAPI(`/persons/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  },
  
  // Properties & Bookings (Included based on backend.md, though maybe less relevant for teacher dashboard)
  properties: {
    list: (params?: any) => {
        return fetchAPI<PaginatedResponse<any>>(`/properties?${buildQueryString(params)}`);
    }
  }
};
