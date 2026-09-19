import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, Navigate, useNavigate } from "react-router-dom";
import ActionMenu from "../../components/ui/ActionMenu";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import DataTable from "../../components/ui/DataTable";
import GlassPanel, { PageIntro } from "../../components/ui/GlassPanel";
import StatusBadge from "../../components/ui/StatusBadge";
import { ghostBtn, primaryBtn } from "../../components/ui/formStyles";
import {
  deleteMaterialRequest,
  saveMaterialRequest,
  setMaterialRequests,
  updateMaterialStatus,
} from "../../store/workflowSlice";
import { hasPrivilege } from "../../constants/privileges";
import { actionsFor, isEditableStatus, materialRequestHref, stageStatuses } from "../../features/workflow/workflow";
import { api } from "../../services/api";

export default function MaterialFlow({
  moduleKey,
  title,
  kicker,
  allowCreate = false,
  showPayment = false,
}) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const privileges = useSelector((state) => state.auth.privileges);
  const roleKey = useSelector((state) => state.auth.role?.key || state.auth.user?.role);
  const currentUser = useSelector((state) => state.auth.user);
  const rows = useSelector((state) => state.workflow.materialRequests);
  const canCreate = allowCreate && hasPrivilege(privileges, moduleKey, "create");
  const canEdit = hasPrivilege(privileges, moduleKey, "edit");
  const canDelete = hasPrivilege(privileges, moduleKey, "delete");
  const [pending, setPending] = useState(null);
  const [error, setError] = useState("");

  const statuses = stageStatuses[moduleKey];
  const scopedRows =
    roleKey === "user"
      ? rows.filter(
          (item) =>
            item.requestedById === currentUser?.id ||
            (!item.requestedById && item.requestedBy === currentUser?.name)
        )
      : rows;
  const data = statuses ? scopedRows.filter((item) => statuses.includes(item.status)) : scopedRows;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const response = await api.get("/material-requests");
        if (cancelled) return;
        dispatch(setMaterialRequests(response.materialRequests || []));
      } catch {
        if (roleKey === "user") dispatch(setMaterialRequests([]));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [dispatch, roleKey]);

  const columns = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "MR No.",
        cell: (info) => (
          <Link
            to={materialRequestHref(info.getValue())}
            className="text-brand-teal hover:underline"
          >
            {info.getValue()}
          </Link>
        ),
      },
      { accessorKey: "project", header: "Project / Department" },
      { accessorKey: "requestedBy", header: "Requested By" },
      { accessorKey: "quantity", header: "Products" },
      {
        accessorKey: "status",
        header: "Status",
        cell: (info) => <StatusBadge value={info.getValue()} />,
      },
      ...(showPayment
        ? [
            {
              accessorKey: "paymentStatus",
              header: "Payment",
              cell: (info) => <StatusBadge value={info.getValue()} />,
            },
          ]
        : []),
      { accessorKey: "date", header: "Date" },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const record = row.original;
          const actions = actionsFor(roleKey, record.status);
          return (
            <ActionMenu
              items={[
                {
                  label: "View details",
                  onClick: () => navigate(materialRequestHref(record.id)),
                },
                canEdit && isEditableStatus(record.status)
                  ? {
                      label: "Edit",
                      tone: "edit",
                      onClick: () => navigate(`/material-requests/${record.id}/edit`),
                    }
                  : null,
                ...actions.map((action) => ({
                  label: action.label,
                  tone: action.tone,
                  onClick: () => setPending({ record, action }),
                })),
                canDelete || (roleKey === "user" && isEditableStatus(record.status))
                  ? {
                      label: "Delete",
                      tone: "delete",
                      onClick: () =>
                        setPending({
                          record,
                          action: { label: "Delete", type: "delete", tone: "delete" },
                        }),
                    }
                  : null,
              ]}
            />
          );
        },
      },
    ],
    [canDelete, canEdit, navigate, roleKey, showPayment]
  );

  if (!hasPrivilege(privileges, moduleKey, "view")) {
    return <Navigate to={roleKey === "user" ? "/material-requests" : "/"} replace />;
  }

  return (
    <div className="flex min-h-[calc(100vh-6.5rem)] flex-col gap-4">
      <PageIntro kicker={kicker} title={title} />

      {canCreate ? (
        <GlassPanel className="flex flex-wrap items-center justify-between gap-3 p-5">
          <div>
            <h2 className="text-lg font-semibold">New material request</h2>
            <p className="mt-1 text-sm text-white/55">
              Open the form to add products row by row. MR number is generated automatically.
            </p>
          </div>
          <button
            type="button"
            className={primaryBtn}
            onClick={() => navigate("/material-requests/new")}
          >
            Create MR
          </button>
        </GlassPanel>
      ) : null}

      <GlassPanel className="flex min-h-0 flex-1 flex-col p-5">
        <div className="mb-4 flex shrink-0 items-center justify-between gap-3">
          <p className="text-sm text-white/50">{data.length} records in this stage</p>
          {canCreate ? (
            <button
              type="button"
              className={ghostBtn}
              onClick={() => navigate("/material-requests/new")}
            >
              Open form
            </button>
          ) : null}
        </div>
        {error ? <p className="mb-3 shrink-0 text-sm text-red-200">{error}</p> : null}
        <div className="min-h-0 flex-1">
          <DataTable
            columns={columns}
            data={data}
            searchPlaceholder="Filter material requests"
            pageSize={12}
            fillHeight
            onRowClick={(record) => navigate(materialRequestHref(record.id))}
          />
        </div>
      </GlassPanel>

      <ConfirmDialog
        open={Boolean(pending)}
        title={pending?.action?.label || "Confirm"}
        message={
          pending?.action?.type === "delete"
            ? `Delete ${pending?.record?.id}?`
            : `Move ${pending?.record?.id} to ${pending?.action?.status}?`
        }
        confirmLabel={pending?.action?.label || "Confirm"}
        danger={pending?.action?.tone === "reject" || pending?.action?.type === "delete"}
        onCancel={() => setPending(null)}
        onConfirm={async () => {
          try {
            if (pending.action.type === "delete") {
              await api.del(`/material-requests/${pending.record.id}`);
              dispatch(deleteMaterialRequest(pending.record.id));
            } else {
              const response = await api.put(`/material-requests/${pending.record.id}`, {
                status: pending.action.status,
              });
              dispatch(saveMaterialRequest(response.materialRequest));
              dispatch(
                updateMaterialStatus({ id: pending.record.id, status: pending.action.status })
              );
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
