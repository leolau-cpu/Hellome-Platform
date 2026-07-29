import type { InputHTMLAttributes } from 'react';
import { InputField } from './Input';

type SearchInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'onChange' | 'size' | 'type' | 'value' | 'defaultValue'
> & {
  size?: 'md' | 'lg';
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  error?: boolean;
};

export function SearchInput({
  size = 'md',
  placeholder = '搜索',
  ...props
}: SearchInputProps) {
  return (
    <InputField
      {...props}
      size={size}
      placeholder={placeholder}
      prefixIcon="Search"
      clearable
      clearLabel="清空搜索"
    />
  );
}
