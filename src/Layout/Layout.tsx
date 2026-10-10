import { getSuggestedUsers, getUnreadCount } from "../API/API";
import { useCallback, useEffect, useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import useCollection from "../hooks/useCollection";
import Nav from "../Nav/Nav";
import Avatar from "../components/Avatar";
import Icon from "../components/Icon";
import type { IconName } from "../components/Icon";
import UserCard from "../components/UserCard";
const links: { path: string; label: string; icon: IconName }[] = [
  { path: "/", label: "الرئيسية", icon: "home" },
  { path: "/discover", label: "اكتشف ناس جديدة", icon: "users" },
  { path: "/bookmarks", label: "المحفوظات", icon: "bookmark" },
  { path: "/notifications", label: "الإشعارات", icon: "bell" },
  { path: "/profile", label: "الملف الشخصي", icon: "users" },
  { path: "/settings", label: "الإعدادات", icon: "settings" },
];
function Layout() {
  const { user, logout } = useAuth();
  const [unread, setUnread] = useState(0);
  const loader = useCallback(
    (page: number, signal: AbortSignal) =>
      getSuggestedUsers(page, signal),
    []
  );
  const suggestions = useCollection(loader);
  useEffect(() => {
    const controller = new AbortController();
    const updateCount = () =>
      getUnreadCount(controller.signal)
        .then((result) => setUnread(result.data.unreadCount))
        .catch(() => {});
    updateCount();
    const timer = window.setInterval(updateCount, 60000);
    window.addEventListener("notifications-changed", updateCount);
    return () => {
      controller.abort();
      clearInterval(timer);
      window.removeEventListener("notifications-changed", updateCount);
    };
  }, []);
  return (
    <>
      <Nav unread={unread} />
      <div className="app-grid">
        <aside className="sidebar">
          <Link to="/profile" className="card sidebar-profile">
            <Avatar user={user} />
            <h2 className="font-bold mt-3 truncate">{user?.name}</h2>
            <p className="text-xs text-slate-400 mt-1" dir="ltr">
              @{user?.username}
            </p>
            <div className="profile-mini-stats">
              <span>
                <strong>{user?.followersCount || 0}</strong> متابع
              </span>
              <span>
                <strong>{user?.followingCount || 0}</strong> بتتابعهم
              </span>
            </div>
          </Link>
          <nav className="sidebar-nav" aria-label="التنقل الرئيسي">
            {links.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.path === "/"}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? "active" : ""}`
                }
              >
                <Icon name={link.icon} />
                <span>{link.label}</span>
                {link.path === "/notifications" && unread > 0 && (
                  <span className="side-count">{unread}</span>
                )}
              </NavLink>
            ))}
          </nav>
          <button className="sidebar-link logout-link" onClick={logout}>
            <Icon name="logout" />
            تسجيل الخروج
          </button>
          <div className="sidebar-foot">
            Social · مساحة تجمعنا<span>صُنع بشغف للتواصل.</span>
          </div>
        </aside>
        <main className="main-column" id="main-content">
          <Outlet />
        </main>
        <aside className="right-column">
          <section className="card p-5">
            <header className="flex justify-between items-center mb-5">
              <h2 className="font-bold text-sm">وسّع دايرتك</h2>
              <Icon name="users" className="text-slate-400 size-4" />
            </header>
            <p className="text-xs text-slate-400 mb-4">
              يمكن الحكاية الجاية تبدأ بمتابعة.
            </p>
            {suggestions.loading ? (
              <p className="text-sm text-slate-400 py-3">
                بنجهّز اقتراحات ليك...
              </p>
            ) : suggestions.error ? (
              <button
                className="text-sm text-blue-800"
                onClick={suggestions.refresh}
              >
                إعادة تحميل الاقتراحات
              </button>
            ) : (
              suggestions.items
                .slice(0, 4)
                .map((u) => <UserCard key={u._id} user={u} compact />)
            )}
            <Link to="/discover" className="see-more">
              اكتشف المزيد <Icon name="arrow" className="size-4" />
            </Link>
          </section>
          <section className="community-note">
            <span className="note-badge">
              <Icon name="spark" />
            </span>
            <h2>خليك على طبيعتك.</h2>
            <p>
              مش لازم تكون الحكاية كبيرة.
              <br />
              أحياناً أبسط لحظة بتصنع أحلى تواصل.
            </p>
            <span className="community-signature">حكايتك ليها مكان هنا ↗</span>
          </section>
          <p className="text-xs text-slate-400 px-3 leading-7">
            تواصل باحترام · شارك بشغف
            <br />© {new Date().getFullYear()} Social
          </p>
        </aside>
      </div>
      <nav className="mobile-nav" aria-label="التنقل على الموبايل">
        {links
          .filter((l) => l.path !== "/settings")
          .map((l) => (
            <NavLink
              key={l.path}
              to={l.path}
              end={l.path === "/"}
              aria-label={l.label}
            >
              <Icon name={l.icon} />
              <span>
                {l.path === "/discover"
                  ? "اكتشف"
                  : l.path === "/profile"
                    ? "حسابي"
                    : l.label}
              </span>
            </NavLink>
          ))}
      </nav>
    </>
  );
}
export default Layout;
