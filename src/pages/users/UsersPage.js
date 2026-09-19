import { useSelector } from "react-redux";
import { Navigate, useSearchParams } from "react-router-dom";
import UserManager from "../../features/users/UserManager";
import { PageIntro } from "../../components/ui/GlassPanel";
import { hasPrivilege } from "../../constants/privileges";

const titles = {
  admin: "Admins",
  user: "Users",
};

export default function Users() {
  const [params] = useSearchParams();
  const role = params.get("role");
  const privileges = useSelector((state) => state.auth.privileges);
  if (!hasPrivilege(privileges, "users", "view")) return <Navigate to="/" replace />;

  const roleKeys = role ? [role] : ["admin", "user"];
  const title = titles[role] || "Users";

  return (
    <div className="space-y-5">
      <PageIntro kicker="Directory" title={title}>
        {!role ? (
          <p className="mt-1 text-sm text-white/55">Admins and all users in one place.</p>
        ) : null}
      </PageIntro>
      <UserManager title={title} roleKeys={roleKeys} />
    </div>
  );
}
