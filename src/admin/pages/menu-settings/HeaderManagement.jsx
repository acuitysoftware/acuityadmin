import React, { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import {
  FiChevronDown,
  FiChevronRight,
  FiEdit2,
  FiEye,
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
  closestCenter,
  DndContext,
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
  createMenu,
  deleteMenu,
  getMenuView,
  getMenusList,
  updateMenu,
  updateMenuRank,
} from "../../../api/header/header";
import ConfirmModal from "../components/ConfirmModal";

const getList = (response) => {
  if (Array.isArray(response)) return response;
  return Array.isArray(response?.data) ? response.data : [];
};
const active = (status) => status === 1 || status === "1" || status === true;
const errorMessage = (error) =>
  error?.response?.data?.message || error?.message || "Something went wrong";

export default function HeaderManagement() {
  const [menus, setMenus] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selected, setSelected] = useState([]);
  const [editForm, setEditForm] = useState(null);
  const [view, setView] = useState(null);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const latestRequest = useRef(0);
  const token = localStorage.getItem("admin_token");
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const fetchMenus = useCallback(async (keyword = "") => {
    const requestId = ++latestRequest.current;
    setLoading(true);
    try {
      const trimmedKeyword = keyword.trim();
      const payload = trimmedKeyword ? { search_keyword: trimmedKeyword } : {};
      const response = await getMenusList(token, payload);

      // Ignore an older response if a newer search has already completed.
      if (requestId !== latestRequest.current) return;

      setMenus(
        getList(response).map((item) => ({
          ...item,
          child_menus: Array.isArray(item.child_menus) ? item.child_menus : [],
        }))
      );
      setSelected([]);
    } catch (error) {
      if (requestId === latestRequest.current) {
        toast.error(errorMessage(error));
      }
    } finally {
      if (requestId === latestRequest.current) setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    const timer = setTimeout(() => fetchMenus(search), 300);
    return () => clearTimeout(timer);
  }, [search, fetchMenus]);

  const pages = Math.max(1, Math.ceil(menus.length / pageSize));
  const rows = menus.slice((page - 1) * pageSize, page * pageSize);
  const first = menus.length ? (page - 1) * pageSize + 1 : 0;
  const last = Math.min(page * pageSize, menus.length);
  const selectedPage = rows.length > 0 && rows.every((item) => selected.includes(item.id));

  const toggleSelect = (id) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((value) => value !== id) : [...prev, id]
    );
  const toggleAll = (event) =>
    setSelected(
      event.target.checked
        ? [...new Set([...selected, ...rows.map((item) => item.id)])]
        : selected.filter((id) => !rows.some((item) => item.id === id))
    );
  const showView = async (item) => {
    setView({ loading: true, data: item });
    try {
      const res = await getMenuView(token, { id: item.id });
      setView({ loading: false, data: res?.data || res?.menu || res });
    } catch (error) {
      setView(null);
      toast.error(errorMessage(error));
    }
  };
  const openEdit = async (item) => {
    try {
      const res = await getMenuView(token, { id: item.id });
      setEditForm({ ...item, ...(res?.data || res?.menu || {}) });
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };
  const saveMenu = async (form) => {
    setSaving(true);
    try {
      const payload = { name: form.name.trim() };
      if (form.parent_id) payload.parent_id = String(form.parent_id);
      if (form.id) {
        payload.id = String(form.id);
        await updateMenu(token, payload);
      } else {
        await createMenu(token, payload);
      }
      toast.success(form.id ? "Menu updated successfully" : "Menu created successfully");
      setEditForm(null);
      await fetchMenus(search);
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setSaving(false);
    }
  };
  const deleteSelected = async () => {
    setDeleting(true);
    try {
      await deleteMenu(token, { ids: selected });
      toast.success("Menu(s) deleted successfully");
      setConfirmDelete(false);
      await fetchMenus(search);
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setDeleting(false);
    }
  };
  const reorder = async (list, update, event) => {
    const { active: dragged, over } = event;
    if (!over || dragged.id === over.id) return;
    const from = list.findIndex((item) => String(item.id) === String(dragged.id));
    const to = list.findIndex((item) => String(item.id) === String(over.id));
    if (from < 0 || to < 0) return;
    const next = arrayMove(list, from, to).map((item, index) => ({
      ...item,
      rank: index + 1,
    }));
    update(next);
    try {
      await updateMenuRank(token, { id: dragged.id, rank: next[to].rank });
      toast.success("Menu rank updated");
    } catch (error) {
      update(list);
      toast.error(errorMessage(error));
    }
  };
  const reorderParents = (event) => reorder(menus, setMenus, event);
  const th = "px-4 py-3.5 bg-[#F4F4F4] text-xs font-bold text-slate-700 first:rounded-l-xl last:rounded-r-xl";

  return (
    <div className="min-h-screen rounded-2xl border border-slate-100 bg-white p-6 font-body shadow-sm">
      <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-heading text-2xl font-bold text-primary">Header Management</h1>
          <p className="mt-1 text-xs text-slate-500">Manage header menus and dropdown links.</p>
        </div>
        <button
          onClick={() => fetchMenus(search)}
          className="flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200"
        >
          <FiRefreshCw className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      <div className="mb-4 flex flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="flex w-full items-center gap-3 sm:w-auto">
          <button
            onClick={() => setEditForm({ name: "", parent_id: "" })}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-orange-500/20"
          >
            <GoPlus /> Add Menu
          </button>
          {selected.length > 0 && (
            <button
              onClick={() => setConfirmDelete(true)}
              className="flex items-center gap-2 rounded-xl bg-rose-500 px-4 py-2.5 text-sm font-semibold text-white"
            >
              <FiTrash2 /> Delete Selected ({selected.length})
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
            placeholder="Search menus..."
            className="w-full rounded-xl bg-[#F4F4F4] py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-orange-500/40"
          />
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-y-1 text-left">
          <thead>
            <tr>
              <th className={`${th} w-10`}>
                <input
                  type="checkbox"
                  checked={selectedPage}
                  onChange={toggleAll}
                  className="h-4 w-4 cursor-pointer rounded border-slate-300 accent-orange-500"
                />
              </th>
              <th className={`${th} w-28 text-center`}>Level</th>
              <th className={`${th} w-20`}>Rank</th>
              <th className={th}>Menu Title</th>
              <th className={th}>Slug</th>
              <th className={th}>Status</th>
              <th className={`${th} text-center`}>Actions</th>
            </tr>
          </thead>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={reorderParents}>
            <SortableContext items={rows.map((item) => String(item.id))} strategy={verticalListSortingStrategy}>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-sm text-slate-500">
                      <span className="inline-flex items-center gap-2">
                        <span className="h-5 w-5 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
                        Loading menus...
                      </span>
                    </td>
                  </tr>
                ) : rows.length ? (
                  rows.map((item, index) => (
                    <React.Fragment key={item.id}>
                      <ParentMenuRow
                        item={item}
                        index={(page - 1) * pageSize + index}
                        expanded={expanded[item.id]}
                        selected={selected.includes(item.id)}
                        onSelect={() => toggleSelect(item.id)}
                        onToggle={() =>
                          setExpanded((prev) => ({ ...prev, [item.id]: !prev[item.id] }))
                        }
                        onView={() => showView(item)}
                        onEdit={() => openEdit(item)}
                      />
                      {expanded[item.id] && (
                        <>
                          <tr>
                            <td colSpan="7" className="border-l-4 border-secondary bg-sky-50 px-5 pb-1 pt-3">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                                Submenus under {item.name}
                              </span>
                            </td>
                          </tr>
                          <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={(event) =>
                              reorder(
                                item.child_menus,
                                (next) =>
                                  setMenus((prev) =>
                                    prev.map((menu) =>
                                      menu.id === item.id ? { ...menu, child_menus: next } : menu
                                    )
                                  ),
                                event
                              )
                            }
                          >
                            <SortableContext
                              items={item.child_menus.map((child) => String(child.id))}
                              strategy={verticalListSortingStrategy}
                            >
                              {item.child_menus.map((child, childIndex) => (
                                <ChildMenuRow
                                  key={child.id}
                                  item={child}
                                  index={childIndex}
                                  selected={selected.includes(child.id)}
                                  onSelect={() => toggleSelect(child.id)}
                                  onView={() => showView(child)}
                                  onEdit={() => openEdit(child)}
                                />
                              ))}
                            </SortableContext>
                          </DndContext>
                        </>
                      )}
                    </React.Fragment>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-sm italic text-slate-400">
                      {search ? `No menus matching "${search}" found.` : "No menus found."}
                    </td>
                  </tr>
                )}
              </tbody>
            </SortableContext>
          </DndContext>
        </table>
      </div>

      <div className="mt-4 flex flex-col items-center justify-between gap-4 text-xs text-slate-500 sm:flex-row">
        <span>Showing {first} to {last} of {menus.length} items</span>
        <div className="flex items-center gap-3">
          <button
            disabled={page === 1}
            onClick={() => setPage((current) => current - 1)}
            className="rounded-lg bg-[#F4F4F4] px-3 py-1.5 font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
          >Previous</button>
          <span>Page <strong>{page}</strong> of {pages}</span>
          <button
            disabled={page === pages}
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

      {view && <MenuViewModal view={view} onClose={() => setView(null)} />}
      {editForm && (
        <MenuModal
          initial={editForm}
          parents={menus}
          loading={saving}
          onClose={() => setEditForm(null)}
          onSubmit={saveMenu}
        />
      )}
      <ConfirmModal
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={deleteSelected}
        title="Delete Selected Menu(s)?"
        message={`Are you sure you want to permanently delete ${selected.length} selected menu(s)? This action cannot be undone.`}
        confirmText="Yes, Delete"
        cancelText="Cancel"
        loading={deleting}
        variant="danger"
      />
    </div>
  );
}

function ParentMenuRow({ item, index, expanded, selected, onSelect, onToggle, onView, onEdit }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: String(item.id) });
  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 10 : undefined, position: isDragging ? "relative" : undefined };
  const bg = isDragging ? "bg-sky-50" : index % 2 ? "bg-[#F4F4F4]" : "bg-white";
  const td = `px-4 py-3 ${bg} align-middle`;
  return <tr ref={setNodeRef} style={style} className={isDragging ? "shadow-md" : ""}>
    <td className={`${td} rounded-l-xl`}>
      <input type="checkbox" checked={selected} onChange={onSelect} className="h-4 w-4 cursor-pointer rounded border-slate-300 accent-orange-500" />
    </td>
      <td className={td}>
        <div className="flex items-center justify-center gap-2">
          <span className="flex w-6 shrink-0 justify-center">
            {item.child_menus.length > 0 ? (
              <button
                onClick={onToggle}
                aria-label={`${expanded ? "Collapse" : "Expand"} ${item.name}`}
                className="rounded-md p-1 text-slate-500 hover:bg-slate-100"
              >
                {expanded ? <FiChevronDown /> : <FiChevronRight />}
              </button>
            ) : null}
          </span>
          <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-600">
            Main
          </span>
        </div>
      </td>
    <td className={td}>
      <button {...attributes} {...listeners} aria-label={`Reorder ${item.name}`} className="flex touch-none cursor-grab items-center gap-2 active:cursor-grabbing">
        <BsGripVertical className="text-slate-400" />{item.rank ?? index + 1}
      </button>
    </td>
    <td className={`${td} text-sm font-semibold text-slate-800`}>{item.name}</td><td className={`${td} text-sm text-slate-600`}>/{item.slug}</td>
    <td className={td}>
      <span className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-bold ${active(item.status) ? "border-emerald-200 bg-emerald-50 text-emerald-600" : "border-rose-200 bg-rose-50 text-rose-600"}`}>
        <span className={`h-2 w-2 rounded-full ${active(item.status) ? "bg-emerald-500" : "bg-rose-500"}`} />
        {active(item.status) ? "Active" : "Inactive"}
      </span>
    </td>
    <td className={`${td} rounded-r-xl text-center`}>
      <div className="flex justify-center gap-2">
        <button onClick={onView} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-secondary">
          <FiEye /> View
        </button>
        <button onClick={onEdit} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-orange-500 hover:text-orange-600">
          <FiEdit2 /> Edit
        </button>
      </div>
    </td>
  </tr>;
}

function ChildMenuRow({ item, index, selected, onSelect, onView, onEdit }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: String(item.id) });
  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 10 : undefined, position: isDragging ? "relative" : undefined };
  const bg = isDragging ? "bg-sky-100" : "bg-[#EFF7FF]";
  const td = `px-4 py-3 ${bg} align-middle`;
  return (
    <tr ref={setNodeRef} style={style} className={isDragging ? "shadow-md" : ""}>
      <td className={`${td} rounded-l-xl border-l-4 border-secondary pl-10`}>
        <input type="checkbox" checked={selected} onChange={onSelect} className="h-4 w-4 accent-orange-500" />
      </td>
      <td className={td}>
        <div className="flex items-center justify-center gap-2">
          <span className="w-6 shrink-0" aria-hidden="true" />
          <span className="inline-flex rounded-full border border-secondary/20 bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-primary">
            Submenu
          </span>
        </div>
      </td>
      <td className={td}>
        <button {...attributes} {...listeners} aria-label={`Reorder submenu ${item.name}`} className="flex touch-none cursor-grab items-center gap-2 active:cursor-grabbing">
          <BsGripVertical className="text-secondary/70" />{item.rank ?? index + 1}
        </button>
      </td>
      <td className={`${td} pl-8 text-sm font-semibold text-slate-700`}>{item.name}</td>
      <td className={`${td} text-sm text-slate-600`}>{item.slug ? `/${item.slug}` : "—"}</td>
      <td className={td}>
        <span className={`inline-flex items-center gap-2 text-xs font-semibold ${active(item.status) ? "text-emerald-700" : "text-rose-600"}`}>
          <span className={`h-2 w-2 rounded-full ${active(item.status) ? "bg-emerald-500" : "bg-rose-500"}`} />
          {active(item.status) ? "Active" : "Inactive"}
        </span>
      </td>
      <td className={`${td} rounded-r-xl text-center`}>
        <div className="flex justify-center gap-2">
          <button onClick={onView} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold"><FiEye /> View</button>
          <button onClick={onEdit} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold hover:border-orange-500 hover:text-orange-600"><FiEdit2 /> Edit</button>
        </div>
      </td>
    </tr>
  );
}

function MenuModal({ initial, parents, loading, onClose, onSubmit }) {
  const [form, setForm] = useState({
    name: "",
    parent_id: "",
    id: initial.id,
    name: initial.name || "",
    parent_id: initial.parent_id ? String(initial.parent_id) : "",
  });
  const input = "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-800 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30";
  const change = (event) =>
    setForm((previous) => ({ ...previous, [event.target.name]: event.target.value }));
  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({
      id: form.id,
      name: form.name,
      parent_id: form.parent_id,
    });
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={loading ? undefined : onClose} />
      <div className="fixed inset-y-0 right-0 z-50 flex w-full flex-col bg-white shadow-2xl sm:max-w-lg">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 p-5">
          <div>
            <h2 className="text-lg font-bold text-slate-800">{form.id ? "Edit Menu" : "Add New Menu"}</h2>
            <p className="text-xs text-slate-400">Set the menu name and optional parent menu.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><RxCross1 /></button>
        </div>

        <form id="menu-form" onSubmit={handleSubmit} className="flex-1 space-y-5 overflow-y-auto p-6">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            <span className="mb-1.5 flex items-center gap-2"><FiType className="text-orange-500" /> Menu Name *</span>
            <input required name="name" value={form.name} onChange={change} placeholder="e.g. Services" className={input} />
          </label>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            Parent Menu
            <select name="parent_id" value={form.parent_id} onChange={change} className={`${input} mt-1.5`}>
              <option value="">Top level menu</option>
              {parents
                .filter((item) => String(item.id) !== String(form.id))
                .map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </label>
        </form>

        <div className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50/50 p-5">
          <button type="button" disabled={loading} onClick={onClose} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700"><FiXCircle /> Cancel</button>
          <button form="menu-form" type="submit" disabled={loading} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-2.5 text-sm font-bold text-white disabled:opacity-50">
            {loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <FiSave />}
            {form.id ? "Update Menu" : "Create Menu"}
          </button>
        </div>
      </div>
    </>
  );
}

function MenuViewModal({ view, onClose }) {
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
            <h2 className="font-heading text-xl font-bold text-primary">Menu Details</h2>
            <p className="mt-1 text-sm text-slate-500">{data.name || "Menu"}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100">
            <FiX />
          </button>
        </div>
        {view.loading ? (
          <p className="py-8 text-center text-sm text-slate-500">Loading menu details...</p>
        ) : (
          <dl className="grid gap-3 sm:grid-cols-2">
            {Object.entries(data).map(([key, value]) => (
              <div key={key} className="min-w-0 rounded-lg bg-[#F4F4F4] p-3">
                <dt className="text-xs font-bold capitalize text-slate-500">
                  {key.replaceAll("_", " ")}
                </dt>
                <dd className="mt-1 break-words whitespace-pre-wrap text-sm text-slate-800">
                  {value == null || value === ""
                    ? "—"
                    : typeof value === "object"
                      ? JSON.stringify(value, null, 2)
                      : String(value)}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </div>
  );
}
