import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import useAuthStore from '../store/authSore';

const RegisterSuccess = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [countdown, setCountdown] = useState(5);

    // Get email from state (optional)
    const email = location.state?.email || 'your email';

    // Auto redirect to login after 5 seconds
    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    navigate('/login', { replace: true });
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [navigate]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                    {/* Success Icon */}
                    <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                        <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>

                    {/* Main Content */}
                    <h1 className="text-2xl font-bold text-gray-900 mb-3">
                        Registration Successful!
                    </h1>

                    <p className="text-gray-700 mb-6">
                        ✅ Your account has been created successfully.
                        <br />
                        Please go to the login page to continue.
                    </p>

                    <p className="text-sm text-gray-600 mb-6">
                        Redirecting to login in <span className="text-blue-600 font-semibold">{countdown}</span> seconds...
                    </p>

                    <Link
                        to="/login"
                        className="w-full inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200"
                    >
                        Go to Login Now
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default RegisterSuccess;
