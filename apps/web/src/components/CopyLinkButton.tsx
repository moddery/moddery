import { Check, Copy } from 'lucide-react';
import { useState } from 'react';

export function CopyLinkButton() {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <button
      type="button"
      onClick={() => void copyLink()}
      className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg border border-line px-3 text-sm font-bold text-ink transition-colors hover:bg-control-hover"
    >
      {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
      {copied ? 'Copied' : 'Copy link'}
    </button>
  );
}
