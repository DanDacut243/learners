import { Outlet, useNavigate } from "react-router";
import { StudentSidebar } from "../../components/student/StudentSidebar";
import { Topbar } from "../../components/shared/Topbar";
import { AIChatbot } from "../../components/shared/AIChatbot";
import { useAuth } from "../../context/AuthContext";
import { useEffect } from "react";

export default function StudentLayout() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && (!user || user.role !== "student")) {
      navigate("/login", { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  if (!user || user.role !== "student") return null;

  return (
    <>
      <StudentSidebar />
      <Topbar />
      <main className="ml-64 pt-24 min-h-screen px-8 pb-12">
        <Outlet />
      </main>
      <AIChatbot />
    </>
  );
}
