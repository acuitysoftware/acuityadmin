import { useCallback, useEffect, useMemo, useState } from "react";
import { FiChevronDown, FiEdit2, FiRefreshCw, FiSearch, FiShare2, FiTrash2 } from "react-icons/fi";
import { BsGripVertical } from "react-icons/bs";
import { GoPlus } from "react-icons/go";
import { toast } from "react-toastify";
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
  changeSocialLinkStatus,
  createSocialLink,
  deleteSocialLink,
  getSocialLinksList,
  updateSocialLink,
  updateSocialLinkRank,
  viewSocialLink,
} from "../../api/social/social";
import ConfirmModal from "./components/ConfirmModal";
import SocialLinkModal from "./components/SocialLinkModal";
import { getSocialIcon } from "./components/socialIcons";

const getErrorMessage = (error) =>
  error.response?.data?.message ?? error.response?.data?.error ?? error.message ?? "An error occurred";

function getResponseData(response) {
  if (response?.status === false) throw new Error(response.message || "The request could not be completed.");
  return response?.data ?? response;
}

export default function SocialManagement() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const token = localStorage.getItem("admin_token");
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor),
  );

  const fetchSocialLinks = useCallback(async (keyword = "") => {
    setLoading(true);
    try {
      const response = await getSocialLinksList(token, keyword.trim() ? { search_keyword: keyword.trim() } : {});
      const result = getResponseData(response);
      if (!Array.isArray(result)) throw new Error("The social links response was not a list.");
      setData(result);
      setSelectedIds([]);
    } catch (error) {
      console.error("Fetch social links failed:", error);
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    const timer = setTimeout(() => fetchSocialLinks(search), 350);
    return () => clearTimeout(timer);
  }, [fetchSocialLinks, search]);

  const currentTableData = useMemo(
    () => data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
    [data, currentPage, itemsPerPage],
  );
  const totalPages = Math.ceil(data.length / itemsPerPage) || 1;
  const showingFrom = data.length ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const showingTo = Math.min(currentPage * itemsPerPage, data.length);

  const handleStatusToggle = async (item) => {
    const nextStatus = item.status === "1" || item.status === 1 || item.status === true ? "0" : "1";
    try {
      const response = await changeSocialLinkStatus(token, { id: item.id, status: nextStatus });
      getResponseData(response);
      toast.success("Social link status updated");
      setData((previous) => previous.map((link) => link.id === item.id ? { ...link, status: nextStatus } : link));
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedIds.length) return;
    setDeleteLoading(true);
    try {
      const response = await deleteSocialLink(token, { ids: selectedIds });
      getResponseData(response);
      toast.success("Social link(s) deleted successfully");
      setSelectedIds([]);
      setIsConfirmOpen(false);
      await fetchSocialLinks(search);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleEditClick = async (item) => {
    setEditLoading(true);
    try {
      const response = await viewSocialLink(token, { id: item.id });
      const detail = getResponseData(response);
      if (!detail || typeof detail !== "object" || Array.isArray(detail)) {
        throw new Error("The social link details could not be loaded.");
      }
      setEditData(detail);
      setIsModalOpen(true);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setEditLoading(false);
    }
  };

  const handleModalSubmit = async (formData) => {
    setModalLoading(true);
    try {
      const isEditing = formData.id !== undefined && formData.id !== null;
      const response = isEditing
        ? await updateSocialLink(token, formData)
        : await createSocialLink(token, formData);
      getResponseData(response);
      toast.success(isEditing ? "Social link updated successfully" : "Social link added successfully");
      setIsModalOpen(false);
      await fetchSocialLinks(search);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setModalLoading(false);
    }
  };

  const handleReorder = async ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const from = data.findIndex((item) => String(item.id) === String(active.id));
    const to = data.findIndex((item) => String(item.id) === String(over.id));
    if (from < 0 || to < 0) return;

    const reorderedData = arrayMove(data, from, to).map((item, index) => ({
      ...item,
      rank: index + 1,
    }));
    const draggedItem = reorderedData[to];
    setData(reorderedData);
    try {
      const response = await updateSocialLinkRank(token, { id: draggedItem.id, rank: draggedItem.rank });
      getResponseData(response);
      toast.success("Social link order updated");
      await fetchSocialLinks(search);
    } catch (error) {
      setData(data);
      toast.error(getErrorMessage(error));
    }
  };

  const th = "bg-[#F4F4F4] px-4 py-3.5 text-left text-xs font-bold text-slate-700 first:rounded-l-xl last:rounded-r-xl";

  return (
    <section className="min-h-screen rounded-2xl border border-slate-100 bg-white p-6 font-body shadow-sm">
      <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-heading text-2xl font-bold text-primary">Social Management</h1>
          <p className="mt-1 text-sm text-slate-500">Manage social profile links and their display icons.</p>
        </div>
        <button type="button" onClick={() => fetchSocialLinks(search)} className="flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200" title="Refresh social links">
          <FiRefreshCw className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      <div className="mb-4 flex flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => { setEditData(null); setIsModalOpen(true); }} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-orange-500/20 hover:from-orange-600 hover:to-amber-600">
            <GoPlus className="text-lg" /> Add Social Link
          </button>
          {selectedIds.length > 0 && (
            <button type="button" onClick={() => setIsConfirmOpen(true)} className="flex items-center gap-2 rounded-xl bg-rose-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-600">
              <FiTrash2 /> Delete Selected ({selectedIds.length})
            </button>
          )}
        </div>
        <div className="relative w-full sm:w-72">
          <input type="search" placeholder="Search social links..." value={search} onChange={(event) => { setSearch(event.target.value); setCurrentPage(1); }} className="w-full rounded-xl bg-[#F4F4F4] py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-orange-500/40" />
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full table-fixed border-separate border-spacing-y-1 text-left">
          <thead><tr>
            <th className={`${th} w-12 text-center`}>
              <input type="checkbox" aria-label="Select all social links on this page" checked={currentTableData.length > 0 && currentTableData.every((item) => selectedIds.includes(item.id))} onChange={(event) => setSelectedIds((previous) => event.target.checked ? [...new Set([...previous, ...currentTableData.map((item) => item.id)])] : previous.filter((id) => !currentTableData.some((item) => item.id === id)))} className="h-4 w-4 accent-orange-500" />
            </th>
            <th className={`${th} w-24 text-center`}>Rank</th>
            <th className={th}>Social Network</th>
            <th className={`${th} w-32 text-center`}>Status</th>
            <th className={`${th} w-32 text-right`}>Actions</th>
          </tr></thead>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleReorder}>
          <SortableContext items={currentTableData.map((item) => String(item.id))} strategy={verticalListSortingStrategy}>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" className="p-8 text-center text-sm text-slate-500"><span className="inline-flex items-center gap-2"><span className="h-5 w-5 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />Loading social links...</span></td></tr>
            ) : currentTableData.length ? currentTableData.map((item, index) => (
              <SocialLinkRow
                key={item.id}
                item={item}
                index={(currentPage - 1) * itemsPerPage + index}
                selected={selectedIds.includes(item.id)}
                editLoading={editLoading}
                onSelect={() => setSelectedIds((previous) => previous.includes(item.id) ? previous.filter((id) => id !== item.id) : [...previous, item.id])}
                onStatusToggle={() => handleStatusToggle(item)}
                onEdit={() => handleEditClick(item)}
              />
            )) : (
              <tr><td colSpan="5" className="p-8 text-center text-sm italic text-slate-400">{search ? `No social links matching "${search}" found.` : "No social links found. Click 'Add Social Link' to create one."}</td></tr>
            )}
          </tbody>
          </SortableContext>
          </DndContext>
        </table>
      </div>

      <div className="mt-4 flex flex-col items-center justify-between gap-4 text-xs text-slate-500 sm:flex-row">
        <span>Showing {showingFrom} to {showingTo} of {data.length} items</span>
        <div className="flex items-center gap-3">
          <button type="button" disabled={currentPage === 1} onClick={() => setCurrentPage((page) => page - 1)} className="rounded-lg bg-[#F4F4F4] px-3 py-1.5 font-semibold text-slate-700 disabled:opacity-40">Previous</button>
          <span>Page <strong>{currentPage}</strong> of {totalPages}</span>
          <button type="button" disabled={currentPage === totalPages} onClick={() => setCurrentPage((page) => page + 1)} className="rounded-lg bg-[#F4F4F4] px-3 py-1.5 font-semibold text-slate-700 disabled:opacity-40">Next</button>
          <div className="relative">
            <select value={itemsPerPage} onChange={(event) => { setItemsPerPage(Number(event.target.value)); setCurrentPage(1); }} className="appearance-none rounded-lg border border-slate-200 bg-white py-1.5 pl-3 pr-7 font-semibold text-slate-700">
              {[5, 10, 20, 50].map((count) => <option key={count} value={count}>{count}</option>)}
            </select>
            <FiChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
        </div>
      </div>

      {isModalOpen && <SocialLinkModal initial={editData} onClose={() => setIsModalOpen(false)} onSubmit={handleModalSubmit} loading={modalLoading} />}
      <ConfirmModal isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} onConfirm={handleDeleteConfirm} title="Delete Selected Social Link(s)?" message={`Are you sure you want to permanently delete ${selectedIds.length} selected social link(s)? This action cannot be undone.`} confirmText="Yes, Delete" cancelText="Cancel" loading={deleteLoading} variant="danger" />
    </section>
  );
}

