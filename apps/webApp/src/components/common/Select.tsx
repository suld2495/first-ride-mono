interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: { label: string; value?: string }[];
}

const Select = ({ options, defaultValue, ...props }: SelectProps) => {
  return (
    <select
      className="border-[1px] border-gray-300 rounded-md p-2 text-[15px] outline-0 focus:border-gray-500 focus:ring-0 transition-colors duration-300"
      {...props}
    >
      <option value="" disabled>
        선택해주세요.
      </option>
      {options.map(({ label, value }) => (
        <option
          key={value || label}
          value={value || label}
          selected={defaultValue === (value || label)}
        >
          {label}
        </option>
      ))}
    </select>
  );
};

export default Select;
