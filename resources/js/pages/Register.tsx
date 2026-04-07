import React from 'react';
import { Link } from 'react-router-dom';

export default function Register() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-96 text-center">
        <h1 className="text-2xl font-bold mb-4 text-[#0D1F3C]">Register (Placeholder)</h1>
        <p className="text-gray-500 mb-6">Client Portal Registration</p>
        <Link to="/" className="text-[#CFA030] underline">Back to Home</Link>
      </div>
    </div>
  );
}
