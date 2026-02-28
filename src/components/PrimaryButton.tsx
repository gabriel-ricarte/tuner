import type { ButtonHTMLAttributes } from 'react';

type PrimaryButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export function PrimaryButton({
  className = '',
  type = 'button',
  ...props
}: PrimaryButtonProps) {
  return <button className={`primary-button ${className}`.trim()} type={type} {...props} />;
}
