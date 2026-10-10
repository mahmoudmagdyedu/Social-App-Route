// React بتعمل escape للنص؛ بنلوّن الـ mentions من غير dangerouslySetInnerHTML.
const RichText = ({ text }: { text: string }) => (
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
export default RichText;
