'use client';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          {/* Logo */}
          <div className="relative w-10 h-10 rounded-lg gradient-blue-purple flex items-center justify-center">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          {/* Title */}
          <div>
            <h1 className="text-xl font-bold text-gradient-blue-purple">
              CodeFlow
            </h1>
            <p className="text-xs text-muted-foreground">研发协作可视化平台</p>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            实时同步
          </div>
        </div>
      </div>
    </header>
  );
}
