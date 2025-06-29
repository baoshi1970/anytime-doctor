// frontend/src/types/auth.ts

export interface User {
    id: number;
    email: string;
    full_name?: string | null;
    role: 'patient' | 'healthcare_professional' | 'admin';
    is_active: boolean;
    // items?: any[]; // If you have items linked to users
}

export interface TokenResponse {
    access_token: string;
    token_type: string;
}

// You might also want types for registration payloads if they differ significantly
// export interface PatientRegistrationData {
//   email: string;
//   password: string;
//   full_name?: string;
// }

// export interface ProfessionalRegistrationData extends PatientRegistrationData {
//   // any specific fields for professionals
// }

// Type for the AuthContext
export interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null;
    token: string | null;
    login: (email_: string, password_: string) => Promise<void>;
    logout: () => void;
    registerPatient: (userData: any) => Promise<any>; // Define more specific type later
    registerProfessional: (userData: any) => Promise<any>; // Define more specific type later
    isLoading: boolean;
    error: string | null;
    clearError: () => void;
}
