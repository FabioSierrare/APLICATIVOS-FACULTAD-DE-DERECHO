"use client"
import Link from "next/link";

export default function ComponentLink({ label, href, isActive = false }) {
  return (
    <Link
      href={href}
      className={`block pl-3 hover:text-active-text font-normal text-[14px] ${
        isActive ? "text-active-text" : "text-white"
      }`}
    >
      {label}
    </Link>
  );
}
