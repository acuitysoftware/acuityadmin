import React, { useState, useEffect, useMemo, useCallback } from "react";
import { FiSearch, FiTrash2, FiEdit2, FiChevronDown, FiRefreshCw, FiImage, FiBriefcase } from "react-icons/fi";
import { GoPlus } from "react-icons/go";
import { toast } from "react-toastify";
import SolutionModal, { getSolutionImageUrl } from "../components/SolutionModal";
import ConfirmModal from "../components/ConfirmModal";
import {
  getSolutionsList,
  createSolution,
  updateSolution,
  deleteSolution,
  changeSolutionStatus,
  getSolutionView,
} from "../../../api/home/solution";

export default function HomeSolutions() {
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

  // Fetch Solutions from API with search_keyword
  const fetchSolutions = useCallback(async (keyword = "") => {
    setLoading(true);
    try {
      const payload = keyword && keyword.trim() ? { search_keyword: keyword.trim() } : {};
      const res = await getSolutionsList(token, payload);
      const list = Array.isArray(res)
        ? res
        : res?.data && Array.isArray(res.data)
        ? res.data
        : res?.solutions && Array.isArray(res.solutions)
        ? res.solutions
        : [];
      setData(list);
    } catch (err) {
      console.error("Fetch solutions failed:", err);
      toast.error(getErrMessage(err));
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSolutions(search);
    }, 350);

    return () => clearTimeout(timer);
  }, [search, fetchSolutions]);

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
      await changeSolutionStatus(token, { id: item.id, status: nextStatus });
      toast.success("Solution status updated");
      setData((prev) =>
        prev.map((s) => (s.id === item.id ? { ...s, status: nextStatus } : s))
      );
    } catch (err) {
      toast.error(getErrMessage(err));
    }
  };

  // Delete selected solutions handler
  const handleDeleteConfirm = async () => {
    if (selectedIds.length === 0) return;
    setDeleteLoading(true);
    try {
      await deleteSolution(token, { ids: selectedIds });
      toast.success("Solution(s) deleted successfully");
      setSelectedIds([]);
      setIsConfirmOpen(false);
      fetchSolutions(search);
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
      const res = await getSolutionView(token, { id: item.id });
      const solutionDetail = res?.data || res?.solution || res;
      if (solutionDetail && typeof solutionDetail === "object" && !Array.isArray(solutionDetail)) {
        setEditData((prev) => ({ ...prev, ...solutionDetail }));
      }
    } catch {
      // Fall back to item row data
    }
  };

  // Modal Submit (Create / Update)
  const handleModalSubmit = async (formData) => {
    setModalLoading(true);
    try {
      if (formData.id) {
        await updateSolution(token, formData);
        toast.success("Solution updated successfully");
      } else {
        await createSolution(token, formData);
        toast.success("Solution added successfully");
      }
      setIsModalOpen(false);
      fetchSolutions(search);
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
          <h1 className="text-2xl font-bold font-heading text-[#0e1b3d]">Solutions Settings</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage enterprise solution highlights, capabilities, descriptions, and homepage blocks.
          </p>
        </div>
        <button
          onClick={() => fetchSolutions(search)}
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
            <GoPlus className="text-lg" /> Add Solution
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
            placeholder="Search solutions..."
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
              <th className={`${th} w-20`}>Image</th>
              <th className={th}>Solution Title</th>
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
                    Loading solutions...
                  </span>
                </td>
              </tr>
            ) : currentTableData.length > 0 ? (
              currentTableData.map((item, index) => {
                const bg = index % 2 === 1 ? "bg-[#F4F4F4]" : "bg-white";
                const td = `px-4 py-3 ${bg} first:rounded-l-xl last:rounded-r-xl align-middle`;
                const isSelected = selectedIds.includes(item.id);
                const isActive = item.status === "1" || item.status === 1 || item.status === true;
                const imageUrl = getSolutionImageUrl(item);
                const solutionTitle = item.title || item.name || `Solution #${item.id || index + 1}`;

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
                          alt={solutionTitle}
                          className="w-10 h-10 object-contain rounded-lg bg-white p-1 border border-slate-200 shadow-sm"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                          <FiBriefcase size={18} />
                        </div>
                      )}
                    </td>

                    <td className={td}>
                      <span className="text-sm font-semibold text-slate-800">
                        {solutionTitle}
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
                  {search ? `No solutions matching "${search}" found.` : "No solutions found. Click 'Add Solution' to create your first solution."}
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

      {/* Solution Modal */}
      {isModalOpen && (
        <SolutionModal
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
        title="Delete Selected Solution(s)?"
        message={`Are you sure you want to permanently delete ${selectedIds.length} selected solution(s)? This action cannot be undone.`}
        confirmText="Yes, Delete"
        cancelText="Cancel"
        loading={deleteLoading}
        variant="danger"
      />
    </div>
  );
}
