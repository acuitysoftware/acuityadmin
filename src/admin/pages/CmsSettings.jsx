import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import { FiChevronDown, FiCopy, FiEdit2, FiEye, FiRefreshCw, FiSearch, FiTrash2, FiX } from "react-icons/fi";
import { GoPlus } from "react-icons/go";
import { BsGripVertical } from "react-icons/bs";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  changeCmsStatus,
  createCms,
  deleteCms,
  getCmsList,
  getCmsView,
  updateCms,
  updateCmsRank,
} from "../../api/cms/cms";
import CMSModal from "./components/CMSModal";
import ConfirmModal from "./components/ConfirmModal";

const getList = (response) => {
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response)) return response;
  return [];
};
const isActive = (status) => status === 1 || status === "1" || status === true;
const errorMessage = (error) => error?.response?.data?.message || error?.message || "Something went wrong";
const pageName = (item) => item.page_name || item.name || "Untitled page";
const pageUrl = (item) => item.page_url || item.slug || "";

export default function CmsSettings() {
  const [pages, setPages] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [view, setView] = useState(null);
  const latestRequest = useRef(0);
  const token = localStorage.getItem("admin_token");
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), useSensor(KeyboardSensor));

  const fetchPages = useCallback(async (keyword = "") => {
    const requestId = ++latestRequest.current;
    setLoading(true);
    try {
      const searchKeyword = keyword.trim();
      const response = await getCmsList(token, searchKeyword ? { search_keyword: searchKeyword } : {});
      if (requestId !== latestRequest.current) return;
      const list = getList(response);
      setPages(list);
      setTotalCount(Number.isFinite(Number(response?.total_count)) ? Number(response.total_count) : list.length);
      setSelected([]);
    } catch (error) {
      if (requestId === latestRequest.current) toast.error(errorMessage(error));
    } finally {
      if (requestId === latestRequest.current) setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    const timer = setTimeout(() => fetchPages(search), 300);
    return () => clearTimeout(timer);
  }, [fetchPages, search]);

  const totalPages = Math.max(1, Math.ceil(pages.length / pageSize));
  const rows = useMemo(() => pages.slice((page - 1) * pageSize, page * pageSize), [pages, page, pageSize]);
  const first = pages.length ? (page - 1) * pageSize + 1 : 0;
  const last = Math.min(page * pageSize, pages.length);
  const selectedPage = rows.length > 0 && rows.every((item) => selected.includes(item.id));

  useEffect(() => { if (page > totalPages) setPage(totalPages); }, [page, totalPages]);

  const toggleSelect = (id) => setSelected((previous) => previous.includes(id) ? previous.filter((value) => value !== id) : [...previous, id]);
  const toggleAll = (event) => setSelected((previous) => event.target.checked
    ? [...new Set([...previous, ...rows.map((item) => item.id)])]
    : previous.filter((id) => !rows.some((item) => item.id === id)));

  const openView = async (item) => {
    setView({ loading: true, data: item });
    try {
      const response = await getCmsView(token, { id: item.id });
      setView({ loading: false, data: response?.data || item });
    } catch (error) {
      setView(null);
      toast.error(errorMessage(error));
    }
  };

  const openEdit = async (item) => {
    try {
      const response = await getCmsView(token, { id: item.id });
      setEditForm({ ...item, ...(response?.data || {}) });
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };

  const savePage = async (form) => {
    setSaving(true);
    try {
      const payload = {
        page_name: form.page_name,
        description: form.description || "",
        short_description: form.short_description || "",
        page_url: form.page_url,
        seo_title: form.seo_title || "",
        seo_description: form.seo_description || "",
        seo_keywords: form.seo_keywords || "",
      };
      if (editForm?.id) {
        await updateCms(token, { id: String(editForm.id), ...payload });
      } else {
        await createCms(token, payload);
      }
      toast.success(editForm?.id ? "CMS page updated" : "CMS page created");
      setEditForm(null);
      await fetchPages(search);
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (item) => {
    const nextStatus = isActive(item.status) ? 0 : 1;
    try {
      await changeCmsStatus(token, { id: item.id, status: nextStatus });
      setPages((previous) => previous.map((pageItem) => pageItem.id === item.id ? { ...pageItem, status: nextStatus } : pageItem));
      toast.success("CMS page status updated");
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };

  const deleteSelected = async () => {
    if (!selected.length) return;
    setDeleting(true);
    try {
      await deleteCms(token, { ids: selected });
      toast.success("CMS page(s) deleted");
      setConfirmDelete(false);
      await fetchPages(search);
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setDeleting(false);
    }
  };

  const reorder = async ({ active, over }) => {
    if (!over || String(active.id) === String(over.id)) return;
    const from = pages.findIndex((item) => String(item.id) === String(active.id));
    const to = pages.findIndex((item) => String(item.id) === String(over.id));
    if (from < 0 || to < 0) return;
    const previous = pages;
    const next = arrayMove(pages, from, to).map((item, index) => ({ ...item, rank: index + 1 }));
    setPages(next);
    try {
      await updateCmsRank(token, { id: active.id, rank: next[to].rank });
      toast.success("CMS page order updated");
    } catch (error) {
      setPages(previous);
      toast.error(errorMessage(error));
    }
  };

  const copyUrl = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Page URL copied");
    } catch {
      toast.error("Could not copy page URL");
    }
  };

  const th = "px-4 py-3.5 bg-[#F4F4F4] text-xs font-bold text-slate-700 first:rounded-l-xl last:rounded-r-xl";

  return (
    <div className="min-h-screen rounded-2xl border border-slate-100 bg-white p-6 font-body shadow-sm">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div><h1 className="font-heading text-2xl font-bold text-primary">CMS Pages</h1><p className="mt-1 text-sm text-slate-500">Manage page content and SEO details.</p></div>
        <button onClick={() => fetchPages(search)} className="flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200"><FiRefreshCw /> Refresh</button>
      </div>

      <div className="mb-4 flex flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="flex gap-2">
          <button onClick={() => setEditForm({})} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-orange-500/20"><GoPlus /> Add Page</button>
          {selected.length > 0 && <button disabled={deleting} onClick={() => setConfirmDelete(true)} className="flex items-center gap-2 rounded-xl bg-rose-500 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"><FiTrash2 /> Delete ({selected.length})</button>}
        </div>
        <div className="relative w-full sm:w-72">
          <input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search pages..." className="w-full rounded-xl bg-[#F4F4F4] py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-orange-500/40" />
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-y-1 text-left">
          <thead><tr>
            <th className={`${th} w-10`}><input type="checkbox" checked={selectedPage} onChange={toggleAll} className="h-4 w-4 accent-orange-500" /></th>
            <th className={`${th} w-12`}>Rank</th><th className={th}>Page Name</th><th className={th}>URL</th><th className={th}>Status</th><th className={`${th} text-center`}>Actions</th>
          </tr></thead>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={reorder}>
            <SortableContext items={rows.map((item) => String(item.id))} strategy={verticalListSortingStrategy}>
              <tbody>
                {loading ? <tr><td colSpan={6} className="py-10 text-center text-sm text-slate-500">Loading CMS pages...</td></tr> : rows.map((item, index) => <CmsRow key={item.id} item={item} index={index} selected={selected.includes(item.id)} onSelect={() => toggleSelect(item.id)} onStatus={() => toggleStatus(item)} onView={() => openView(item)} onEdit={() => openEdit(item)} onCopy={() => copyUrl(pageUrl(item))} />)}
                {!loading && rows.length === 0 && <tr><td colSpan={6} className="py-10 text-center text-sm text-slate-500">No CMS pages found.</td></tr>}
              </tbody>
            </SortableContext>
          </DndContext>
        </table>
      </div>

      <div className="mt-4 flex flex-col items-center justify-between gap-4 text-sm text-slate-500 sm:flex-row">
        <span>Showing {first} to {last} of {totalCount} pages</span>
        <div className="flex items-center gap-3">
          <button disabled={page === 1} onClick={() => setPage((current) => current - 1)} className="rounded-lg bg-[#F4F4F4] px-3 py-1.5 font-semibold text-slate-700 disabled:opacity-40">Previous</button>
          <span className="text-xs">Page <strong>{page}</strong> of {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage((current) => current + 1)} className="rounded-lg bg-[#F4F4F4] px-3 py-1.5 font-semibold text-slate-700 disabled:opacity-40">Next</button>
          <div className="relative"><select value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1); }} className="appearance-none rounded-lg border border-slate-200 bg-white py-1.5 pl-3 pr-8 text-xs font-semibold outline-none focus:ring-2 focus:ring-orange-500/30"><option value={5}>5</option><option value={10}>10</option><option value={20}>20</option><option value={50}>50</option></select><FiChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-500" /></div>
        </div>
      </div>

      {editForm && <CMSModal initial={editForm.id ? editForm : null} loading={saving} onClose={() => setEditForm(null)} onSubmit={savePage} />}
      {view && <ViewModal view={view} onClose={() => setView(null)} />}
      <ConfirmModal
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={deleteSelected}
        title="Delete Selected CMS Page(s)?"
        message={`Are you sure you want to permanently delete ${selected.length} selected CMS page(s)? This action cannot be undone.`}
        confirmText="Yes, Delete"
        loading={deleting}
      />
    </div>
  );
}

