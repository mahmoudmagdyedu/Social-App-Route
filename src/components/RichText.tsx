function RichText({ text }: { text: string }) {
  return (
  <p className="post-text" dir="auto">
    {text.split(/(@[a-zA-Z0-9_]+)/g).map((part, i) =>
      part.startsWith("@") ? (
        <span className="mention" key={i}>
          {part}
        </span>
      ) : (
        part
      )
    )}
  </p>
);
}
export default RichText;
