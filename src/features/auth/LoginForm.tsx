import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleExclamationPoint, Eye, EyeOff } from "lucide-react";
import { toApiError } from "@/shared/api/errors";
import { Button } from "@/shared/components/Button";
import { Field } from "@/shared/components/Field";
import { Input } from "@/shared/components/ui/input";
import { useAuth } from "./auth-context";
import { loginSchema, type LoginValues } from "./schemas";

function loginErrorMessage(error: unknown): string {
  const e = toApiError(error);
  if (e.status === 401 || e.status === 400)
    return "Email or password is incorrect.";
  if (e.status === 429) return "Too many attempts. Try again in a minute.";
  if (e.isNetwork)
    return "Can't reach the server. Check your connection and try again.";
  return "Something went wrong. Please try again.";
}

export function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const { login } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await login(values);
      onSuccess();
    } catch (error) {
      setFormError(loginErrorMessage(error));
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <Field label="Email" error={errors.email?.message} className="gap-1">
        {(control) => (
          <div className="relative">
            <Input
              variant="line"
              type="email"
              autoComplete="username"
              inputMode="email"
              autoCapitalize="none"
              spellCheck={false}
              {...control}
              {...register("email")}
            />
          </div>
        )}
      </Field>

      <Field
        label="Password"
        error={errors.password?.message}
        className="gap-1"
      >
        {(control) => (
          <div className="relative">
            <Input
              variant="line"
              className="pr-10"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              {...control}
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute cursor-pointer top-1/2 -right-2 flex size-10 -translate-y-1/2 items-center justify-center rounded-control text-muted transition-colors duration-150 hover:text-ink"
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
            >
              {showPassword ? (
                <EyeOff size={18} aria-hidden="true" />
              ) : (
                <Eye size={18} aria-hidden="true" />
              )}
            </button>
          </div>
        )}
      </Field>

      {formError && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-control bg-danger-soft px-3 py-2.5 text-sm text-danger"
        >
          <CircleExclamationPoint
            size={16}
            aria-hidden="true"
            className="mt-0.5 shrink-0"
          />
          <span>{formError}</span>
        </div>
      )}

      <Button
        type="submit"
        variant="primary"
        block
        loading={isSubmitting}
        loadingLabel="Logging in"
        className="mt-2 pointer-fine:h-10"
      >
        Log in
      </Button>
    </form>
  );
}
