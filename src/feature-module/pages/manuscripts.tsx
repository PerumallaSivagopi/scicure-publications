import React, { useState, useEffect, useMemo } from "react";
import { URLS, Url } from "../../Urls";
import "../../assets/css/onboarding.css";
import { Eye, Edit, Trash2, FileText, Check, X, Upload } from "lucide-react";
import Modal from "../../components/ui/Modal";

interface Manuscript {
  _id?: string;
  authorName?: string;
  email?: string;
  mobile?: string;
  postalAddress?: string;
  country?: string;

  journalId?: string | {
    journalName?: string;
    journalId?: string;
    _id?: string;
  };

  articleType?: string;
  menuscriptTitle?: string;
  abstract?: string;
  manuscriptFile?: string;
}

const ManuscriptsPage = () => {
  const [editors, setEditors] = useState<Manuscript[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const token = localStorage.getItem("authToken") || "";
    fetch(URLS.MANUSCRIPTS,
      {
        method: "GET",
        headers: {
          "content-type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      }
    )
      .then((res) => res.json())
      .then((result) => {
        if (Array.isArray(result)) {
          setEditors(result);
        } else if (result && result.data && Array.isArray(result.data)) {
          setEditors(result.data);
        } else {
          setEditors([]);
        }
      })
      .catch((err) => {
        console.error("Error fetching manuscripts:", err);
        setEditors([]);
      });
  }, []);

  // New state for Modal and Form
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedManuscript, setSelectedManuscript] = useState<Manuscript | null>(null);

  const [journals, setJournals] = useState<any[]>([]);
  // Simplified state for demo - in real app might need file upload handling
  const [newManuscript, setNewManuscript] = useState<Manuscript>({
    authorName: "",
    email: "",
    mobile: "",
    postalAddress: "",
    country: "",
    journalId: undefined, // specific type handling needed
    articleType: "",
    menuscriptTitle: "",
    abstract: "",
  });

  const resetForm = () => {
    setNewManuscript({
      authorName: "",
      email: "",
      mobile: "",
      postalAddress: "",
      country: "",
      journalId: undefined,
      articleType: "",
      menuscriptTitle: "",
      abstract: "",
    });
    setSelectedManuscript(null);
    setIsEditMode(false);
  };

  // Fetch Journals for dropdown
  useEffect(() => {
    const token = localStorage.getItem("authToken") || "";
    fetch(URLS.USERS, {
      method: "GET",
      headers: {
        "content-type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(result => {
        if (result.data && Array.isArray(result.data)) {
          const journalData = result.data.filter((item: any) => item.role === 'journal');
          setJournals(journalData);
        }
      })
      .catch(err => console.error("Error fetching journals:", err));
  }, []);

  const handleSaveManuscript = () => {
    // Simple validation
    if (!newManuscript.menuscriptTitle) {
      alert("Please fill in required fields");
      return;
    }

    const token = localStorage.getItem("authToken") || "";
    let url = URLS.MANUSCRIPTS;
    let method = "POST";

    if (isEditMode && selectedManuscript) {
      url = `${URLS.MANUSCRIPTS}/${selectedManuscript._id}`;
      method = "PUT";
    }

    fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(newManuscript)
    })
      .then(res => res.json())
      .then(result => {
        alert(isEditMode ? "Manuscript updated successfully!" : "Manuscript added successfully!");
        setIsAddModalOpen(false);
        resetForm();
        // Refetch
        return fetch(URLS.MANUSCRIPTS, {
          method: "GET",
          headers: {
            "content-type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });
      })
      .then(res => res && res.json())
      .then(result => {
        if (result) {
          if (Array.isArray(result)) setEditors(result);
          else if (result.data && Array.isArray(result.data)) setEditors(result.data);
        }
      })
      .catch(err => {
        console.error("Error saving manuscript:", err);
        alert("Failed to save manuscript");
      });
  };

  const handleView = (row: Manuscript) => {
    setSelectedManuscript(row);
    setIsViewModalOpen(true);
  };

  const handleEdit = (row: Manuscript) => {
    let jId: any = "";
    if (typeof row.journalId === 'object' && row.journalId !== null) {
      jId = row.journalId._id;
    } else {
      jId = row.journalId;
    }

    setNewManuscript({
      authorName: row.authorName || "",
      email: row.email || "",
      mobile: row.mobile || "",
      postalAddress: row.postalAddress || "",
      country: row.country || "",
      journalId: jId,
      articleType: row.articleType || "",
      menuscriptTitle: row.menuscriptTitle || "",
      abstract: row.abstract || "",
      manuscriptFile: row.manuscriptFile // Keep existing file ref if needed
    });
    setSelectedManuscript(row);
    setIsEditMode(true);
    setIsAddModalOpen(true);
  };

  const handleDelete = (row: Manuscript) => {
    setSelectedManuscript(row);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedManuscript) return;

    try {
      const token = localStorage.getItem("authToken") || "";
      const response = await fetch(`${URLS.MANUSCRIPTS}/${selectedManuscript._id}`, {
        method: 'DELETE',
        headers: {
          "Authorization": `Bearer ${token}`,
        }
      });

      if (response.ok) {
        alert("Manuscript deleted successfully");
        // Refetch
        const res = await fetch(URLS.MANUSCRIPTS, {
          method: "GET",
          headers: {
            "content-type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });
        const result = await res.json();
        if (result) {
          if (Array.isArray(result)) setEditors(result);
          else if (result.data && Array.isArray(result.data)) setEditors(result.data);
        }
      } else {
        alert("Failed to delete manuscript");
      }
    } catch (error) {
      console.error("Error deleting manuscript:", error);
      alert("Error deleting manuscript");
    } finally {
      setIsDeleteModalOpen(false);
      setSelectedManuscript(null);
    }
  };

  // Search filter including nested journalName
  const filteredData = useMemo(() => {
    if (!searchTerm) return editors;

    const term = searchTerm.toLowerCase();

    return editors.filter((item) => {


      return (
        item.authorName?.toLowerCase().includes(term) ||
        item.email?.toLowerCase().includes(term) ||
        item.mobile?.toLowerCase().includes(term) ||
        item.country?.toLowerCase().includes(term) ||
        item.postalAddress?.toLowerCase().includes(term) ||
        item.articleType?.toLowerCase().includes(term) ||
        item.menuscriptTitle?.toLowerCase().includes(term) ||
        (typeof item.journalId === 'object' && (item.journalId as any)?.journalName?.toLowerCase().includes(term))
      );
    });

  }, [searchTerm, editors]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / pageSize);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredData.slice(startIndex, startIndex + pageSize);
  }, [filteredData, currentPage, pageSize]);

  return (
    <div className="page-wrapper">
      <div className="content container-fluid">
        <div className="page-header">
          <div>
            <h3 className="page-title">Manuscripts</h3>
            <ul className="breadcrumb">
              <li className="breadcrumb-item">
                <a href="/index">Dashboard</a>
              </li>
              <li className="breadcrumb-item active">Manuscripts</li>
            </ul>
          </div>
        </div>


        {/* Editors Table */}
        <div className="row">
          <div className="col-md-12">
            <div className="card">
              <div className="card-body">

                {/* Search + Entries */}
                <div
                  className="table-controls"
                  style={{
                    marginBottom: 20,
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <label style={{ marginRight: 10 }}>Show entries:</label>
                    <select
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      style={{
                        padding: "6px 8px",
                        border: "1px solid #ddd",
                        borderRadius: 4,
                      }}
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                    </select>
                  </div>

                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    style={{
                      padding: "8px 12px",
                      border: "1px solid #ddd",
                      borderRadius: 4,
                      width: 200,
                    }}
                  />
                </div>

                {/* TABLE */}
                <div className="overflow-x-auto">
                  <table
                    className="table table-striped table-hover"
                    style={{ whiteSpace: "nowrap" }}
                  >
                    <thead>
                      <tr>
                        <th>S.No</th>
                        <th>Author</th>
                        <th>Email</th>

                        <th>Country</th>
                        <th>Journal Name</th>
                        <th>Manuscript Title</th>
                        <th>Manuscript Type</th>
                        <th>PDF</th>
                        <th>Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {paginatedData.length > 0 ? (
                        paginatedData.map((row, index) => (
                          <tr key={row._id || index}>
                            <td>{(currentPage - 1) * pageSize + index + 1}</td>
                            <td>{row.authorName || "-"}</td>
                            <td>{row.email || "-"}</td>

                            <td>{row.country || "-"}</td>

                            <td>
                              {typeof row.journalId === 'object' && row.journalId !== null
                                ? (row.journalId as any).journalName
                                : "-"}
                            </td>

                            <td>{row.menuscriptTitle || "-"}</td>
                            <td>{row.articleType || "-"}</td>

                            <td>
                              {row.manuscriptFile ? (
                                <a
                                  href={`${Url}upload/${row.manuscriptFile}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{ color: "#007bff", textDecoration: "underline" }}
                                >
                                  View File
                                </a>
                              ) : (
                                "-"
                              )}
                            </td>

                            <td>
                              <div style={{ display: "flex", gap: 10 }}>
                                <Eye size={18} color="#3e99a8" onClick={() => handleView(row)} />
                                <Edit size={18} color="#e1b225" onClick={() => handleEdit(row)} />
                                <Trash2 size={18} color="#bd3846" onClick={() => handleDelete(row)} />
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={10} style={{ textAlign: "center", padding: 20 }}>
                            No records found
                          </td>
                        </tr>
                      )}
                    </tbody>

                  </table>
                </div>

                {/* Pagination */}
                <div
                  style={{
                    marginTop: 20,
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <span>
                    Showing{" "}
                    {paginatedData.length
                      ? (currentPage - 1) * pageSize + 1
                      : 0}{" "}
                    to{" "}
                    {Math.min(currentPage * pageSize, filteredData.length)} of{" "}
                    {filteredData.length} entries
                  </span>

                  <div style={{ display: "flex", gap: 5 }}>
                    <button
                      onClick={() =>
                        setCurrentPage((p) => Math.max(1, p - 1))
                      }
                      disabled={currentPage === 1}
                      className="paginate_button"
                    >
                      Previous
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`paginate_button ${page === currentPage ? "current" : ""
                            }`}
                        >
                          {page}
                        </button>
                      )
                    )}

                    <button
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="paginate_button"
                    >
                      Next
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>

      </div>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          resetForm();
        }}
        title="Edit Manuscript"
        maxWidth="max-w-4xl"
        footer={
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:text-gray-900 transition-all duration-200 focus:ring-2 focus:ring-gray-200 outline-none"
            >
              Cancel
            </button>

            <button
              onClick={handleSaveManuscript}
              className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-[#00467F] to-[#0078A8] rounded-xl hover:shadow-lg hover:shadow-blue-900/20 hover:from-[#031E40] hover:to-[#00467F] transition-all duration-200 transform hover:-translate-y-0.5 focus:ring-2 focus:ring-[#00467F] outline-none"
            >
              Update Manuscript
            </button>
          </div>
        }
      >
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">
                Title *
              </label>
              <input
                type="text"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#00467F]/20 focus:border-[#00467F]"
                value={newManuscript.menuscriptTitle}
                onChange={(e) =>
                  setNewManuscript({
                    ...newManuscript,
                    menuscriptTitle: e.target.value,
                  })
                }
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">
                Author Name
              </label>
              <input
                type="text"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#00467F]/20 focus:border-[#00467F]"
                value={newManuscript.authorName}
                onChange={(e) =>
                  setNewManuscript({
                    ...newManuscript,
                    authorName: e.target.value,
                  })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">
                Email
              </label>
              <input
                type="email"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#00467F]/20 focus:border-[#00467F]"
                value={newManuscript.email}
                onChange={(e) =>
                  setNewManuscript({
                    ...newManuscript,
                    email: e.target.value,
                  })
                }
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">
                Mobile
              </label>
              <input
                type="text"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#00467F]/20 focus:border-[#00467F]"
                value={newManuscript.mobile}
                onChange={(e) =>
                  setNewManuscript({
                    ...newManuscript,
                    mobile: e.target.value,
                  })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">
                Country
              </label>
              <input
                type="text"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#00467F]/20 focus:border-[#00467F]"
                value={newManuscript.country}
                onChange={(e) =>
                  setNewManuscript({
                    ...newManuscript,
                    country: e.target.value,
                  })
                }
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">
                Journal
              </label>
              <select
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#00467F]/20 focus:border-[#00467F]"
                value={
                  typeof newManuscript.journalId === "string"
                    ? newManuscript.journalId
                    : newManuscript.journalId?._id || ""
                }
                onChange={(e) =>
                  setNewManuscript({
                    ...newManuscript,
                    journalId: e.target.value,
                  })
                }
              >
                <option value="">Select Journal</option>
                {journals.map((journal) => (
                  <option key={journal._id} value={journal._id}>
                    {journal.journalTitle || journal.username || "Unknown Journal"}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">
              Abstract
            </label>
            <textarea
              rows={4}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#00467F]/20 focus:border-[#00467F]"
              value={newManuscript.abstract}
              onChange={(e) =>
                setNewManuscript({
                  ...newManuscript,
                  abstract: e.target.value,
                })
              }
            />
          </div>
        </div>
      </Modal>


      {/* View Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Manuscript Details"
        maxWidth="max-w-3xl"
        footer={
          <button
            onClick={() => setIsViewModalOpen(false)}
            className="px-5 py-2.5 text-sm font-medium text-white bg-[#00467F] rounded-xl hover:bg-[#031E40] transition-colors"
          >
            Close
          </button>
        }
      >
        {selectedManuscript && (
          <div className="space-y-6">
            <div className="border-b border-gray-100 pb-4">
              <h4 className="text-xl font-bold text-[#00467F]">{selectedManuscript.menuscriptTitle}</h4>
              <p className="text-sm text-gray-500 mt-1">Type: {selectedManuscript.articleType}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h5 className="text-xs font-semibold text-gray-500 uppercase mb-1">Author</h5>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{selectedManuscript.authorName}</span>
                </div>
              </div>
              <div>
                <h5 className="text-xs font-semibold text-gray-500 uppercase mb-1">Email</h5>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{selectedManuscript.email}</span>
                </div>
              </div>
              <div>
                <h5 className="text-xs font-semibold text-gray-500 uppercase mb-1">Mobile</h5>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{selectedManuscript.mobile || "-"}</span>
                </div>
              </div>
              <div>
                <h5 className="text-xs font-semibold text-gray-500 uppercase mb-1">Country</h5>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{selectedManuscript.country}</span>
                </div>
              </div>
              <div>
                <h5 className="text-xs font-semibold text-gray-500 uppercase mb-1">Postal Address</h5>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{selectedManuscript.postalAddress || "-"}</span>
                </div>
              </div>
              <div>
                <h5 className="text-xs font-semibold text-gray-500 uppercase mb-1">Journal</h5>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {typeof selectedManuscript.journalId === 'object' && selectedManuscript.journalId !== null
                      ? (selectedManuscript.journalId as any).journalName
                      : "N/A"}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <h5 className="text-xs font-semibold text-gray-500 uppercase mb-2">Abstract</h5>
              <p className="text-sm text-gray-700 leading-relaxed">
                {selectedManuscript.abstract || "No abstract available."}
              </p>
            </div>

            {selectedManuscript.manuscriptFile && (
              <div className="flex justify-end">
                <a
                  href={`${Url}upload/${selectedManuscript.manuscriptFile}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
                >
                  <FileText size={16} />
                  View PDF
                </a>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Delete"
        footer={
          <>
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              className="px-5 py-2.5 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
          </>
        }
      >
        <div className="py-2">
          <p className="text-gray-600">Are you sure you want to delete this manuscript? This action cannot be undone.</p>
          {selectedManuscript && (
            <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-100">
              <p className="text-sm font-medium text-red-800">{selectedManuscript.menuscriptTitle}</p>
              <p className="text-xs text-red-600">{selectedManuscript.authorName}</p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default ManuscriptsPage;


