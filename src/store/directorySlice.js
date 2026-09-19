import { createSlice } from "@reduxjs/toolkit";
import rolesJson from "../data/roles.json";
import privilegesJson from "../data/rolePrivileges.json";
import departmentsJson from "../data/departments.json";
import { defaultCollections } from "../features/records/records";
import { loadJson, saveJson } from "../services/storage";

const STORAGE_KEY = "servhub_directory_v5";
const defaultSettings = { orgName: "ServHub", theme: "day" };

function load() {
  return loadJson(STORAGE_KEY);
}

const saved = load();

function uniqueUsers(users) {
  const seen = new Set();
  return (users || []).filter((user) => {
    const key = String(user?.email || user?.id || "").toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function persist(state) {
  saveJson(STORAGE_KEY, {
    roles: state.roles,
    departments: state.departments,
    rolePrivileges: state.rolePrivileges,
    departmentPrivileges: state.departmentPrivileges,
    collections: state.collections,
    settings: state.settings,
  });
}

const directorySlice = createSlice({
  name: "directory",
  initialState: {
    users: [],
    roles: saved?.roles || rolesJson,
    departments: saved?.departments?.length ? saved.departments : departmentsJson,
    rolePrivileges: saved?.rolePrivileges || privilegesJson,
    departmentPrivileges: saved?.departmentPrivileges || {},
    collections: { ...defaultCollections, ...(saved?.collections || {}) },
    settings: { ...defaultSettings, ...(saved?.settings || {}) },
  },
  reducers: {
    setDirectory(state, action) {
      const { users, roles, rolePrivileges, departments, departmentPrivileges } = action.payload || {};
      if (Array.isArray(users)) state.users = uniqueUsers(users);
      if (roles) state.roles = roles;
      if (rolePrivileges) state.rolePrivileges = rolePrivileges;
      if (Array.isArray(departments)) state.departments = departments;
      if (departmentPrivileges) state.departmentPrivileges = departmentPrivileges;
      persist(state);
    },
    saveUser(state, action) {
      const user = action.payload;
      const index = state.users.findIndex((item) => item.id === user.id);
      if (index >= 0) state.users[index] = user;
      else state.users.push(user);
      state.users = uniqueUsers(state.users);
      persist(state);
    },
    deleteUser(state, action) {
      state.users = state.users.filter((item) => item.id !== action.payload);
      persist(state);
    },
    saveRole(state, action) {
      const { role, previousKey, privileges } = action.payload;
      const index = state.roles.findIndex((item) => item.id === role.id);
      if (index >= 0) {
        const oldKey = previousKey || state.roles[index].key;
        state.roles[index] = role;
        if (oldKey !== role.key) {
          state.rolePrivileges[role.key] =
            privileges || state.rolePrivileges[oldKey] || {};
          delete state.rolePrivileges[oldKey];
          state.users.forEach((user) => {
            if (user.role === oldKey) user.role = role.key;
          });
        } else if (privileges) {
          state.rolePrivileges[role.key] = privileges;
        }
      } else {
        state.roles.push(role);
        state.rolePrivileges[role.key] = privileges || { dashboard: ["view"] };
      }
      persist(state);
    },
    deleteRole(state, action) {
      const role = state.roles.find((item) => item.id === action.payload);
      if (!role) return;
      state.roles = state.roles.filter((item) => item.id !== role.id);
      delete state.rolePrivileges[role.key];
      persist(state);
    },
    saveRecord(state, action) {
      const { collection, record } = action.payload;
      if (!state.collections[collection]) state.collections[collection] = [];
      const list = state.collections[collection];
      const index = list.findIndex((item) => item.id === record.id);
      if (index >= 0) list[index] = record;
      else list.push(record);
      persist(state);
    },
    deleteRecord(state, action) {
      const { collection, id } = action.payload;
      if (!state.collections[collection]) return;
      state.collections[collection] = state.collections[collection].filter(
        (item) => item.id !== id
      );
      persist(state);
    },
    saveSettings(state, action) {
      state.settings = { ...state.settings, ...action.payload };
      persist(state);
    },
  },
});

export const {
  setDirectory,
  saveUser,
  deleteUser,
  saveRole,
  deleteRole,
  saveRecord,
  deleteRecord,
  saveSettings,
} = directorySlice.actions;
export default directorySlice.reducer;
