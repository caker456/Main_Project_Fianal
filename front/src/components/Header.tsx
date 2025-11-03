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
  onLogout?: () => void;
}

export function Header({ onPageChange, onLogout }: HeaderProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [remainingTime, setRemainingTime] = useState<number>(0);

  const fetchRemainingTime = async () => {
    try {
      const res = await fetch('http://localhost:8000/session/remaining', {
        method: 'GET',
        credentials: 'include',
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        console.warn("Expected JSON but got HTML or invalid response", text);
        return; // 뒤로가기 시 HTML 반환 무시
      }

      if (typeof data.remaining === 'number') {
        setRemainingTime(data.remaining);
        if (data.remaining <= 0 && onLogout) {
          alert(data.message || '세션이 만료되었습니다. 다시 로그인해주세요.');
          onLogout();
        }
      } else {
        console.warn('Invalid session response:', data);
      }
    } catch (err) {
      console.error('Failed to fetch session remaining time', err);
    }
  };


  useEffect(() => {
    fetchRemainingTime();

    const countdown = setInterval(() => {
      setRemainingTime(prev => Math.max(prev - 1, 0));
    }, 1000);

    const sync = setInterval(fetchRemainingTime, 10000);

    return () => {
      clearInterval(countdown);
      clearInterval(sync);
    };
  }, [onLogout]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

  const handleClose = () => setAnchorEl(null);

  const open = Boolean(anchorEl);

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between overflow-visible">
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

        <div className="relative">
          <div className="flex items-center gap-2 cursor-pointer" onClick={handleClick}>
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-gray-600" />
            </div>
            <span className="text-sm text-gray-700">▼</span>
          </div>
        </div>

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
