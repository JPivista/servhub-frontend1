import { WORKFLOW_ROLE_OPTIONS } from "../workflow/workflow";

export function assignableRoles(actorRole) {
  if (actorRole === "super_admin") {
    return WORKFLOW_ROLE_OPTIONS;
  }
  if (actorRole === "admin") {
    return WORKFLOW_ROLE_OPTIONS.filter((item) => item.key === "requestor" || item.key === "admin");
  }
  return [];
}

export function usersListHref(role) {
  if (role) return `/users?role=${encodeURIComponent(role)}`;
  return "/users";
}

/** Always return to the full users list. */
export function usersHomeHref() {
  return "/users";
}

export function userCreateHref(role) {
  return role ? `/users/new?role=${encodeURIComponent(role)}` : "/users/new";
}

export function userEditHref(id) {
  return `/users/${encodeURIComponent(id)}/edit`;
}
