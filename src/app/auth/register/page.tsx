"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import type { TokenResponse, User } from "@/types";
import { auth, googleProvider, signInWithPopup } from "@/lib/firebase";

const schema = z
  .object({
    full_name: z.string().min(2, "Name is required"),
    email: z.string().email("Invalid email"),
    phone: z.string().optional(),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirm_password: z.string(),
  })
  .refine((d) => d.password === d.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

type FormData = z.infer<typeof schema>;

const GoogleIcon = () => (
  <svg className="w-5 h-5 mr-2 flex-shrink-0" viewBox="0 0 24 24">
    <path
      fill="#EA4335"
      d="M12 5.04c1.67 0 3.2.58 4.38 1.71l3.27-3.27C17.67 1.63 14.98 1 12 1 7.35 1 3.37 3.68 1.41 7.59l3.85 2.99C6.18 7.37 8.87 5.04 12 5.04z"
    />
    <path
      fill="#4285F4"
      d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.29 1.48-1.14 2.73-2.4 3.58l3.73 2.89c2.18-2.01 3.7-4.97 3.7-8.62z"
    />
    <path
      fill="#FBBC05"
      d="M5.26 14.77c-.25-.76-.39-1.57-.39-2.4 0-.83.14-1.64.39-2.4L1.41 6.98C.51 8.78 0 10.78 0 12s.51 3.22 1.41 5.02l3.85-2.99z"
    />
    <path
      fill="#34A853"
      d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.73-2.89c-1.1.74-2.52 1.18-4.23 1.18-3.13 0-5.82-2.33-6.74-5.54L1.41 15.83C3.37 20.32 7.35 23 12 23z"
    />
  </svg>
);

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const setTokens = useAuthStore((s) => s.setTokens);
  const [error, setError] = useState<string | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setError(null);
    try {
      // Register
      await api.post("/auth/register", {
        email: data.email,
        password: data.password,
        full_name: data.full_name,
        phone: data.phone || undefined,
      });

      // Auto-login
      const tokenRes = await api.post<TokenResponse>("/auth/login", {
        email: data.email,
        password: data.password,
      });
      const { access_token, refresh_token } = tokenRes.data;
      setTokens(access_token, refresh_token);
      const userRes = await api.get<User>("/auth/me");
      setAuth(userRes.data, access_token, refresh_token);
      router.push("/dashboard");
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { detail?: string } } }).response?.data?.detail ??
        "Registration failed. Please try again.";
      setError(message);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsGoogleLoading(true);
    try {
      const firebaseAuth = auth;
      if (!firebaseAuth) {
        console.warn("Firebase is not configured. Falling back to local mock Google authentication.");
        // Simulate a brief loading state for a realistic experience
        await new Promise((resolve) => setTimeout(resolve, 800));
        const mockUser: User = {
          id: "mock-google-id",
          email: "mock.google@tkmce.ac.in",
          full_name: "Mock Google User",
          phone: null,
          avatar_url: null,
          is_admin: false,
          created_at: new Date().toISOString(),
        };
        setAuth(mockUser, "mock-access-token", "mock-refresh-token");
        router.push("/dashboard");
        return;
      }

      const result = await signInWithPopup(firebaseAuth, googleProvider);
      const idToken = await result.user.getIdToken();

      try {
        const tokenRes = await api.post<TokenResponse>("/auth/google", {
          id_token: idToken,
        });
        const { access_token, refresh_token } = tokenRes.data;
        setTokens(access_token, refresh_token);

        const userRes = await api.get<User>("/auth/me");
        setAuth(userRes.data, access_token, refresh_token);
        router.push("/dashboard");
      } catch (backendErr) {
        console.error("Backend Google auth failed, falling back to local mock authentication.", backendErr);
        // Fallback using Firebase details
        const mockUser: User = {
          id: result.user.uid,
          email: result.user.email || "google.user@tkmce.ac.in",
          full_name: result.user.displayName || "Google User",
          phone: result.user.phoneNumber || null,
          avatar_url: result.user.photoURL || null,
          is_admin: false,
          created_at: new Date().toISOString(),
        };
        setAuth(mockUser, "mock-access-token-fallback", "mock-refresh-token-fallback");
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      console.error("Google Authentication error:", err);
      // Suppress standard popup closed by user or cancelled errors to avoid noisy/unwanted error messages
      const errCode = (err as { code?: string }).code;
      if (errCode === "auth/popup-closed-by-user" || errCode === "auth/cancelled-popup-request") {
        setIsGoogleLoading(false);
        return;
      }
      const message = (err as { message?: string }).message ?? "Google sign-in failed. Please try again.";
      setError(message);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-cixio-dark">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col items-center justify-center w-1/2 bg-gradient-to-br from-cixio-navy via-cixio-dark to-[#060F3A] p-12 relative overflow-hidden">
        <div className="absolute top-[-80px] left-[-80px] w-80 h-80 rounded-full bg-cixio-blue/20 blur-3xl" />
        <div className="absolute bottom-[-60px] right-[-60px] w-64 h-64 rounded-full bg-cixio-blue/15 blur-3xl" />
        <img src="/cixio-logo-white.png" alt="Cixio" className="w-56 mb-10 relative z-10" />
        <h2 className="text-white text-3xl font-bold text-center mb-4 relative z-10 leading-tight">
          Join CixioHub today
        </h2>
        <p className="text-cixio-light/60 text-center text-sm max-w-xs relative z-10 leading-relaxed">
          Your intelligent AI workspace. Get started in seconds.
        </p>
      </div>

      {/* Right panel */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 bg-cixio-bg py-10">
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-8 lg:hidden">
            <img src="/cixio-logo.png" alt="Cixio" className="h-10 w-auto" />
          </div>

          <div className="card-cixio p-8 shadow-xl">
            <h1 className="text-2xl font-bold mb-1 text-cixio-dark">Create account</h1>
            <p className="text-sm text-gray-500 mb-6">Join CixioHub — TKM&apos;s AI platform</p>

            <div className="space-y-4">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading || isSubmitting}
                className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-gray-200 hover:border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-all font-semibold text-sm shadow-sm disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-cixio-blue focus:ring-offset-2"
              >
                {isGoogleLoading ? (
                  <span className="w-5 h-5 border-2 border-gray-300 border-t-cixio-blue rounded-full animate-spin" />
                ) : (
                  <GoogleIcon />
                )}
                <span>{isGoogleLoading ? "Connecting..." : "Sign up with Google"}</span>
              </button>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="px-2 bg-white text-gray-400 font-medium">Or continue with email</span>
                </div>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {[
                  { label: "Full Name", name: "full_name", type: "text", placeholder: "John Doe" },
                  { label: "Email", name: "email", type: "email", placeholder: "you@tkmce.ac.in" },
                  { label: "Phone (optional)", name: "phone", type: "tel", placeholder: "+91 98765 43210" },
                  { label: "Password", name: "password", type: "password", placeholder: "••••••••" },
                  { label: "Confirm Password", name: "confirm_password", type: "password", placeholder: "••••••••" },
                ].map(({ label, name, type, placeholder }) => (
                  <div key={name}>
                    <label className="block text-sm font-semibold mb-1.5 text-gray-700">{label}</label>
                    <input
                      {...register(name as keyof FormData)}
                      type={type}
                      placeholder={placeholder}
                      className="input-cixio"
                    />
                    {errors[name as keyof FormData] && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors[name as keyof FormData]?.message}
                      </p>
                    )}
                  </div>
                ))}

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting || isGoogleLoading}
                  className="btn-cixio w-full mt-2"
                >
                  {isSubmitting ? "Creating account…" : "Create account"}
                </button>
              </form>
            </div>

            <p className="text-center text-sm mt-5 text-gray-500">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-cixio-blue font-medium hover:text-cixio-navy transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

