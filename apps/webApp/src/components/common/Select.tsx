/**
 * DaisyUI Select Wrapper Component
 *
 * External library를 래핑하여 내부 구현을 추상화합니다.
 * UI 라이브러리 변경 시 이 컴포넌트만 수정하면 됩니다.
 */

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: { label: string; value?: string }[];
  placeholder?: string;
}

const Select = ({
  options,
  placeholder = '선택해주세요',
  className = '',
  ...props
}: SelectProps) => {
  return (
    <select
      className={`select w-full outline-none max-w-xs border-[1px] border-gray-300 dark:border-gray-400 rounded-md text-gray-main dark:text-gray-200 dark:bg-dark-primary-color focus:border-gray-500 dark:focus:border-gray-400 focus:outline-none transition-colors duration-300 ${className}`}
      {...props}
    >
      <option value="" disabled>
        {placeholder}
      </option>
      {options.map(({ label, value }) => (
        <option key={value || label} value={value || label}>
          {label}
        </option>
      ))}
    </select>
  );
};

export default Select;
