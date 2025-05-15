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
  const [positionStart, setPositionStart] = useState<number | null>(null);
  const [positionEnd, setPositionEnd] = useState<number | null>(null);
  const isMultipleSlotsSelected =
    positionStart !== null && positionEnd !== null && positionStart !== positionEnd;

  useEffect(() => {
    if (value.length === maxLength) {
      onComplete?.(value);
    }
  }, [maxLength, onComplete, value]);

  return (
    <div
      className={`relative flex w-min items-center justify-between gap-1 rounded p-0.5 ${className} ${isFocused && value.length === maxLength ? 'ring-2 ring-pink-500' : ''}`}
    >
      <input
        type='text'
        className='peer absolute inset-0 z-10 appearance-none border-none bg-transparent text-transparent outline-none selection:bg-inherit selection:text-inherit'
        autoComplete={autoComplete}
        maxLength={maxLength}
        value={value}
        onChange={(event) => {
          const newValue = event.target.value.replace(/[^0-9]/g, '');
          if (newValue.length <= maxLength) {
            setValue(newValue);
          }
        }}
        {...props}
        onSelect={(event) => {
          const { selectionStart, selectionEnd } = event.currentTarget;
          setPositionStart(selectionStart);
          setPositionEnd(selectionEnd);
        }}
        onFocus={() => {
          setIsFocused(true);
        }}
        onBlur={() => {
          setIsFocused(false);
          setPositionStart(null);
          setPositionEnd(null);
        }}
      />

      {Array.from({ length: maxLength }, (_, index) => {
        const hasValue = Boolean(value[index]);
        const isFirstEmptySlot = index === value.length;
        const isCurrentPosition = index === positionStart;
        const isSelected = isMultipleSlotsSelected
          ? positionStart <= index && index <= positionEnd && !isFirstEmptySlot
          : isCurrentPosition;
        const isActive = isFocused && (isSelected || (isFirstEmptySlot && isCurrentPosition));
        const shouldShowCaret = isFocused && isCurrentPosition && isFirstEmptySlot;

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
