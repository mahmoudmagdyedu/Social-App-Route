import { Link, NavLink } from "react-router";
import { useAuth } from "../context/AuthContext";
import Brand from "../components/Brand";
import Avatar from "../components/Avatar";
import Icon from "../components/Icon";
const Nav = ({ unread }: { unread: number }) => {
  const { user } = useAuth();
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <Brand />
        <Link to="/discover" className="nav-search">
          <Icon name="search" />
          <span>اكتشف ناس وحكايات جديدة</span>
          <span className="search-hint">استكشف</span>
        </Link>
        <div className="flex items-center gap-3">
          <NavLink
            to="/notifications"
            className="icon-btn notification-btn"
            aria-label={`الإشعارات، ${unread} غير مقروءة`}
          >
            <Icon name="bell" />
            {unread > 0 && (
              <span className="notification-badge">
                {unread > 99 ? "99+" : unread}
              </span>
            )}
          </NavLink>
          <span className="nav-divider" />
          <Link to="/profile" className="flex items-center gap-2">
            <Avatar user={user} size="sm" />
            <span className="text-sm font-bold hidden sm:block max-w-28 truncate">
              {user?.name}
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
};
export default Nav;
