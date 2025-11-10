/**
 * DaisyUI Select Wrapper Component
 *
 * External library를 래핑하여 내부 구현을 추상화합니다.
 * UI 라이브러리 변경 시 이 컴포넌트만 수정하면 됩니다.
 */

import { cn } from '@/design-system';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: { label: string; value?: string }[];
  placeholder?: string;
  error?: boolean;
}

/**
 * 통합 Select 컴포넌트
 *
 * @example
 * <Select
 *   options={[{ label: '옵션1', value: '1' }]}
 *   placeholder="선택하세요"
 * />
 *
 * @example
 * // className 오버라이드 (올바르게 작동)
 * <Select
 *   options={options}
 *   className="border-blue-500"
 * />
 */
const Select = ({
  options,
  placeholder = '선택해주세요',
  className = '',
  error = false,
  disabled,
  ...props
}: SelectProps) => {
  return (
    <select
      className={cn(
        'select w-full outline-none max-w-xs',
        'border-[1px] rounded-md transition-colors duration-300',
        'text-gray-main dark:text-gray-200 dark:bg-dark-primary-color',
        error
          ? 'border-quest-error-color focus:border-quest-error-color'
          : 'border-gray-300 dark:border-gray-400 focus:border-gray-500 dark:focus:border-gray-400',
        'focus:outline-none',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      disabled={disabled}
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
