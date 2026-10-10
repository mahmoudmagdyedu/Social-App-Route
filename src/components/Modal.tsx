import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import Icon from "./Icon";
function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    const previous = document.activeElement as HTMLElement | null;
    dialog?.showModal();
    return () => {
      dialog?.close();
      previous?.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className="modal"
      aria-labelledby="modal-title"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <header className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
        <h2 id="modal-title" className="font-bold text-lg">
          {title}
        </h2>
        <button className="icon-btn" aria-label="إغلاق" onClick={onClose}>
          <Icon name="close" />
        </button>
      </header>
      <div className="p-6">{children}</div>
    </dialog>
  );
}
export default Modal;
