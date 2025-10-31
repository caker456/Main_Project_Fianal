'use client';

import React, { useEffect, useState } from "react";
import Popover from "@mui/material/Popover";
import MenuItem from "@mui/material/MenuItem";
import MenuList from "@mui/material/MenuList";
import Divider from "@mui/material/Divider";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import ListItemIcon from "@mui/material/ListItemIcon";
import { UserIcon, SignOutIcon } from "@phosphor-icons/react";

export interface UserPopoverProps {
  anchorEl: Element | null;
  onClose: () => void;
  open: boolean;
  onPageChange: (page: 'home' | 'management' | 'history' | 'documents' | 'statistics' | 'profile') => void;
}

export function UserPopover({ anchorEl, onClose, open, onPageChange }: UserPopoverProps) {
  const [name, setName] = useState<string>("User");

  useEffect(() => {
    fetch("http://localhost:8000/me", { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        if (data.name) setName(data.name);
      })
      .catch(err => console.error(err));
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:8000/logout", {
        method: "GET",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Logout failed");
      window.location.href = "/signin";
    } catch (error) {
      console.error("Logout error:", error);
      alert("Logout failed");
    }
  };

  const goToProfile = () => {
    onClose(); // 팝오버 닫기
    onPageChange('profile'); // 상태 기반 페이지 전환
  };

  return (
    <Popover
      anchorEl={anchorEl}
      onClose={onClose}
      open={open}
      anchorOrigin={{ horizontal: "left", vertical: "bottom" }}
      slotProps={{ paper: { sx: { width: 200, mt: 1, borderRadius: 2 } } }}
    >
      <Box sx={{ p: "12px 16px" }}>
        <Typography variant="subtitle1">{name}</Typography>
      </Box>

      <Divider />

      <MenuList disablePadding sx={{ p: "8px", "& .MuiMenuItem-root": { borderRadius: 1, fontSize: "0.85rem" } }}>
        {/* - 관리자 역할을 할거면 이거 사용하는게 좋을듯
        <MenuItem component={RouterLink} href={paths.dashboard.settings} onClick={onClose}>
          <ListItemIcon>
            <GearSixIcon fontSize="var(--icon-fontSize-md)" />
          </ListItemIcon>
          Settings
        </MenuItem> */}
        <MenuItem onClick={goToProfile}>
          <ListItemIcon>
            <UserIcon fontSize="var(--icon-fontSize-md)" />
          </ListItemIcon>
          사용자
        </MenuItem>

        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <SignOutIcon fontSize="var(--icon-fontSize-md)" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </MenuList>
    </Popover>
  );
}

