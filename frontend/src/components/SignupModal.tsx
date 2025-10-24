import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

type SignupModalProps = {
  isOpen: boolean;
  onChange: (open: boolean) => void;
  setUser: (user: any) => void;
  setRoleDialogOpen: (value: boolean) => void;
  setSelectedRole: (role: string | null) => void;
  setSignUpDialogOpen: (value: boolean) => void;
};

export default function SignupModal({
  isOpen,
  onChange,
  setUser,
  setRoleDialogOpen,
  setSelectedRole,
  setSignUpDialogOpen,
}: SignupModalProps) {
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

            console.log("Signing up:", {
              firstName,
              lastName,
              email,
              password,
              role,
            });

            // ✅ Update user state after signup (or after API call)
            setUser({ firstName, lastName, email, role });

            // TODO: Replace with your real signup API call
            setSignUpDialogOpen(false);
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
            className="w-full bg-blue-600 text-white hover:bg-blue-700 mt-2"
          >
            Sign Up
          </Button>
        </form>

        {/* ✅ "Already have an account?" link */}
        <div className="text-center mt-3 text-sm text-gray-600">
          Already have an account?{" "}
          <button
            type="button"
            className="text-blue-600 hover:underline"
            onClick={() => {
              // Close Sign Up dialog
              setSignUpDialogOpen(false);
              // Open existing Login dialog
              setRoleDialogOpen(true);
              // Optionally set a default login role
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
