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
  // Handle bold text **text**
  let processedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Handle italic text *text*
  processedText = processedText.replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  // Split into paragraphs
  const paragraphs = processedText.split('\n\n').filter(p => p.trim());
  
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
                  {parseMarkdownLinks(item.replace(/^[•\-]\s*/, ''))}
                </li>
              ))}
            </ul>
          );
        } else {
          return (
            <p key={index} className="text-gray-700 text-sm leading-relaxed">
              {parseMarkdownLinks(paragraph)}
            </p>
          );
        }
      })}
    </div>
  );
}