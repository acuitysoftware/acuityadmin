import React, { useState, useMemo } from "react";
import { FiSearch, FiCopy, FiTrash2, FiEdit2, FiChevronDown } from "react-icons/fi";
import { GoPlus } from "react-icons/go";
import { BsGripVertical } from "react-icons/bs";
import CMSModal from "./components/CMSModal";

// Dnd-kit imports for smooth drag and drop
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
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

const CmsSettings = () => {
  // State Management
  const [data, setData] = useState([
    { id: 1, page_title: "About Us", page_url: "about-us", short_description: "Learn more about us", rank: 1, status: true },
    { id: 2, page_title: "Privacy Policy", page_url: "privacy-policy", short_description: "Our privacy guidelines", rank: 2, status: true },
    { id: 3, page_title: "Terms & Conditions", page_url: "terms-conditions", short_description: "Terms of service", rank: 3, status: false },
    { id: 4, page_title: "Contact Us", page_url: "contact-us", short_description: "Get in touch", rank: 4, status: true },
    { id: 5, page_title: "FAQs", page_url: "faqs", short_description: "Frequently asked questions", rank: 5, status: true },
  ]);

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  // Filtered and Paginated Data
  const filteredData = useMemo(() => {
    return data.filter((item) =>
      item.page_title.toLowerCase().includes(search.toLowerCase())
    );
  }, [data, search]);

  const currentTableData = useMemo(() => {
    const firstPageIndex = (currentPage - 1) * itemsPerPage;
    const lastPageIndex = firstPageIndex + itemsPerPage;
    return filteredData.slice(firstPageIndex, lastPageIndex);
  }, [filteredData, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const showingFrom = filteredData.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const showingTo = Math.min(currentPage * itemsPerPage, filteredData.length);

  // Handlers
  const handleSearch = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

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

  const handleStatusChange = (id) => {
    setData((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: !item.status } : item
      )
    );
  };

  const handleDelete = async () => {
    if (selectedIds.length === 0) return alert("Please select a row to delete");
    if (!window.confirm("Are you sure you want to delete selected pages?")) return;

    setData((prev) => prev.filter((item) => !selectedIds.includes(item.id)));
    setSelectedIds([]);
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    alert("URL copied to clipboard");
  };

  // Dnd-kit Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 }, // Ensures clicks don't trigger drag
    }),
    useSensor(KeyboardSensor)
  );

  // Dnd-kit Drag End Handler
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = data.findIndex((item) => item.id === active.id);
    const newIndex = data.findIndex((item) => item.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const newData = arrayMove(data, oldIndex, newIndex);

      // Re-calculate ranks globally
      const reRankedData = newData.map((item, index) => ({
        ...item,
        rank: index + 1,
      }));

      setData(reRankedData);

      // Find the moved item to send to API
      const updatedItem = reRankedData.find((i) => i.id === active.id);
      console.log("Sending new rank to API:", updatedItem);
      // Add your API call for rank update here
    }
  };

  const handleEdit = (item) => {
    setEditData(item);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditData(null);
    setIsModalOpen(true);
  };

  const handleModalSubmit = (formData) => {
    if (editData) {
      setData((prev) =>
        prev.map((item) =>
          item.id === editData.id ? { ...item, ...formData } : item
        )
      );
    } else {
      const newItem = {
        id: Date.now(),
        ...formData,
        rank: data.length + 1,
        status: true,
      };
      setData((prev) => [...prev, newItem]);
    }
    setIsModalOpen(false);
  };

  // Header cell style (rounded ends make the header look like one pill bar)
  const th =
    "px-4 py-3.5 bg-[#F4F4F4] text-xs font-bold text-body first:rounded-l-xl last:rounded-r-xl";

  return (
    <div className="p-6 bg-white min-h-screen font-body">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-heading font-bold text-primary">CMS Pages</h1>
      </div>

      {/* Toolbar */}
      <div className="mb-4 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="flex gap-2">
          {selectedIds.length > 0 && (
            <button
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600 text-white text-sm font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <FiTrash2 /> Delete Selected
            </button>
          )}
          <button
            onClick={handleAdd}
            className="bg-accent hover:brightness-95 text-white text-sm font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition"
          >
            <GoPlus /> Add Page
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search pages..."
            value={search}
            onChange={handleSearch}
            className="w-full pl-10 pr-4 py-2 text-sm bg-[#F4F4F4] rounded-lg outline-none focus:ring-2 focus:ring-secondary/40 transition-all"
          />
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {/* Table */}
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
                  className="w-4 h-4 rounded border-gray-300 accent-accent"
                />
              </th>
              <th className={`${th} w-10`}></th> {/* Drag Handle Column */}
              <th className={th}>Rank</th>
              <th className={th}>Page Title</th>
              <th className={th}>URL</th>
              <th className={th}>Status</th>
              <th className={`${th} text-right`}>Actions</th>
            </tr>
          </thead>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={currentTableData.map((item) => item.id)}
              strategy={verticalListSortingStrategy}
            >
              <tbody>
                {currentTableData.map((item, index) => (
                  <SortableRow
                    key={item.id}
                    item={item}
                    index={index}
                    selectedIds={selectedIds}
                    handleSelectRow={handleSelectRow}
                    handleStatusChange={handleStatusChange}
                    handleCopy={handleCopy}
                    handleEdit={handleEdit}
                  />
                ))}
                {currentTableData.length === 0 && (
                  <tr>
                    <td colSpan="7" className="p-6 text-center text-sm text-gray-500">
                      No data found
                    </td>
                  </tr>
                )}
              </tbody>
            </SortableContext>
          </DndContext>
        </table>
      </div>

      {/* Footer / Pagination */}
      <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-body/60">
        <span>
          Showing {showingFrom} to {showingTo} of {filteredData.length} items
        </span>

        <div className="flex items-center gap-3">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
            className="px-3 py-1.5 text-xs font-semibold text-body bg-[#F4F4F4] rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors"
          >
            Previous
          </button>
          <span className="text-xs text-body">
            Page <strong>{currentPage}</strong> of {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
            className="px-3 py-1.5 text-xs font-semibold text-body bg-[#F4F4F4] rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors"
          >
            Next
          </button>

          {/* Items per page */}
          <div className="relative">
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="appearance-none bg-white border border-gray-200 rounded-lg pl-3 pr-8 py-1.5 text-xs font-semibold text-body outline-none focus:ring-2 focus:ring-secondary/40 cursor-pointer"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <FiChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-body/60" />
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <CMSModal
          isOpen={isModalOpen}
          initial={editData}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleModalSubmit}
        />
      )}
    </div>
  );
};

