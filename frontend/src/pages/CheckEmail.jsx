import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import useAuthStore from '../store/authSore';

const CheckEmail = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { register } = useAuthStore();
    const [isResending, setIsResending] = useState(false);
    const [resendMessage, setResendMessage] = useState('');
    
    // Get email from state (passed from register/login)
    const email = location.state?.email || 'your email';
    const fromPage = location.state?.from || 'register';

    const handleResendEmail = async () => {
        if (!location.state?.email) {
            setResendMessage('Email address not found. Please register again.');
            return;
        }

        setIsResending(true);
        setResendMessage('');

        try {
            // Call register again to resend verification email
            const res = await register(location.state.formData);
            if (res?.message?.includes('verify')) {
                setResendMessage('✅ Verification email sent successfully! Please check your inbox.');
            } else {
                setResendMessage('❌ Failed to resend email. Please try again.');
            }
        } catch (error) {
            setResendMessage('❌ Failed to resend email. Please try again.');
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                    {/* Email Icon */}
                    <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                        <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                        </svg>
                    </div>

                    {/* Main Content */}
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">
                        Please Check Your Email
                    </h1>
                    
                    <p className="text-gray-600 mb-6 leading-relaxed">
                        We've sent a verification link to
                        <br />
                        <span className="font-semibold text-gray-900">{email}</span>
                    </p>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <p className="text-blue-800 text-sm font-medium">
                            📧 Verification email has been sent! Please check your inbox and click the verification link to activate your account.
                        </p>
                    </div>

                    {/* Instructions */}
                    <div className="text-left bg-gray-50 rounded-lg p-4 mb-6">
                        <h3 className="font-semibold text-gray-900 mb-2">Next Steps:</h3>
                        <ul className="text-sm text-gray-600 space-y-1">
                            <li>• Check your inbox for our email</li>
                            <li>• Look in spam/junk folder if not found</li>
                            <li>• Click the verification link</li>
                            <li>• Return to login page</li>
                        </ul>
                    </div>

                    {/* Resend Email */}
                    <div className="space-y-4">
                        {resendMessage && (
                            <div className={`p-3 rounded-lg text-sm ${
                                resendMessage.includes('✅') 
                                    ? 'bg-green-50 text-green-700 border border-green-200' 
                                    : 'bg-red-50 text-red-700 border border-red-200'
                            }`}>
                                {resendMessage}
                            </div>
                        )}

                        <button
                            onClick={handleResendEmail}
                            disabled={isResending}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center"
                        >
                            {isResending ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Sending...
                                </>
                            ) : (
                                'Resend Verification Email'
                            )}
                        </button>

                        <div className="flex space-x-4">
                            <Link 
                                to="/login"
                                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-lg transition duration-200 text-center"
                            >
                                Back to Login
                            </Link>
                            <Link 
                                to="/register"
                                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-lg transition duration-200 text-center"
                            >
                                Register Again
                            </Link>
                        </div>
                    </div>

                    {/* Help Text */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <p className="text-gray-500 text-sm">
                            Still having trouble? 
                            <br />
                            <span className="text-blue-600 hover:text-blue-700 cursor-pointer">
                                Contact our support team
                            </span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckEmail;