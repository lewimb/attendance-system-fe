import { useLocation, useNavigate, type Location } from "react-router";
import { LoginForm } from "@/features/auth";

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: Location } | null)?.from;
  const target =
    from && from.pathname !== "/login"
      ? `${from.pathname}${from.search}`
      : "/today";

  return (
    <div className="glass w-full max-w-95 rounded-card px-6 pt-8 pb-7 sm:px-8">
      <LoginForm onSuccess={() => navigate(target, { replace: true })} />

      <p className="pt-6 text-center text-label text-muted">
        Your HR team creates every account.
      </p>
    </div>
  );
}
