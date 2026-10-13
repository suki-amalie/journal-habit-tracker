
import { Link } from "react-router-dom";

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}

function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: AuthLayoutProps) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#faf8f3] p-6">
      <section className="w-full max-w-sm">
        {/* Brand */}
        <header className="mb-8 text-center">
          <Link to="/" className="font-serif text-3xl text-[#343c32]">
            hibi
          </Link>
          <p className="mt-2 text-sm text-[#77796f]">
            A little space to return to yourself.
          </p>
        </header>

        {/* Page heading */}
        <div className="mb-6">
          <h1 className="font-serif text-2xl text-[#343c32]">
            {title}
          </h1>
          <p className="mt-2 text-sm text-[#77796f]">
            {subtitle}
          </p>
        </div>

        {/* Form supplied by Login or Register */}
        {children}

        {/* Link to the other auth page */}
        <div className="mt-6 text-center text-sm text-[#77796f]">
          {footer}
        </div>
      </section>
    </main>
  );
}

export default AuthLayout;