function SocialLinkRow({ item, index, selected, editLoading, onSelect, onStatusToggle, onEdit }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: String(item.id) });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
    position: isDragging ? "relative" : undefined,
  };
  const background = isDragging ? "bg-orange-50" : index % 2 ? "bg-[#F4F4F4]" : "bg-white";
  const cellClass = `align-middle px-4 py-3 ${background}`;
  const active = item.status === "1" || item.status === 1 || item.status === true;
  const socialIcon = getSocialIcon(item.icon);
  const Icon = socialIcon?.Icon;

  return (
    <tr ref={setNodeRef} style={style} className={isDragging ? "shadow-md" : ""}>
      <td className={`${cellClass} w-12 rounded-l-xl text-center`}>
        <input type="checkbox" aria-label={`Select ${item.name}`} checked={selected} onChange={onSelect} className="h-4 w-4 accent-orange-500" />
      </td>
      <td className={`${cellClass} w-24`}>
        <button {...attributes} {...listeners} type="button" aria-label={`Reorder ${item.name}`} className="mx-auto flex touch-none cursor-grab items-center gap-2 active:cursor-grabbing">
          <BsGripVertical className="text-slate-400" />{item.rank ?? index + 1}
        </button>
      </td>
      <td className={cellClass}>
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-lg text-orange-600">{Icon ? <Icon /> : <FiShare2 />}</span>
          <div><p className="text-sm font-semibold text-slate-800">{item.name}</p><p className="text-xs text-slate-400">{socialIcon?.name || item.icon}</p></div>
        </div>
      </td>
      <td className={`${cellClass} w-32 text-center`}>
        <button type="button" onClick={onStatusToggle} className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-bold ${active ? "border-emerald-200 bg-emerald-50 text-emerald-600" : "border-rose-200 bg-rose-50 text-rose-600"}`}>
          <span className={`h-2 w-2 rounded-full ${active ? "bg-emerald-500" : "bg-rose-500"}`} />{active ? "Active" : "Inactive"}
        </button>
      </td>
      <td className={`${cellClass} w-32 rounded-r-xl text-right`}>
        <button type="button" disabled={editLoading} onClick={onEdit} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:border-orange-500 hover:text-orange-600 disabled:opacity-50">
          {editLoading ? <span className="h-3 w-3 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" /> : <FiEdit2 size={13} />} Edit
        </button>
      </td>
    </tr>
  );
}
