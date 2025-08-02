interface AuthFormProps {
  title: string;
  children: React.ReactNode;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

const AuthForm = ({ title, children, onSubmit }: AuthFormProps) => {
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-5">
      <h3 className="dark:text-white text-2xl font-bold">{title}</h3>
      <form
        className="flex flex-col items-center justify-center w-[300px]"
        onSubmit={onSubmit}
      >
        {children}
      </form>
    </div>
  );
};

export default AuthForm;
