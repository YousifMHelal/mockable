import { requireAuth } from "@/lib/auth/guards";
import { SignOutButton } from "@/components/auth/sign-out-button";

export default async function DashboardPage() {
  const session = await requireAuth();

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary">Welcome, {session.user.name}!</h1>
            <p className="text-gray-600 mt-1">Your interview practice dashboard</p>
          </div>
          <SignOutButton />
        </div>

        <div className="bg-white rounded-lg-custom shadow-soft p-8 border border-gray-200">
          <p className="text-gray-700">
            This is your dashboard placeholder. Phase 6 will build out your interview history,
            stats, and controls here.
          </p>
        </div>
      </div>
    </div>
  );
}
