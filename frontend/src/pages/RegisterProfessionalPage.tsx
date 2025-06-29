// frontend/src/pages/RegisterProfessionalPage.tsx
import React from 'react';
import RegisterProfessionalForm from '../components/Auth/RegisterProfessionalForm';
import { Link } from 'react-router-dom';
// import './AuthPage.css'; // Shared CSS

const RegisterProfessionalPage: React.FC = () => {
    return (
        <div className="auth-page-container">
            <RegisterProfessionalForm />
            <p style={{ textAlign: 'center', marginTop: '1rem' }}>
                Already have an account? <Link to="/login">Login here</Link>
            </p>
            <p style={{ textAlign: 'center', marginTop: '0.5rem' }}>
                Registering as a patient? <Link to="/register-patient">Click here</Link>
            </p>
        </div>
    );
};

export default RegisterProfessionalPage;
