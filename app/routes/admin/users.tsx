// Admin Users Management
import { useState, useEffect } from "react";
import { useToast } from "../../components/shared/Toast";
import { usersApi } from "../../services/api";

export function meta() {
  return [{ title: "ERUDITE - Users Management" }];
}

interface UserRecord {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  login: string;
}

export default function Users() {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  // Password validation state
  const [passwordError, setPasswordError] = useState("");

  // Form state
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formRole, setFormRole] = useState("student");
  const [formPassword, setFormPassword] = useState("");
  const [formSubmitting, setFormSubmitting] = useState(false);

  function validatePassword(pwd: string) {
    const errors = [];
    if (pwd.length < 8) errors.push("At least 8 characters");
    if (!/[A-Z]/.test(pwd)) errors.push("One uppercase letter");
    if (!/[a-z]/.test(pwd)) errors.push("One lowercase letter");
    if (!/[0-9]/.test(pwd)) errors.push("One number");
    if (!/[@$!%*?&]/.test(pwd)) errors.push("One special character (@$!%*?&)");
    return errors;
  }

  function generatePassword() {
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const special = "@$!%*?&";
    
    let pwd = 
      uppercase[Math.floor(Math.random() * uppercase.length)] +
      lowercase[Math.floor(Math.random() * lowercase.length)] +
      numbers[Math.floor(Math.random() * numbers.length)] +
      special[Math.floor(Math.random() * special.length)];
    
    const remaining = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@$!%*?&";
    for (let i = 4; i < 12; i++) {
      pwd += remaining[Math.floor(Math.random() * remaining.length)];
    }
    
    return pwd.split('').sort(() => Math.random() - 0.5).join('');
  }

  // Fetch users on mount
  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      setLoading(true);
      const response = await usersApi.getAll();
      // Handle paginated response from API
      const usersData = Array.isArray(response.data) ? response.data : response.data.data || [];
      setUsers(
        usersData.map((u: any) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role.charAt(0).toUpperCase() + u.role.slice(1),
          status: "Active",
          login: "Recently",
        }))
      );
    } catch (err) {
      toast("Failed to load users", "error");
    } finally {
      setLoading(false);
    }
  }

  function openAdd() {
    setEditingUser(null);
    setFormName("");
    setFormEmail("");
    setFormRole("student");
    setFormPassword("");
    setPasswordError("");
    setModalOpen(true);
  }

  function openEdit(u: UserRecord) {
    setEditingUser(u);
    setFormName(u.name);
    setFormEmail(u.email);
    setFormRole(u.role.toLowerCase());
    setFormPassword("");
    setPasswordError("");
    setModalOpen(true);
  }

  async function handleSave() {
    if (!formName.trim() || !formEmail.trim()) {
      toast("Name and email are required", "error");
      return;
    }

    // Validate password for new users
    if (!editingUser) {
      if (!formPassword.trim()) {
        toast("Password is required for new users", "error");
        return;
      }
      const errors = validatePassword(formPassword);
      if (errors.length > 0) {
        toast(`Password must have: ${errors.join(", ")}`, "error");
        return;
      }
    }

    setFormSubmitting(true);
    try {
      if (editingUser) {
        await usersApi.update(editingUser.id, {
          name: formName,
          email: formEmail,
          role: formRole,
        });
        toast("User updated successfully");
      } else {
        await usersApi.create({
          name: formName,
          email: formEmail,
          password: formPassword,
          role: formRole,
        });
        toast("User added successfully");
      }
      setModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.response?.data?.errors?.password?.[0] || "Failed to save user";
      toast(errorMsg, "error");
    } finally {
      setFormSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    try {
      await usersApi.delete(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      setDeleteConfirm(null);
      toast("User removed", "error");
    } catch (err) {
      toast("Failed to delete user", "error");
    }
  }

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin">
          <span className="material-symbols-outlined text-4xl text-primary">hourglass_bottom</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-display-lg text-4xl font-extrabold text-primary tracking-tight mb-2">Users Management</h1>
          <p className="text-on-surface-variant font-body">Manage platform access, roles, and user details.</p>
        </div>
        <button
          onClick={openAdd}
          className="bg-primary text-white px-6 py-3 rounded-lg font-bold hover:bg-primary/90 transition-colors flex items-center gap-2 cursor-pointer"
        >
          <span className="material-symbols-outlined">person_add</span>
          Add New User
        </button>
      </div>

      {/* Search */}
      <div className="mb-6 relative max-w-md">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-surface-container-low border-none rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-secondary/20 outline-none"
          placeholder="Search users..."
        />
      </div>

      <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden border border-slate-100">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Name</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Role</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Email</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-primary">{user.name}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="bg-secondary-container text-on-secondary-container text-xs font-bold px-3 py-1 rounded-full">
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full bg-green-100 text-green-800`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-500">{user.email}</td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => openEdit(user)}
                    className="text-slate-400 hover:text-primary transition-colors p-2 cursor-pointer"
                    title="Edit User"
                  >
                    <span className="material-symbols-outlined text-sm">edit</span>
                  </button>
                  {deleteConfirm === user.id ? (
                    <span className="inline-flex items-center gap-1 ml-1">
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="text-xs font-bold text-error cursor-pointer"
                      >
                        Yes
                      </button>
                      <span className="text-slate-300">|</span>
                      <button onClick={() => setDeleteConfirm(null)} className="text-xs font-bold text-slate-500 cursor-pointer">
                        No
                      </button>
                    </span>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(user.id)}
                      className="text-slate-400 hover:text-error transition-colors p-2 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-medium">
                  No users match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-[90] flex items-center justify-center p-4"
          onClick={() => {
            setModalOpen(false);
            setPasswordError("");
          }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-primary mb-6">
              {editingUser ? "Edit User" : "Add New User"}
            </h2>
            <div className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-slate-600">Full Name</label>
                <input
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="bg-surface-container-low border-none rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-secondary/50"
                  placeholder="John Doe"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-slate-600">Email</label>
                <input
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  type="email"
                  className="bg-surface-container-low border-none rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-secondary/50"
                  placeholder="user@erudite.edu"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-slate-600">Role</label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value)}
                  className="bg-surface-container-low border-none rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-secondary/50 cursor-pointer"
                >
                  <option>student</option>
                  <option>instructor</option>
                  <option>admin</option>
                </select>
              </div>
              {!editingUser && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-bold text-slate-600">Temporary Password</label>
                  <div className="flex gap-2">
                    <input
                      value={formPassword}
                      onChange={(e) => setFormPassword(e.target.value)}
                      type="password"
                      placeholder="••••••••"
                      className="flex-1 bg-surface-container-low border-none rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-secondary/50"
                    />
                    <button
                      type="button"
                      onClick={() => setFormPassword(generatePassword())}
                      className="px-3 py-3 bg-secondary text-white text-xs font-bold rounded-lg hover:bg-secondary/90 transition-colors cursor-pointer whitespace-nowrap"
                      title="Generate strong password"
                    >
                      <span className="material-symbols-outlined text-sm">refresh</span>
                    </button>
                  </div>
                  
                  {/* Password requirements */}
                  {formPassword && (
                    <div className="mt-2 p-3 bg-slate-50 rounded-lg">
                      <p className="text-xs font-bold text-slate-600 mb-2">Password Requirements:</p>
                      <div className="space-y-1 text-xs">
                        {[
                          { req: "At least 8 characters", check: formPassword.length >= 8 },
                          { req: "One uppercase letter", check: /[A-Z]/.test(formPassword) },
                          { req: "One lowercase letter", check: /[a-z]/.test(formPassword) },
                          { req: "One number", check: /[0-9]/.test(formPassword) },
                          { req: "One special character (@$!%*?&)", check: /[@$!%*?&]/.test(formPassword) },
                        ].map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <span className={`material-symbols-outlined text-sm ${item.check ? "text-green-600" : "text-slate-300"}`}>
                              {item.check ? "check_circle" : "radio_button_unchecked"}
                            </span>
                            <span className={item.check ? "text-green-700 font-semibold" : "text-slate-500"}>{item.req}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <p className="text-xs text-slate-400">
                    Users will be required to change this upon first login.
                  </p>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => {
                  setModalOpen(false);
                  setPasswordError("");
                }}
                disabled={formSubmitting}
                className="px-6 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={formSubmitting}
                className="px-6 py-2.5 text-sm font-bold bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors cursor-pointer disabled:opacity-50"
              >
                {editingUser ? "Save Changes" : "Add User"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
