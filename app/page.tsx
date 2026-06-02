import MotionSmoke from "@/components/motion-smoke";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-4xl font-bold tracking-tight text-gray-900">
        Mockable
      </h1>
      <p className="text-lg text-gray-600">
        AI-powered voice mock interviews — coming soon.
      </p>
      <MotionSmoke />
    </main>
  );
}
