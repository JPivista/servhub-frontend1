import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import GlassPanel, { PageIntro } from "../../components/ui/GlassPanel";
import { approveBtn, fieldClass, ghostBtn } from "../../components/ui/formStyles";
import { hasPrivilege } from "../../constants/privileges";
import { api } from "../../services/api";
import { saveMaterialRequest } from "../../store/workflowSlice";
import { isEditableStatus } from "../../features/workflow/workflow";

const emptyProduct = () => ({ name: "", quantity: "", unit: "", amount: "" });

export default function MaterialRequestFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const privileges = useSelector((state) => state.auth.privileges);
  const existing = useSelector((state) =>
    state.workflow.materialRequests.find((item) => item.id === id)
  );
  const canCreate = hasPrivilege(privileges, "material_requests", "create");
  const canEdit = hasPrivilege(privileges, "material_requests", "edit");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    project: "",
    justification: "",
    products: [emptyProduct()],
    status: "Draft",
  });

  useEffect(() => {
    if (!isEdit) return;
    if (existing) {
      setForm({
        project: existing.project || "",
        justification: existing.justification || "",
        status: existing.status || "Draft",
        products: existing.products?.length
          ? existing.products.map((item) => ({
              name: item.name || "",
              quantity: item.quantity || "",
              unit: item.unit || "",
              amount: item.amount ?? "",
            }))
          : [emptyProduct()],
      });
      return;
    }
    (async () => {
      try {
        const response = await api.get("/material-requests");
        const match = (response.materialRequests || []).find((item) => item.id === id);
        if (!match) return;
        dispatch(saveMaterialRequest(match));
        setForm({
          project: match.project || "",
          justification: match.justification || "",
          status: match.status || "Draft",
          products: match.products?.length
            ? match.products.map((item) => ({
                name: item.name || "",
                quantity: item.quantity || "",
                unit: item.unit || "",
                amount: item.amount ?? "",
              }))
            : [emptyProduct()],
        });
      } catch (err) {
        setError(err.message);
      }
    })();
  }, [dispatch, existing, id, isEdit]);

  if (isEdit && !canEdit) return <Navigate to="/material-requests" replace />;
  if (!isEdit && !canCreate) return <Navigate to="/material-requests" replace />;
  if (isEdit && existing && !isEditableStatus(existing.status)) {
    return <Navigate to={`/material-requests/${id}`} replace />;
  }

  const updateProduct = (index, key, value) => {
    setForm((prev) => {
      const products = [...prev.products];
      products[index] = { ...products[index], [key]: value };
      return { ...prev, products };
    });
  };

  const saveRequest = async (status) => {
    setError("");
    setLoading(true);
    const products = form.products
      .filter((item) => item.name && item.quantity)
      .map((item) => ({
        name: item.name,
        quantity: String(item.quantity),
        unit: item.unit || "",
        amount: Number(item.amount) || 0,
      }));
    if (!products.length) {
      setError("Add at least one product row");
      setLoading(false);
      return;
    }
    try {
      const payload = {
        project: form.project,
        justification: form.justification,
        products,
        status,
      };
      const response = isEdit
        ? await api.put(`/material-requests/${id}`, payload)
        : await api.post("/material-requests", payload);
      dispatch(saveMaterialRequest(response.materialRequest));
      navigate("/material-requests");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const onSaveDraft = async (event) => {
    event.preventDefault();
    await saveRequest("Draft");
  };

  return (
    <div className="space-y-5">
      <PageIntro
        kicker="Request"
        title={isEdit ? `Edit ${id}` : "New Material Request Form"}
      />
      <GlassPanel as="article" className="p-5 sm:p-6">
        {error ? <p className="mb-4 text-sm text-red-200">{error}</p> : null}
        <form className="space-y-5" onSubmit={onSaveDraft}>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-sm text-white/70">MR No.</span>
              <input
                className={fieldClass}
                value={isEdit ? id : "Will be generated automatically"}
                disabled
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm text-white/70">Project / Department</span>
              <input
                className={fieldClass}
                value={form.project}
                onChange={(e) => setForm({ ...form, project: e.target.value })}
                placeholder="e.g. Office renovation"
                required
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm text-white/70">Justification</span>
              <input
                className={fieldClass}
                value={form.justification}
                onChange={(e) => setForm({ ...form, justification: e.target.value })}
                placeholder="Why is this needed?"
                required
              />
            </label>
          </div>

          <div className="space-y-3 rounded-[22px] border border-white/10 bg-white/5 p-4">
            <div>
              <p className="text-sm font-semibold">Products</p>
              <p className="text-xs text-white/50">Use + to add a row and − to remove one</p>
            </div>

            <div className="hidden gap-2 text-[11px] uppercase tracking-[0.14em] text-white/45 sm:grid sm:grid-cols-12">
              <span className="sm:col-span-4">Product</span>
              <span className="sm:col-span-2">Qty</span>
              <span className="sm:col-span-2">Unit</span>
              <span className="sm:col-span-2">Amount</span>
              <span className="sm:col-span-2 text-center">Actions</span>
            </div>

            {form.products.map((product, index) => (
              <div key={`product-${index}`} className="grid gap-2 sm:grid-cols-12 sm:items-center">
                <input
                  className={`${fieldClass} sm:col-span-4`}
                  placeholder="Product name"
                  value={product.name}
                  onChange={(e) => updateProduct(index, "name", e.target.value)}
                  required
                />
                <input
                  className={`${fieldClass} sm:col-span-2`}
                  placeholder="Qty"
                  value={product.quantity}
                  onChange={(e) => updateProduct(index, "quantity", e.target.value)}
                  required
                />
                <input
                  className={`${fieldClass} sm:col-span-2`}
                  placeholder="Unit"
                  value={product.unit}
                  onChange={(e) => updateProduct(index, "unit", e.target.value)}
                />
                <input
                  type="number"
                  className={`${fieldClass} sm:col-span-2`}
                  placeholder="Amount"
                  value={product.amount}
                  onChange={(e) => updateProduct(index, "amount", e.target.value)}
                />
                <div className="flex items-center justify-center gap-2 sm:col-span-2">
                  <button
                    type="button"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-teal text-lg font-semibold text-white shadow-[0_6px_16px_rgba(4,167,147,0.35)] hover:bg-brand-teal-dark disabled:cursor-not-allowed disabled:opacity-40"
                    onClick={() => {
                      const products = [...form.products];
                      products.splice(index + 1, 0, emptyProduct());
                      setForm({ ...form, products });
                    }}
                    aria-label="Add product row"
                    title="Add row"
                  >
                    +
                  </button>
                  <button
                    type="button"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-red-500 text-lg font-semibold text-white shadow-[0_6px_16px_rgba(239,68,68,0.35)] hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                    onClick={() =>
                      setForm({
                        ...form,
                        products: form.products.filter((_, itemIndex) => itemIndex !== index),
                      })
                    }
                    disabled={form.products.length <= 1}
                    aria-label="Remove product row"
                    title="Remove row"
                  >
                    −
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <button type="submit" className={ghostBtn} disabled={loading}>
              {loading ? "Saving..." : "Save as draft"}
            </button>
            <button
              type="button"
              className={approveBtn}
              disabled={loading}
              onClick={() => saveRequest("Requested")}
            >
              {loading ? "Sending..." : "Send request"}
            </button>
            <button
              type="button"
              className={ghostBtn}
              onClick={() => navigate("/material-requests")}
            >
              Cancel
            </button>
          </div>
        </form>
      </GlassPanel>
    </div>
  );
}
