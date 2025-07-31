// Utility to convert markdown-style links to clickable JSX elements
export function parseMarkdownLinks(text: string): JSX.Element {
  // Regex to find markdown links [text](url)
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const parts: (string | JSX.Element)[] = [];
  let lastIndex = 0;
  let match;

  while ((match = linkRegex.exec(text)) !== null) {
    // Add text before the link
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    
    // Add the clickable link
    const linkText = match[1];
    const url = match[2];
    parts.push(
      <a
        key={match.index}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary hover:text-indigo-700 underline hover:no-underline transition-colors"
      >
        {linkText}
      </a>
    );
    
    lastIndex = linkRegex.lastIndex;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return <>{parts}</>;
}

// Utility to convert markdown text formatting
export function parseMarkdownText(text: string): JSX.Element {
  // Function to recursively parse text with formatting
  const parseFormattedText = (content: string): (string | JSX.Element)[] => {
    const parts: (string | JSX.Element)[] = [];
    let lastIndex = 0;
    
    // Combined regex for bold, italic, links, and timestamps
    const formatRegex = /(\*\*(.*?)\*\*|\*(.*?)\*|\[([^\]]+)\]\(([^)]+)\)|<strong>(.*?)<\/strong>|<em>(.*?)<\/em>|\[(\d{1,2}:\d{2})\])/g;
    let match;
    
    while ((match = formatRegex.exec(content)) !== null) {
      // Add text before the match
      if (match.index > lastIndex) {
        parts.push(content.slice(lastIndex, match.index));
      }
      
      const fullMatch = match[0];
      
      if (fullMatch.startsWith('**') && fullMatch.endsWith('**')) {
        // Bold markdown **text**
        parts.push(<strong key={match.index} className="font-semibold">{match[2]}</strong>);
      } else if (fullMatch.startsWith('*') && fullMatch.endsWith('*') && !fullMatch.startsWith('**')) {
        // Italic markdown *text*
        parts.push(<em key={match.index} className="italic">{match[3]}</em>);
      } else if (fullMatch.startsWith('[') && fullMatch.includes('](')) {
        // Markdown link [text](url)
        const linkText = match[4];
        const url = match[5];
        parts.push(
          <a
            key={match.index}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-indigo-700 underline hover:no-underline transition-colors"
          >
            {linkText}
          </a>
        );
      } else if (fullMatch.startsWith('<strong>')) {
        // HTML strong tag
        parts.push(<strong key={match.index} className="font-semibold">{match[6]}</strong>);
      } else if (fullMatch.startsWith('<em>')) {
        // HTML em tag
        parts.push(<em key={match.index} className="italic">{match[7]}</em>);
      } else if (fullMatch.startsWith('[') && fullMatch.endsWith(']') && /^\[\d{1,2}:\d{2}\]$/.test(fullMatch)) {
        // Timestamp [MM:SS]
        const timestamp = match[8];
        parts.push(
          <button
            key={match.index}
            className="inline-flex items-center text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition-colors ml-1 mr-1"
            onClick={() => console.log(`Jump to ${timestamp}`)}
          >
            <svg className="w-2 h-2 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
            {timestamp}
          </button>
        );
      }
      
      lastIndex = formatRegex.lastIndex;
    }
    
    // Add remaining text
    if (lastIndex < content.length) {
      parts.push(content.slice(lastIndex));
    }
    
    return parts;
  };
  
  // Split into paragraphs
  const paragraphs = text.split('\n\n').filter(p => p.trim());
  
  return (
    <div className="space-y-3">
      {paragraphs.map((paragraph, index) => {
        // Check if it's a bullet point
        if (paragraph.trim().startsWith('•') || paragraph.trim().startsWith('-')) {
          const items = paragraph.split('\n').filter(item => item.trim());
          return (
            <ul key={index} className="list-disc list-inside space-y-1 text-gray-700">
              {items.map((item, itemIndex) => (
                <li key={itemIndex} className="text-sm leading-relaxed">
                  {parseFormattedText(item.replace(/^[•\-]\s*/, ''))}
                </li>
              ))}
            </ul>
          );
        } else {
          return (
            <p key={index} className="text-gray-700 text-sm leading-relaxed">
              {parseFormattedText(paragraph)}
            </p>
          );
        }
      })}
    </div>
  );
}