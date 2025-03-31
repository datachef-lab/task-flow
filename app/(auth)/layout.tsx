import { ReactNode } from "react";
import Image from "next/image";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Left side: Form content */}
      <div className="w-full md:w-1/2 flex items-center justify-center">
        {children}
      </div>

      {/* Right side: Image */}
      <div className="hidden md:block md:w-1/2 bg-indigo-600 relative">
        <div className="absolute inset-0 flex flex-col justify-center p-10 bg-indigo-600/90">
          <div className="max-w-md mx-auto">
            <h2 className="text-3xl font-bold text-white mb-6">
              Task Flow Management System
            </h2>
            <p className="text-indigo-100 mb-8">
              Streamline your workflow, manage tasks efficiently, and
              collaborate with your team in real-time.
            </p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-white"></div>
                <span className="text-indigo-100">Task Management</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-white"></div>
                <span className="text-indigo-100">Real-time Notifications</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-white"></div>
                <span className="text-indigo-100">Team Collaboration</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-white"></div>
                <span className="text-indigo-100">Progress Tracking</span>
              </div>
            </div>
          </div>
          <div className="absolute bottom-4 left-0 right-0 text-center text-indigo-200 text-sm">
            © {new Date().getFullYear()} Task Flow. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
}
