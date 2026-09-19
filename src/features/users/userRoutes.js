export function assignableRoles(actorRole) {
  if (actorRole === "super_admin" || actorRole === "admin") {
    return [
      { key: "admin", name: "Admin" },
      { key: "user", name: "User" },
    ];
  }
  return [];
}

export function usersListHref(role) {
  if (role === "admin") return "/users?role=admin";
  if (role === "user") return "/users?role=user";
  return "/users";
}

/** Always return to the full users list (admins + users). */
export function usersHomeHref() {
  return "/users";
}

export function userCreateHref(role) {
  return role ? `/users/new?role=${encodeURIComponent(role)}` : "/users/new";
}

export function userEditHref(id) {
  return `/users/${encodeURIComponent(id)}/edit`;
}
