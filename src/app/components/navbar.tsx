"use client";

import { createAuthStore } from "@/ZustandStore/Auth";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const navbar = () => {
  const links = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
  ];
  const { session, logout } = createAuthStore();
  const pathname = usePathname();

  return (
    <div className="fixed top-1/2 left-4 -translate-y-1/2 w-16 md:w-20 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-xl z-50 p-3 flex flex-col items-center gap-4">
      <nav className="flex flex-col items-center gap-4">
        {links.map((link, index) => (
          <Link
            key={index}
            href={link.href}
            className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-xl text-white text-sm hover:bg-white/20 transition-all ${
              pathname === link.href ? "bg-white/20" : ""
            }`}
          >
            {link.name[0]}
          </Link>
        ))}
      </nav>

      <div className="border-t border-white/20 w-full pt-3 flex flex-col items-center gap-3">
        {session ? (
          <button
            onClick={logout}
            title="Logout"
            className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-xl bg-red-500/70 text-white hover:bg-red-500 transition-all"
          >
            ⎋
          </button>
        ) : (
          <>
            <Link
              href="/login"
              title="Login"
              className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-xl text-white hover:bg-white/20 transition-all"
            >
              🔐
            </Link>
            <Link
              href="/register"
              title="Register"
              className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-xl text-white hover:bg-white/20 transition-all"
            >
              📝
            </Link>
          </>
        )}
      </div>
    </div>
  );
};
