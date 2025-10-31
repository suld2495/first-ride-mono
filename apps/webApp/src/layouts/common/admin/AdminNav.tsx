import { Link, useLocation } from 'react-router';
import { IconHome, IconFriends } from '@tabler/icons-react';
import React from 'react';

interface NavTextProps {
  children: React.ReactNode;
  active: boolean;
}

const NavText = ({ children, active }: NavTextProps) => {
  return <span className={`text-[12px] ${active ? 'text-white' : 'text-gray-500'}`}>{children}</span>
}

const AdminNav = () => {
  const { pathname } = useLocation();

  return (
    <nav>
      <ul className="flex justify-center gap-10">
        <li>
          <Link to="/admin/quest-management" className="flex flex-col items-center gap-1">
            <IconHome color={pathname.includes('/admin/quest-management') ? 'white' : 'gray'} stroke={2} />
            <NavText active={pathname.includes('/admin/quest-management')}>퀘스트</NavText>
          </Link>
        </li>
        <li>
          <Link to="/reward" className="flex flex-col items-center gap-1">
            <IconFriends color={pathname.includes('/admin/reward') ? 'white' : 'gray'} stroke={2} />
            <NavText active={pathname.includes('/admin/reward')}>보상</NavText>
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default AdminNav;
