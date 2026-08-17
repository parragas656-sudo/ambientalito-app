import React from "react";

export const SapoLogo = ({ className = "w-10 h-10" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Eyes background (green bulge) */}
    <circle cx="34" cy="42" r="14" fill="#22c55e" stroke="#0f172a" strokeWidth="4.5" />
    <circle cx="66" cy="42" r="14" fill="#22c55e" stroke="#0f172a" strokeWidth="4.5" />
    
    {/* Head Main Base */}
    <ellipse cx="50" cy="64" rx="34" ry="26" fill="#22c55e" stroke="#0f172a" strokeWidth="4.5" />
    
    {/* Clean filler to merge eye lines with the head */}
    <circle cx="34" cy="42" r="12" fill="#22c55e" />
    <circle cx="66" cy="42" r="12" fill="#22c55e" />
    <ellipse cx="50" cy="64" rx="31" ry="23" fill="#22c55e" />

    {/* Eyes (White parts) */}
    <circle cx="34" cy="42" r="8.5" fill="white" stroke="#0f172a" strokeWidth="3.5" />
    <circle cx="66" cy="42" r="8.5" fill="white" stroke="#0f172a" strokeWidth="3.5" />

    {/* Pupils with cute reflection shines */}
    <circle cx="34" cy="42" r="4.5" fill="#0f172a" />
    <circle cx="32" cy="40" r="1.5" fill="white" />
    
    <circle cx="66" cy="42" r="4.5" fill="#0f172a" />
    <circle cx="64" cy="40" r="1.5" fill="white" />

    {/* Rosy cheeks */}
    <ellipse cx="25" cy="67" rx="5" ry="3.5" fill="#f43f5e" fillOpacity="0.65" />
    <ellipse cx="75" cy="67" rx="5" ry="3.5" fill="#f43f5e" fillOpacity="0.65" />

    {/* Smiling mouth */}
    <path d="M 38 64 Q 50 75 62 64" stroke="#0f172a" strokeWidth="4" strokeLinecap="round" fill="none" />
    {/* Cute tiny tongue */}
    <path d="M 46 68.5 Q 50 73.5 54 68.5" fill="#f43f5e" />

    {/* 🍀 Four-Leaf Clover in the middle of head */}
    {/* Stem connecting head to clover */}
    <path d="M 50 42 Q 47 30, 48 24" stroke="#15803d" strokeWidth="4.5" strokeLinecap="round" fill="none" />
    
    {/* Four heart-shaped leaflets centered around (48, 20) */}
    <g transform="translate(48, 20)">
      {/* Top Leaf */}
      <path d="M 0 0 C -4 -7, 4 -7, 0 0 Z" fill="#10b981" stroke="#0f172a" strokeWidth="2.5" strokeLinejoin="round" />
      {/* Right Leaf */}
      <path d="M 0 0 C -4 -7, 4 -7, 0 0 Z" fill="#10b981" stroke="#0f172a" strokeWidth="2.5" strokeLinejoin="round" transform="rotate(90)" />
      {/* Bottom Leaf */}
      <path d="M 0 0 C -4 -7, 4 -7, 0 0 Z" fill="#10b981" stroke="#0f172a" strokeWidth="2.5" strokeLinejoin="round" transform="rotate(180)" />
      {/* Left Leaf */}
      <path d="M 0 0 C -4 -7, 4 -7, 0 0 Z" fill="#10b981" stroke="#0f172a" strokeWidth="2.5" strokeLinejoin="round" transform="rotate(270)" />
      
      {/* Center detail node */}
      <circle cx="0" cy="0" r="1" fill="#a7f3d0" />
    </g>
  </svg>
);
