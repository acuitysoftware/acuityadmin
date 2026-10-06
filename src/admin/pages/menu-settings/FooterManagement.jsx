import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  FiCheckCircle,
  FiEdit2,
  FiEye,
  FiLink,
  FiRefreshCw,
  FiSave,
  FiSearch,
  FiTrash2,
  FiType,
  FiX,
  FiXCircle,
} from "react-icons/fi";
import { GoPlus } from "react-icons/go";
import { BsGripVertical } from "react-icons/bs";
import { RxCross1 } from "react-icons/rx";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  changeFooterMenuStatus,
  createFooterMenu,
  deleteFooterMenu,
  getFooterMenuView,
  getFooterMenusList,
  updateFooterMenu,
  updateFooterMenuRank,
} from "../../../api/footer/footer";
import ConfirmModal from "../components/ConfirmModal";

const getList = (response) => {
  const candidate = response && typeof response === "object" ? response : null;
  const possibleLists = [
    candidate,
    candidate?.data,
    candidate?.list,
    candidate?.items,
    candidate?.result,
    candidate?.records,
    candidate?.rows,
    candidate?.footer_menus,
    candidate?.footerLinks,
  ];

  for (const item of possibleLists) {
    if (Array.isArray(item)) return item;
  }

  return [];
};

const isActive = (status) => status === 1 || status === "1" || status === true;
const getErrorMessage = (error) =>
  error?.response?.data?.message || error?.message || "Something went wrong";

const TABLE_HEADER_CLASS =
  "px-4 py-3.5 bg-[#F4F4F4] text-xs font-bold text-slate-700 first:rounded-l-xl last:rounded-r-xl";

