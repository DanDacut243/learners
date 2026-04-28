import { Outlet, useNavigate } from "react-router";
import { AdminSidebar } from "../../components/admin/AdminSidebar";
import { Topbar } from "../../components/shared/Topbar";
import { useAuth } from "../../context/AuthContext";
import { useEffect } from "react";

export default function AdminLayout() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      navigate("/login", { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  if (!user || user.role !== "admin") return null;

  return (
    <>
      <AdminSidebar />
      <Topbar />
      <main className="ml-64 pt-24 min-h-screen px-8 pb-12">
        <Outlet />
      </main>
    </>
  );
}
