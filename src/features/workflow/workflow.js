import { approveBtn, deleteBtn, editBtn, rejectBtn } from "../../components/ui/formStyles";

export const roleActions = {
  user: {
    Draft: [{ label: "Send", status: "Requested", tone: "edit" }],
    Returned: [{ label: "Send", status: "Requested", tone: "edit" }],
  },
  requester: {
    Draft: [{ label: "Send", status: "Requested", tone: "edit" }],
    Returned: [{ label: "Send", status: "Requested", tone: "edit" }],
  },
  manager: {
    Requested: [
      { label: "Approve", status: "Approved", tone: "approve" },
      { label: "Return", status: "Returned", tone: "reject" },
      { label: "Reject", status: "Rejected", tone: "reject" },
    ],
    "Pending Approval": [
      { label: "Approve", status: "Approved", tone: "approve" },
      { label: "Return", status: "Returned", tone: "reject" },
      { label: "Reject", status: "Rejected", tone: "reject" },
    ],
  },
  procurement: {
    Approved: [
      { label: "Start sourcing", status: "Sourcing", tone: "edit" },
    ],
    Sourcing: [
      { label: "Issue RFQ", status: "Sourcing", tone: "edit" },
      { label: "Create PO", status: "Ordered", tone: "approve" },
    ],
    "In Procurement": [{ label: "Create PO", status: "Ordered", tone: "approve" }],
    "RFQ Issued": [{ label: "Create PO", status: "Ordered", tone: "approve" }],
  },
  department_head: {
    Approved: [
      { label: "Approve commercial", status: "Sourcing", tone: "approve" },
      { label: "Return", status: "Returned", tone: "reject" },
    ],
  },
  finance: {
    Sourcing: [
      { label: "Approve budget", status: "Ordered", tone: "approve" },
      { label: "Return", status: "Returned", tone: "reject" },
    ],
  },
  supplier: {
    Ordered: [
      { label: "Dispatch", status: "In transit", tone: "approve" },
      { label: "Reject PO", status: "Returned", tone: "reject" },
    ],
    "PO Issued": [
      { label: "Dispatch", status: "In transit", tone: "approve" },
    ],
    "In transit": [{ label: "Mark arriving", status: "Arriving", tone: "approve" }],
    "In Delivery": [{ label: "Mark arriving", status: "Arriving", tone: "approve" }],
  },
  in_charge: {
    Arriving: [
      { label: "Confirm delivery", status: "Delivered", tone: "approve" },
      { label: "Reject material", status: "Returned", tone: "reject" },
    ],
    "Pending Receipt": [
      { label: "Confirm delivery", status: "Delivered", tone: "approve" },
    ],
  },
  super_admin: {},
  admin: {},
};

export function actionsFor(role, status) {
  const map = roleActions[role] || {};
  const own = map[status] || [];
  if (role === "super_admin") {
    return Object.values(roleActions)
      .flatMap((group) => group[status] || [])
      .filter((item, index, list) => list.findIndex((row) => row.label === item.label) === index);
  }
  return own;
}

export function materialRequestHref(id) {
  return `/material-requests/${encodeURIComponent(id)}`;
}

export const actionClass = {
  edit: editBtn,
  approve: approveBtn,
  reject: rejectBtn,
  delete: deleteBtn,
};

export const stageStatuses = {
  material_requests: null,
  approvals: ["Requested", "Pending Approval", "Approved"],
  procurement: ["Approved", "Sourcing", "In Procurement", "RFQ Issued"],
  purchase_orders: ["Ordered", "PO Issued", "In transit"],
  deliveries: ["In transit", "Arriving", "Pending Receipt", "Delivered", "Closed"],
  payments: ["Ordered", "PO Issued", "In transit", "Arriving", "Delivered", "Closed"],
};

export function isEditableStatus(status) {
  return status === "Draft" || status === "Returned";
}
