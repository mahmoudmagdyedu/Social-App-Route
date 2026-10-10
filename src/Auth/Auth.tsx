import { signUp, signIn } from "../API/API";
import { useState } from "react";
import type { FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { errorMessage } from "../API/API";
import { signinSchema, signupSchema } from "../services/validation";
import type { SignupValues } from "../types";
import Brand from "../components/Brand";
import Icon from "../components/Icon";

function Auth({ signup = false }: { signup?: boolean }) {
  const { user, setSession, error: sessionError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [values, setValues] = useState<SignupValues & { login: string }>({
    name: "",
    username: "",
    email: "",
    dateOfBirth: "",
    gender: "male",
    password: "",
    rePassword: "",
    login: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  if (user) return <Navigate to="/" replace />;
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setApiError("");
    const result = (signup ? signupSchema : signinSchema).safeParse(values);
    if (!result.success) {
      const next: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        next[String(issue.path[0])] = issue.message;
      });
      setErrors(next);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      const response = signup
        ? await signUp(values)
        : await signIn(values.login.trim(), values.password);
      setSession(response.data);
      toast.success(
        signup ? "حسابك جاهز. أهلاً بيك!" : "حمد الله على السلامة! 👋"
      );
      const from = location.state?.from;
      navigate(
        typeof from === "string" &&
          from.startsWith("/") &&
          !from.startsWith("//")
          ? from
          : "/",
        { replace: true }
      );
    } catch (err) {
      setApiError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };
  const field = (
    name: keyof typeof values,
    label: string,
    type = "text",
    placeholder = "",
    autoComplete = "off"
  ) => (
    <div className="field" key={name}>
      <label htmlFor={name}>{label}</label>
      <div className="relative">
        <input
          id={name}
          name={name}
          type={type}
          value={values[name]}
          autoComplete={autoComplete}
          placeholder={placeholder}
          max={
            type === "date" ? new Date().toISOString().slice(0, 10) : undefined
          }
          dir="ltr"
          aria-invalid={Boolean(errors[name])}
          aria-describedby={errors[name] ? `${name}-error` : undefined}
          onChange={(e) =>
            setValues((prev) => ({ ...prev, [name]: e.target.value }))
          }
        />
      </div>
      {errors[name] && (
        <p className="field-error" id={`${name}-error`}>
          {errors[name]}
        </p>
      )}
    </div>
  );
  return (
    <div className="auth-page">
      <header className="auth-header">
        <Brand />
        <span className="text-sm text-slate-500">
          مساحة للتواصل، على طبيعتك.
        </span>
      </header>
      <main className={`auth-grid ${signup ? "auth-register" : ""}`}>
        <section className="auth-story">
          <span className="eyebrow">
            <span className="size-2 rounded-full bg-blue-500" /> كل حكاية تستاهل
            تتشارك
          </span>
          <h1>
            ناس شبهك.
            <br />
            حكايات <span>تقرّبنا.</span>
          </h1>
          <p className="auth-description">
            فكرة جديدة، صورة من يومك، أو مجرد كلمة حلوة.
            <br className="hidden sm:block" /> شارك اللي بتحبه، وخليك قريب من
            الناس اللي تهمك.
          </p>
          <div className="story-art" aria-hidden="true">
            <div className="art-orbit orbit-one" />
            <div className="art-orbit orbit-two" />
            <div className="art-note note-one">
              <span className="art-icon">
                <Icon name="heart" />
              </span>
              <span>
                حكايتك بتفرق
                <span className="block text-xs text-slate-400 mt-1">
                  شارك لحظاتك، بطريقتك
                </span>
              </span>
              <span className="art-dots">•••</span>
            </div>
            <div className="art-note note-two">
              <span className="art-icon teal">
                <Icon name="users" />
              </span>
              <span>
                قرّب المسافات
                <span className="block text-xs text-slate-400 mt-1">
                  تواصل يبدأ بفكرة
                </span>
              </span>
            </div>
            <div className="floating-symbol">
              <Icon name="spark" className="size-8" />
            </div>
            <div className="art-caption">
              <span className="size-2 bg-emerald-400 rounded-full" /> مساحة لكل
              الأصوات
            </div>
          </div>
          <div className="auth-benefits">
            <span>
              <Icon name="globe" /> اكتشف جديد
            </span>
            <span>
              <Icon name="comment" /> ابدأ حوار
            </span>
            <span>
              <Icon name="bookmark" /> احفظ اللي تحبه
            </span>
          </div>
        </section>
        <section className="auth-card">
          <nav className="auth-tabs" aria-label="الحساب">
            <Link className={!signup ? "active" : ""} to="/login">
              تسجيل الدخول
            </Link>
            <Link className={signup ? "active" : ""} to="/signup">
              حساب جديد
            </Link>
          </nav>
          <div className="mt-8 mb-7">
            <span className="text-2xl">{signup}</span>
            <h2 className="text-2xl font-bold mt-3">
              {signup ? "حكايتك تبدأ هنا" : "أهلاً بيك من جديد"}
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              {signup
                ? "خطوة بسيطة، وعالم من الحكايات مستنيك."
                : "سجّل دخولك وشوف إيه الجديد في دايرتك."}
            </p>
          </div>
          {(apiError || sessionError) && (
            <p className="alert-error mb-5" role="alert">
              {apiError || sessionError}
            </p>
          )}
          <form dir="ltr" onSubmit={handleSubmit} noValidate className="space-y-4 text-left">
            {signup ? (
              <>
                <div className="grid sm:grid-cols-2 gap-4">
                  {field(
                    "name",
                    "الاسم بالكامل",
                    "text",
                    "اسمك الجميل",
                    "name"
                  )}
                  {field(
                    "username",
                    "اسم المستخدم",
                    "text",
                    "your_username",
                    "username"
                  )}
                </div>
                {field(
                  "email",
                  "البريد الإلكتروني",
                  "email",
                  "you@example.com",
                  "email"
                )}
                <div className="grid sm:grid-cols-2 gap-4">
                  {field("dateOfBirth", "تاريخ الميلاد", "date")}
                  <div className="field">
                    <label htmlFor="gender">النوع</label>
                    <select
                      id="gender"
                      value={values.gender}
                      onChange={(e) =>
                        setValues((prev) => ({
                          ...prev,
                          gender: e.target.value as "male" | "female",
                        }))
                      }
                    >
                      <option value="male">ذكر</option>
                      <option value="female">أنثى</option>
                    </select>
                  </div>
                </div>
              </>
            ) : (
              field(
                "login",
                "البريد الإلكتروني أو اسم المستخدم",
                "text",
                "you@example.com",
                "username"
              )
            )}
            {field(
              "password",
              "كلمة السر",
              "password",
              "••••••••",
              signup ? "new-password" : "current-password"
            )}
            {signup && (
              <>
                {field(
                  "rePassword",
                  "تأكيد كلمة السر",
                  "password",
                  "••••••••",
                  "new-password"
                )}
                <p className="text-xs text-slate-500">
                  8 حروف على الأقل، حرف كبير وصغير ورقم ورمز.
                </p>
              </>
            )}
            <button
              className="btn-primary w-full justify-center !py-3.5"
              disabled={loading}
            >
              {loading ? "لحظة واحدة..." : signup ? "إنشاء حسابي" : "يلا نبدأ"}
              <Icon name="arrow" />
            </button>
          </form>
          <p className="text-center text-sm text-slate-500 mt-6">
            {signup ? "عندك حساب بالفعل؟" : "لسه جديد معانا؟"}{" "}
            <Link
              className="font-bold text-blue-800"
              to={signup ? "/login" : "/signup"}
            >
              {signup ? "سجّل دخولك" : "اعمل حساب"}
            </Link>
          </p>
          <div className="auth-footer">
            <Icon name="lock" className="size-3.5" />
            <span>بياناتك بتتبعت باتصال آمن ومشفّر</span>
          </div>
        </section>
      </main>
      <footer className="auth-bottom">
        Social · فكرة تجمعنا، وحكاية تقرّبنا <span>صُنع بشغف، للتواصل.</span>
      </footer>
    </div>
  );
}
export default Auth;
