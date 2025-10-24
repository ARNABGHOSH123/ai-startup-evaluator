import { GoogleLogin } from "@react-oauth/google";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { jwtDecode } from "jwt-decode";

type LoginModalProps = {
  isOpen: boolean;
  onChange: (open: boolean) => void;
  showForgotPassword: boolean;
  setShowForgotPassword: (value: boolean) => void;
  selectedRole: string | null;
  setSignUpDialogOpen: (value: boolean) => void;
  setRoleDialogOpen: (value: boolean) => void;
  setUser: (user: any) => void;
};

export default function LoginModal({
  isOpen,
  onChange,
  showForgotPassword,
  setShowForgotPassword,
  selectedRole,
  setSignUpDialogOpen,
  setRoleDialogOpen,
  setUser,
}: LoginModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onChange}>
      <DialogContent className="sm:max-w-md rounded-xl">
        <DialogHeader>
          <DialogTitle>{selectedRole || "Login"}</DialogTitle>
          <DialogDescription>
            {showForgotPassword
              ? "Reset your password by entering your registered email address."
              : "Sign in using your email and password, or continue with Google."}
          </DialogDescription>
        </DialogHeader>

        {!showForgotPassword ? (
          <>
            {/* Email + Password Login */}
            <form
              className="flex flex-col gap-3 mt-4"
              onSubmit={(e) => {
                e.preventDefault();
                const email = (
                  e.currentTarget.elements.namedItem(
                    "email"
                  ) as HTMLInputElement
                ).value;
                const password = (
                  e.currentTarget.elements.namedItem(
                    "password"
                  ) as HTMLInputElement
                ).value;
                console.log("Logging in with:", {
                  role: selectedRole,
                  email,
                  password,
                });

                // Fake API logic:
                const accountExists = false; // TODO: Replace with actual API call to check

                if (!accountExists) {
                  alert("Account not found. Please create one.");
                  setRoleDialogOpen(false);
                  setSignUpDialogOpen(true);
                  return;
                }

                // ✅ Successful login:
                setUser({
                  email,
                  role: selectedRole,
                  password,
                });

                setRoleDialogOpen(false);
              }}
            >
              <input
                type="email"
                name="email"
                required
                placeholder="Email address"
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="password"
                name="password"
                required
                placeholder="Password"
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <div className="flex justify-between items-center text-xs">
                <button
                  type="button"
                  className="text-blue-600 hover:underline"
                  onClick={() => setShowForgotPassword(true)}
                >
                  Forgot password?
                </button>

                {/* ✅ Switch to Sign Up */}
                <button
                  type="button"
                  className="text-blue-600 hover:underline"
                  onClick={() => {
                    setRoleDialogOpen(false);
                    setSignUpDialogOpen(true);
                  }}
                >
                  Create account
                </button>
              </div>

              <Button
                type="submit"
                size="sm"
                className="w-full bg-blue-600 text-white hover:bg-blue-700 mt-2"
              >
                Sign In
              </Button>
            </form>

            {/* Divider */}
            <div className="flex items-center my-3">
              <div className="flex-grow h-px bg-gray-200" />
              <span className="px-2 text-xs text-gray-400 uppercase">or</span>
              <div className="flex-grow h-px bg-gray-200" />
            </div>

            {/* Google Login */}
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={(credentialResponse) => {
                  const decoded = jwtDecode(credentialResponse.credential!);
                  console.log("Google Login Success:", decoded);
                  setRoleDialogOpen(false);
                }}
                onError={() => console.log("Google Login Failed")}
              />
            </div>
          </>
        ) : (
          /* Forgot Password View */
          <form
            className="flex flex-col gap-3 mt-4"
            onSubmit={(e) => {
              e.preventDefault();
              const email = (
                e.currentTarget.elements.namedItem(
                  "resetEmail"
                ) as HTMLInputElement
              ).value;
              console.log("Sending reset link to:", email);
              // TODO: call password reset API
              alert(`Password reset link sent to ${email}`);
              setShowForgotPassword(false);
            }}
          >
            <input
              type="email"
              name="resetEmail"
              required
              placeholder="Registered email address"
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <Button
              type="submit"
              size="sm"
              className="w-full bg-blue-600 text-white hover:bg-blue-700"
            >
              Send Reset Link
            </Button>

            <button
              type="button"
              className="text-xs text-gray-600 hover:underline mt-1"
              onClick={() => setShowForgotPassword(false)}
            >
              Back to Login
            </button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