function CmsRow({ item, index, selected, onSelect, onStatus, onView, onEdit, onCopy }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: String(item.id) });
  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 10 : undefined, position: isDragging ? "relative" : undefined };
  const active = isActive(item.status);
  const bg = isDragging ? "bg-sky-50" : index % 2 ? "bg-[#F4F4F4]" : "bg-white";
  const td = `px-4 py-3 ${bg} align-middle first:rounded-l-xl last:rounded-r-xl`;
  const url = pageUrl(item);
  return <tr ref={setNodeRef} style={style} className={isDragging ? "shadow-md" : ""}>
    <td className={td}><input type="checkbox" checked={selected} onChange={onSelect} className="h-4 w-4 accent-orange-500" /></td>
    <td className={td}><button {...attributes} {...listeners} aria-label={`Reorder ${pageName(item)}`} className="flex touch-none cursor-grab items-center gap-1 text-sm font-semibold text-slate-700"><BsGripVertical className="text-secondary/70" />{item.rank ?? index + 1}</button></td>
    <td className={`${td} text-sm font-semibold text-slate-800`}>{pageName(item)}{item.short_description && <div className="mt-0.5 max-w-sm truncate text-xs font-normal text-slate-500">{item.short_description}</div>}</td>
    <td className={`${td} text-sm text-slate-600`}><div className="flex items-center gap-2"><span className="max-w-xs truncate">{url || "—"}</span>{url && <button aria-label="Copy page URL" onClick={onCopy} className="text-slate-400 hover:text-orange-600"><FiCopy /></button>}</div></td>
    <td className={td}><button type="button" onClick={onStatus} className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-bold ${active ? "border-emerald-200 bg-emerald-50 text-emerald-600" : "border-rose-200 bg-rose-50 text-rose-600"}`}><span className={`h-2 w-2 rounded-full ${active ? "bg-emerald-500" : "bg-rose-500"}`} />{active ? "Active" : "Inactive"}</button></td>
    <td className={`${td} text-center`}><div className="flex justify-center gap-2"><button onClick={onView} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-secondary"><FiEye /> View</button><button onClick={onEdit} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-orange-500 hover:text-orange-600"><FiEdit2 /> Edit</button></div></td>
  </tr>;
}

function ViewModal({ view, onClose }) {
  const data = view.data || {};
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <div role="dialog" aria-modal="true" className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
      <div className="mb-5 flex items-start justify-between"><div><h2 className="font-heading text-xl font-bold text-primary">CMS Page Details</h2><p className="mt-1 text-sm text-slate-500">{pageName(data)}</p></div><button onClick={onClose} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><FiX /></button></div>
      {view.loading ? <p className="py-8 text-center text-sm text-slate-500">Loading page details...</p> : <dl className="grid gap-3 sm:grid-cols-2">{Object.entries(data).map(([key, value]) => <div key={key} className="min-w-0 rounded-lg bg-[#F4F4F4] p-3"><dt className="text-xs font-bold capitalize text-slate-500">{key.replaceAll("_", " ")}</dt><dd className="mt-1 break-words whitespace-pre-wrap text-sm text-slate-800">{value == null || value === "" ? "—" : typeof value === "object" ? JSON.stringify(value, null, 2) : String(value)}</dd></div>)}</dl>}
    </div>
  </div>;
}
