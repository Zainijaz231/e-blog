import { Navigate } from "react-router-dom";
import  useAuthStore from "../store/authSore";

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuthStore();

    console.log('ProtectedRoute - Loading:', loading, 'User:', user);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Authenticating...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        console.log('ProtectedRoute - No user, redirecting to login');
        return <Navigate to="/login" replace />;
    }

    console.log('ProtectedRoute - User authenticated, rendering children');
    return children;
};


export default ProtectedRoute;