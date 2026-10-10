import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import toast from "react-hot-toast";
import Icon from "./Icon";
import { errorMessage, validateImage } from "../API/API";
function MediaForm({
  initialText = "",
  existingImage,
  placeholder = "إيه الحكاية النهارده؟",
  label = "نشر",
  compact = false,
  onSubmit,
}: {
  initialText?: string;
  existingImage?: string;
  placeholder?: string;
  label?: string;
  compact?: boolean;
  onSubmit: (text: string, image?: File) => Promise<void>;
}) {
  const [text, setText] = useState(initialText);
  const [image, setImage] = useState<File>();
  const [preview, setPreview] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview);
    },
    [preview]
  );
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim() && !image && !existingImage) {
      setError("اكتب حاجة أو اختار صورة الأول.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await onSubmit(text.trim(), image);
      setText("");
      setImage(undefined);
      setPreview("");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };
  return (
    <form
      className={`media-form ${compact ? "compact" : ""}`}
      onSubmit={submit}
    >
      <textarea
        aria-label={placeholder}
        placeholder={placeholder}
        dir="auto"
        maxLength={5000}
        rows={compact ? 2 : 3}
        value={text}
        disabled={busy}
        onChange={(e) => setText(e.target.value)}
      />
      {(preview || existingImage) && (
        <div className="image-preview">
          <img src={preview || existingImage} alt="معاينة الصورة" />
          {preview && (
            <button
              type="button"
              className="icon-btn preview-close"
              aria-label="إزالة الصورة المختارة"
              onClick={() => {
                setImage(undefined);
                setPreview("");
              }}
            >
              <Icon name="close" />
            </button>
          )}
        </div>
      )}
      {error && (
        <p className="field-error mb-3" role="alert">
          {error}
        </p>
      )}
      <div className="media-form-actions">
        <input
          ref={fileRef}
          type="file"
          className="sr-only"
          accept="image/jpeg,image/png,image/webp,image/gif"
          aria-label="اختيار صورة"
          disabled={busy}
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (!file) return;
            try {
              validateImage(file);
              setImage(file);
              setPreview(URL.createObjectURL(file));
            } catch (err) {
              toast.error(errorMessage(err));
            }
          }}
        />
        <button
          className="image-picker"
          type="button"
          disabled={busy}
          onClick={() => fileRef.current?.click()}
        >
          <Icon name="image" />
          <span>{compact ? "صورة" : "أضف صورة"}</span>
        </button>
        {!compact && (
          <span className="text-xs text-slate-400 hidden sm:block">
            استخدم @username للإشارة لشخص
          </span>
        )}
        <button
          className="btn-primary !py-2.5"
          disabled={busy || (!text.trim() && !image && !existingImage)}
        >
          {busy ? "جاري الإرسال..." : label}
          <Icon name="send" className="size-4" />
        </button>
      </div>
    </form>
  );
}
export default MediaForm;
