'use client';

import { useEffect, useState, type InputHTMLAttributes } from 'react';

type Override<T, U> = Omit<T, keyof U> & U;

type Props = Override<
  InputHTMLAttributes<HTMLInputElement>,
  {
    value?: string;
    defaultValue?: string;
    maxLength?: number;
    onComplete?: (value: string) => void;
  }
>;

export function OtpInput({
  autoComplete = 'one-time-code',
  maxLength = 6,
  className,
  placeholder,
  onComplete,
  defaultValue = '',
  ...props
}: Props) {
  const [value, setValue] = useState(defaultValue);
  const [isFocused, setIsFocused] = useState(false);
  const [positionStart, setPositionStart] = useState<number>(0);
  const [positionEnd, setPositionEnd] = useState<number>(0);
  const isMultipleSelected = positionStart !== positionEnd;

  useEffect(() => {
    if (value.length === maxLength) {
      onComplete?.(value);
    }
  }, [maxLength, onComplete, value]);

  return (
    <div className={`relative flex w-min items-center justify-between gap-1 ${className}`}>
      <input
        type='text'
        autoComplete={autoComplete}
        value={value}
        onChange={(event) => {
          const newValue = event.target.value.replace(/[^0-9]/g, '');
          if (newValue.length <= maxLength) {
            setValue(newValue);
          }
        }}
        {...props}
        maxLength={maxLength}
        className='peer absolute inset-0 z-10 appearance-none border-none bg-transparent text-transparent outline-none selection:bg-inherit selection:text-inherit'
        onSelect={(event) => {
          const input = event.currentTarget;
          const { selectionStart, selectionEnd } = input;

          console.log({
            selectionStart,
            selectionEnd,
          });

          setPositionStart(selectionStart ?? 0);
          setPositionEnd(selectionEnd ?? 0);
        }}
        onFocus={() => {
          setIsFocused(true);
        }}
        onBlur={() => {
          setIsFocused(false);
          setPositionStart(0);
          setPositionEnd(0);
        }}
      />

      {Array.from({ length: maxLength }, (_, index) => {
        const hasValue = Boolean(value[index]);
        const isCurrentInput = index === value.length;
        const isCurrentPosition = index === positionStart;
        const isSelected = isMultipleSelected
          ? positionStart <= index && index <= positionEnd && !isCurrentInput
          : isCurrentPosition;
        const isActive = isFocused && (isSelected || (isCurrentInput && isCurrentPosition));
        const shouldShowCaret = isFocused && isCurrentPosition && isCurrentInput;

        return (
          <div
            key={index}
            className={`size-8 cursor-text rounded-sm bg-white p-1 text-center text-black ${isActive ? 'peer-focus:ring-2 peer-focus:ring-pink-500' : ''}`}
          >
            {hasValue ? (
              value[index]
            ) : shouldShowCaret ? (
              <div className='pointer-events-none flex size-full animate-caret-blink items-center justify-center'>
                <div className='h-3/4 w-0.5 bg-black' />
              </div>
            ) : (
              placeholder?.[index] && <span className='text-zinc-400'>{placeholder[index]}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
