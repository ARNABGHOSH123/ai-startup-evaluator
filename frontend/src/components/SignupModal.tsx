import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { useState } from "react";

type SignupModalProps = {
  isOpen: boolean;
  onChange: (open: boolean) => void;
  setRoleDialogOpen: (value: boolean) => void;
  setSelectedRole: (role: string | null) => void;
  setSignUpDialogOpen: (value: boolean) => void;
};

export default function SignupModal({
  isOpen,
  onChange,
  setRoleDialogOpen,
  setSelectedRole,
  setSignUpDialogOpen,
}: SignupModalProps) {
  const [loading, setLoading] = useState(false);

  const handleSignup = async (formData: any) => {
    const { firstName, email, password, role } = formData;

    try {
      setLoading(true);
      let endpoint = "";
      if (role === "Founder") {
        endpoint = `${
          import.meta.env.VITE_CLOUD_RUN_SERVICE_URL
        }/create_founder_account`;
      } else if (role === "Investor") {
        endpoint = `${
          import.meta.env.VITE_CLOUD_RUN_SERVICE_URL
        }/create_investor_account`;
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
          role === "Founder"
            ? JSON.stringify({
                founder_name: firstName,
                founder_email: email,
                founder_account_pwd: password,
              })
            : JSON.stringify({
                investor_name: firstName,
                investor_email: email,
                investor_account_pwd: password,
              }),
      });

      if (!response.ok) {
        const errorData = await response.json();

        // Gracefully handle different FastAPI error formats
        let errorMessage = "Failed to create account";

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

      alert("Account created successfully!");
      setSignUpDialogOpen(false);
    } catch (error: any) {
      alert(`Signup failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onChange}>
      <DialogContent className="sm:max-w-md rounded-xl">
        <DialogHeader>
          <DialogTitle>Sign Up</DialogTitle>
          <DialogDescription>
            Create your account to access the platform.
          </DialogDescription>
        </DialogHeader>

        <form
          className="flex flex-col gap-3 mt-4"
          onSubmit={(e) => {
            e.preventDefault();

            const firstName = (
              e.currentTarget.elements.namedItem(
                "firstName"
              ) as HTMLInputElement
            ).value;
            const lastName = (
              e.currentTarget.elements.namedItem("lastName") as HTMLInputElement
            ).value;
            const email = (
              e.currentTarget.elements.namedItem("email") as HTMLInputElement
            ).value;
            const password = (
              e.currentTarget.elements.namedItem("password") as HTMLInputElement
            ).value;
            const role = (
              e.currentTarget.elements.namedItem("role") as HTMLSelectElement
            ).value;

            handleSignup({ firstName, lastName, email, password, role });
          }}
        >
          <input
            type="text"
            name="firstName"
            required
            placeholder="First Name"
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            name="lastName"
            required
            placeholder="Last Name"
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
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

          <select
            name="role"
            required
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Role</option>
            <option value="Founder">Founder</option>
            <option value="Investor">Investor</option>
          </select>

          <Button
            type="submit"
            size="sm"
            disabled={loading}
            className="w-full bg-blue-600 text-white hover:bg-blue-700 mt-2"
          >
            {loading ? "Creating..." : "Sign Up"}
          </Button>
        </form>

        {/* ✅ Already have an account link */}
        <div className="text-center mt-3 text-sm text-gray-600">
          Already have an account?{" "}
          <button
            type="button"
            className="text-blue-600 hover:underline"
            onClick={() => {
              setSignUpDialogOpen(false);
              setRoleDialogOpen(true);
              setSelectedRole("Login");
            }}
          >
            Login
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
