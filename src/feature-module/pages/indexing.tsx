import React, { useEffect, useState, useRef } from "react";
import "../../assets/css/onboarding.css";
import { Plus, Trash2, Edit as EditIcon } from "lucide-react";
import Modal from "../../components/ui/Modal";
import { all_routes } from "../../router/all_routes";
import { URLS, ImageUrl } from "../../Urls";

type IndexingItem = {
  _id?: string;
  indexImg?: string;
  imageUrl?: string;
  status: "active" | "inactive" | string;
};

const IndexingPage = () => {
  const [items, setItems] = useState<IndexingItem[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [status, setStatus] = useState<"active" | "inactive">("active");
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedItem, setSelectedItem] = useState<IndexingItem | null>(null);

  const openAdd = () => {
    setPreview(null);
    setStatus("active");
    setSelectedFile(null);
    setSelectedItem(null);
    setIsEditMode(false);
    setIsAddModalOpen(true);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    if (f) {
      const url = URL.createObjectURL(f);
      setPreview(url);
      setSelectedFile(f);
    } else {
      setPreview(null);
      setSelectedFile(null);
    }
  };

  const fetchIndexing = () => {
    const token = localStorage.getItem("authToken") || "";
    fetch(`${URLS.INDEX}`, {
      method: "GET",
      headers: {
        "content-type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((result) => {
        let list: any[] = [];
        if (Array.isArray(result)) {
          list = result;
        } else if (result && Array.isArray(result.data)) {
          list = result.data;
        }
        setItems(list || []);
      })
      .catch(() => setItems([]));
  };

  useEffect(() => {
    fetchIndexing();
  }, []);

  const saveItem = () => {
    const token = localStorage.getItem("authToken") || "";
    const formData = new FormData();
    if (selectedFile) {
      formData.append("indexImg", selectedFile);
    }
    formData.append("status", status);

    const isUpdate = isEditMode && selectedItem && selectedItem._id;
    const url = isUpdate ? `${URLS.INDEX}/${selectedItem?._id}` : `${URLS.INDEX}`;
    const method = isUpdate ? "PUT" : "POST";

    fetch(url, {
      method,
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        alert(isUpdate ? "Indexing updated successfully" : "Indexing added successfully");
        setIsAddModalOpen(false);
        setPreview(null);
        setSelectedFile(null);
        setSelectedItem(null);
        setIsEditMode(false);
        fetchIndexing();
      })
      .catch((err) => {
        alert(isUpdate ? "Failed to update indexing" : "Failed to add indexing");
      });
  };

  const removeItem = (id: string) => {
    const token = localStorage.getItem("authToken") || "";
    fetch(`${URLS.INDEX}/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then(() => {
        alert("Indexing deleted successfully");
        fetchIndexing();
      })
      .catch(() => {
        alert("Failed to delete indexing");
      });
  };

  const handleEdit = (item: IndexingItem) => {
    setSelectedItem(item);
    setIsEditMode(true);
    const src = item.indexImg
      ? (String(item.indexImg).startsWith("http")
        ? String(item.indexImg)
        : `${ImageUrl}${item.indexImg}`)
      : (item.imageUrl || null);
    setPreview(src || null);
    setSelectedFile(null);
    setStatus(String(item.status || "active").toLowerCase() as any);
    setIsAddModalOpen(true);
  };

  return (
    <div className="page-wrapper">
      <div className="content container-fluid">
        <div className="page-header">
          <div className="row align-items-center">
            <div className="col flex justify-between items-center">
              <div>
                <h3 className="page-title">Indexing</h3>
                <ul className="breadcrumb">
                  <li className="breadcrumb-item">
                    <a href={all_routes.index}>Dashboard</a>
                  </li>
                  <li className="breadcrumb-item active">Indexing</li>
                </ul>
              </div>
              <button
                className="px-4 py-2 bg-[#00467F] text-white rounded-lg flex items-center gap-2 hover:bg-[#031E40] transition-colors"
                onClick={openAdd}
              >
                <Plus size={18} />
                Add
              </button>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            {items.length === 0 ? (
              <div className="py-16 text-center text-gray-500">
                No indexing images added
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                {items.map((item) => {
                  const src = item.indexImg
                    ? (String(item.indexImg).startsWith("http")
                      ? String(item.indexImg)
                      : `${ImageUrl}${item.indexImg}`)
                    : (item.imageUrl || "");
                  return (
                  <div key={(item._id || src || Math.random()).toString()} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="aspect-[4/3] bg-gray-50">
                      {src ? (
                        <img src={src} alt="Indexing" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                      )}
                    </div>
                    <div className="flex items-center justify-between p-3">
                      <span
                        className={`badge ${
                          String(item.status).toLowerCase() === "active" ? "badge-success" : "badge-warning"
                        }`}
                      >
                        {item.status || "-"}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          className="p-2 text-[#00467F] hover:bg-[#00467F]/10 rounded-lg transition-colors"
                          onClick={() => handleEdit(item)}
                          title="Edit"
                        >
                          <EditIcon size={18} />
                        </button>
                        <button
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          onClick={() => item._id && removeItem(String(item._id))}
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                )})}
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={isEditMode ? "Edit Indexing" : "Add Indexing"}
        footer={
          <>
            <button
              className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </button>
            <button
              className="px-5 py-2.5 text-sm font-medium text-white bg-[#00467F] rounded-xl hover:bg-[#031E40] transition-colors"
              onClick={saveItem}
              disabled={!selectedFile && !isEditMode}
            >
              {isEditMode ? "Update" : "Save"}
            </button>
          </>
        }
        maxWidth="max-w-xl"
      >
        <div className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">
              Image
            </label>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={onFileChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00467F]/20 focus:border-[#00467F]"
            />
            {preview && (
              <div className="mt-3">
                <img src={preview} alt="Preview" className="h-40 rounded-lg object-contain border border-gray-200" />
              </div>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as "active" | "inactive")}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00467F]/20 focus:border-[#00467F]"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default IndexingPage;
