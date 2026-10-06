import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FiSearch, FiTrash2, FiEdit2, FiChevronDown, FiRefreshCw, FiImage, FiBriefcase } from "react-icons/fi";
import { GoPlus } from "react-icons/go";
import { toast } from "react-toastify";
import ProjectModal, { getProjectImageUrl } from "../components/ProjectModal";
import ConfirmModal from "../components/ConfirmModal";
import { getProjectsList, createProject, updateProject, deleteProject, changeProjectStatus, getProjectView } from "../../../api/home/project";

export default function HomeProject() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const token = localStorage.getItem("admin_token");
  const getErrMessage = (err) => err.response?.data?.message ?? err.response?.data?.error ?? err.message ?? "An error occurred";

  const fetchProjects = useCallback(async (keyword = "") => {
    setLoading(true);
    try {
      const res = await getProjectsList(token, keyword.trim() ? { search_keyword: keyword.trim() } : {});
      setData(Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : Array.isArray(res?.projects) ? res.projects : []);
    } catch (err) {
      console.error("Fetch projects failed:", err);
      toast.error(getErrMessage(err));
    } finally { setLoading(false); }
  }, [token]);

  useEffect(() => {
    const timer = setTimeout(() => fetchProjects(search), 350);
    return () => clearTimeout(timer);
  }, [search, fetchProjects]);

  const currentTableData = useMemo(() => data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage), [data, currentPage, itemsPerPage]);
  const totalPages = Math.ceil(data.length / itemsPerPage) || 1;
  const showingFrom = data.length ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const showingTo = Math.min(currentPage * itemsPerPage, data.length);

  const handleStatusToggle = async (item) => {
    const nextStatus = item.status === "1" || item.status === 1 || item.status === true ? "0" : "1";
    try {
      await changeProjectStatus(token, { id: item.id, status: nextStatus });
      toast.success("Project status updated");
      setData((prev) => prev.map((p) => p.id === item.id ? { ...p, status: nextStatus } : p));
    } catch (err) { toast.error(getErrMessage(err)); }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedIds.length) return;
    setDeleteLoading(true);
    try {
      await deleteProject(token, { ids: selectedIds });
      toast.success("Project(s) deleted successfully");
      setSelectedIds([]);
      setIsConfirmOpen(false);
      fetchProjects(search);
    } catch (err) { toast.error(getErrMessage(err)); }
    finally { setDeleteLoading(false); }
  };

  const handleEditClick = async (item) => {
    setEditData(item);
    setIsModalOpen(true);
    try {
      const res = await getProjectView(token, { id: item.id });
      const detail = res?.data || res?.project || res;
      if (detail && typeof detail === "object" && !Array.isArray(detail)) setEditData((prev) => ({ ...prev, ...detail }));
    } catch { /* Use list row data if the view request fails. */ }
  };

  const handleModalSubmit = async (formData) => {
    setModalLoading(true);
    try {
      if (formData.id) { await updateProject(token, formData); toast.success("Project updated successfully"); }
      else { await createProject(token, formData); toast.success("Project added successfully"); }
      setIsModalOpen(false);
      fetchProjects(search);
    } catch (err) { toast.error(getErrMessage(err)); }
    finally { setModalLoading(false); }
  };

  const th = "px-4 py-3.5 bg-[#F4F4F4] text-xs font-bold text-slate-700 first:rounded-l-xl last:rounded-r-xl";
  return (
    <div className="p-6 bg-white min-h-screen font-body rounded-2xl shadow-sm border border-slate-100">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div><h1 className="text-2xl font-bold text-[#0e1b3d]">Projects Settings</h1><p className="text-xs text-slate-500 mt-1">Manage homepage projects, descriptions, and showcase images.</p></div>
        <button onClick={() => fetchProjects(search)} className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors flex items-center gap-1 text-xs font-semibold" title="Refresh List"><FiRefreshCw className={loading ? "animate-spin" : ""} /> Refresh</button>
      </div>
      <div className="mb-4 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="flex items-center gap-3">
          <button onClick={() => { setEditData(null); setIsModalOpen(true); }} className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-sm font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-md shadow-orange-500/20 transition-all"><GoPlus className="text-lg" /> Add Project</button>
          {selectedIds.length > 0 && <button onClick={() => setIsConfirmOpen(true)} className="bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2"><FiTrash2 /> Delete Selected ({selectedIds.length})</button>}
        </div>
        <div className="relative w-full sm:w-72"><input type="text" placeholder="Search projects..." value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#F4F4F4] rounded-xl outline-none focus:ring-2 focus:ring-orange-500/40" /><FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" /></div>
      </div>
      <div className="overflow-x-auto"><table className="w-full text-left border-separate border-spacing-y-1"><thead><tr>
        <th className={`${th} w-10`}><input type="checkbox" checked={currentTableData.length > 0 && currentTableData.every((item) => selectedIds.includes(item.id))} onChange={(e) => setSelectedIds(e.target.checked ? [...new Set([...selectedIds, ...currentTableData.map((item) => item.id)])] : selectedIds.filter((id) => !currentTableData.some((item) => item.id === id)))} className="w-4 h-4 accent-orange-500" /></th>
        <th className={`${th} w-20`}>Image</th><th className={th}>Project Title</th><th className={th}>Status</th><th className={`${th} text-right`}>Actions</th>
      </tr></thead><tbody>
        {loading ? <tr><td colSpan="5" className="p-8 text-center text-sm text-slate-500"><span className="inline-flex items-center gap-2"><span className="w-5 h-5 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />Loading projects...</span></td></tr>
          : currentTableData.length ? currentTableData.map((item, index) => {
            const bg = index % 2 ? "bg-[#F4F4F4]" : "bg-white";
            const td = `px-4 py-3 ${bg} first:rounded-l-xl last:rounded-r-xl align-middle`;
            const active = item.status === "1" || item.status === 1 || item.status === true;
            const imageUrl = getProjectImageUrl(item);
            return <tr key={item.id || index}>
              <td className={td}><input type="checkbox" checked={selectedIds.includes(item.id)} onChange={() => setSelectedIds((prev) => prev.includes(item.id) ? prev.filter((id) => id !== item.id) : [...prev, item.id])} className="w-4 h-4 accent-orange-500" /></td>
              <td className={td}>{imageUrl ? <img src={imageUrl} alt={item.title} className="w-12 h-10 object-cover rounded-lg border border-slate-200" onError={(e) => { e.currentTarget.style.display = "none"; }} /> : <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400"><FiBriefcase /></div>}</td>
              <td className={td}><span className="text-sm font-semibold text-slate-800">{item.title || `Project #${item.id || index + 1}`}</span></td>
              <td className={td}><button type="button" onClick={() => handleStatusToggle(item)} className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-bold ${active ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-rose-50 text-rose-600 border border-rose-200"}`}><span className={`w-2 h-2 rounded-full ${active ? "bg-emerald-500" : "bg-rose-500"}`} />{active ? "Active" : "Inactive"}</button></td>
              <td className={`${td} text-right`}><button onClick={() => handleEditClick(item)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 shadow-sm text-xs font-semibold text-slate-700 hover:border-orange-500 hover:text-orange-600"><FiEdit2 size={13} /> Edit</button></td>
            </tr>;
          }) : <tr><td colSpan="5" className="p-8 text-center text-sm text-slate-400 italic">{search ? `No projects matching "${search}" found.` : "No projects found. Click 'Add Project' to create your first project."}</td></tr>}
      </tbody></table></div>
      <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500"><span>Showing {showingFrom} to {showingTo} of {data.length} items</span><div className="flex items-center gap-3">
        <button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)} className="px-3 py-1.5 font-semibold text-slate-700 bg-[#F4F4F4] rounded-lg disabled:opacity-40">Previous</button><span>Page <strong>{currentPage}</strong> of {totalPages}</span><button disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)} className="px-3 py-1.5 font-semibold text-slate-700 bg-[#F4F4F4] rounded-lg disabled:opacity-40">Next</button>
        <div className="relative"><select value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }} className="appearance-none bg-white border border-slate-200 rounded-lg pl-3 pr-7 py-1.5 font-semibold text-slate-700"><option value={5}>5</option><option value={10}>10</option><option value={20}>20</option><option value={50}>50</option></select><FiChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400" /></div>
      </div></div>
      {isModalOpen && <ProjectModal isOpen={isModalOpen} initial={editData} onClose={() => setIsModalOpen(false)} onSubmit={handleModalSubmit} loading={modalLoading} />}
      <ConfirmModal isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} onConfirm={handleDeleteConfirm} title="Delete Selected Project(s)?" message={`Are you sure you want to permanently delete ${selectedIds.length} selected project(s)? This action cannot be undone.`} confirmText="Yes, Delete" cancelText="Cancel" loading={deleteLoading} variant="danger" />
    </div>
  );
}
