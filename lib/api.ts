import { redirect } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

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
  bearerToken: string;
  refreshToken: string;
  expiresAt: string;
}

export interface User {
  id: string;
  email: string;
  companyId: string;
  roleId: string;
  personId: string;
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

async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      // Optional: Redirect to login
      // window.location.href = "/login";
    }
    throw new Error("Unauthorized");
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

export const api = {
  auth: {
    login: (data: { email: string; password: string }) => 
      fetchAPI<AuthResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    me: () => fetchAPI<User>("/auth/authenticated-user"),
  },

  users: {
    create: (data: any) => fetchAPI("/users", { method: "POST", body: JSON.stringify(data) }),
    list: (params?: any) => {
      const searchParams = new URLSearchParams(params);
      return fetchAPI<PaginatedResponse<User>>(`/users?${searchParams.toString()}`);
    },
  },

  students: {
    create: (data: any) => fetchAPI("/students", { method: "POST", body: JSON.stringify(data) }),
    list: (params?: any) => {
      const searchParams = new URLSearchParams(params);
      return fetchAPI<PaginatedResponse<Student>>(`/students?${searchParams.toString()}`);
    },
    get: (id: string) => fetchAPI<Student>(`/students/${id}`),
    update: (id: string, data: any) => fetchAPI(`/students/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string) => fetchAPI(`/students/${id}`, { method: "DELETE" }),
  },

  lessons: {
    create: (data: any) => fetchAPI("/lessons", { method: "POST", body: JSON.stringify(data) }),
    list: (params?: any) => {
      const searchParams = new URLSearchParams(params);
      return fetchAPI<PaginatedResponse<Lesson>>(`/lessons?${searchParams.toString()}`);
    },
    get: (id: string) => fetchAPI<Lesson>(`/lessons/${id}`),
    update: (id: string, data: any) => fetchAPI(`/lessons/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string) => fetchAPI(`/lessons/${id}`, { method: "DELETE" }),
  },

  classes: {
    create: (data: any) => fetchAPI("/classes", { method: "POST", body: JSON.stringify(data) }),
    list: (params?: any) => {
      const searchParams = new URLSearchParams(params);
      return fetchAPI<PaginatedResponse<Class>>(`/classes?${searchParams.toString()}`);
    },
    get: (id: string) => fetchAPI<Class>(`/classes/${id}`),
    delete: (id: string) => fetchAPI(`/classes/${id}`, { method: "DELETE" }),
  },

  notes: {
    create: (data: any) => fetchAPI("/notes", { method: "POST", body: JSON.stringify(data) }),
    list: (params?: any) => {
      const searchParams = new URLSearchParams(params);
      return fetchAPI<PaginatedResponse<Note>>(`/notes?${searchParams.toString()}`);
    },
    update: (id: string, data: any) => fetchAPI(`/notes/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  },
  
  // Properties & Bookings (Included based on backend.md, though maybe less relevant for teacher dashboard)
  properties: {
    list: (params?: any) => {
        const searchParams = new URLSearchParams(params);
        return fetchAPI<PaginatedResponse<any>>(`/properties?${searchParams.toString()}`);
    }
  }
};
