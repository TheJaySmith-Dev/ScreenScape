
import React from 'react';

interface VisionResultProps {
  text: string;
}

// Simple markdown parser to convert [text](url) to <a> tags
const parseMarkdownLinks = (text: string): (string | JSX.Element)[] => {
  const regex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // Push the text before the link
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    // Push the link element
    const [, linkText, url] = match;
    parts.push(
      <a
        href={url}
        key={url + match.index}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-400 hover:text-blue-300 underline"
      >
        {linkText}
      </a>
    );
    lastIndex = regex.lastIndex;
  }

  // Push the remaining text after the last link
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts;
};


export const VisionResult: React.FC<VisionResultProps> = ({ text }) => {
  const lines = text.split('\n');

  return (
    <div className="mt-4 text-sm text-gray-300 space-y-2 prose prose-invert prose-a:text-blue-400 hover:prose-a:text-blue-300">
      {lines.map((line, index) => {
        if (line.trim().startsWith('*')) {
            return (
                <p key={index} className="!my-1 pl-4 relative">
                    <span className="absolute left-0 top-1.5 text-blue-400">&bull;</span>
                    <strong>{parseMarkdownLinks(line.replace(/^\*\s*\*\*(.*?)\*\*:/, '$1:') + ' ')}</strong>
                    {parseMarkdownLinks(line.replace(/^\*\s*\*\*(.*?)\*\*:?/, ''))}
                </p>
            );
        }
        return <p key={index} className="!my-1">{parseMarkdownLinks(line)}</p>;
      })}
    </div>
  );
};
