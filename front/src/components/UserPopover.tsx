'use client';

import React, { useEffect, useState } from "react";
import Popover from "@mui/material/Popover";
import MenuItem from "@mui/material/MenuItem";
import MenuList from "@mui/material/MenuList";
import Divider from "@mui/material/Divider";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import ListItemIcon from "@mui/material/ListItemIcon";
import { UserIcon, SignOutIcon, GearSixIcon } from "@phosphor-icons/react";

export interface UserPopoverProps {
  anchorEl: Element | null;
  onClose: () => void;
  open: boolean;
  onPageChange: (
    page:
      | "home"
      | "management"
      | "history"
      | "documents"
      | "statistics"
      | "profile"
      | "admin"
  ) => void;
}

export function UserPopover({
  anchorEl,
  onClose,
  open,
  onPageChange,
}: UserPopoverProps) {
  const [name, setName] = useState<string>(""); // 초기값을 빈 문자열로 변경
  const [roleName, setRoleName] = useState<string>("");

  // ✅ 사용자 정보 불러오기
  useEffect(() => {
    if (!open) return;

    fetch("http://localhost:8000/member/current/role", { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch user info");
        return res.json();
      })
      .then((member) => {
        setName(member?.name || "");
        setRoleName(member?.role_name || "");
      })
      .catch((err) => {
        console.error("❌ [UserPopover] Error fetching user info:", err);
        setName("");
        setRoleName("");
      });
  }, [open]);

  // ✅ 로그아웃
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

  // ✅ 사용자 페이지 이동
  const goToProfile = () => {
    onClose();
    onPageChange("profile");
  };

  // ✅ 회원 관리 (Admin 페이지로 이동)
  const goToAdmin = () => {
    onClose();
    onPageChange("admin");
  };

  return (
    <Popover
      anchorEl={anchorEl}
      onClose={onClose}
      open={open}
      anchorOrigin={{ horizontal: "left", vertical: "bottom" }}
      slotProps={{ paper: { sx: { width: 200, mt: 1, borderRadius: 2 } } }}
    >
      {/* 사용자 정보 */}
      <Box sx={{ p: "12px 16px" }}>
        {name && <Typography variant="subtitle1">{name}</Typography>} {/* 조건부 렌더링 */}
      </Box>

      <Divider />

      {/* 메뉴 항목 */}
      <MenuList
        disablePadding
        sx={{
          p: "8px",
          "& .MuiMenuItem-root": { borderRadius: 1, fontSize: "0.85rem" },
        }}
      >
        {/* 관리자 전용 버튼 */}
        {roleName.toLowerCase() === "admin" && (
          <MenuItem onClick={goToAdmin}>
            <ListItemIcon>
              <GearSixIcon fontSize="var(--icon-fontSize-md)" />
            </ListItemIcon>
            회원 관리
          </MenuItem>
        )}

        {/* 프로필 */}
        <MenuItem onClick={goToProfile}>
          <ListItemIcon>
            <UserIcon fontSize="var(--icon-fontSize-md)" />
          </ListItemIcon>
          사용자
        </MenuItem>

        {/* 로그아웃 */}
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <SignOutIcon fontSize="var(--icon-fontSize-md)" />
          </ListItemIcon>
          로그아웃
        </MenuItem>
      </MenuList>
    </Popover>
  );
}
