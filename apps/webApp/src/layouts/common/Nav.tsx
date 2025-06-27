import { Link } from 'react-router';
import { IconHome } from '@tabler/icons-react';

const Nav = () => {
  return (
    <nav>
      <ul className="flex justify-center gap-10">
        <li>
          <Link to="/" className="flex flex-col items-center gap-1">
            <IconHome color="white" stroke={2} />
            <span className="text-[12px] text-white">홈</span>
          </Link>
        </li>
        <li>
          <Link to="/routine" className="flex flex-col items-center gap-1">
            <IconHome color="white" stroke={2} />
            <span className="text-[12px] text-white">루틴</span>
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Nav;
