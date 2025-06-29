// frontend/src/components/Auth/RegisterProfessionalForm.tsx
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const RegisterProfessionalForm: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [fullName, setFullName] = useState('');
    // Add any professional-specific fields here, e.g., license number, clinic name
    // const [licenseNumber, setLicenseNumber] = useState('');
    const [formError, setFormError] = useState<string | null>(null);
    const { registerProfessional, isLoading, error: authError, clearError } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        clearError();
        setFormError(null);

        if (password !== confirmPassword) {
            setFormError("Passwords do not match.");
            return;
        }
        if (password.length < 8) {
            setFormError("Password must be at least 8 characters long.");
            return;
        }
        // Add validation for professional-specific fields if any

        try {
            const professionalData = {
                email,
                password,
                full_name: fullName || undefined,
                role: 'healthcare_professional', // Explicitly set role
                // license_number: licenseNumber || undefined, // Example specific field
            };
            await registerProfessional(professionalData);
            alert('Healthcare Professional registration successful! Account may require admin approval or further setup.');
            navigate('/login'); // Or to a pending approval page / dashboard
        } catch (err: any) {
            console.error("Professional registration failed on form:", err.message);
            // authError from useAuth() will be displayed by the page component
        }
    };

    return (
        <form onSubmit={handleSubmit} className="auth-form">
            <h2>Healthcare Professional Registration</h2>
            {formError && <p className="error-message">{formError}</p>}
            {authError && <p className="error-message">{authError}</p>}

            <div className="form-group">
                <label htmlFor="prof-email">Email:</label>
                <input
                    type="email"
                    id="prof-email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
            </div>
            <div className="form-group">
                <label htmlFor="prof-fullName">Full Name:</label>
                <input
                    type="text"
                    id="prof-fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                />
            </div>
            {/* Example of a professional-specific field */}
            {/* <div className="form-group">
                <label htmlFor="prof-license">License Number:</label>
                <input
                    type="text"
                    id="prof-license"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    required
                />
            </div> */}
            <div className="form-group">
                <label htmlFor="prof-password">Password:</label>
                <input
                    type="password"
                    id="prof-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                />
            </div>
            <div className="form-group">
                <label htmlFor="prof-confirmPassword">Confirm Password:</label>
                <input
                    type="password"
                    id="prof-confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                />
            </div>
            <button type="submit" disabled={isLoading} className="submit-button">
                {isLoading ? 'Registering...' : 'Register as Professional'}
            </button>
        </form>
    );
};

export default RegisterProfessionalForm;
