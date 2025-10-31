'use client';

import { useEffect, useState } from 'react';
import { Bell, HelpCircle, User } from 'lucide-react';
import { UserPopover } from './UserPopover';

interface HeaderProps {
  onPageChange: (
    page:
      | 'home'
      | 'management'
      | 'history'
      | 'documents'
      | 'statistics'
      | 'profile'
  ) => void;
  onLogout?: () => void; // 자동 로그아웃을 위해 추가
  sessionDuration?: number; // 세션 유지 시간 (초)
}

export function Header({
  onPageChange,
  onLogout,
  sessionDuration = 3600, // 기본 1시간
}: HeaderProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [remainingTime, setRemainingTime] = useState(sessionDuration);
  const [sessionStart] = useState(Date.now()); // 현재 시점 기준 시작

  // 남은 시간 계산
  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - sessionStart) / 1000);
      const remaining = sessionDuration - elapsed;
      if (remaining <= 0) {
        setRemainingTime(0);
        clearInterval(interval);

        // 자동 로그아웃 실행 (옵션)
        if (onLogout) {
          alert('세션이 만료되었습니다. 다시 로그인해주세요.');
          onLogout();
        }
      } else {
        setRemainingTime(remaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionDuration, sessionStart, onLogout]);

  // 남은 시간을 mm:ss로 포맷팅
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Popover 제어
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between overflow-visible">
      {/* ✅ 세션 만료 표시 */}
      <div className="text-sm text-gray-600">
        <span className="mr-1">⏰</span>
        {remainingTime > 0 ? (
          <span>{formatTime(remainingTime)} 후 세션이 종료됩니다.</span>
        ) : (
          <span className="text-red-500">세션이 만료되었습니다.</span>
        )}
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

        {/* Popover */}
        <UserPopover
          anchorEl={anchorEl}
          onClose={handleClose}
          open={open}
          onPageChange={onPageChange}
        />
      </div>
    </header>
  );
}
