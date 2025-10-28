import { Link, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import useAuthStore from '../store/authSore';

const LeftSidebar = () => {
    const location = useLocation();
    const { user, fetchUser, logout } = useAuthStore();



    // Force refresh user data if username is missing
    useEffect(() => {
        if (user && !user.username) {
            fetchUser();
        }
    }, [user, fetchUser]);

    const isActive = (path) => {
        return location.pathname === path;
    };

    const menuItems = [
        {
            name: 'Home',
            path: '/',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
            )
        },
        {
            name: 'Profile',
            path: user ? (user.username ? `/profile/${user.username}` : '#') : '/login',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            )
        },
        {
            name: 'Search',
            path: '/search',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            )
        },
        {
            name: 'Create Post',
            path: '/create-post',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
            )
        },
        {
            name: 'Following',
            path: '/following',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            )
        }
    ];

    return (
        <div className="hidden lg:block fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 z-40">
            {/* Logo */}
            <div className="p-6 border-b border-gray-200">
                <Link to="/" className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                    </div>
                    <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        E-Blog
                    </span>
                </Link>
                
                {/* Debug info */}
                {user && !user.username && (
                    <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                        Profile loading... Please refresh page or logout/login again.
                    </div>
                )}
            </div>

            {/* Navigation Menu */}
            <nav className="p-4">
                <ul className="space-y-2">
                    {menuItems.map((item) => (
                        <li key={item.name}>
                            {item.path === '#' ? (
                                <div className="flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-400 cursor-not-allowed">
                                    {item.icon}
                                    <span className="font-medium">{item.name}</span>
                                    <span className="text-xs">(Loading...)</span>
                                </div>
                            ) : (
                                <Link
                                    to={item.path}
                                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                                        isActive(item.path)
                                            ? 'bg-blue-50 text-blue-600 border border-blue-200'
                                            : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                                    }`}
                                >
                                    {item.icon}
                                    <span className="font-medium">{item.name}</span>
                                </Link>
                            )}
                        </li>
                    ))}
                </ul>
            </nav>

            {/* User Info */}
            {user && (
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
                    <div className="flex items-center space-x-3 p-3 rounded-xl bg-gray-50 mb-3">
                        <img
                            src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.name}&background=6366f1&color=fff&size=40`}
                            alt={user.name}
                            className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                            <p className="text-xs text-gray-500 truncate">
                                @{user.username || 'Loading...'}
                            </p>
                        </div>
                    </div>
                    
                    {/* Logout Button */}
                    <button
                        onClick={async () => {
                            try {
                                await logout();
                                window.location.href = '/login';
                            } catch (error) {
                                console.error('Logout failed:', error);
                            }
                        }}
                        className="w-full flex items-center space-x-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span className="text-sm font-medium">Logout</span>
                    </button>
                    
                    {!user.username && (
                        <div className="mt-2 text-center">
                            <button
                                onClick={() => window.location.reload()}
                                className="text-xs text-blue-600 hover:text-blue-700"
                            >
                                Refresh to load profile
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default LeftSidebar;