"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";

interface HeaderProps {
  userEmail: string;
  userName?: string | null;
  userImage?: string | null;
}

export default function Header({ userEmail, userName, userImage }: HeaderProps) {
  const handleSignOut = () => {
    signOut({ callbackUrl: "/login" });
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Brand */}
          <Link href="/dashboard" className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-slate-800 to-slate-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <span className="text-lg font-semibold text-gray-900">
              Meld Report Generator
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/dashboard"
              className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium"
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard/new"
              className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium"
            >
              New Report
            </Link>
            <Link
              href="/dashboard/settings"
              className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium"
            >
              Settings
            </Link>
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              {userImage ? (
                <Image
                  src={userImage}
                  alt={userName || "User"}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              ) : (
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-gray-600 text-sm font-medium">
                    {(userName || userEmail)?.[0]?.toUpperCase() || "U"}
                  </span>
                </div>
              )}
              <span className="hidden sm:block text-sm text-gray-700">
                {userName || userEmail}
              </span>
            </div>
            <button
              onClick={handleSignOut}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors font-medium px-3 py-1.5 rounded-md hover:bg-gray-100"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