// =============================================
// Sortable Row Component
// =============================================
const SortableRow = ({
  item,
  index,
  selectedIds,
  handleSelectRow,
  handleStatusChange,
  handleCopy,
  handleEdit,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1000 : "auto",
    position: isDragging ? "relative" : undefined,
  };

  // Alternate rows: white / light grey. Background sits on the cells so the
  // rounded ends work inside a table.
  const bg = isDragging ? "bg-sky-50" : index % 2 === 1 ? "bg-[#F4F4F4]" : "bg-white";
  const td = `px-4 py-3 ${bg} first:rounded-l-xl last:rounded-r-xl`;

  return (
    <tr ref={setNodeRef} style={style} className={isDragging ? "shadow-md" : ""}>
      <td className={td}>
        <input
          type="checkbox"
          checked={selectedIds.includes(item.id)}
          onChange={() => handleSelectRow(item.id)}
          className="w-4 h-4 rounded border-gray-300 accent-accent"
        />
      </td>

      {/* Drag Handle - listeners and attributes applied here */}
      <td className={td}>
        <button
          className="cursor-grab active:cursor-grabbing touch-none w-6 h-6 rounded-full border border-gray-300 bg-white text-gray-500 hover:text-primary hover:border-primary flex items-center justify-center transition-colors"
          {...attributes}
          {...listeners}
        >
          <BsGripVertical size={14} />
        </button>
      </td>

      <td className={`${td} text-sm text-body`}>{item.rank}</td>

      {/* Title + small description underneath (like name + email in the design) */}
      <td className={td}>
        <div className="text-sm font-medium text-body leading-tight">{item.page_title}</div>
        <div className="text-[11px] text-body/50 mt-0.5">{item.short_description}</div>
      </td>

      <td className={`${td} text-sm text-body/70`}>
        <div className="flex items-center gap-2">
          <span>{`/${item.page_url}`}</span>
          <FiCopy
            className="cursor-pointer text-gray-400 hover:text-secondary transition-colors"
            onClick={() => handleCopy(item.page_url)}
          />
        </div>
      </td>

      {/* Status: dot + coloured label, click to toggle */}
      <td className={td}>
        <button
          type="button"
          onClick={() => handleStatusChange(item.id)}
          className={`inline-flex items-center gap-2 text-xs font-semibold ${
            item.status ? "text-green-600" : "text-red-600"
          }`}
          title="Click to toggle status"
        >
          <span
            className={`w-3.5 h-3.5 rounded-full border-2 ${
              item.status
                ? "border-green-300 bg-green-500"
                : "border-red-300 bg-red-500"
            }`}
          />
          {item.status ? "Active" : "Inactive"}
        </button>
      </td>

      <td className={`${td} text-right`}>
        <button
          onClick={() => handleEdit(item)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-gray-100 shadow-sm text-xs font-semibold text-body hover:border-secondary/40 hover:text-secondary transition-colors"
        >
          <FiEdit2 size={12} /> Edit
        </button>
      </td>
    </tr>
  );
};

export default CmsSettings;