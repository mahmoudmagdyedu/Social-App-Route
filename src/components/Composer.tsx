import { createPost } from "../API/API";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import Avatar from "./Avatar";
import MediaForm from "./MediaForm";
function Composer({ onCreated }: { onCreated: () => void }) {
  const { user } = useAuth();
  const create = async (text: string, image?: File) => {
    await createPost(text, image);
    toast.success("حكايتك اتنشرت ✨");
    onCreated();
  };
  return (
    <section className="card composer">
      <div className="flex items-center gap-3 mb-4">
        <Avatar user={user} />
        <div>
          <h2 className="font-bold text-sm">شارك لحظة من يومك</h2>
          <p className="text-xs text-slate-400 mt-1">
            فيه دايماً حد مهتم يسمع حكايتك.
          </p>
        </div>
      </div>
      <MediaForm onSubmit={create} />
    </section>
  );
}
export default Composer;
