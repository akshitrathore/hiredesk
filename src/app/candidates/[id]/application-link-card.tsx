"use client";

import { useRef, useState } from "react";

export function ApplicationLinkCard({ link }: { link: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [copied, setCopied] = useState(false);

  return (
    <div className="rounded-md border border-blue-200 bg-blue-50 p-4">
      <p className="text-sm font-semibold text-blue-950">
        Application link pending
      </p>
      <p className="mt-1 text-sm leading-6 text-blue-800">
        The candidate has not submitted their form yet. Share this link if they
        need it again.
      </p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <input
          className="h-10 flex-1 rounded-md border border-blue-200 bg-white px-3 text-sm text-blue-950 outline-none"
          readOnly
          ref={inputRef}
          value={link}
        />
        <button
          className="h-10 rounded-md bg-blue-950 px-4 text-sm font-semibold text-white"
          onClick={async () => {
            inputRef.current?.select();
            await navigator.clipboard.writeText(link);
            setCopied(true);
          }}
          type="button"
        >
          {copied ? "Copied" : "Copy link"}
        </button>
      </div>
    </div>
  );
}
