import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';
import useAuthStore from './store/authSore';
import { useEffect } from 'react';
import VerifyEmail from './pages/VerifyEmail';
import RegisterSuccess from './pages/RegisterSuccess';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Profile from './pages/Profile';
import CreatePost from './pages/CreatePost';
import PostDetail from './pages/PostDetail';
import EditPost from './pages/EditPost';
import Following from './pages/Following';
import Search from './pages/Search';

function App() {
  const { fetchUser, loading } = useAuthStore();

  useEffect(() => {
    // Only fetch user if there might be a token
    const token = localStorage.getItem('token');
    if (token) {
      fetchUser().catch(() => {
        // If fetchUser fails, just continue - user is not authenticated
        console.log('User not authenticated');
      });
    }
  }, [fetchUser]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  ); // prevent early redirect

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/register-success" element={<RegisterSuccess />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/profile/:username" element={<Profile />} />
        <Route path="/create-post" element={<CreatePost />} />
        <Route path="/post/:postId" element={<PostDetail />} />
        <Route path="/edit-post/:postId" element={<ProtectedRoute><EditPost /></ProtectedRoute>} />
        <Route path="/following" element={<ProtectedRoute><Following /></ProtectedRoute>} />
        <Route path="/search" element={<Search />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;
