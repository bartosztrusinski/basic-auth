'use client';

import { useEffect, useState, type InputHTMLAttributes } from 'react';

type Override<T, U> = Omit<T, keyof U> & U;

type Props = Override<
  Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'autoComplete' | 'inputMode'>,
  {
    value?: string;
    defaultValue?: string;
    maxLength?: number;
    onComplete?: (value: string) => void;
  }
>;

export function OtpInput({
  value: externalValue,
  maxLength = 6,
  defaultValue = '',
  placeholder,
  className = '',
  onChange,
  onFocus,
  onBlur,
  onSelect,
  onComplete,
  ...props
}: Props) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [isFocused, setIsFocused] = useState(false);
  const [selectionStart, setSelectionStart] = useState<number | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<number | null>(null);
  const value = externalValue ?? internalValue;
  const isComplete = value.length === maxLength;
  const isNoSlotSelected = selectionStart === maxLength;
  const isPlaceholderVisible = !isFocused && value.length === 0;

  useEffect(() => {
    if (externalValue && !onChange) {
      console.error(
        'You provided a `value` prop to an OTP Input without an `onChange` handler. This will render a read-only field. If the field should be mutable use `defaultValue`',
      );
    }
  }, [externalValue, onChange]);

  return (
    <div className={`relative ${className}`}>
      <input
        {...props}
        type='text'
        autoComplete='one-time-code'
        inputMode='numeric'
        className={`peer absolute inset-0 z-10 appearance-none rounded border-none bg-transparent -tracking-[1rem] text-transparent outline-none selection:bg-inherit selection:text-inherit placeholder:text-inherit ${isFocused && isComplete && isNoSlotSelected ? 'outline-2 outline-zinc-400' : ''}`}
        maxLength={maxLength}
        value={value}
        aria-placeholder={placeholder}
        onChange={(event) => {
          const newValue = event.target.value.replace(/\D/g, '');
          event.target.value = newValue;

          onChange?.(event);

          if (!externalValue) {
            setInternalValue(newValue);
          }

          if (newValue.length === maxLength) {
            onComplete?.(newValue);
          }
        }}
        onSelect={(event) => {
          const { selectionStart, selectionEnd } = event.currentTarget;
          setSelectionStart(selectionStart);
          setSelectionEnd(selectionEnd);
          onSelect?.(event);
        }}
        onFocus={(event) => {
          setIsFocused(true);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setIsFocused(false);
          setSelectionStart(null);
          setSelectionEnd(null);
          onBlur?.(event);
        }}
      />

      {Array.from({ length: maxLength }, (_, slotIndex) => {
        const hasValue = slotIndex < value.length;
        const isCaretSlot = slotIndex === value.length;
        const isCurrentPosition = selectionStart === selectionEnd && slotIndex === selectionStart;
        const isSelected =
          selectionStart !== null &&
          selectionEnd !== null &&
          slotIndex >= selectionStart &&
          slotIndex <= selectionEnd;
        const isActive =
          isFocused && ((hasValue && isSelected) || (isCaretSlot && isCurrentPosition));
        const slotPlaceholder = isPlaceholderVisible ? placeholder?.[slotIndex] : null;

        return (
          <div
            key={slotIndex}
            className={`flex size-8 place-content-center place-items-center rounded-sm bg-zinc-800 text-center text-zinc-50 outline-2 outline-zinc-400 ${isActive ? 'peer-focus:outline' : ''}`}
          >
            {hasValue ? (
              value[slotIndex]
            ) : isActive && isCaretSlot ? (
              <span className='pointer-events-none h-[1.5ch] w-[0.2ch] animate-caret-blink bg-current'></span>
            ) : (
              slotPlaceholder && (
                <span className='pointer-events-none text-zinc-500'>{slotPlaceholder}</span>
              )
            )}
          </div>
        );
      })}
    </div>
  );
}
