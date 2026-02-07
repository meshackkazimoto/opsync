"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginSchema } from "@/schemas/auth.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { login } from "@/services/auth-service";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { useRedirectIfAuthed } from "@/lib/auth/require-auth";
import { motion } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/";
  const { notify } = useToast();

  useRedirectIfAuthed();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginSchema>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values: LoginSchema) => {
    try {
      await login(values);
      notify({ title: "Welcome back", description: "Login successful", tone: "success" });
      router.replace(next);
    } catch (error) {
      notify({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Please try again",
        tone: "error",
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-6 py-12">
      <motion.div
        className="w-full max-w-md border border-border bg-surface p-8 shadow-soft"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.3em] text-muted">Opsync Admin</p>
          <h1 className="text-2xl font-semibold">Sign in to your workspace</h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input
            label="Email"
            type="email"
            placeholder="you@opsync.io"
            error={errors.email?.message}
            {...register("email")}
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register("password")}
          />
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Signing in" : "Sign in"}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
