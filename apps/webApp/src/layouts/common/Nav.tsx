import { Link, useLocation } from 'react-router';
import { IconHome, IconFriends, IconBriefcase } from '@tabler/icons-react';
import React from 'react';

interface NavTextProps {
  children: React.ReactNode;
  active: boolean;
}

const NavText = ({ children, active }: NavTextProps) => {
  return <span className={`text-[12px] ${active ? 'text-white' : 'text-gray-500'}`}>{children}</span>
}

const Nav = () => {
  const { pathname } = useLocation();

  return (
    <nav>
      <ul className="flex justify-center gap-10">
        <li>
          <Link to="/" className="flex flex-col items-center gap-1">
            <IconHome color={pathname === '/' ? 'white' : 'gray'} stroke={2} />
            <NavText active={pathname === '/'}>루틴</NavText>
          </Link>
        </li>
        <li>
          <Link to="/quest" className="flex flex-col items-center gap-1">
            <IconBriefcase color={pathname.includes('quest') ? 'white' : 'gray'} stroke={2} />
            <NavText active={pathname.includes('quest')}>퀘스트</NavText>
          </Link>
        </li>
        <li>
          <Link to="/friends" className="flex flex-col items-center gap-1">
            <IconFriends color={pathname === '/friends' ? 'white' : 'gray'} stroke={2} />
            <NavText active={pathname === '/friends'}>친구</NavText>
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Nav;
