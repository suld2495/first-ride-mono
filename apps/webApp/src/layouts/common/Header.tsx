import React from "react";

interface HeaderProps {
  children: React.ReactNode;
}

const Header = ({ children }: HeaderProps) => {
  return <header className="relative flex justify-between w-full h-[var(--header-height)] py-3 px-4">{children}</header>
};

export default Header;