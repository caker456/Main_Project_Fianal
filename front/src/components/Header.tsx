import { Bell, HelpCircle, User } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <div className="text-sm text-gray-600">
        <span className="mr-1">⏰</span>
        <span>58:22 후 세션이 종료됩니다.</span>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Notification Bell with Badge */}
        <div className="relative cursor-pointer">
          <Bell className="w-5 h-5 text-gray-600" />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-xs text-white">1</span>
          </div>
        </div>

        {/* Help Icon */}
        <HelpCircle className="w-5 h-5 text-gray-600 cursor-pointer" />

        {/* User Profile */}
        <div className="flex items-center gap-2 cursor-pointer">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-gray-600" />
          </div>
          <span className="text-sm text-gray-700">▼</span>
        </div>
      </div>
    </header>
  );
}
