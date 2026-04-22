import React from 'react';

interface Props {
  title?: React.ReactNode;
  eyebrow?: React.ReactNode;
  trailing?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  id?: string;
  as?: 'article' | 'div' | 'section';
}

/** The reusable cmd-panel chrome from the telemetry snippet. */
export function CmdPanel({
  title,
  eyebrow,
  trailing,
  children,
  className = '',
  bodyClassName = '',
  id,
  as = 'article',
}: Props) {
  const Tag = as as 'article';
  return (
    <Tag id={id} className={`cmd-panel ${className}`}>
      {(title || eyebrow || trailing) && (
        <header className="cmd-panel-header">
          <div className="flex flex-col gap-1 min-w-0">
            {eyebrow && (
              <span className="text-[0.6875rem] text-zinc-500 font-mono uppercase tracking-[0.18em]">
                {eyebrow}
              </span>
            )}
            {title && <span className="text-base font-normal text-zinc-200 truncate">{title}</span>}
          </div>
          {trailing && <div className="flex items-center gap-2 flex-shrink-0">{trailing}</div>}
        </header>
      )}
      <div className={`cmd-panel-body ${bodyClassName}`}>{children}</div>
    </Tag>
  );
}
