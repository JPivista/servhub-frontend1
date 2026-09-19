import { createSlice } from "@reduxjs/toolkit";
import { loadJson, saveJson } from "../services/storage";

const STORAGE_KEY = "servhub_workflow_v2";

function load() {
  return loadJson(STORAGE_KEY);
}

const saved = load();

function persist(state) {
  saveJson(STORAGE_KEY, {
    materialRequests: state.materialRequests,
    suppliers: state.suppliers,
  });
}

function withPayment(record, status) {
  if (status === "Ordered" || status === "PO Issued") {
    return { ...record, status, paymentStatus: "Open", supplier: record.supplier || "OfficeMart" };
  }
  if (status === "Delivered" || status === "Closed") {
    return { ...record, status, paymentStatus: "Released" };
  }
  return { ...record, status };
}

const workflowSlice = createSlice({
  name: "workflow",
  initialState: {
    materialRequests: saved?.materialRequests || [],
    suppliers: saved?.suppliers || [],
  },
  reducers: {
    setMaterialRequests(state, action) {
      state.materialRequests = Array.isArray(action.payload) ? action.payload : [];
      persist(state);
    },
    saveMaterialRequest(state, action) {
      const record = action.payload;
      const index = state.materialRequests.findIndex((item) => item.id === record.id);
      if (index >= 0) state.materialRequests[index] = record;
      else state.materialRequests.unshift(record);
      persist(state);
    },
    updateMaterialStatus(state, action) {
      const { id, status } = action.payload;
      const index = state.materialRequests.findIndex((item) => item.id === id);
      if (index < 0) return;
      state.materialRequests[index] = withPayment(state.materialRequests[index], status);
      persist(state);
    },
    deleteMaterialRequest(state, action) {
      state.materialRequests = state.materialRequests.filter((item) => item.id !== action.payload);
      persist(state);
    },
    saveSupplier(state, action) {
      const record = action.payload;
      const index = state.suppliers.findIndex((item) => item.id === record.id);
      if (index >= 0) state.suppliers[index] = record;
      else state.suppliers.push(record);
      persist(state);
    },
  },
});

export const {
  setMaterialRequests,
  saveMaterialRequest,
  updateMaterialStatus,
  deleteMaterialRequest,
  saveSupplier,
} = workflowSlice.actions;
export default workflowSlice.reducer;
