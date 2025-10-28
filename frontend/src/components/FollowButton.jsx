import { useState, useEffect } from "react";
import api from "../api/axios";
import { useQueryClient } from "@tanstack/react-query";

const FollowButton = ({ username, currentUser, isFollowing: initialFollow }) => {
    const [isFollowing, setIsFollowing] = useState(false);
    const [loading, setLoading] = useState(false);
    const queryClient = useQueryClient();

    useEffect(() => {
        setIsFollowing(initialFollow);
    }, [initialFollow]);



    const handleFollowToggle = async () => {
        try {
            setLoading(true);
            await api.post(`/auth/profile/${username}/follow`);
            setIsFollowing(prev => !prev);
            queryClient.invalidateQueries(['profile', username])
        } catch (error) {
            console.error("Follow/Unfollow error:", error);
        } finally {
            setLoading(false);
        }
    };

    const getButtonText = () => {
        if (loading) return isFollowing ? "Unfollowing..." : "Following...";
        return isFollowing ? "Unfollow" : "Follow";
    };

    return (
        <button
            onClick={handleFollowToggle}
            disabled={loading}
            className={`px-4 py-2 rounded-full font-semibold ${isFollowing
                ? "bg-gray-200 text-black hover:bg-gray-300"
                : "bg-blue-600 text-white hover:bg-blue-700"
                } transition duration-200`}
        >
            {getButtonText()}
        </button>
    );
};

export default FollowButton;
