// Utility to convert markdown-style links to clickable JSX elements
export function parseMarkdownLinks(text: string): JSX.Element {
  // Handle null or undefined text
  if (!text || typeof text !== "string") {
    return <>{""}</>;
  }
  
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

// Utility to clean and sanitize text before parsing
function cleanText(text: string): string {
  if (!text || typeof text !== "string") return "";

  // Remove any malformed JSON artifacts
  let cleaned = text.replace(/^\{|\}$/g, ""); // Remove leading/trailing braces
  cleaned = cleaned.replace(/^"answer":\s*"|"$|\\"/g, ""); // Remove JSON property syntax and escaped quotes
  cleaned = cleaned.replace(/\\n/g, "\n"); // Convert escaped newlines to actual newlines
  cleaned = cleaned.replace(/\\t/g, "\t"); // Convert escaped tabs to actual tabs
  cleaned = cleaned.replace(/\\\\/g, "\\"); // Fix double-escaped backslashes

  return cleaned.trim();
}

// Utility to convert markdown text formatting
export function parseMarkdownText(
  text: string,
  onTimestampClick?: (timestamp: string) => void,
): JSX.Element {
  // Clean the input text first
  const cleanedText = cleanText(text);

  // Function to recursively parse text with formatting
  const parseFormattedText = (content: string): (string | JSX.Element)[] => {
    const parts: (string | JSX.Element)[] = [];
    let lastIndex = 0;

    // Combined regex for bold, italic, links, and timestamps (including ranges and inline format)
    const formatRegex =
      /(\*\*(.*?)\*\*|\*(.*?)\*|\[([^\]]+)\]\(([^)]+)\)|<strong>(.*?)<\/strong>|<em>(.*?)<\/em>|\[([\d:,-\s]+)\]|\(Timestamp:\s*([\d:]+)\)|\(([\d:]+)\))/g;
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
          <strong key={match.index} className="font-bold text-foreground">
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
          <strong key={match.index} className="font-bold text-foreground">
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
        // Timestamp [MM:SS] or range [MM:SS - MM:SS] - REMOVED
        // Skip rendering these - they will be removed from the UI
        parts.push("");
      } else if (fullMatch.startsWith("(Timestamp:")) {
        // Inline timestamp (Timestamp: XX:XX)
        const timestamp = match[9];
        parts.push(
          <button
            key={match.index}
            className="text-primary hover:text-primary/80 underline hover:no-underline transition-colors cursor-pointer inline"
            onClick={() => {
              console.log(`Jump to ${timestamp}`);
              if (onTimestampClick) {
                onTimestampClick(timestamp);
              }
            }}
          >
            ({timestamp})
          </button>,
        );
      } else if (
        fullMatch.startsWith("(") &&
        fullMatch.endsWith(")") &&
        /^\([\d:]+\)$/.test(fullMatch)
      ) {
        // Simple inline timestamp (XX:XX)
        const timestamp = match[10];
        parts.push(
          <button
            key={match.index}
            className="text-primary hover:text-primary/80 underline hover:no-underline transition-colors cursor-pointer inline"
            onClick={() => {
              console.log(`Jump to ${timestamp}`);
              if (onTimestampClick) {
                onTimestampClick(timestamp);
              }
            }}
          >
            ({timestamp})
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

  // Split content into lines and group them properly
  const lines = cleanedText.split("\n").filter((line) => line.trim());
  const elements: JSX.Element[] = [];
  let currentBulletGroup: string[] = [];

  const flushBulletGroup = () => {
    if (currentBulletGroup.length > 0) {
      elements.push(
        <ul
          key={elements.length}
          className="list-none space-y-2 text-foreground mb-3"
        >
          {currentBulletGroup.map((item, itemIndex) => (
            <li
              key={itemIndex}
              className="text-[15px] leading-relaxed flex items-start"
            >
              <span className="text-primary mr-2 mt-0.5 font-bold">•</span>
              <div className="flex-1">
                {parseFormattedText(item.replace(/^[•\-]\s*/, ""))}
              </div>
            </li>
          ))}
        </ul>,
      );
      currentBulletGroup = [];
    }
  };

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();

    if (trimmedLine.startsWith("•") || trimmedLine.startsWith("- ")) {
      // This is a bullet point - add to current group
      currentBulletGroup.push(trimmedLine);
    } else if (trimmedLine.startsWith("**") && trimmedLine.includes(":**")) {
      // This is a section header - flush bullets first, then add header
      flushBulletGroup();
      elements.push(
        <div
          key={elements.length}
          className="text-[15px] leading-relaxed text-foreground mb-2"
        >
          {parseFormattedText(trimmedLine)}
        </div>,
      );
    } else if (trimmedLine) {
      // This is regular text - flush bullets first, then add paragraph
      flushBulletGroup();

      // Check if this is a continuation of previous content or standalone
      const isShortLine = trimmedLine.length < 100;
      const hasFormattingMarks =
        trimmedLine.includes("**") ||
        trimmedLine.includes("[") ||
        trimmedLine.includes("](");

      elements.push(
        <p
          key={elements.length}
          className="text-foreground text-[15px] mt-[16px] mb-[16px]"
        >
          {parseFormattedText(trimmedLine)}
        </p>,
      );
    }
  });

  // Flush any remaining bullets
  flushBulletGroup();

  return <div className="space-y-1">{elements}</div>;
}
