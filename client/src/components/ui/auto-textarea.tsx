import * as React from "react"
import { cn } from "@/lib/utils"

interface AutoTextareaProps extends React.ComponentProps<"textarea"> {
  maxHeight?: number;
}

const AutoTextarea = React.forwardRef<HTMLTextAreaElement, AutoTextareaProps>(
  ({ className, maxHeight = 120, ...props }, ref) => {
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);
    
    // Combine refs
    React.useImperativeHandle(ref, () => textareaRef.current!);

    const adjustHeight = React.useCallback(() => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = 'auto';
      
      // Calculate new height based on content
      const newHeight = Math.min(textarea.scrollHeight, maxHeight);
      textarea.style.height = `${newHeight}px`;
      
      // Add scrollbar if content exceeds max height
      if (textarea.scrollHeight > maxHeight) {
        textarea.style.overflowY = 'auto';
      } else {
        textarea.style.overflowY = 'hidden';
      }
    }, [maxHeight]);

    // Adjust height on value change
    React.useEffect(() => {
      adjustHeight();
    }, [props.value, adjustHeight]);

    // Handle input event for real-time adjustment
    const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
      adjustHeight();
      if (props.onInput) {
        props.onInput(e);
      }
    };

    return (
      <textarea
        {...props}
        ref={textareaRef}
        onInput={handleInput}
        className={cn(
          "flex w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm resize-none transition-all duration-200",
          className
        )}
        style={{
          height: '44px', // Default height as requested
          overflowY: 'hidden',
          ...props.style,
        }}
      />
    );
  }
);

AutoTextarea.displayName = "AutoTextarea";

export { AutoTextarea };