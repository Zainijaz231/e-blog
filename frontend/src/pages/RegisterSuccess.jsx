import { useEffect } from "react";

export default function RegisterSuccess() {
  useEffect(() => {
    console.log("✅ RegisterSuccess page loaded!");
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-green-600">
          User Successfully Registered 🎉
        </h1>
        <p className="mt-2">You can now login to your account.</p>
        <a
          href="/login"
          className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Go to Login
        </a>
      </div>
    </div>
  );
}
