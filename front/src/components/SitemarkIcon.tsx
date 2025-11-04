// components/DclassificationIcon.tsx
import * as React from "react";
import SvgIcon from "@mui/material/SvgIcon";

export default function DclassificationIcon() {
  return (
    <SvgIcon
      viewBox="0 0 320 40"
      sx={{ height: 28, width: "auto", mr: 2 }}
    >
      <rect width="320" height="40" fill="none" />
      {/* 🎨 "D" 배경 원 */}
      <circle cx="22" cy="20" r="16" fill="#4876EE" />
      <text
        x="14"
        y="27"
        fill="white"
        fontFamily="'Segoe UI', 'Roboto', sans-serif"
        fontWeight="700"
        fontSize="20"
      >
        D
      </text>

      {/* ✨ 나머지 글자 "classification" */}
      <text
        x="50"
        y="26"
        fill="#2C3E50"
        fontFamily="'Segoe UI', 'Roboto', sans-serif"
        fontWeight="600"
        fontSize="18"
        letterSpacing="0.5"
      >
        classification
      </text>

      {/* 포인트 밑줄 */}
      <line
        x1="50"
        y1="30"
        x2="230"
        y2="30"
        stroke="#00D3AB"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </SvgIcon>
  );
}
