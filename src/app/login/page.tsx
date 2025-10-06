"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Film, Loader2, Mail, Lock, Chrome } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { authClient, useSession } from "@/lib/auth-client";
import { toast } from "sonner";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, isPending } = useSession();

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false
  });

  const redirect = searchParams.get("redirect") || "/";
  const registered = searchParams.get("registered");

  useEffect(() => {
    if (registered === "true") {
      toast.success("Account created! Please login with your credentials.");
    }
  }, [registered]);

  useEffect(() => {
    if (!isPending && session?.user) {
      router.push(redirect);
    }
  }, [session, isPending, router, redirect]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await authClient.signIn.email({
        email: formData.email,
        password: formData.password,
        rememberMe: formData.rememberMe,
        callbackURL: redirect
      });

      if (error?.code) {
        toast.error("Invalid email or password. Please make sure you have already registered an account and try again.");
        setLoading(false);
        return;
      }

      toast.success("Login successful!");
      router.push(redirect);
    } catch (error) {
      console.error("Login error:", error);
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
            <h1 className="text-3xl font-bold tracking-tight mt-4">Welcome Back</h1>
            <p className="text-muted-foreground mt-2">Sign in to your account to continue</p>
          </div>

          {/* Login Card */}
          <div className="bg-card border border-border/50 rounded-xl p-8 space-y-6">
            {/* Google Sign In */}
            <Button
              type="button"
              variant="outline"
              className="w-full h-12 border-border/50 hover:border-primary/50 hover:bg-primary/5 !text-white"
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
                <span className="px-4 bg-card text-muted-foreground">Or continue with email</span>
              </div>
            </div>

            {/* Email/Password Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
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
                    className="pl-10 bg-background border-border/50 md:!text-white"
                    required
                    autoComplete="email" />

                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
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
                    className="pl-10 bg-background border-border/50 md:!text-white"
                    required
                    autoComplete="off" />

                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="remember"
                    checked={formData.rememberMe}
                    onCheckedChange={(checked) =>
                    setFormData({ ...formData, rememberMe: checked as boolean })
                    } />

                  <label
                    htmlFor="remember"
                    className="text-sm text-muted-foreground cursor-pointer">

                    Remember me
                  </label>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={loading}>

                {loading ?
                <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Signing in...
                  </> :

                "Sign In"
                }
              </Button>
            </form>

            {/* Sign Up Link */}
            <div className="text-center pt-4 border-t border-border/50">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link
                  href={`/register${redirect !== "/" ? `?redirect=${encodeURIComponent(redirect)}` : ""}`}
                  className="text-primary hover:underline font-medium">

                  Create account
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

export default function LoginPage() {
  return (
    <Suspense
      fallback={
      <div className="min-h-screen flex items-center justify-center bg-background dark">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }>

      <LoginForm />
    </Suspense>);

}