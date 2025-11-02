import { useState } from "react";
import { useNavigate } from "react-router-dom";
// import { GoogleLogin } from "@react-oauth/google";
// import { jwtDecode } from "jwt-decode";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

type LoginModalProps = {
  isOpen: boolean;
  onChange: (open: boolean) => void;
  showForgotPassword: boolean;
  setShowForgotPassword: (value: boolean) => void;
  selectedRole: string | null;
  setSignUpDialogOpen: (value: boolean) => void;
  setRoleDialogOpen: (value: boolean) => void;
};

export default function LoginModal({
  isOpen,
  onChange,
  showForgotPassword,
  setShowForgotPassword,
  selectedRole,
  setSignUpDialogOpen,
  setRoleDialogOpen,
}: LoginModalProps) {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignin = async (formData: any) => {
    const { email, password, selectedRole } = formData;

    try {
      setLoading(true);
      let endpoint = "";
      if (selectedRole === "Pitch as Founder") {
        endpoint = `${
          import.meta.env.VITE_CLOUD_RUN_SERVICE_URL
        }/sign_in_founder_account`;
      } else if (selectedRole === "Fund as Investor") {
        endpoint = `${
          import.meta.env.VITE_CLOUD_RUN_SERVICE_URL
        }/sign_in_investor_account`;
      } else {
        alert("Please select a valid role");
        return;
      }

      // Send POST request using fetch
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body:
          selectedRole === "Pitch as Founder"
            ? JSON.stringify({
                founder_email: email,
                founder_account_pwd: password,
              })
            : JSON.stringify({
                investor_email: email,
                investor_account_pwd: password,
              }),
      });

      if (!response.ok) {
        const errorData = await response.json();

        // Gracefully handle different FastAPI error formats
        let errorMessage = "Failed to Login";

        if (typeof errorData.detail === "string") {
          errorMessage = errorData.detail;
        } else if (Array.isArray(errorData.detail)) {
          errorMessage = errorData.detail
            .map((d: any) => d.msg || JSON.stringify(d))
            .join(", ");
        } else if (typeof errorData === "object") {
          errorMessage = JSON.stringify(errorData);
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();

      alert("Logged in successfully!");
      setSignUpDialogOpen(false);

      if (selectedRole === "Pitch as Founder") {
        localStorage.setItem(
          "user",
          JSON.stringify({
            founderId: data?.founder_id,
            founderName: data?.founder_name,
            companyDocId: data?.company_doc_id,
          })
        );
        navigate(`/founder/${data?.founder_id}`);
      } else {
        localStorage.setItem(
          "user",
          JSON.stringify({
            investorId: data?.investor_id,
            investorName: data?.investor_name,
          })
        );
        navigate(`/investor/${data?.investor_id}`);
      }
    } catch (error: any) {
      alert(`Login failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

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
                //     const firstName = (
                //   e.currentTarget.elements.namedItem("firstName") as HTMLInputElement
                // ).value;
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
                //     const role = (
                //   e.currentTarget.elements.namedItem("role") as HTMLSelectElement
                // ).value;

                // Fake API logic:
                // const accountExists = false; // TODO: Replace with actual API call to check
                handleSignin({ email, password, selectedRole });

                // if (!accountExists) {
                //   alert("Account not found. Please create one.");
                //   setRoleDialogOpen(false);
                //   setSignUpDialogOpen(true);
                //   return;
                // }

                // // ✅ Successful login:
                // setUser({
                //   email,
                //   role: selectedRole,
                //   password,
                // });

                // setRoleDialogOpen(false);
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
                disabled={loading}
                className="w-full bg-blue-600 text-white hover:bg-blue-700 mt-2"
              >
                Sign In
              </Button>
            </form>

            {/* Divider */}
            {/* <div className="flex items-center my-3">
              <div className="flex-grow h-px bg-gray-200" />
              <span className="px-2 text-xs text-gray-400 uppercase">or</span>
              <div className="flex-grow h-px bg-gray-200" />
            </div> */}

            {/* Google Login
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={(credentialResponse) => {
                  const decoded = jwtDecode(credentialResponse.credential!);
                  setRoleDialogOpen(false);
                }}
              />
            </div> */}
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
