/**
 * The chat input textarea (ADR-0002 §7).
 *
 *   - 4096-char hard cap (ADR-0003 §4.2)
 *   - Ctrl+Enter submits
 *   - Disabled while a request is in flight
 *   - Live character counter ` N/4096 `
 */
import { forwardRef, useImperativeHandle, useRef } from 'react';

export interface ChatInputHandle {
  focus: () => void;
  setValue: (v: string) => void;
}

interface Props {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  sending?: boolean;
  placeholder?: string;
  maxLength?: number;
  /** Optional extra-info label shown on the right (e.g. "Thread full"). */
  rightSlot?: React.ReactNode;
}

const MAX_LENGTH_DEFAULT = 4096;

export const ChatInput = forwardRef<ChatInputHandle, Props>(function ChatInput(
  { value, onChange, onSubmit, disabled, sending, placeholder, maxLength, rightSlot },
  ref,
) {
  const cap = maxLength ?? MAX_LENGTH_DEFAULT;
  const taRef = useRef<HTMLTextAreaElement>(null);

  useImperativeHandle(ref, () => ({
    focus: () => taRef.current?.focus(),
    setValue: (v: string) => {
      onChange(v);
      // Defer focus so the caret lands after the change settles.
      setTimeout(() => taRef.current?.focus(), 0);
    },
  }));

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (!disabled && value.trim().length > 0) onSubmit();
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const next = e.target.value.slice(0, cap);
    onChange(next);
  }

  const count = value.length;
  const near = count > cap * 0.9;

  return (
    <div className="flex flex-col gap-2">
      <textarea
        ref={taRef}
        value={value}
        onChange={handleChange}
        onKeyDown={onKeyDown}
        placeholder={placeholder ?? 'Ask about the OIA Model…'}
        rows={3}
        disabled={disabled}
        aria-label="Chat message"
        className="w-full bg-black border border-white/10 rounded px-3 py-2 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-[#f05122]/60 resize-y leading-relaxed disabled:opacity-50 disabled:cursor-not-allowed"
      />
      <div className="flex items-center gap-3 flex-wrap">
        <span
          className={`text-[0.6875rem] font-mono tracking-[0.14em] ${
            near ? 'text-[#ff8a5c]' : 'text-white/45'
          }`}
          aria-live="polite"
        >
          {count}/{cap}
        </span>
        <span className="text-[0.6875rem] font-mono text-white/35 tracking-[0.14em] hidden sm:inline">
          <kbd className="px-1 py-0.5 rounded border border-white/15 bg-white/[0.03] text-white/55">
            Ctrl
          </kbd>
          <span className="mx-0.5 text-white/35">+</span>
          <kbd className="px-1 py-0.5 rounded border border-white/15 bg-white/[0.03] text-white/55">
            Enter
          </kbd>
          <span className="ml-1.5 text-white/35">to send</span>
        </span>
        {rightSlot && <div className="ml-auto flex items-center gap-2">{rightSlot}</div>}
        <button
          type="button"
          onClick={() => {
            if (!disabled && value.trim().length > 0) onSubmit();
          }}
          disabled={disabled || value.trim().length === 0}
          className={`${rightSlot ? '' : 'ml-auto'} inline-flex items-center gap-2 px-4 py-2 bg-[#f05122] hover:bg-[#ff7a4a] text-white text-sm rounded transition-colors shadow-[0_0_20px_rgba(240,81,34,0.4)] disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none`}
        >
          {sending ? 'Sending…' : 'Ask'}
        </button>
      </div>
    </div>
  );
});
