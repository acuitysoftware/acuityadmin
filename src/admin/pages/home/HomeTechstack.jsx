import React, { useState, useEffect, useMemo, useCallback } from "react";
import { FiSearch, FiTrash2, FiEdit2, FiChevronDown, FiRefreshCw, FiCpu } from "react-icons/fi";
import { GoPlus } from "react-icons/go";
import { toast } from "react-toastify";
import TechstackModal, { getTechnologyImageUrl } from "../components/TechstackModal";
import ConfirmModal from "../components/ConfirmModal";
import {
  getTechnologiesList,
  createTechnology,
  updateTechnology,
  deleteTechnology,
  changeTechnologyStatus,
  getTechnologyView,
} from "../../../api/home/techstack";

export default function HomeTechstack() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Delete Confirmation Modal State
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const token = localStorage.getItem("admin_token");

  const getErrMessage = (err) => {
    return err.response?.data?.message ?? err.response?.data?.error ?? err.message ?? "An error occurred";
  };

  // Fetch Technologies from API with search_keyword
  const fetchTechnologies = useCallback(async (keyword = "") => {
    setLoading(true);
    try {
      const payload = keyword && keyword.trim() ? { search_keyword: keyword.trim() } : {};
      const res = await getTechnologiesList(token, payload);
      const list = Array.isArray(res)
        ? res
        : res?.data && Array.isArray(res.data)
        ? res.data
        : res?.technologies && Array.isArray(res.technologies)
        ? res.technologies
        : [];
      setData(list);
    } catch (err) {
      console.error("Fetch technologies failed:", err);
      toast.error(getErrMessage(err));
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTechnologies(search);
    }, 350);

    return () => clearTimeout(timer);
  }, [search, fetchTechnologies]);

  const currentTableData = useMemo(() => {
    const firstPageIndex = (currentPage - 1) * itemsPerPage;
    const lastPageIndex = firstPageIndex + itemsPerPage;
    return data.slice(firstPageIndex, lastPageIndex);
  }, [data, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(data.length / itemsPerPage) || 1;
  const showingFrom = data.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const showingTo = Math.min(currentPage * itemsPerPage, data.length);

  // Checkbox handlers
  const handleSelectRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(currentTableData.map((item) => item.id));
    } else {
      setSelectedIds([]);
    }
  };

  // Status toggle handler
  const handleStatusToggle = async (item) => {
    const nextStatus = item.status === "1" || item.status === 1 || item.status === true ? "0" : "1";
    try {
      await changeTechnologyStatus(token, { id: item.id, status: nextStatus });
      toast.success("Technology status updated");
      setData((prev) =>
        prev.map((s) => (s.id === item.id ? { ...s, status: nextStatus } : s))
      );
    } catch (err) {
      toast.error(getErrMessage(err));
    }
  };

  // Delete selected technologies handler
  const handleDeleteConfirm = async () => {
    if (selectedIds.length === 0) return;
    setDeleteLoading(true);
    try {
      await deleteTechnology(token, { ids: selectedIds });
      toast.success("Technology item(s) deleted successfully");
      setSelectedIds([]);
      setIsConfirmOpen(false);
      fetchTechnologies(search);
    } catch (err) {
      toast.error(getErrMessage(err));
    } finally {
      setDeleteLoading(false);
    }
  };

  // Open Edit Modal with full view data
  const handleEditClick = async (item) => {
    setEditData(item);
    setIsModalOpen(true);
    try {
      const res = await getTechnologyView(token, { id: item.id });
      const techDetail = res?.data || res?.technology || res;
      if (techDetail && typeof techDetail === "object" && !Array.isArray(techDetail)) {
        setEditData((prev) => ({ ...prev, ...techDetail }));
      }
    } catch {
      // Fall back to row item
    }
  };

  // Modal Submit (Create / Update)
  const handleModalSubmit = async (formData) => {
    setModalLoading(true);
    try {
      if (formData.id) {
        await updateTechnology(token, formData);
        toast.success("Technology updated successfully");
      } else {
        await createTechnology(token, formData);
        toast.success("Technology added successfully");
      }
      setIsModalOpen(false);
      fetchTechnologies(search);
    } catch (err) {
      toast.error(getErrMessage(err));
    } finally {
      setModalLoading(false);
    }
  };

  const th = "px-4 py-3.5 bg-[#F4F4F4] text-xs font-bold text-slate-700 first:rounded-l-xl last:rounded-r-xl";

  return (
    <div className="p-6 bg-white min-h-screen font-body rounded-2xl shadow-sm border border-slate-100">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold font-heading text-[#0e1b3d]">TechStack Settings</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your company's core technology stack, programming frameworks, and tools.
          </p>
        </div>
        <button
          onClick={() => fetchTechnologies(search)}
          className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors flex items-center gap-1 text-xs font-semibold"
          title="Refresh List"
        >
          <FiRefreshCw className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {/* Toolbar */}
      <div className="mb-4 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setEditData(null);
              setIsModalOpen(true);
            }}
            className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-sm font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-md shadow-orange-500/20 transition-all"
          >
            <GoPlus className="text-lg" /> Add Technology
          </button>

          {selectedIds.length > 0 && (
            <button
              onClick={() => setIsConfirmOpen(true)}
              className="bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-md shadow-rose-500/20 animate-fade-in"
            >
              <FiTrash2 /> Delete Selected ({selectedIds.length})
            </button>
          )}
        </div>

        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Search technologies..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#F4F4F4] rounded-xl outline-none focus:ring-2 focus:ring-orange-500/40 transition-all"
          />
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-separate border-spacing-y-1">
          <thead>
            <tr>
              <th className={`${th} w-10`}>
                <input
                  type="checkbox"
                  checked={
                    selectedIds.length === currentTableData.length &&
                    currentTableData.length > 0
                  }
                  onChange={handleSelectAll}
                  className="w-4 h-4 rounded border-slate-300 accent-orange-500 cursor-pointer"
                />
              </th>
              <th className={`${th} w-20`}>Logo / Icon</th>
              <th className={th}>Technology Name</th>
              <th className={th}>Status</th>
              <th className={`${th} text-right`}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="p-8 text-center text-sm text-slate-500">
                  <span className="inline-flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
                    Loading tech stack...
                  </span>
                </td>
              </tr>
            ) : currentTableData.length > 0 ? (
              currentTableData.map((item, index) => {
                const bg = index % 2 === 1 ? "bg-[#F4F4F4]" : "bg-white";
                const td = `px-4 py-3 ${bg} first:rounded-l-xl last:rounded-r-xl align-middle`;
                const isSelected = selectedIds.includes(item.id);
                const isActive = item.status === "1" || item.status === 1 || item.status === true;
                const imageUrl = getTechnologyImageUrl(item);
                const techTitle = item.title || item.name || `Technology #${item.id || index + 1}`;

                return (
                  <tr key={item.id || index} className="hover:opacity-95 transition-opacity">
                    <td className={td}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectRow(item.id)}
                        className="w-4 h-4 rounded border-slate-300 accent-orange-500 cursor-pointer"
                      />
                    </td>

                    <td className={td}>
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={techTitle}
                          className="w-10 h-10 object-contain rounded-lg bg-white p-1 border border-slate-200 shadow-sm"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                          <FiCpu size={18} />
                        </div>
                      )}
                    </td>

                    <td className={td}>
                      <span className="text-sm font-semibold text-slate-800">
                        {techTitle}
                      </span>
                    </td>

                    <td className={td}>
                      <button
                        type="button"
                        onClick={() => handleStatusToggle(item)}
                        className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
                          isActive
                            ? "bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100"
                            : "bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100"
                        }`}
                        title="Click to toggle status"
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isActive ? "bg-emerald-500 animate-pulse" : "bg-rose-500"
                          }`}
                        />
                        {isActive ? "Active" : "Inactive"}
                      </button>
                    </td>

                    <td className={`${td} text-right`}>
                      <button
                        onClick={() => handleEditClick(item)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 shadow-sm text-xs font-semibold text-slate-700 hover:border-orange-500 hover:text-orange-600 transition-colors"
                      >
                        <FiEdit2 size={13} /> Edit
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="5" className="p-8 text-center text-sm text-slate-400 italic">
                  {search ? `No technologies matching "${search}" found.` : "No technologies found. Click 'Add Technology' to add your first tech stack item."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
        <span>
          Showing {showingFrom} to {showingTo} of {data.length} items
        </span>

        <div className="flex items-center gap-3">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
            className="px-3 py-1.5 font-semibold text-slate-700 bg-[#F4F4F4] rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-200 transition-colors"
          >
            Previous
          </button>
          <span>
            Page <strong>{currentPage}</strong> of {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
            className="px-3 py-1.5 font-semibold text-slate-700 bg-[#F4F4F4] rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-200 transition-colors"
          >
            Next
          </button>

          <div className="relative">
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="appearance-none bg-white border border-slate-200 rounded-lg pl-3 pr-7 py-1.5 font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-orange-500/40 cursor-pointer"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <FiChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
        </div>
      </div>

      {/* Technology Modal */}
      {isModalOpen && (
        <TechstackModal
          isOpen={isModalOpen}
          initial={editData}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleModalSubmit}
          loading={modalLoading}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Selected Technology item(s)?"
        message={`Are you sure you want to permanently delete ${selectedIds.length} selected technology item(s)? This action cannot be undone.`}
        confirmText="Yes, Delete"
        cancelText="Cancel"
        loading={deleteLoading}
        variant="danger"
      />
    </div>
  );
}
