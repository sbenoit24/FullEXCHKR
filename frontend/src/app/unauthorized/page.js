'use client'

import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 px-4">
      <div className="relative">
        {/* Glowing effect */}
        <div className="absolute inset-0 blur-3xl opacity-50">
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-purple-500 rounded-full animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        
        {/* Content */}
        <div className="relative flex flex-col items-center gap-6 text-center">
          <div className="text-7xl mb-2">🚫</div>
          <h1 className="text-7xl md:text-8xl font-bold bg-clip-text text-transparent bg-linear-to-r from-purple-400 via-pink-400 to-blue-400 animate-pulse">
            403
          </h1>
          <div className="flex flex-col gap-2">
            <p className="text-2xl md:text-3xl font-light text-gray-300">
              Access Denied
            </p>
            <p className="text-base text-gray-400 max-w-md">
              You don't have permission to view this page
            </p>
          </div>
          <Link 
            href="/"
            className="mt-4 text-purple-300 hover:text-purple-200 transition-colors underline decoration-purple-400 underline-offset-4"
          >
            Return home
          </Link>
        </div>
      </div>
    </div>
  );
}