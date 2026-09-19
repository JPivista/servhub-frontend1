import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import GlassPanel, { PageIntro } from "../../components/ui/GlassPanel";
import { fieldClass, primaryBtn } from "../../components/ui/formStyles";
import { icons } from "../../components/icons";
import { api } from "../../services/api";
import { syncCurrentUser } from "../../store/authSlice";
import { saveSettings } from "../../store/directorySlice";
import { hasPrivilege } from "../../constants/privileges";

const THEMES = [
  { id: "day", label: "Day", icon: "sun" },
  { id: "night", label: "Night", icon: "moon" },
  { id: "system", label: "System", icon: "system" },
];

export default function Settings() {
  const dispatch = useDispatch();
  const privileges = useSelector((state) => state.auth.privileges);
  const roleKey = useSelector((state) => state.auth.role?.key);
  const user = useSelector((state) => state.auth.user);
  const settings = useSelector((state) => state.directory.settings);
  const canEditSettings = hasPrivilege(privileges, "settings", "edit") || roleKey === "user";
  const isUser = roleKey === "user";
  const [orgName, setOrgName] = useState(settings.orgName);
  const [theme, setTheme] = useState(settings.theme || "day");
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setOrgName(settings.orgName);
    setTheme(settings.theme || "day");
  }, [settings.orgName, settings.theme]);

  if (!hasPrivilege(privileges, "settings", "view") && roleKey !== "user") {
    return <Navigate to="/" replace />;
  }

  const savePassword = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("New passwords do not match");
      return;
    }
    try {
      await api.put("/users/me/password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setMessage("Password updated");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-5">
      <PageIntro kicker="Account" title="Settings" />
      {message ? <p className="text-sm text-brand-teal">{message}</p> : null}
      {error ? <p className="text-sm text-red-200">{error}</p> : null}

      <GlassPanel as="article" className="p-6">
        <h2 className="text-lg font-semibold">Profile</h2>
        <p className="mt-1 text-sm text-white/50">Name and email are managed by your admin.</p>
        <div className="mt-4 grid max-w-xl gap-3">
          <div>
            <p className="mb-1.5 text-sm text-white/70">Name</p>
            <p className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium">
              {user?.name || "—"}
            </p>
          </div>
          <div>
            <p className="mb-1.5 text-sm text-white/70">Email</p>
            <p className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium">
              {user?.email || "—"}
            </p>
          </div>
        </div>
      </GlassPanel>

      <GlassPanel as="article" className="p-6">
        <h2 className="text-lg font-semibold">Change password</h2>
        <form className="mt-4 grid max-w-xl gap-3" onSubmit={savePassword}>
          <label className="block">
            <span className="mb-1.5 block text-sm text-white/70">Current password</span>
            <input
              type="password"
              className={fieldClass}
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              required
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm text-white/70">New password</span>
            <input
              type="password"
              className={fieldClass}
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              required
              minLength={6}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm text-white/70">Confirm new password</span>
            <input
              type="password"
              className={fieldClass}
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              required
              minLength={6}
            />
          </label>
          <div>
            <button type="submit" className={primaryBtn}>
              Update password
            </button>
          </div>
        </form>
      </GlassPanel>

      <GlassPanel as="article" className="p-6">
        <h2 className="text-lg font-semibold">Appearance</h2>
        <p className="mt-1 text-sm text-white/50">Choose Day, Night, or follow your system setting.</p>
        <div className="mt-4 inline-flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-white/5 p-1">
          {THEMES.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition ${
                theme === item.id
                  ? "bg-brand-blue text-white shadow-[0_6px_16px_rgba(4,114,223,0.35)]"
                  : "text-white/70 hover:bg-white/10"
              }`}
              onClick={() => {
                setTheme(item.id);
                dispatch(saveSettings({ theme: item.id }));
                setMessage("Theme updated");
                setError("");
              }}
            >
              <span className="inline-flex h-5 w-5 items-center justify-center">{icons[item.icon]}</span>
              {item.label}
            </button>
          ))}
        </div>
      </GlassPanel>

      {!isUser ? (
        <GlassPanel as="article" className="p-6">
          <h2 className="text-lg font-semibold">Organization</h2>
          <form
            className="mt-4 max-w-xl space-y-3"
            onSubmit={(event) => {
              event.preventDefault();
              if (!canEditSettings) return;
              dispatch(saveSettings({ orgName }));
              setMessage("Organization saved");
              setError("");
            }}
          >
            <label className="block">
              <span className="mb-1.5 block text-sm text-white/70">Name</span>
              <input
                className={fieldClass}
                value={orgName}
                disabled={!canEditSettings}
                onChange={(e) => setOrgName(e.target.value)}
              />
            </label>
            {canEditSettings ? (
              <button type="submit" className={primaryBtn}>
                Save
              </button>
            ) : null}
          </form>
        </GlassPanel>
      ) : null}
    </div>
  );
}
