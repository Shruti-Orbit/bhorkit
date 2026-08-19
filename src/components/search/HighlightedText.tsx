type HighlightedTextProps = {
  text: string;
  ranges: [number, number][];
};

export function HighlightedText({ text, ranges }: HighlightedTextProps) {
  if (ranges.length === 0) {
    return <>{text}</>;
  }

  const sorted = [...ranges].sort((a, b) => a[0] - b[0]);
  const segments: { value: string; matched: boolean }[] = [];
  let cursor = 0;

  for (const [start, end] of sorted) {
    if (start > cursor) segments.push({ value: text.slice(cursor, start), matched: false });
    segments.push({ value: text.slice(Math.max(start, cursor), end), matched: true });
    cursor = Math.max(cursor, end);
  }
  if (cursor < text.length) segments.push({ value: text.slice(cursor), matched: false });

  return (
    <>
      {segments.map((segment, index) =>
        segment.matched ? (
          <mark key={index} className="bg-transparent font-bhor-bold text-bhor-primary">
            {segment.value}
          </mark>
        ) : (
          <span key={index}>{segment.value}</span>
        ),
      )}
    </>
  );
}
