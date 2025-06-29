// frontend/src/components/Auth/RegisterPatientForm.tsx
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom'; // For redirection after registration

interface RegisterPatientFormProps {
    // any specific props if needed, e.g. onSuccessfulRegistration
}

const RegisterPatientForm: React.FC<RegisterPatientFormProps> = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [formError, setFormError] = useState<string | null>(null);
    const { registerPatient, isLoading, error: authError, clearError } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        clearError(); // Clear previous auth errors
        setFormError(null); // Clear previous form errors

        if (password !== confirmPassword) {
            setFormError("Passwords do not match.");
            return;
        }
        if (password.length < 8) {
            setFormError("Password must be at least 8 characters long.");
            return;
        }

        try {
            const userData = {
                email,
                password,
                full_name: fullName || undefined, // Pass undefined if empty, backend handles optional
                role: 'patient' // Explicitly set role, though UserCreate schema defaults to patient
            };
            await registerPatient(userData);
            // Handle successful registration, e.g., show a message or redirect
            alert('Registration successful! Please log in.'); // Simple alert for now
            navigate('/login'); // Redirect to login page
        } catch (err: any) {
            // err is already set in authContext, but we can set form specific error if needed
            // For now, authError from useAuth() will be displayed by the page component
            console.error("Registration failed on form:", err.message);
            // setFormError(err.message || "An unexpected error occurred during registration.");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="auth-form">
            <h2>Patient Registration</h2>
            {formError && <p className="error-message">{formError}</p>}
            {authError && <p className="error-message">{authError}</p>}

            <div className="form-group">
                <label htmlFor="email">Email:</label>
                <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
            </div>
            <div className="form-group">
                <label htmlFor="fullName">Full Name (Optional):</label>
                <input
                    type="text"
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                />
            </div>
            <div className="form-group">
                <label htmlFor="password">Password:</label>
                <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                />
            </div>
            <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password:</label>
                <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                />
            </div>
            <button type="submit" disabled={isLoading} className="submit-button">
                {isLoading ? 'Registering...' : 'Register'}
            </button>
        </form>
    );
};

export default RegisterPatientForm;
