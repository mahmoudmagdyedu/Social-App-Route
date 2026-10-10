import {
  createBrowserRouter,
  Navigate,
  Outlet,
  RouterProvider,
  useLocation,
} from "react-router";
import { Toaster } from "react-hot-toast";
import AuthProvider from "./context/AuthProvider";
import { useAuth } from "./context/AuthContext";
import Layout from "./Layout/Layout";
import Auth from "./pages/Auth";
import Feed from "./pages/Feed";
import Profile from "./pages/Profile";
import PostDetails from "./pages/PostDetails";
import Discover from "./pages/Discover";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import { ErrorState, Skeleton } from "./components/Status";
const ProtectedRoute = () => {
  const { user, loading, error } = useAuth();
  const location = useLocation();
  if (loading)
    return (
      <div className="max-w-xl mx-auto py-16 px-4">
        <Skeleton />
      </div>
    );
  if (error && !user)
    return (
      <div className="max-w-xl mx-auto py-16 px-4">
        <ErrorState message={error} retry={() => window.location.reload()} />
        <a className="btn-secondary mt-4" href="/login">
          تسجيل الدخول
        </a>
      </div>
    );
  return user ? (
    <Outlet />
  ) : (
    <Navigate
      to="/login"
      replace
      state={{ from: location.pathname + location.search }}
    />
  );
};
const router = createBrowserRouter([
  { path: "/login", element: <Auth /> },
  { path: "/signup", element: <Auth signup /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <Layout />,
        children: [
          { path: "/", element: <Feed key="feed" /> },
          { path: "/bookmarks", element: <Feed key="bookmarks" bookmarks /> },
          { path: "/profile", element: <Profile /> },
          { path: "/users/:userId", element: <Profile /> },
          { path: "/posts/:postId", element: <PostDetails /> },
          { path: "/discover", element: <Discover /> },
          { path: "/notifications", element: <Notifications /> },
          { path: "/settings", element: <Settings /> },
          { path: "*", element: <NotFound /> },
        ],
      },
    ],
  },
]);
const App = () => (
  <AuthProvider>
    <RouterProvider router={router} />
    <Toaster
      position="bottom-center"
      toastOptions={{
        duration: 3500,
        style: {
          fontFamily: "inherit",
          borderRadius: "14px",
          fontSize: "14px",
        },
      }}
    />
  </AuthProvider>
);
export default App;
