import { telLink, whatsappLink } from "@/data/site";

/** Always-reachable WhatsApp + call buttons, bottom-right on every page. */
export function FloatingContact() {
  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3">
      <a
        href={whatsappLink()}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp"
        className="flex h-13 w-13 items-center justify-center rounded-full bg-[#25D366] shadow-lg shadow-black/25 transition-transform duration-300 ease-[var(--ease-cubic)] hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366]"
        style={{ width: 52, height: 52 }}
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M12 2a10 10 0 00-8.6 15.1L2 22l5.1-1.3A10 10 0 1012 2z"
            fill="#fff"
          />
          <path
            d="M9.1 7.3c-.2-.5-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.2.2 2.1 3.3 5.1 4.5 2.5 1 3 .8 3.6.7.5 0 1.7-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.1-.3-.2-.6-.4l-2-1c-.3-.1-.5-.2-.7.1-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1a7.6 7.6 0 01-2.2-1.4 8.4 8.4 0 01-1.6-1.9c-.2-.3 0-.5.1-.6l.5-.5c.1-.2.2-.3.3-.5v-.5c0-.1-.7-1.6-1-2.2z"
            fill="#25D366"
          />
        </svg>
      </a>
      <a
        href={telLink()}
        aria-label="Call us"
        className="flex items-center justify-center rounded-full bg-saffron shadow-lg shadow-black/25 transition-transform duration-300 ease-[var(--ease-cubic)] hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-saffron"
        style={{ width: 52, height: 52 }}
      >
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
          <path
            d="M5 3.5h3.2l1.5 4.1-2 1.6a12.6 12.6 0 004.9 4.9l1.6-2 4.1 1.5V17a1.5 1.5 0 01-1.5 1.5A14.8 14.8 0 013.5 5 1.5 1.5 0 015 3.5z"
            stroke="#2e1e12"
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
        </svg>
      </a>
    </div>
  );
}
