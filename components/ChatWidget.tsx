'use client';

import { useState, useRef, useEffect } from 'react';

interface ChatMessage {
  type: 'user' | 'assistant';
  text?: string;
  products?: Array<{
    id: string;
    title: string;
    site: string;
    price: number;
    rating: number;
    url: string;
  }>;
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { type: 'assistant', text: 'Hi! Ask me about any product and I\'ll find it on Amazon, Flipkart, Meesho, and more! 🛒' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    setMessages(prev => [...prev, { type: 'user', text: trimmed }]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`);
      const data = await res.json();
      const results = data.results || [];

      if (results.length > 0) {
        const lowestByTitle: Record<string, typeof results[0]> = {};
        results.forEach((r: any) => {
          const key = r.title.toLowerCase();
          if (!lowestByTitle[key] || r.price < lowestByTitle[key].price) {
            lowestByTitle[key] = r;
          }
        });

        const topProducts = Object.values(lowestByTitle).slice(0, 3);

        setMessages(prev => [
          ...prev,
          {
            type: 'assistant',
            products: topProducts.map((p: any) => ({
              id: p.id,
              title: p.title,
              site: p.source,
              price: p.price,
              rating: p.rating,
              url: p.productUrl,
            })),
          },
        ]);
      } else {
        setMessages(prev => [
          ...prev,
          {
            type: 'assistant',
            text: `I couldn\'t find "${trimmed}" right now. Try searching for something else like iPhone, Samsung, Laptop, or Headphones!`,
          },
        ]);
      }
    } catch (error) {
      setMessages(prev => [
        ...prev,
        { type: 'assistant', text: 'Oops! Something went wrong. Please try again.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="dev-nova-chat" className={`dn-chat ${!isOpen ? 'closed' : ''}`} aria-hidden={!isOpen}>
      <div className="dn-header">
        <div className="dn-title">
          <span className="dn-dot"></span>
          NovaMart Assistant
        </div>
        <div className="dn-status">ONLINE</div>
        <button
          className="dn-toggle"
          aria-label="Toggle chat"
          onClick={() => setIsOpen(false)}
        >
          ✕
        </button>
      </div>
      <div className="dn-body">
        <div className="dn-messages">
          {messages.map((msg, i) => (
            <div key={i}>
              {msg.text && (
                <div className={`dn-msg ${msg.type}`}>
                  {msg.text}
                </div>
              )}
              {msg.products && (
                <div className="dn-products">
                  {msg.products.map((prod) => (
                    <a
                      key={prod.id}
                      href={prod.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="dn-product-link"
                    >
                      <div className="dn-prod-title">{prod.title}</div>
                      <div className="dn-prod-meta">
                        <span className="dn-site">{prod.site}</span>
                        <span className="dn-price">₹{prod.price.toLocaleString()}</span>
                        <span className="dn-rating">⭐ {prod.rating.toFixed(1)}</span>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="dn-msg assistant">
              <span className="dn-typing">Searching...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="dn-input">
          <input
            type="text"
            placeholder="Search for a product..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
            disabled={loading}
          />
          <button onClick={handleSend} disabled={loading}>
            {loading ? '...' : 'Send'}
          </button>
        </div>
      </div>
      <button
        className="dn-open"
        aria-label="Open chat"
        onClick={() => setIsOpen(true)}
      >
        💬
      </button>

      <style jsx>{`
        #dev-nova-chat {
          position: fixed;
          right: 20px;
          bottom: 20px;
          /* full width when open defined on .dn-chat itself */
          font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;
          z-index: 9999;
        }
        .dn-chat {
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
          border-radius: 12px;
          overflow: hidden;
          background: hsl(var(--card));    /* use theme card color */
          display: flex;
          flex-direction: column;
          transition: transform 0.18s ease, opacity 0.18s ease;
          width: 320px;                    /* smaller width */
        }
        /* hide chat body + input when closed */
        .dn-chat.closed .dn-body,
        .dn-chat.closed .dn-input {
          display: none;
        }
        /* floating circular toggle button */
        .dn-open {
          width: 48px;
          height: 48px;
          background: hsl(var(--primary));
          color: var(--primary-foreground);
          border: none;
          border-radius: 50%;
          cursor: pointer;
          font-size: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px hsl(var(--foreground) / 0.15);
          transition: transform .2s;
        }
        .dn-open:hover {
          transform: scale(1.1);
        }
        /* hide toggle button when chat is open */
        .dn-chat:not(.closed) + .dn-open {
          display: none;
        }
        .dn-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 12px;
          background: hsl(var(--primary));
          color: var(--primary-foreground);
        }
        .dn-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
        }
        .dn-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: hsl(var(--accent));
          display: inline-block;
          box-shadow: 0 0 6px hsl(var(--accent) / 0.6);
        }
        .dn-status {
          background: hsl(var(--accent) / 0.15);
          color: hsl(var(--accent));
          padding: 4px 8px;
          border-radius: 999px;
          font-size: 12px;
          margin-left: 8px;
        }
        .dn-toggle {
          background: transparent;
          border: none;
          color: var(--primary-foreground);
          font-size: 16px;
          cursor: pointer;
        }
        .dn-body {
          display: flex;
          flex-direction: column;
          height: 400px;
        }
        .dn-messages {
          padding: 12px;
          overflow: auto;
          flex: 1;
          background: var(--background);
        }
        .dn-msg {
          margin-bottom: 10px;
          padding: 8px 10px;
          border-radius: 8px;
          font-size: 14px;
          word-wrap: break-word;
        }
        .dn-msg.assistant {
          background: hsl(var(--accent) / 0.1);
          color: var(--foreground);
        }
        .dn-msg.user {
          background: hsl(var(--primary) / 0.1);
          color: var(--foreground);
          text-align: right;
          margin-left: 30px;
        }
        .dn-typing {
          display: inline-block;
          animation: pulse 1.5s infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        .dn-products {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 10px;
        }
        .dn-product-link {
          display: block;
          padding: 8px 10px;
          background: hsl(var(--PRIMARY) / 0.1);
          border: 1px solid hsl(var(--primary) / 0.2);
          border-radius: 8px;
          text-decoration: none;
          color: inherit;
          transition: all 0.2s ease;
        }
        .dn-product-link:hover {
          background: hsl(var(--primary) / 0.15);
          border-color: hsl(var(--primary) / 0.4);
          box-shadow: 0 2px 8px hsl(var(--foreground) / 0.1);
        }
        .dn-prod-title {
          font-size: 13px;
          font-weight: 600;
          color: hsl(var(--primary));
          margin-bottom: 4px;
          line-height: 1.3;
        }
        .dn-prod-meta {
          display: flex;
          gap: 6px;
          font-size: 12px;
          flex-wrap: wrap;
        }
        .dn-site {
          background: hsl(var(--primary));
          color: var(--primary-foreground);
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: 600;
        }
        .dn-price {
          color: hsl(var(--accent));
          font-weight: 700;
        }
        .dn-rating {
          color: hsl(var(--warning));
        }
        .dn-input {
          display: flex;
          gap: 8px;
          padding: 10px;
          border-top: 1px solid hsl(var(--border));
        }
        .dn-input input {
          flex: 1;
          padding: 8px 10px;
          border: 1px solid hsl(var(--input));
          border-radius: 8px;
          font-size: 14px;
          background: hsl(var(--card));
          color: hsl(var(--foreground));
        }
        .dn-input input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .dn-input button {
          padding: 8px 12px;
          background: hsl(var(--primary));
          color: var(--primary-foreground);
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: opacity 0.2s;
        }
        .dn-input button:hover:not(:disabled) {
          opacity: 0.9;
        }
        .dn-input button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        @media (max-width: 420px) {
          #dev-nova-chat {
            right: 12px;
            left: 12px;
            width: auto;
          }
          .dn-body {
            height: 360px;
          }
        }
      `}</style>
    </div>
  );
}

