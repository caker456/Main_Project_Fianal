'use client';

import { useState } from 'react';
import { Bell, HelpCircle, User } from 'lucide-react';
import { UserPopover } from './UserPopover';

interface HeaderProps {
  onPageChange: (page: 'home' | 'management' | 'history' | 'documents' | 'statistics' | 'profile') => void;
}

export function Header({ onPageChange }: HeaderProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  // Popover 토글
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between overflow-visible">
      <div className="text-sm text-gray-600">
        <span className="mr-1">⏰</span>
        <span>58:22 후 세션이 종료됩니다.</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative cursor-pointer">
          <Bell className="w-5 h-5 text-gray-600" />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-xs text-white">1</span>
          </div>
        </div>

        <HelpCircle className="w-5 h-5 text-gray-600 cursor-pointer" />

        {/* 사용자 메뉴 */}
        <div className="relative">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={handleClick}
          >
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-gray-600" />
            </div>
            <span className="text-sm text-gray-700">▼</span>
          </div>
        </div>

        {/* Popover 연결 */}
        <UserPopover
          anchorEl={anchorEl}
          onClose={handleClose}
          open={open}
          onPageChange={onPageChange} // ✅ 여기서 전달
        />
      </div>
    </header>
  );
}
