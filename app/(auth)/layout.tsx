export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="bg-gradient-brand relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      {/* Decorative blurred gradient orbs */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute left-[-10%] top-[-20%] h-[70%] w-[70%] rounded-full bg-linear-to-br from-primary-fixed to-transparent opacity-50 blur-[100px]" />
        <div className="absolute right-[-10%] bottom-0 h-[60%] w-[60%] rounded-full bg-linear-to-tl from-secondary-fixed to-transparent opacity-50 blur-[80px]" />
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="shadow-soft rounded-xl-custom border border-surface-variant bg-surface p-8 sm:p-10">
          {children}
        </div>
      </div>
    </div>
  );
}
