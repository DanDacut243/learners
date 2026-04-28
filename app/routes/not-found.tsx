export function meta() {
  return [{ title: "ERUDITE - Page Not Found" }];
}

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-container-lowest">
      <div className="text-center max-w-md px-8">
        <div className="text-8xl font-black text-primary/10 mb-4">404</div>
        <h1 className="text-3xl font-extrabold text-primary tracking-tight mb-4">Page Not Found</h1>
        <p className="text-slate-500 font-medium mb-8">The page you're looking for doesn't exist or has been moved.</p>
        <div className="flex justify-center gap-4">
          <a href="/" className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors cursor-pointer">Go Home</a>
          <a href="/login" className="bg-surface-container-high text-primary px-6 py-3 rounded-xl font-bold hover:bg-surface-container-highest transition-colors cursor-pointer">Sign In</a>
        </div>
      </div>
    </div>
  );
}
