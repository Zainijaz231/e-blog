import { useState } from "react";
import axios from "../api/axios";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/authSore";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const CreatePost = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content: "",
  });

  const [loading, setLoading] = useState(false);

  // ✅ Max limits
  const maxTitle = 150;
  const maxDescription = 500;
  const maxContent = 20000;

  const handleChange = (e) => {
    const { name, value } = e.target;

    // limit based on field
    if (name === "title" && value.length > maxTitle) {
      toast.error("Title too long! Max " + maxTitle + " characters allowed.");
      return;
    }
    if (name === "description" && value.length > maxDescription) {
      toast.error(
        "Description too long! Max " + maxDescription + " characters allowed."
      );
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleContentChange = (value) => {
    const plainText = value.replace(/<[^>]*>/g, "");
    if (plainText.length > maxContent) {
      toast.error("Content too long! Max " + maxContent + " characters allowed.");
      return;
    }
    setFormData((prev) => ({ ...prev, content: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { title, description, content } = formData;

    const plainText = content.replace(/<[^>]*>/g, "");

    if (!title.trim()) return toast.error("Title is required.");
    if (!content.trim()) return toast.error("Content is required.");
    if (plainText.length > maxContent)
      return toast.error(`Content exceeds ${maxContent} characters.`);

    try {
      setLoading(true);
      await axios.post(
        "/posts",
        { title, description, content },
        { headers: { Authorization: `Bearer ${user?.token}` } }
      );
      toast.success("Post created successfully!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error(
        error.response?.data?.message ||
          "Error creating post. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-semibold mb-8 text-gray-900 dark:text-white">
        Create New Post
      </h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter your post title..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 outline-none text-lg"
            required
          />
          <p
            className={`text-sm mt-1 text-right ${
              formData.title.length >= maxTitle - 10
                ? "text-red-500"
                : "text-gray-500"
            }`}
          >
            {formData.title.length}/{maxTitle}
          </p>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <input
            type="text"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Brief description of your post..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 outline-none"
          />
          <p
            className={`text-sm mt-1 text-right ${
              formData.description.length >= maxDescription - 20
                ? "text-red-500"
                : "text-gray-500"
            }`}
          >
            {formData.description.length}/{maxDescription}
          </p>
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Content *
          </label>
          <ReactQuill
            theme="snow"
            value={formData.content}
            onChange={handleContentChange}
            className="bg-white rounded-lg"
            placeholder="Write your blog content here..."
          />
          <p
            className={`text-sm mt-2 text-right ${
              formData.content.replace(/<[^>]*>/g, "").length >= maxContent - 100
                ? "text-red-500"
                : "text-gray-500"
            }`}
          >
            {formData.content.replace(/<[^>]*>/g, "").length}/{maxContent} characters
          </p>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-blue-600 text-white py-3 px-6 rounded-lg text-lg font-medium hover:bg-blue-700 transition duration-200 ${
              loading && "opacity-70 cursor-not-allowed"
            }`}
          >
            {loading ? "Creating..." : "Publish Post"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;