export default function FooterManagement() {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedIds, setSelectedIds] = useState([]);
  const [editLink, setEditLink] = useState(null);
  const [view, setView] = useState(null);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const token = localStorage.getItem("admin_token");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const fetchLinks = useCallback(async (keyword = "") => {
    setLoading(true);
    try {
      const payload = keyword.trim() ? { search_keyword: keyword.trim() } : {};
      const response = await getFooterMenusList(token, payload);
      setLinks(getList(response));
      setSelectedIds([]);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    const timer = setTimeout(() => fetchLinks(search), 300);
    return () => clearTimeout(timer);
  }, [fetchLinks, search]);

  const filteredLinks = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return links;
    return links.filter((link) =>
      (link.link_label_name || "").toLowerCase().includes(keyword)
    );
  }, [links, search]);

  const pageCount = Math.max(1, Math.ceil(filteredLinks.length / pageSize));
  useEffect(() => {
    if (page > pageCount) {
      setPage(pageCount);
    }
  }, [page, pageCount]);

  const pageLinks = filteredLinks.slice((page - 1) * pageSize, page * pageSize);
  const firstItem = filteredLinks.length ? (page - 1) * pageSize + 1 : 0;
  const lastItem = Math.min(page * pageSize, filteredLinks.length);
  const allPageSelected =
    pageLinks.length > 0 && pageLinks.every((link) => selectedIds.includes(link.id));

  const toggleSelected = (id) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((selectedId) => selectedId !== id)
        : [...current, id]
    );
  };

  const togglePageSelection = (event) => {
    setSelectedIds((current) => {
      if (event.target.checked) {
        return [...new Set([...current, ...pageLinks.map((link) => link.id)])];
      }
      return current.filter((id) => !pageLinks.some((link) => link.id === id));
    });
  };

  const openView = async (link) => {
    setView({ loading: true, data: link });
    try {
      const response = await getFooterMenuView(token, { id: link.id });
      setView({
        loading: false,
        data: response?.data || response?.menu || response,
      });
    } catch (error) {
      setView(null);
      toast.error(getErrorMessage(error));
    }
  };

  const openEdit = async (link) => {
    try {
      const response = await getFooterMenuView(token, { id: link.id });
      setEditLink({ ...link, ...(response?.data || response?.menu || {}) });
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const saveLink = async (form) => {
    setSaving(true);
    const payload = {
      link_label_name: form.link_label_name.trim(),
      link_type: String(form.link_type),
      column_no: String(form.column_no),
      cms_id: form.link_type === "0" ? String(form.cms_id || "") : "",
      url: String(form.url || ""),
    };

    try {
      if (form.id) {
        const response = await updateFooterMenu(token, { id: String(form.id), ...payload });
        toast.success(response?.message || "Footer link updated successfully");
      } else {
        const response = await createFooterMenu(token, payload);
        toast.success(response?.message || "Footer link created successfully");
      }
      setEditLink(null);
      await fetchLinks(search);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (link) => {
    const previousLinks = links;
    const nextStatus = isActive(link.status) ? "0" : "1";
    setLinks((current) =>
      current.map((item) =>
        item.id === link.id ? { ...item, status: nextStatus } : item
      )
    );

    try {
      const response = await changeFooterMenuStatus(token, { id: link.id, status: nextStatus });
      toast.success(response?.message || "Footer link status updated");
    } catch (error) {
      setLinks(previousLinks);
      toast.error(getErrorMessage(error));
    }
  };

  const deleteSelected = async () => {
    if (!selectedIds.length) return;
    setDeleting(true);
    try {
      const response = await deleteFooterMenu(token, { ids: selectedIds });
      toast.success(response?.message || "Footer link(s) deleted successfully");
      setConfirmDelete(false);
      await fetchLinks(search);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setDeleting(false);
    }
  };

  const handleDragEnd = async ({ active, over }) => {
    if (!over || active.id === over.id) return;

    const fromIndex = links.findIndex((link) => String(link.id) === String(active.id));
    const toIndex = links.findIndex((link) => String(link.id) === String(over.id));
    if (fromIndex < 0 || toIndex < 0) return;

    const previousLinks = links;
    const reorderedLinks = arrayMove(links, fromIndex, toIndex).map((link, index) => ({
      ...link,
      rank: index + 1,
    }));
    setLinks(reorderedLinks);

    try {
      const response = await updateFooterMenuRank(token, {
        id: active.id,
        rank: reorderedLinks[toIndex].rank,
      });
      toast.success(response?.message || "Footer link rank updated");
    } catch (error) {
      setLinks(previousLinks);
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <section className="min-h-screen rounded-2xl border border-slate-100 bg-white p-6 font-body shadow-sm">
      <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-heading text-2xl font-bold text-primary">Footer Management</h1>
          <p className="mt-1 text-xs text-slate-500">
            Manage footer links, their columns, and display order.
          </p>
        </div>
        <button
          type="button"
          onClick={() => fetchLinks(search)}
          className="flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200"
        >
          <FiRefreshCw className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      <div className="mb-4 flex flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="flex w-full items-center gap-3 sm:w-auto">
          <button
            type="button"
            onClick={() => setEditLink({})}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-orange-500/20"
          >
            <GoPlus /> Add Footer Link
          </button>
          {selectedIds.length > 0 && (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="flex items-center gap-2 rounded-xl bg-rose-500 px-4 py-2.5 text-sm font-semibold text-white"
            >
              <FiTrash2 /> Delete Selected ({selectedIds.length})
            </button>
          )}
        </div>

        <div className="relative w-full sm:w-72">
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search footer links..."
            className="w-full rounded-xl bg-[#F4F4F4] py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-orange-500/40"
          />
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-y-1 text-left">
          <thead>
            <tr>
              <th className={`${TABLE_HEADER_CLASS} w-10`}>
                <input
                  type="checkbox"
                  checked={allPageSelected}
                  onChange={togglePageSelection}
                  className="h-4 w-4 cursor-pointer rounded border-slate-300 accent-orange-500"
                />
              </th>
              <th className={`${TABLE_HEADER_CLASS} w-10`}></th>
              <th className={`${TABLE_HEADER_CLASS} w-20`}>Rank</th>
              <th className={TABLE_HEADER_CLASS}>Footer Link</th>
              <th className={TABLE_HEADER_CLASS}>Status</th>
              <th className={`${TABLE_HEADER_CLASS} text-center`}>Actions</th>
            </tr>
          </thead>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={pageLinks.map((link) => String(link.id))}
              strategy={verticalListSortingStrategy}
            >
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-sm text-slate-500">
                      <span className="inline-flex items-center gap-2">
                        <span className="h-5 w-5 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
                        Loading footer links...
                      </span>
                    </td>
                  </tr>
                ) : pageLinks.length ? (
                  pageLinks.map((link, index) => (
                    <SortableFooterRow
                      key={link.id}
                      link={link}
                      index={(page - 1) * pageSize + index}
                      selected={selectedIds.includes(link.id)}
                      onSelect={() => toggleSelected(link.id)}
                      onStatusChange={() => toggleStatus(link)}
                      onView={() => openView(link)}
                      onEdit={() => openEdit(link)}
                    />
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-sm italic text-slate-400">
                      {search
                        ? `No footer links matching "${search}" found.`
                        : "No footer links found. Add one to get started."}
                    </td>
                  </tr>
                )}
              </tbody>
            </SortableContext>
          </DndContext>
        </table>
      </div>

      <div className="mt-4 flex flex-col items-center justify-between gap-4 text-xs text-slate-500 sm:flex-row">
        <span>Showing {firstItem} to {lastItem} of {filteredLinks.length} items</span>
        <div className="flex items-center gap-3">
          <button
            disabled={page === 1}
            onClick={() => setPage((current) => current - 1)}
            className="rounded-lg bg-[#F4F4F4] px-3 py-1.5 font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
          >Previous</button>
          <span>Page <strong>{page}</strong> of {pageCount}</span>
          <button
            disabled={page === pageCount}
            onClick={() => setPage((current) => current + 1)}
            className="rounded-lg bg-[#F4F4F4] px-3 py-1.5 font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
          >Next</button>
          <select
            value={pageSize}
            onChange={(event) => {
              setPageSize(Number(event.target.value));
              setPage(1);
            }}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-semibold"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {editLink && (
        <FooterLinkModal
          initial={editLink.id ? editLink : null}
          loading={saving}
          onClose={() => setEditLink(null)}
          onSubmit={saveLink}
        />
      )}
      {view && <FooterLinkViewModal view={view} onClose={() => setView(null)} />}
      <ConfirmModal
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={deleteSelected}
        title="Delete Selected Footer Link(s)?"
        message={`Are you sure you want to permanently delete ${selectedIds.length} selected footer link(s)? This action cannot be undone.`}
        confirmText="Yes, Delete"
        cancelText="Cancel"
        loading={deleting}
        variant="danger"
      />
    </section>
  );
}

function SortableFooterRow({ link, index, selected, onSelect, onStatusChange, onView, onEdit }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: String(link.id),
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
    position: isDragging ? "relative" : undefined,
  };
  const rowBackground = isDragging
    ? "bg-sky-50"
    : index % 2
      ? "bg-[#F4F4F4]"
      : "bg-white";
  const cellClass = `px-4 py-3 ${rowBackground} align-middle`;

  return (
    <tr ref={setNodeRef} style={style} className={isDragging ? "shadow-md" : ""}>
      <td className={`${cellClass} rounded-l-xl`}>
        <input
          type="checkbox"
          checked={selected}
          onChange={onSelect}
          className="h-4 w-4 cursor-pointer rounded border-slate-300 accent-orange-500"
        />
      </td>
      <td className={cellClass}>
        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label={`Reorder ${link.link_label_name}`}
          className="flex h-7 w-7 touch-none cursor-grab items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 hover:border-primary hover:text-primary active:cursor-grabbing"
        >
          <BsGripVertical size={16} />
        </button>
      </td>
      <td className={`${cellClass} text-sm text-body`}>
        {link.rank ?? index + 1}
      </td>
      <td className={cellClass}>
        <div className="text-sm font-semibold text-slate-800">
          {link.link_label_name || `Footer link #${link.id}`}
        </div>
      </td>
      <td className={cellClass}>
        <button
          type="button"
          onClick={onStatusChange}
          className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-bold transition-colors ${
            isActive(link.status)
              ? "border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
              : "border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100"
          }`}
          title="Click to toggle status"
        >
          <span className={`h-2 w-2 rounded-full ${isActive(link.status) ? "bg-emerald-500" : "bg-rose-500"}`} />
          {isActive(link.status) ? "Active" : "Inactive"}
        </button>
      </td>
      <td className={`${cellClass} rounded-r-xl text-center`}>
        <div className="flex justify-center gap-2">
          <button
            type="button"
            onClick={onView}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-secondary"
          >
            <FiEye /> View
          </button>
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-orange-500 hover:text-orange-600"
          >
            <FiEdit2 /> Edit
          </button>
        </div>
      </td>
    </tr>
  );
}

function FooterLinkModal({ initial, loading, onClose, onSubmit }) {
  const [form, setForm] = useState({
    link_label_name: initial?.link_label_name || "",
    link_type: String(initial?.link_type ?? "0"),
    column_no: String(initial?.column_no ?? "1"),
    cms_id: initial?.cms_id == null ? "" : String(initial.cms_id),
    url: initial?.url || "",
  });
  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-800 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30";
  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };
  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({ ...form, id: initial?.id });
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={loading ? undefined : onClose} />
      <div className="fixed inset-y-0 right-0 z-50 flex w-full flex-col bg-white shadow-2xl sm:max-w-lg">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 p-5">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              {initial ? "Edit Footer Link" : "Add Footer Link"}
            </h2>
            <p className="text-xs text-slate-400">Set the footer label, link target, and column.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100">
            <RxCross1 />
          </button>
        </div>

        <form id="footer-link-form" onSubmit={handleSubmit} className="flex-1 space-y-5 overflow-y-auto p-6">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            <span className="mb-1.5 flex items-center gap-2"><FiType className="text-orange-500" /> Link Label *</span>
            <input
              required
              name="link_label_name"
              value={form.link_label_name}
              onChange={handleChange}
              placeholder="e.g. About Us"
              className={inputClass}
            />
          </label>

          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            <span className="mb-1.5 flex items-center gap-2"><FiCheckCircle className="text-orange-500" /> Link Type *</span>
            <select name="link_type" value={form.link_type} onChange={handleChange} className={`${inputClass} cursor-pointer`}>
              <option value="0">CMS Page</option>
              <option value="1">URL</option>
            </select>
          </label>

          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            Footer Column *
            <select name="column_no" value={form.column_no} onChange={handleChange} className={`${inputClass} mt-1.5 cursor-pointer`}>
              {[1, 2, 3, 4].map((column) => (
                <option key={column} value={column}>Column {column}</option>
              ))}
            </select>
          </label>

          {form.link_type === "0" && (
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              CMS ID *
              <input
                required
                name="cms_id"
                value={form.cms_id}
                onChange={handleChange}
                placeholder="Enter the CMS page ID"
                className={`${inputClass} mt-1.5`}
              />
            </label>
          )}

          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            <span className="mb-1.5 flex items-center gap-2"><FiLink className="text-orange-500" /> URL</span>
            <input
              type="url"
              name="url"
              value={form.url}
              onChange={handleChange}
              placeholder="https://example.com"
              className={inputClass}
            />
          </label>
        </form>

        <div className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50/50 p-5">
          <button type="button" disabled={loading} onClick={onClose} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700">
            <FiXCircle /> Cancel
          </button>
          <button form="footer-link-form" type="submit" disabled={loading} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-2.5 text-sm font-bold text-white disabled:opacity-50">
            {loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <FiSave />}
            {initial ? "Update Footer Link" : "Create Footer Link"}
          </button>
        </div>
      </div>
    </>
  );
}

function FooterLinkViewModal({ view, onClose }) {
  const data = view.data || {};
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div role="dialog" aria-modal="true" className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h2 className="font-heading text-xl font-bold text-primary">Footer Link Details</h2>
            <p className="mt-1 text-sm text-slate-500">{data.link_label_name || "Footer Link"}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100">
            <FiX />
          </button>
        </div>
        {view.loading ? (
          <p className="py-8 text-center text-sm text-slate-500">Loading footer link details...</p>
        ) : (
          <dl className="grid gap-3 sm:grid-cols-2">
            {Object.entries(data).map(([key, value]) => (
              <div key={key} className="min-w-0 rounded-lg bg-[#F4F4F4] p-3">
                <dt className="text-xs font-bold capitalize text-slate-500">{key.replaceAll("_", " ")}</dt>
                <dd className="mt-1 break-words whitespace-pre-wrap text-sm text-slate-800">
                  {value == null || value === "" ? "—" : String(value)}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </div>
  );
}
