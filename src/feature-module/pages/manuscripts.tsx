import React, { useState, useEffect, useMemo } from "react";
import { URLS, Url } from "../../Urls";
import "../../assets/css/onboarding.css";
import { Eye, Edit, Trash2, FileText, Check, X, Upload, User, Mail, Phone, MapPin, Building, BookOpen } from "lucide-react";
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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
    setSelectedFile(null);
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

    const formData = new FormData();
    Object.keys(newManuscript).forEach(key => {
        if (key !== 'manuscriptFile' && newManuscript[key as keyof Manuscript] !== undefined) {
            formData.append(key, String(newManuscript[key as keyof Manuscript]));
        }
    });

    if (selectedFile) {
      formData.append("manuscriptFile", selectedFile);
    }

    fetch(url, {
      method: method,
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      body: formData
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
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600 font-medium">Show entries:</label>
                    <select
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#00467F]/20 focus:border-[#00467F] outline-none bg-white cursor-pointer"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                    </select>
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full sm:w-64 border border-gray-200 rounded-lg pl-4 pr-10 py-2 text-sm focus:ring-2 focus:ring-[#00467F]/20 focus:border-[#00467F] outline-none"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                      </svg>
                    </div>
                  </div>
                </div>

                {/* TABLE */}
                <div className="overflow-x-auto rounded-xl border border-gray-200">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-700 font-medium border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4">S.No</th>
                        <th className="px-6 py-4">Author</th>
                        <th className="px-6 py-4">Email</th>
                        <th className="px-6 py-4">Country</th>
                        <th className="px-6 py-4">Journal Name</th>
                        <th className="px-6 py-4">Manuscript Title</th>
                        <th className="px-6 py-4">Manuscript Type</th>
                        <th className="px-6 py-4">PDF</th>
                        <th className="px-6 py-4">Action</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">
                      {paginatedData.length > 0 ? (
                        paginatedData.map((row, index) => (
                          <tr key={row._id || index} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-6 py-4">{(currentPage - 1) * pageSize + index + 1}</td>
                            <td className="px-6 py-4 font-medium text-gray-900">{row.authorName || "-"}</td>
                            <td className="px-6 py-4 text-gray-500">{row.email || "-"}</td>
                            <td className="px-6 py-4 text-gray-500">{row.country || "-"}</td>
                            <td className="px-6 py-4 text-[#00467F]">
                              {typeof row.journalId === 'object' && row.journalId !== null
                                ? (row.journalId as any).journalName
                                : "-"}
                            </td>
                            <td className="px-6 py-4 text-gray-900">{row.menuscriptTitle || "-"}</td>
                            <td className="px-6 py-4">
                              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                {row.articleType || "-"}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              {row.manuscriptFile ? (
                                <a
                                  href={`${Url}upload/${row.manuscriptFile}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[#3e99a8] hover:text-[#2c7a86] underline flex items-center gap-1"
                                >
                                  <FileText className="w-3.5 h-3.5" />
                                  View
                                </a>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">

                                <button
                                  onClick={() => handleView(row)}
                                  className="p-1.5 text-[#3e99a8] hover:bg-[#3e99a8]/10 rounded-lg transition-colors"
                                  title="View"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleEdit(row)}
                                  className="p-1.5 text-[#e1b225] hover:bg-[#e1b225]/10 rounded-lg transition-colors"
                                  title="Edit"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(row)}
                                  className="p-1.5 text-[#bd3846] hover:bg-[#bd3846]/10 rounded-lg transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
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

                <div className="mt-4 flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    Showing {paginatedData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{' '}
                    {Math.min(currentPage * pageSize, filteredData.length)} of {filteredData.length} entries
                  </span>

                  <div className="flex gap-1">
                    {/* Previous Button */}
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className={`px-3 py-1.5 border border-gray-200 rounded-md text-sm font-medium transition-colors
                        ${currentPage === 1 
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                          : 'bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900 cursor-pointer'}`}
                    >
                      Previous
                    </button>

                    {/* Page Numbers */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-1.5 border rounded-md text-sm font-medium transition-colors
                          ${page === currentPage
                            ? 'bg-[#3e99a8] text-white border-[#3e99a8]'
                            : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:text-gray-900'}`}
                      >
                        {page}
                      </button>
                    ))}

                    {/* Next Button */}
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className={`px-3 py-1.5 border border-gray-200 rounded-md text-sm font-medium transition-colors
                        ${currentPage === totalPages
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900 cursor-pointer'}`}
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

          {/* File Upload */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">
              Manuscript File (PDF)
            </label>
            <div 
              className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:bg-gray-50 transition-colors cursor-pointer relative"
              onClick={() => document.getElementById('manuscript-file-upload')?.click()}
            >
              <div className="space-y-1 text-center">
                {selectedFile ? (
                   <div className="relative inline-block">
                      <div className="flex items-center gap-2 p-2 bg-blue-50 text-blue-700 rounded-lg">
                        <FileText size={24} />
                        <span className="text-sm font-medium">{selectedFile.name}</span>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      >
                        <X size={14} />
                      </button>
                   </div>
                ) : (
                   <>
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600 justify-center">
                        <span className="relative cursor-pointer bg-white rounded-md font-medium text-[#00467F] hover:text-[#003366] focus-within:outline-none">
                          Upload a file
                        </span>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">PDF up to 10MB</p>
                   </>
                )}
                <input
                  id="manuscript-file-upload"
                  type="file"
                  className="sr-only"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setSelectedFile(e.target.files[0]);
                    }
                  }}
                  accept=".pdf"
                />
              </div>
            </div>
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
              <h4 className="text-xl font-bold text-[#00467F] flex items-center gap-2">
                <FileText className="w-6 h-6" />
                {selectedManuscript.menuscriptTitle}
              </h4>
              <p className="text-sm text-gray-500 mt-1 ml-8">Type: {selectedManuscript.articleType}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                <User size={18} className="text-blue-500 min-w-4" />
                <div className="flex-grow">
                  <p className="text-xs text-gray-500 uppercase font-semibold">Author</p>
                  <p className="font-medium text-gray-900">{selectedManuscript.authorName}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                <Mail size={18} className="text-red-500 min-w-4" />
                <div className="flex-grow">
                  <p className="text-xs text-gray-500 uppercase font-semibold">Email</p>
                  <p className="font-medium text-gray-900 break-all">{selectedManuscript.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                <Phone size={18} className="text-green-500 min-w-4" />
                <div className="flex-grow">
                  <p className="text-xs text-gray-500 uppercase font-semibold">Mobile</p>
                  <p className="font-medium text-gray-900">{selectedManuscript.mobile || "-"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                <MapPin size={18} className="text-purple-500 min-w-4" />
                <div className="flex-grow">
                  <p className="text-xs text-gray-500 uppercase font-semibold">Country</p>
                  <p className="font-medium text-gray-900">{selectedManuscript.country}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg shadow-sm col-span-1 md:col-span-2">
                <MapPin size={18} className="text-gray-500 min-w-4" />
                <div className="flex-grow">
                  <p className="text-xs text-gray-500 uppercase font-semibold">Postal Address</p>
                  <p className="font-medium text-gray-900">{selectedManuscript.postalAddress || "-"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg shadow-sm col-span-1 md:col-span-2">
                <Building size={18} className="text-[#00467F] min-w-4" />
                <div className="flex-grow">
                  <p className="text-xs text-gray-500 uppercase font-semibold">Journal</p>
                  <p className="font-medium text-gray-900">
                    {typeof selectedManuscript.journalId === 'object' && selectedManuscript.journalId !== null
                      ? (selectedManuscript.journalId as any).journalName
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <h5 className="text-xs font-semibold text-gray-500 uppercase mb-2 flex items-center gap-2">
                <BookOpen size={16} /> Abstract
              </h5>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
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
        <div className="text-center py-4">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <Trash2 size={24} className="text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Delete Manuscript?</h3>
          <p className="text-gray-500">
            Are you sure you want to delete <span className="font-semibold text-gray-900">{selectedManuscript?.menuscriptTitle}</span>? 
            This action cannot be undone.
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default ManuscriptsPage;


