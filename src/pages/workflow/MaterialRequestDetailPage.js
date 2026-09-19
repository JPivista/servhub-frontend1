import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import GlassPanel, { PageIntro } from "../../components/ui/GlassPanel";
import ProcessTracker from "../../features/workflow/ProcessTracker";
import StatusBadge from "../../components/ui/StatusBadge";
import { ghostBtn } from "../../components/ui/formStyles";
import {
  deleteMaterialRequest,
  saveMaterialRequest,
} from "../../store/workflowSlice";
import { hasPrivilege } from "../../constants/privileges";
import { actionClass, actionsFor, isEditableStatus } from "../../features/workflow/workflow";
import { api } from "../../services/api";

const fields = [
  { key: "id", label: "MR No." },
  { key: "project", label: "Project / Department" },
  { key: "requestedBy", label: "Requested by" },
  { key: "quantity", label: "Quantity" },
  { key: "justification", label: "Justification" },
  { key: "amount", label: "Amount" },
  { key: "supplier", label: "Supplier" },
  { key: "date", label: "Date" },
];

const modules = [
  "material_requests",
  "approvals",
  "procurement",
  "purchase_orders",
  "deliveries",
  "payments",
];

export default function MaterialRequestDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const privileges = useSelector((state) => state.auth.privileges);
  const roleKey = useSelector((state) => state.auth.role?.key || state.auth.user?.role);
  const currentUser = useSelector((state) => state.auth.user);
  const record = useSelector((state) =>
    state.workflow.materialRequests.find((item) => item.id === id)
  );
  const canView = modules.some((key) => hasPrivilege(privileges, key, "view"));
  const canEdit = modules.some((key) => hasPrivilege(privileges, key, "edit"));
  const canDelete = modules.some((key) => hasPrivilege(privileges, key, "delete"));
  const [pending, setPending] = useState(null);
  const [forbidden, setForbidden] = useState(false);
  const [loading, setLoading] = useState(!record);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const response = await api.get(`/material-requests/${id}`);
        if (cancelled) return;
        dispatch(saveMaterialRequest(response.materialRequest));
        setForbidden(false);
      } catch (err) {
        if (!cancelled) {
          setForbidden(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [dispatch, id]);

  if (!canView) return <Navigate to="/" replace />;
  if (forbidden || (roleKey === "user" && record && record.requestedById && record.requestedById !== currentUser?.id)) {
    return <Navigate to="/material-requests" replace />;
  }
  if (loading && !record) {
    return (
      <div className="space-y-5">
        <PageIntro kicker="Request" title="Material request" />
        <GlassPanel className="p-6">
          <p className="text-sm text-white/65">Loading request…</p>
        </GlassPanel>
      </div>
    );
  }
  if (!record) {
    return (
      <div className="space-y-5">
        <PageIntro kicker="Request" title="Material request" />
        <GlassPanel className="p-6">
          <p className="text-sm text-white/65">No requirement found for {id}.</p>
          <Link to="/material-requests" className={`${ghostBtn} mt-4 inline-block`}>
            Back to list
          </Link>
        </GlassPanel>
      </div>
    );
  }

  const actions = actionsFor(roleKey, record.status);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <PageIntro kicker="Requirement detail" title={record.id} />
        <Link to="/material-requests" className={ghostBtn}>
          Back to list
        </Link>
      </div>

      <GlassPanel className="p-6">
        <ProcessTracker status={record.status} />
      </GlassPanel>

      <GlassPanel className="p-6">
        {error ? <p className="mb-4 text-sm text-red-200">{error}</p> : null}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge value={record.status} />
            <StatusBadge value={record.paymentStatus} />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {canEdit && isEditableStatus(record.status) ? (
              <button
                type="button"
                className={actionClass.edit}
                onClick={() => navigate(`/material-requests/${record.id}/edit`)}
              >
                Edit
              </button>
            ) : null}
            {actions.map((action) => (
              <button
                key={action.label}
                type="button"
                className={actionClass[action.tone] || actionClass.edit}
                onClick={() => setPending({ action })}
              >
                {action.label}
              </button>
            ))}
            {canDelete ? (
              <button
                type="button"
                className={actionClass.delete}
                onClick={() =>
                  setPending({ action: { label: "Delete", type: "delete", tone: "delete" } })
                }
              >
                Delete
              </button>
            ) : null}
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {fields.map((field) => (
            <div key={field.key} className="rounded-2xl bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-white/45">{field.label}</p>
              <p className="mt-1 text-sm font-medium">
                {field.key === "amount"
                  ? Number(record.amount || 0).toLocaleString()
                  : record[field.key] || "—"}
              </p>
            </div>
          ))}
        </div>

        {record.products?.length ? (
          <div className="mt-5 overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="text-[11px] uppercase tracking-[0.16em] text-white/45">
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Qty</th>
                  <th className="px-4 py-3">Unit</th>
                  <th className="px-4 py-3">Amount</th>
                </tr>
              </thead>
              <tbody>
                {record.products.map((item, index) => (
                  <tr key={`${item.name}-${index}`} className="border-t border-white/8">
                    <td className="px-4 py-3">{item.name}</td>
                    <td className="px-4 py-3">{item.quantity}</td>
                    <td className="px-4 py-3">{item.unit || "—"}</td>
                    <td className="px-4 py-3">{Number(item.amount || 0).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

      </GlassPanel>

      <ConfirmDialog
        open={Boolean(pending)}
        title={pending?.action?.label || "Confirm"}
        message={
          pending?.action?.type === "delete"
            ? `Delete ${record.id}?`
            : `Move ${record.id} to ${pending?.action?.status}?`
        }
        confirmLabel={pending?.action?.label || "Confirm"}
        danger={pending?.action?.tone === "reject" || pending?.action?.type === "delete"}
        onCancel={() => setPending(null)}
        onConfirm={async () => {
          try {
            setError("");
            if (pending.action.type === "delete") {
              await api.del(`/material-requests/${record.id}`);
              dispatch(deleteMaterialRequest(record.id));
              navigate("/material-requests");
            } else {
              const response = await api.put(`/material-requests/${record.id}`, {
                status: pending.action.status,
              });
              dispatch(saveMaterialRequest(response.materialRequest));
            }
          } catch (err) {
            setError(err.message);
          }
          setPending(null);
        }}
      />
    </div>
  );
}
