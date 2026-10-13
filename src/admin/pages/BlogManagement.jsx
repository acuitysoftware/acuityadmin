import { useCallback, useEffect, useMemo, useState } from "react";
import { FiChevronDown, FiEdit2, FiFileText, FiRefreshCw, FiSearch, FiTrash2 } from "react-icons/fi";
import { GoPlus } from "react-icons/go";
import { toast } from "react-toastify";
import {
  changeBlogStatus,
  createBlog,
  deleteBlog,
  getBlogsList,
  updateBlog,
  viewBlog,
} from "../../api/blog/blog";
import BlogModal from "./components/BlogModal";
import ConfirmModal from "./components/ConfirmModal";

const errorMessage = (error) =>
  error.response?.data?.message ?? error.response?.data?.error ?? error.message ?? "An error occurred";

function responseData(response) {
  if (response?.status === false) throw new Error(response.message || "The request could not be completed.");
  return response?.data ?? response;
}

export default function BlogManagement() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedIds, setSelectedIds] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editBlog, setEditBlog] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [editLoadingId, setEditLoadingId] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const token = localStorage.getItem("admin_token");

  const fetchBlogs = useCallback(async (keyword = "") => {
    setLoading(true);
    try {
      const response = await getBlogsList(token, keyword.trim() ? { search_keyword: keyword.trim() } : {});
      const list = responseData(response);
      if (!Array.isArray(list)) throw new Error("The blog list response was not a list.");
      setBlogs(list);
      setSelectedIds([]);
    } catch (error) {
      console.error("Fetch blogs failed:", error);
      toast.error(errorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    const timer = setTimeout(() => fetchBlogs(search), 350);
    return () => clearTimeout(timer);
  }, [fetchBlogs, search]);

  const visibleBlogs = useMemo(
    () => blogs.slice((page - 1) * pageSize, page * pageSize),
    [blogs, page, pageSize],
  );
  const totalPages = Math.ceil(blogs.length / pageSize) || 1;
  const showingFrom = blogs.length ? (page - 1) * pageSize + 1 : 0;
  const showingTo = Math.min(page * pageSize, blogs.length);

  const toggleStatus = async (blog) => {
    const status = blog.status === "1" || blog.status === 1 || blog.status === true ? "0" : "1";
    try {
      responseData(await changeBlogStatus(token, { id: blog.id, status }));
      toast.success("Blog status updated");
      setBlogs((previous) => previous.map((item) => item.id === blog.id ? { ...item, status } : item));
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };

  const confirmDelete = async () => {
    if (!selectedIds.length) return;
    setDeleteLoading(true);
    try {
      responseData(await deleteBlog(token, { ids: selectedIds }));
      toast.success("Blog(s) deleted successfully");
      setConfirmOpen(false);
      setSelectedIds([]);
      await fetchBlogs(search);
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setDeleteLoading(false);
    }
  };

  const openEdit = async (blog) => {
    setEditLoadingId(blog.id);
    try {
      const detail = responseData(await viewBlog(token, { id: blog.id }));
      if (!detail || typeof detail !== "object" || Array.isArray(detail)) {
        throw new Error("The blog details could not be loaded.");
      }
      setEditBlog(detail);
      setModalOpen(true);
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setEditLoadingId(null);
    }
  };

  const saveBlog = async (formData, isEditing) => {
    setModalLoading(true);
    try {
      responseData(isEditing ? await updateBlog(token, formData) : await createBlog(token, formData));
      toast.success(isEditing ? "Blog updated successfully" : "Blog added successfully");
      setModalOpen(false);
      await fetchBlogs(search);
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setModalLoading(false);
    }
  };

  const th = "bg-[#F4F4F4] px-4 py-3.5 text-left text-xs font-bold text-slate-700 first:rounded-l-xl last:rounded-r-xl";

  return (
    <section className="min-h-screen rounded-2xl border border-slate-100 bg-white p-6 font-body shadow-sm">
      <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-heading text-2xl font-bold text-primary">Blog Management</h1>
          <p className="mt-1 text-sm text-slate-500">Create and manage blog articles, descriptions, and cover images.</p>
        </div>
        <button type="button" onClick={() => fetchBlogs(search)} title="Refresh blogs" className="flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200">
          <FiRefreshCw className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      <div className="mb-4 flex flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => { setEditBlog(null); setModalOpen(true); }} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-orange-500/20 hover:from-orange-600 hover:to-amber-600">
            <GoPlus className="text-lg" /> Add Blog
          </button>
          {selectedIds.length > 0 && (
            <button type="button" onClick={() => setConfirmOpen(true)} className="flex items-center gap-2 rounded-xl bg-rose-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-600">
              <FiTrash2 /> Delete Selected ({selectedIds.length})
            </button>
          )}
        </div>
        <div className="relative w-full sm:w-72">
          <input type="search" placeholder="Search blogs..." value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} className="w-full rounded-xl bg-[#F4F4F4] py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-orange-500/40" />
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] table-fixed border-separate border-spacing-y-1 text-left">
          <colgroup>
            <col className="w-[5%]" />
            <col className="w-[10%]" />
            <col className="w-[22%]" />
            <col className="w-[37%]" />
            <col className="w-[13%]" />
            <col className="w-[13%]" />
          </colgroup>
          <thead><tr>
            <th className={`${th} text-center`}>
              <input type="checkbox" aria-label="Select all blogs on this page" checked={visibleBlogs.length > 0 && visibleBlogs.every((blog) => selectedIds.includes(blog.id))} onChange={(event) => setSelectedIds((previous) => event.target.checked ? [...new Set([...previous, ...visibleBlogs.map((blog) => blog.id)])] : previous.filter((id) => !visibleBlogs.some((blog) => blog.id === id)))} className="h-4 w-4 accent-orange-500" />
            </th>
            <th className={`${th} text-center`}>Image</th>
            <th className={th}>Blog Title</th>
            <th className={th}>Description</th>
            <th className={`${th} text-center`}>Status</th>
            <th className={`${th} text-center`}>Actions</th>
          </tr></thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="p-8 text-center text-sm text-slate-500"><span className="inline-flex items-center gap-2"><span className="h-5 w-5 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />Loading blogs...</span></td></tr>
            ) : visibleBlogs.length ? visibleBlogs.map((blog, index) => {
              const cellClass = `align-middle px-4 py-3 ${index % 2 ? "bg-[#F4F4F4]" : "bg-white"} first:rounded-l-xl last:rounded-r-xl`;
              const active = blog.status === "1" || blog.status === 1 || blog.status === true;
              const title = blog.title || blog.slug || `Blog #${blog.id || index + 1}`;
              const description = (blog.short_description || blog.description || "")
                .replace(/<[^>]*>/g, " ")
                .replace(/&nbsp;/g, " ")
                .trim();
              return (
                <tr key={blog.id || index}>
                  <td className={`${cellClass} text-center`}><input type="checkbox" aria-label={`Select ${title}`} checked={selectedIds.includes(blog.id)} onChange={() => setSelectedIds((previous) => previous.includes(blog.id) ? previous.filter((id) => id !== blog.id) : [...previous, blog.id])} className="h-4 w-4 accent-orange-500" /></td>
                  <td className={cellClass}><div className="flex justify-center">{blog.image_path ? <img src={blog.image_path} alt={title} className="h-10 w-12 rounded-lg border border-slate-200 object-cover" onError={(event) => { event.currentTarget.style.display = "none"; }} /> : <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-400"><FiFileText /></span>}</div></td>
                  <td className={cellClass}><p className="text-sm font-semibold text-slate-800">{title}</p>{blog.title && blog.slug && <p className="mt-0.5 text-xs text-slate-400">{blog.slug}</p>}</td>
                  <td className={cellClass}><p className="max-h-10 overflow-hidden text-sm leading-5 text-slate-600">{description || "—"}</p></td>
                  <td className={`${cellClass} text-center`}>
                    <button type="button" onClick={() => toggleStatus(blog)} className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-bold ${active ? "border-emerald-200 bg-emerald-50 text-emerald-600" : "border-rose-200 bg-rose-50 text-rose-600"}`}>
                      <span className={`h-2 w-2 rounded-full ${active ? "bg-emerald-500" : "bg-rose-500"}`} />{active ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className={`${cellClass} text-center`}>
                    <button type="button" disabled={editLoadingId !== null} onClick={() => openEdit(blog)} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:border-orange-500 hover:text-orange-600 disabled:opacity-50">
                      {editLoadingId === blog.id ? <span className="h-3 w-3 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" /> : <FiEdit2 size={13} />} Edit
                    </button>
                  </td>
                </tr>
              );
            }) : (
              <tr><td colSpan="6" className="p-8 text-center text-sm italic text-slate-400">{search ? `No blogs matching "${search}" found.` : "No blogs found. Click 'Add Blog' to create one."}</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-col items-center justify-between gap-4 text-xs text-slate-500 sm:flex-row">
        <span>Showing {showingFrom} to {showingTo} of {blogs.length} items</span>
        <div className="flex items-center gap-3">
          <button type="button" disabled={page === 1} onClick={() => setPage((value) => value - 1)} className="rounded-lg bg-[#F4F4F4] px-3 py-1.5 font-semibold text-slate-700 disabled:opacity-40">Previous</button>
          <span>Page <strong>{page}</strong> of {totalPages}</span>
          <button type="button" disabled={page === totalPages} onClick={() => setPage((value) => value + 1)} className="rounded-lg bg-[#F4F4F4] px-3 py-1.5 font-semibold text-slate-700 disabled:opacity-40">Next</button>
          <div className="relative">
            <select value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1); }} className="appearance-none rounded-lg border border-slate-200 bg-white py-1.5 pl-3 pr-7 font-semibold text-slate-700">
              {[5, 10, 20, 50].map((size) => <option key={size} value={size}>{size}</option>)}
            </select>
            <FiChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
        </div>
      </div>

      {modalOpen && <BlogModal initial={editBlog} loading={modalLoading} onClose={() => setModalOpen(false)} onSubmit={saveBlog} />}
      <ConfirmModal isOpen={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={confirmDelete} title="Delete Selected Blog(s)?" message={`Are you sure you want to permanently delete ${selectedIds.length} selected blog(s)? This action cannot be undone.`} confirmText="Yes, Delete" cancelText="Cancel" loading={deleteLoading} variant="danger" />
    </section>
  );
}
