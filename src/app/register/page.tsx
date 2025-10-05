"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Film, Loader2, Mail, Lock, User, Chrome } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { authClient, useSession } from "@/lib/auth-client";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, isPending } = useSession();

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const redirect = searchParams.get("redirect") || "/";

  useEffect(() => {
    if (!isPending && session?.user) {
      router.push(redirect);
    }
  }, [session, isPending, router, redirect]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await authClient.signUp.email({
        email: formData.email,
        name: formData.name,
        password: formData.password
      });

      if (error?.code) {
        const errorMap: Record<string, string> = {
          USER_ALREADY_EXISTS: "An account with this email already exists. Please login instead."
        };
        toast.error(errorMap[error.code] || "Registration failed. Please try again.");
        setLoading(false);
        return;
      }

      toast.success("Account created successfully! Redirecting to login...");
      router.push(`/login?registered=true${redirect !== "/" ? `&redirect=${encodeURIComponent(redirect)}` : ""}`);
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const { data, error } = await authClient.signIn.social({
        provider: "google",
        callbackURL: redirect
      });

      if (error?.code) {
        toast.error("Google sign-in failed. Please try again.");
        setGoogleLoading(false);
        return;
      }
    } catch (error) {
      console.error("Google sign-in error:", error);
      toast.error("Google sign-in failed. Please try again.");
      setGoogleLoading(false);
    }
  };

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background dark">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>);

  }

  if (session?.user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background dark">
      {/* Gradient Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-background via-background to-primary/5 pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent pointer-events-none" />

      <div className="relative min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 text-2xl font-bold mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
                <Film className="w-8 h-8 text-primary relative" />
              </div>
              <span className="bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                MovieHub
              </span>
            </Link>
            <h1 className="text-3xl font-bold tracking-tight mt-4 !text-blue-800 !block">Create Account</h1>
            <p className="text-muted-foreground mt-2">Sign up to start reviewing movies</p>
          </div>

          {/* Register Card */}
          <div className="bg-card border border-border/50 rounded-xl p-8 space-y-6">
            {/* Google Sign In */}
            <Button
              type="button"
              variant="outline"
              className="w-full h-12 border-border/50 hover:border-primary/50 hover:bg-primary/5 !text-slate-200"
              onClick={handleGoogleSignIn}
              disabled={googleLoading}>

              {googleLoading ?
              <Loader2 className="w-5 h-5 animate-spin" /> :

              <>
                  <Chrome className="w-5 h-5 mr-2" />
                  Continue with Google
                </>
              }
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-card text-muted-foreground">Or register with email</span>
              </div>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium !text-slate-600">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="pl-10 bg-background border-border/50 md:!text-slate-50"
                    required
                    autoComplete="name" />

                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium !text-slate-600">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-10 bg-background border-border/50 md:!text-slate-50"
                    required
                    autoComplete="email" />

                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium !text-slate-600">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pl-10 bg-background border-border/50 md:!text-slate-50"
                    required
                    autoComplete="off"
                    minLength={8} />

                </div>
                <p className="text-xs text-muted-foreground">Must be at least 8 characters</p>
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium !text-slate-600">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="pl-10 bg-background border-border/50 md:!text-slate-50"
                    required
                    autoComplete="off" />

                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={loading}>

                {loading ?
                <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Creating account...
                  </> :

                "Create Account"
                }
              </Button>
            </form>

            {/* Sign In Link */}
            <div className="text-center pt-4 border-t border-border/50">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                  href={`/login${redirect !== "/" ? `?redirect=${encodeURIComponent(redirect)}` : ""}`}
                  className="text-primary hover:underline font-medium">

                  Sign in
                </Link>
              </p>
            </div>
          </div>

          {/* Back to Home */}
          <div className="text-center mt-6">
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>);

}