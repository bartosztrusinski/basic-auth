'use client';

import { useEffect, useState, type ReactNode, type InputHTMLAttributes } from 'react';
import { type Override } from '@/auth/util';

export type SlotProps = {
  value: string | null;
  placeholder: string | null;
  hasCaret: boolean;
  isActive: boolean;
};

type Props = Override<
  Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'autoComplete' | 'inputMode'>,
  {
    value?: string;
    defaultValue?: string;
    maxLength?: number;
    children: (slots: SlotProps[]) => ReactNode;
    onComplete?: (value: string) => void;
    containerClassName?: string;
    focusClassName?: string;
  }
>;

export function OtpInput({
  value: externalValue,
  maxLength = 6,
  defaultValue = '',
  placeholder,
  className = '',
  containerClassName = '',
  focusClassName = '',
  children,
  onComplete,
  onChange,
  onFocus,
  onBlur,
  onSelect,
  ...props
}: Props) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [isFocused, setIsFocused] = useState(false);
  const [selectionStart, setSelectionStart] = useState<number | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<number | null>(null);

  const value = externalValue ?? internalValue;
  const isEmpty = value.length === 0;
  const isComplete = value.length === maxLength;
  const isNoSlotSelected = selectionStart === maxLength;
  const isPlaceholderVisible = !isFocused && isEmpty;

  const slots: SlotProps[] = Array.from({ length: maxLength }, (_, slotIndex) => {
    const slotValue = value[slotIndex];
    const isCaretSlot = slotIndex === value.length;
    const isSelected =
      selectionStart !== null &&
      selectionEnd !== null &&
      slotIndex >= selectionStart &&
      slotIndex <= selectionEnd;
    const isOnlySelection = isSelected && selectionStart === selectionEnd;
    const slotPlaceholder = isPlaceholderVisible ? placeholder?.[slotIndex] : undefined;
    const isActive = isFocused && (Boolean(slotValue) ? isSelected : isOnlySelection);
    const hasCaret = isActive && isCaretSlot;

    return {
      value: slotValue ?? null,
      placeholder: slotPlaceholder ?? null,
      isActive,
      hasCaret,
    };
  });

  useEffect(() => {
    if (externalValue && !onChange) {
      console.error(
        'You provided a `value` prop to an OTP Input without an `onChange` handler. This will render a read-only field. If the field should be mutable use `defaultValue`',
      );
    }
  }, [externalValue, onChange]);

  return (
    <div className={`relative ${containerClassName}`}>
      <input
        {...props}
        type='text'
        autoComplete='one-time-code'
        inputMode='numeric'
        className={`absolute inset-0 flex h-full w-full appearance-none border-none bg-transparent leading-none -tracking-[0.5em] text-transparent caret-transparent opacity-100 shadow-none outline-none selection:bg-inherit selection:text-inherit placeholder:text-inherit ${isFocused && isComplete && isNoSlotSelected ? focusClassName : ''} ${className}`}
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
          onSelect?.(event);

          const { selectionStart, selectionEnd } = event.currentTarget;
          setSelectionStart(selectionStart);
          setSelectionEnd(selectionEnd);
        }}
        onFocus={(event) => {
          onFocus?.(event);

          setIsFocused(true);

          if (isEmpty) {
            const { selectionStart, selectionEnd } = event.currentTarget;
            setSelectionStart(selectionStart);
            setSelectionEnd(selectionEnd);
          }
        }}
        onBlur={(event) => {
          onBlur?.(event);

          setIsFocused(false);
          setSelectionStart(null);
          setSelectionEnd(null);
        }}
      />

      {children(slots)}
    </div>
  );
}
