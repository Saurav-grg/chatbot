'use client';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
// import { cn } from '@/lib/utils';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy } from 'lucide-react';
import toast from 'react-hot-toast';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="markdown-renderer py-2 px-4 bg-black">
      <ReactMarkdown
        components={{
          h1: ({ ...props }) => (
            <h1
              className="text-2xl font-semibold mt-6 mb-4 text-white"
              {...props}
            />
          ),
          h2: ({ ...props }) => (
            <h2 className="text-2xl font-semibold mt-6 mb-3 text" {...props} />
          ),
          h3: ({ ...props }) => (
            <h3 className="text-xl font-semibold mt-5 mb-2 text" {...props} />
          ),
          h4: ({ ...props }) => (
            <h4 className="text-lg font-semibold mt-4 mb-2 text" {...props} />
          ),
          p: ({ ...props }) => (
            <p className="my-4 text-gray-200 leading-relaxed" {...props} />
          ),
          a: ({ ...props }) => (
            <a
              className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            />
          ),
          ul: ({ ...props }) => (
            <ul className="my-4 ml-6 list-disc text-gray-200" {...props} />
          ),
          ol: ({ ...props }) => (
            <ol className="my-4 ml-6 list-decimal text-gray-200" {...props} />
          ),
          li: ({ ...props }) => <li className="my-1" {...props} />,
          blockquote: ({ ...props }) => (
            <blockquote
              className="border-l-4 border-gray-200 pl-4 py-1 my-4 text-gray-600 italic"
              {...props}
            />
          ),
          code({ inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');

            return !inline && match ? (
              <div className="my-4 rounded-lg overflow-hidden">
                <div className="bg-gray-100 px-4 py-2 text-sm font-mono border-b border-gray-200 flex items-center justify-between">
                  <div>{match[1]}</div>
                  <button
                    className="flex items-center gap-1 text-gray-600 hover:text-gray-800 hover:bg-white px-2 py-1 rounded"
                    onClick={() => {
                      navigator.clipboard.writeText(String(children));
                      toast.success('Copied to clipboard!');
                    }}
                  >
                    <Copy className="h-5" />
                    <span> copy</span>
                  </button>
                </div>
                <SyntaxHighlighter
                  language={match[1]}
                  style={oneLight}
                  customStyle={{
                    margin: 0,
                    borderRadius: '0 0 0.5rem 0.5rem',
                    padding: '1rem',
                  }}
                  {...props}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              </div>
            ) : (
              <code
                className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono text-gray-800"
                {...props}
              >
                {children}
              </code>
            );
          },
          pre({ ...props }) {
            return <div {...props} />;
          },
          strong: ({ ...props }) => (
            <strong className="font-semibold text" {...props} />
          ),
          em: ({ ...props }) => (
            <em className="italic text-white font-serif" {...props} />
          ),
          hr: ({ ...props }) => (
            <hr className="my-6 border-gray-200" {...props} />
          ),
          table: ({ ...props }) => (
            <div className="overflow-x-auto my-6">
              <table
                className="min-w-full divide-y divide-gray-200"
                {...props}
              />
            </div>
          ),
          thead: ({ ...props }) => <thead className="bg-gray-50" {...props} />,
          tbody: ({ ...props }) => (
            <tbody className="divide-y divide-gray-200" {...props} />
          ),
          tr: ({ ...props }) => <tr className="hover:bg-gray-50" {...props} />,
          th: ({ ...props }) => (
            <th
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              {...props}
            />
          ),
          td: ({ ...props }) => (
            <td
              className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
              {...props}
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
