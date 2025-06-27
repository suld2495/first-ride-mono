import Nav from './Nav';

const Footer = () => {
  return (
    <footer className="fixed bottom-0 max-w-[var(--max-width)] w-full h-[var(--footer-height)] py-2 bg-gray-600">
      <Nav />
    </footer>
  );
};

export default Footer;
