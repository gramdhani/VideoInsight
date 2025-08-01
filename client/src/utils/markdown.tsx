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
      </a>,
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
export function parseMarkdownText(
  text: string,
  onTimestampClick?: (timestamp: string) => void,
): JSX.Element {
  // Function to recursively parse text with formatting
  const parseFormattedText = (content: string): (string | JSX.Element)[] => {
    const parts: (string | JSX.Element)[] = [];
    let lastIndex = 0;

    // Combined regex for bold, italic, links, and timestamps (including ranges)
    const formatRegex =
      /(\*\*(.*?)\*\*|\*(.*?)\*|\[([^\]]+)\]\(([^)]+)\)|<strong>(.*?)<\/strong>|<em>(.*?)<\/em>|\[([\d:,-\s]+)\])/g;
    let match;

    while ((match = formatRegex.exec(content)) !== null) {
      // Add text before the match
      if (match.index > lastIndex) {
        parts.push(content.slice(lastIndex, match.index));
      }

      const fullMatch = match[0];

      if (fullMatch.startsWith("**") && fullMatch.endsWith("**")) {
        // Bold markdown **text**
        parts.push(
          <strong key={match.index} className="font-semibold">
            {match[2]}
          </strong>,
        );
      } else if (
        fullMatch.startsWith("*") &&
        fullMatch.endsWith("*") &&
        !fullMatch.startsWith("**")
      ) {
        // Italic markdown *text*
        parts.push(
          <em key={match.index} className="italic">
            {match[3]}
          </em>,
        );
      } else if (fullMatch.startsWith("[") && fullMatch.includes("](")) {
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
          </a>,
        );
      } else if (fullMatch.startsWith("<strong>")) {
        // HTML strong tag
        parts.push(
          <strong key={match.index} className="font-semibold">
            {match[6]}
          </strong>,
        );
      } else if (fullMatch.startsWith("<em>")) {
        // HTML em tag
        parts.push(
          <em key={match.index} className="italic">
            {match[7]}
          </em>,
        );
      } else if (
        fullMatch.startsWith("[") &&
        fullMatch.endsWith("]") &&
        /^\[[\d:,-\s]+\]$/.test(fullMatch)
      ) {
        // Timestamp [MM:SS] or range [MM:SS - MM:SS]
        const timestamp = match[8];
        // For ranges like "5:01 - 6:35", extract the first timestamp
        const firstTimestamp = timestamp.includes(" - ")
          ? timestamp.split(" - ")[0].trim()
          : timestamp;
        parts.push(
          <button
            key={match.index}
            className="inline-flex items-center text-xs font-medium bg-purple-200 text-purple-700 px-3 py-1 rounded-full hover:bg-purple-300 transition-colors ml-1 mr-1"
            style={{
              minHeight: "auto",
              paddingLeft: "8px",
              paddingRight: "8px",
            }}
            onClick={() => {
              console.log(`Jump to ${timestamp}`);
              if (onTimestampClick) {
                onTimestampClick(firstTimestamp);
              }
            }}
          >
            {timestamp}
          </button>,
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
  const paragraphs = text.split("\n\n").filter((p) => p.trim());

  return (
    <div className="space-y-3">
      {paragraphs.map((paragraph, index) => {
        // Check if it's a bullet point
        if (
          paragraph.trim().startsWith("•") ||
          paragraph.trim().startsWith("-")
        ) {
          const items = paragraph.split("\n").filter((item) => item.trim());
          return (
            <ul
              key={index}
              className="list-disc list-inside space-y-1 text-gray-700"
            >
              {items.map((item, itemIndex) => (
                <li key={itemIndex} className="text-sm leading-relaxed">
                  {parseFormattedText(item.replace(/^[•\-]\s*/, ""))}
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
