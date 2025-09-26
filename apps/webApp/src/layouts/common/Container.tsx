interface ContainerProps {
  children: React.ReactNode;
}

const Container = ({ children }: ContainerProps) => {
  return <main className="px-5">{children}</main>;
};

export default Container;