import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import GlassPanel, { PageIntro } from "../../components/ui/GlassPanel";
import { fieldClass, primaryBtn } from "../../components/ui/formStyles";
import { saveUser } from "../../store/directorySlice";
import { syncCurrentUser } from "../../store/authSlice";
import { hasPrivilege } from "../../constants/privileges";

export default function Profile() {
  const dispatch = useDispatch();
  const privileges = useSelector((state) => state.auth.privileges);
  const authUser = useSelector((state) => state.auth.user);
  const users = useSelector((state) => state.directory.users);
  const match = users.find((item) => item.id === authUser?.id);
  const canEdit = hasPrivilege(privileges, "profile", "edit");
  const [form, setForm] = useState(null);

  if (!hasPrivilege(privileges, "profile", "view") || !match) {
    return <Navigate to="/" replace />;
  }

  const current = form || match;

  const onSave = (event) => {
    event.preventDefault();
    if (!canEdit) return;
    dispatch(saveUser({ ...match, ...current }));
    dispatch(syncCurrentUser());
    setForm(null);
  };

  return (
    <div className="space-y-5">
      <PageIntro kicker="Account" title="Profile" />
      <GlassPanel as="article" className="p-6">
        <form className="grid max-w-xl gap-3" onSubmit={onSave}>
          <label className="block">
            <span className="mb-1.5 block text-sm text-white/70">Name</span>
            <input
              className={fieldClass}
              value={current.name}
              disabled={!canEdit}
              onChange={(e) => setForm({ ...current, name: e.target.value })}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm text-white/70">Email</span>
            <input
              type="email"
              className={fieldClass}
              value={current.email}
              disabled={!canEdit}
              onChange={(e) => setForm({ ...current, email: e.target.value })}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm text-white/70">Password</span>
            <input
              className={fieldClass}
              value={current.password}
              disabled={!canEdit}
              onChange={(e) => setForm({ ...current, password: e.target.value })}
            />
          </label>
          {canEdit ? (
            <button type="submit" className={primaryBtn}>
              Save profile
            </button>
          ) : null}
        </form>
      </GlassPanel>
    </div>
  );
}
