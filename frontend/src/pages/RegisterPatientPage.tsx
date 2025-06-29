// frontend/src/pages/RegisterPatientPage.tsx
import React from 'react';
import RegisterPatientForm from '../components/Auth/RegisterPatientForm';
import { Link } from 'react-router-dom';
// import './AuthPage.css'; // Consider a shared CSS file for auth pages

const RegisterPatientPage: React.FC = () => {
    return (
        <div className="auth-page-container">
            {/* You can add a header or layout wrapper here */}
            <RegisterPatientForm />
            <p style={{ textAlign: 'center', marginTop: '1rem' }}>
                Already have an account? <Link to="/login">Login here</Link>
            </p>
            {/* You can add a footer here */}
        </div>
    );
};

export default RegisterPatientPage;
