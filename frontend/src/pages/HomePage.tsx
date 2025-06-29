// frontend/src/pages/HomePage.tsx
import React from 'react';

const HomePage: React.FC = () => {
  return (
    <div>
      <h1>Welcome to Our Application!</h1>
      <p>This is the home page. Navigate using the links above.</p>
      <p>
        If you are a new patient, please <a href="/register-patient">register here</a>.
      </p>
      <p>
        If you already have an account, please <a href="/login">login</a>.
      </p>
    </div>
  );
};

export default HomePage;
