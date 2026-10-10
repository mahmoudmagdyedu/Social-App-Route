import { changePassword, uploadProfilePhoto } from "../API/API";
import { useRef, useState } from "react";
import type { FormEvent } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { errorMessage, validateImage } from "../API/API";
import { passwordSchema } from "../services/validation";
import Avatar from "../components/Avatar";
import Icon from "../components/Icon";
function Settings() {
  const { user, refreshUser, setSession, logout } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const upload = async (file: File) => {
    try {
      validateImage(file);
      setUploading(true);
      await uploadProfilePhoto(file);
      await refreshUser();
      toast.success("صورتك اتحدثت");
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setUploading(false);
    }
  };
  const handlePasswordChange = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    const validation = passwordSchema.safeParse(newPassword);
    if (!password) {
      setError("اكتب كلمة السر الحالية");
      return;
    }
    if (!validation.success) {
      setError(validation.error.issues[0].message);
      return;
    }
    if (newPassword !== confirm) {
      setError("كلمتا السر مش متطابقتين");
      return;
    }
    if (newPassword === password) {
      setError("اختار كلمة سر مختلفة عن الحالية");
      return;
    }
    setSaving(true);
    try {
      const result = await changePassword(password, newPassword);
      setSession({ token: result.data.token, user: result.data.user || user! });
      setPassword("");
      setNewPassword("");
      setConfirm("");
      toast.success("كلمة السر اتغيرت بنجاح");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };
  return (
    <>
      <header className="page-heading">
        <div>
          <span className="eyebrow">حسابك، بطريقتك</span>
          <h1>الإعدادات</h1>
          <p>اهتم بتفاصيلك، وخلي حسابك آمن.</p>
        </div>
        <span className="heading-icon">
          <Icon name="settings" />
        </span>
      </header>
      <section className="card p-6 mb-5">
        <h2 className="font-bold mb-5">صورتك الشخصية</h2>
        <div className="flex items-center gap-5 flex-wrap">
          <Avatar key={user?.photo} user={user} size="lg" />
          <div>
            <button
              className="btn-secondary"
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
            >
              <Icon name="image" />
              {uploading ? "جاري الرفع..." : "غيّر صورتك"}
            </button>
            <p className="text-xs text-slate-400 mt-3">
              JPG، PNG، WebP أو GIF · لحد 5 ميجابايت
            </p>
            <input
              ref={fileRef}
              className="sr-only"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              aria-label="رفع صورة شخصية"
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (file) upload(file);
              }}
            />
          </div>
        </div>
      </section>
      <section className="card p-6 mb-5">
        <h2 className="font-bold mb-5">بيانات الحساب</h2>
        <dl className="account-details">
          <dt>الاسم</dt>
          <dd>{user?.name}</dd>
          <dt>اسم المستخدم</dt>
          <dd dir="ltr">@{user?.username}</dd>
          <dt>البريد الإلكتروني</dt>
          <dd dir="ltr">{user?.email}</dd>
          <dt>تاريخ الميلاد</dt>
          <dd>
            {user?.dateOfBirth
              ? new Date(user.dateOfBirth).toLocaleDateString("ar-EG")
              : "—"}
          </dd>
        </dl>
      </section>
      <section className="card p-6">
        <h2 className="font-bold flex items-center gap-2 mb-2">
          <Icon name="lock" />
          تغيير كلمة السر
        </h2>
        <p className="text-xs text-slate-500 mb-6">
          اختار كلمة سر قوية ومختلفة، عشان حسابك يفضل آمن.
        </p>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          {error && (
            <p className="alert-error" role="alert">
              {error}
            </p>
          )}
          <div className="field">
            <label htmlFor="current-password">كلمة السر الحالية</label>
            <input
              id="current-password"
              type="password"
              autoComplete="current-password"
              dir="ltr"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="new-password">كلمة السر الجديدة</label>
            <input
              id="new-password"
              type="password"
              autoComplete="new-password"
              dir="ltr"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="confirm-password">تأكيد كلمة السر الجديدة</label>
            <input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              dir="ltr"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>
          <button className="btn-primary" disabled={saving}>
            {saving ? "جاري الحفظ..." : "حفظ كلمة السر"}
          </button>
        </form>
      </section>
      <button className="btn-secondary mt-5 text-red-600" onClick={logout}>
        <Icon name="logout" />
        تسجيل الخروج
      </button>
    </>
  );
}
export default Settings;
