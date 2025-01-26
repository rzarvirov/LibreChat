import React from 'react';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 sm:p-8">
      <div className="w-full max-w-4xl">
        <button
          onClick={() => navigate('/login')}
          className="mb-8 flex items-center text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Login
        </button>

        <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
        <div className="prose dark:prose-invert max-w-none">
          <p className="mb-4">Effective Date: March 19, 2024</p>

          <h2 className="text-xl font-semibold mt-6 mb-4">Introduction</h2>
          <p>
            AiBuddy is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard
            your personal information when you use our chat application and related services.
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-4">Information We Collect</h2>
          <ul className="list-disc pl-6 mb-4">
            <li>Account Information: Email address and authentication details when you create an account</li>
            <li>Chat Data: Messages and conversations you have with our AI assistant</li>
            <li>Usage Information: How you interact with our services, including features used and time spent</li>
            <li>Technical Data: IP address, browser type, device information, and cookies</li>
          </ul>

          <h2 className="text-xl font-semibold mt-6 mb-4">How We Use Your Information</h2>
          <ul className="list-disc pl-6 mb-4">
            <li>To provide and maintain our chat service</li>
            <li>To improve and personalize your experience</li>
            <li>To analyze usage patterns and optimize our service</li>
            <li>To communicate with you about service updates</li>
            <li>To ensure security and prevent abuse</li>
          </ul>

          <h2 className="text-xl font-semibold mt-6 mb-4">Data Security</h2>
          <p>
            We implement appropriate technical and organizational security measures to protect your personal information
            from unauthorized access, disclosure, or destruction.
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-4">Your Rights</h2>
          <p>You have the right to:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Access your personal data</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Object to processing of your data</li>
            <li>Export your data</li>
          </ul>

          <h2 className="text-xl font-semibold mt-6 mb-4">Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy or our practices, please contact us at{' '}
            <a href="mailto:support@aibuddy.com" className="text-blue-500 hover:text-blue-600">
              support@aibuddy.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy; 