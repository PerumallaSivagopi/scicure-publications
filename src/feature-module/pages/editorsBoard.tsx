import React, { useState, useEffect, useMemo } from "react";
import "../../assets/css/onboarding.css";
import { Eye, Edit, Trash2, Plus, User, Mail, Briefcase, Building2, Globe, BookOpen } from "lucide-react";
import Modal from "../../components/ui/Modal";
import { URLS } from "../../Urls";
import { all_routes } from "../../router/all_routes";

interface Editor {
  _id?: string;
  editorName: string;
  email: string;
  designation: string;
  institution: string;
  country: string;
  journalId?: string | {
    journalName?: string;
    journalId?: string;
    _id?: string;
    journalTitle?: string;
  };
}

const EditorsBoard = () => {
  const [editors, setEditors] = useState<Editor[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const trim = (v?: string, n: number = 24) => {
    if (!v) return "-";
    return v.length > n ? v.slice(0, n) + "…" : v;
  };

  // New state for Modal and Form
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedEditor, setSelectedEditor] = useState<Editor | null>(null);

  const [journals, setJournals] = useState<any[]>([]);
  const [newEditor, setNewEditor] = useState({
    editorName: "",
    email: "",
    designation: "",
    institution: "",
    country: "",
    journalId: "",
  });

  const filterEditorsByJournal = (items: Editor[]): Editor[] => {
    const role = (localStorage.getItem("userRole") || "").toLowerCase();

    if (role !== "journal") {
      return items;
    }

    let journalUserId = "";

    try {
      const storedInfo = localStorage.getItem("userInfo");
      if (storedInfo) {
        const parsed = JSON.parse(storedInfo);
        journalUserId = parsed.id || parsed._id || "";
      }
    } catch {
      journalUserId = "";
    }

    if (!journalUserId) {
      return items;
    }

    return items.filter((item: any) => {
      let itemJournalId: string | undefined = "";

      if (typeof item.journalId === "object" && item.journalId) {
        itemJournalId =
          (item.journalId as any)._id ||
          (item.journalId as any).journalId ||
          "";
      } else {
        itemJournalId = item.journalId;
      }

      return (
        itemJournalId && String(itemJournalId) === String(journalUserId)
      );
    });
  };

  useEffect(() => {
    const token = localStorage.getItem("authToken") || "";
    fetch(URLS.EDITORS, {
      method: "GET",
      headers: {
        "content-type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((result) => {
        let list: Editor[] = [];

        if (Array.isArray(result)) {
          list = result;
        } else if (result && Array.isArray(result.data)) {
          list = result.data;
        }

        list = filterEditorsByJournal(list);
        setEditors(list);
      })
      .catch((err) => {
        console.error("Error fetching editors:", err);
        setEditors([]);
      });
  }, []);

  useEffect(() => {
    const role = (localStorage.getItem("userRole") || "").toLowerCase();
    const token = localStorage.getItem("authToken") || "";

    fetch(URLS.USERS, {
      method: "GET",
      headers: {
        "content-type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((result) => {
        if (result.data && Array.isArray(result.data)) {
          let journalData = result.data.filter(
            (item: any) => item.role === "journal"
          );

          if (role === "journal") {
            let journalUserId = "";

            try {
              const storedInfo = localStorage.getItem("userInfo");
              if (storedInfo) {
                const parsed = JSON.parse(storedInfo);
                journalUserId = parsed.id || parsed._id || "";
              }
            } catch {
              journalUserId = "";
            }

            if (journalUserId) {
              journalData = journalData.filter(
                (j: any) =>
                  String(j._id) === String(journalUserId) ||
                  String(j.journalId) === String(journalUserId)
              );
            }
          }

          setJournals(journalData);
        }
      })
      .catch((err) => console.error("Error fetching journals:", err));
  }, []);

  const resetForm = () => {
    const role = (localStorage.getItem("userRole") || "").toLowerCase();
    let defaultJournalId = "";

    if (role === "journal") {
      try {
        const storedInfo = localStorage.getItem("userInfo");
        if (storedInfo) {
          const parsed = JSON.parse(storedInfo);
          defaultJournalId = parsed.id || parsed._id || "";
        }
      } catch {
        defaultJournalId = "";
      }
    }

    setNewEditor({
      editorName: "",
      email: "",
      designation: "",
      institution: "",
      country: "",
      journalId: defaultJournalId,
    });
    setSelectedEditor(null);
    setIsEditMode(false);
  };

  const handleSaveEditor = () => {
    if (!newEditor.editorName || !newEditor.designation || !newEditor.institution || !newEditor.country) {
      alert("Please fill in required fields (Name, Designation, Institution, Country)");
      return;
    }

    const token = localStorage.getItem("authToken") || "";
    
    let url = URLS.EDITORS;
    let method = "POST";

    if (isEditMode && selectedEditor) {
      url = `${URLS.EDITORS}/${selectedEditor._id}`;
      method = "PUT";
    }

    fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(newEditor)
    })
    .then(res => res.json())
    .then(result => {
      if (result) {
        alert(isEditMode ? "Editor updated successfully!" : "Editor added successfully!");
        setIsAddModalOpen(false);
        resetForm();
        // Refetch editors
        return fetch(URLS.EDITORS, {
             method: "GET",
             headers: {
               "content-type": "application/json",
               "Authorization": `Bearer ${token}`,
             },
        });
      } else {
        throw new Error("Operation failed");
      }
    })
    .then(res => res && res.json())
    .then(result => {
        if (result) {
          let list: Editor[] = [];

          if (Array.isArray(result)) {
            list = result;
          } else if (result && Array.isArray(result.data)) {
            list = result.data;
          }

          list = filterEditorsByJournal(list);
          setEditors(list);
        }
    })
    .catch(err => {
      console.error("Error saving editor:", err);
      alert("Failed to save editor");
    });
  };

  const handleView = (row: Editor) => {
    setSelectedEditor(row);
    setIsViewModalOpen(true);
  };

  const handleEdit = (row: Editor) => {
    // Extract journal ID if it's an object
    let jId = "";
    if (typeof row.journalId === 'object' && row.journalId !== null) {
        jId = row.journalId._id || "";
    } else if (typeof row.journalId === 'string') {
        jId = row.journalId;
    }

    setNewEditor({
      editorName: row.editorName || "",
      email: row.email || "",
      designation: row.designation || "",
      institution: row.institution || "",
      country: row.country || "",
      journalId: jId,
    });
    setSelectedEditor(row);
    setIsEditMode(true);
    setIsAddModalOpen(true);
  };

  const handleDelete = (row: Editor) => {
    setSelectedEditor(row);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
      if (!selectedEditor) return;
      
      try {
          const token = localStorage.getItem("authToken") || "";
          const response = await fetch(`${URLS.EDITORS}/${selectedEditor._id}`, {
              method: 'DELETE',
              headers: {
                  "Authorization": `Bearer ${token}`,
              }
          });

        if (response.ok) {
          alert("Editor deleted successfully");
          const res = await fetch(URLS.EDITORS, {
            method: "GET",
            headers: {
              "content-type": "application/json",
              "Authorization": `Bearer ${token}`,
            },
          });
          const result = await res.json();
          if (result) {
            let list: Editor[] = [];

            if (Array.isArray(result)) {
              list = result;
            } else if (result && Array.isArray(result.data)) {
              list = result.data;
            }

            list = filterEditorsByJournal(list);
            setEditors(list);
          }
          } else {
              alert("Failed to delete editor");
          }
      } catch (error) {
          console.error("Error deleting editor:", error);
          alert("Error deleting editor");
      } finally {
          setIsDeleteModalOpen(false);
          setSelectedEditor(null);
      }
  };

  // Search filter including nested journalName
  const filteredData = useMemo(() => {
    if (!searchTerm) return editors;

    const term = searchTerm.toLowerCase();

    return editors.filter((item) => {
      return (
        item.editorName?.toLowerCase().includes(term) ||
        item.email?.toLowerCase().includes(term) ||
        item.designation?.toLowerCase().includes(term) ||
        item.institution?.toLowerCase().includes(term) ||
        item.country?.toLowerCase().includes(term) ||
        (typeof item.journalId === 'object' && item.journalId !== null && (item.journalId as any).journalName?.toLowerCase().includes(term))
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
          <div className="row align-items-center">
            <div className="col flex justify-between items-center">
              <div>
                <h3 className="page-title">Editors Board</h3>
                <ul className="breadcrumb">
                  <li className="breadcrumb-item">
                    <a
                      href={
                        (localStorage.getItem("userRole") || "").toLowerCase() ===
                          "journal" &&
                        (() => {
                          try {
                            const stored = localStorage.getItem("userInfo");
                            if (stored) {
                              const parsed = JSON.parse(stored);
                              const id = parsed.id || parsed._id;
                              if (id) {
                                return `${all_routes.journalDetails}?id=${encodeURIComponent(
                                  id
                                )}`;
                              }
                            }
                          } catch {
                            return all_routes.index;
                          }
                          return all_routes.index;
                        })()
                          ? (() => {
                              try {
                                const stored = localStorage.getItem("userInfo");
                                if (stored) {
                                  const parsed = JSON.parse(stored);
                                  const id = parsed.id || parsed._id;
                                  if (id) {
                                    return `${all_routes.journalDetails}?id=${encodeURIComponent(
                                      id
                                    )}`;
                                  }
                                }
                              } catch {
                                return all_routes.index;
                              }
                              return all_routes.index;
                            })()
                          : all_routes.index
                      }
                    >
                      Dashboard
                    </a>
                  </li>
                  <li className="breadcrumb-item active">Editors Board</li>
                </ul>
              </div>
              <button
                className="px-4 py-2 bg-[#00467F] text-white rounded-lg flex items-center gap-2 hover:bg-[#031E40] transition-colors"
                onClick={() => { resetForm(); setIsAddModalOpen(true); }}
              >
                 Add Editor
              </button>
            </div>
          </div>
        </div>

        {/* Editors Table */}
        <div className="row">
          <div className="col-md-12">
            <div className="card">
              <div className="card-body">

                {/* Search + Entries */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Show entries:</span>
                    <select
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00467F]/20 focus:border-[#00467F]"
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
                      className="w-full md:w-64 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00467F]/20 focus:border-[#00467F]"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-gray-200">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-700 font-medium border-b border-gray-200">
                      <tr>
                        <th className="px-3 py-4">S.No</th>
                        <th className="px-3 py-4">Editor Name</th>
                        <th className="px-3 py-4">Email</th>
                        <th className="px-3 py-4">Designation</th>
                        <th className="px-3 py-4">Journal Name</th>
                        <th className="px-3 py-4">Country</th>
                        <th className="px-3 py-4">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {paginatedData.length > 0 ? (
                        paginatedData.map((row, index) => (
                          <tr key={row._id || index} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-3 py-4">{(currentPage - 1) * pageSize + index + 1}</td>
                            <td className="px-3 py-4">
                              <div className="max-w-[180px] truncate">{trim(row.editorName, 15)}</div>
                            </td>
                            <td className="px-3 py-4 text-gray-600">
                              <div className="max-w-[220px] truncate">{trim(row.email, 20)}</div>
                            </td>
                            <td className="px-3 py-4">
                              <div className="max-w-[160px] truncate">{trim(row.designation, 20)}</div>
                            </td>
                            <td className="px-3 py-4 text-[#00467F]">
                              <div className="max-w-[200px] truncate">
                                {typeof row.journalId === "object" && row.journalId !== null
                                  ? trim((row.journalId as any).journalName, 20)
                                  : "-"}
                              </div>
                            </td>
                            <td className="px-3 py-4 text-gray-600">
                              <div className="max-w-[120px] truncate">{trim(row.country, 18)}</div>
                            </td>
                            <td className="px-3 py-4">
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
                          <td colSpan={7} className="px-3 py-6 text-center text-gray-500">
                            No records found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
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
        onClose={() => { setIsAddModalOpen(false); resetForm(); }}
        title={isEditMode ? "Edit Editor" : "Add New Editor"}
        maxWidth="max-w-4xl"
        footer={
          <>
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:text-gray-900 transition-all duration-200 focus:ring-2 focus:ring-gray-200 outline-none"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveEditor}
              className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-[#00467F] to-[#0078A8] rounded-xl hover:shadow-lg hover:shadow-blue-900/20 hover:from-[#031E40] hover:to-[#00467F] transition-all duration-200 transform hover:-translate-y-0.5 focus:ring-2 focus:ring-[#00467F] outline-none"
            >
              {isEditMode ? "Update Editor" : "Save Editor"}
            </button>
          </>
        }
      >
        <div className="space-y-5">
          <div className="relative">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Editor Name <span className="text-red-500">*</span></label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <User size={18} />
              </div>
              <input
                type="text"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-[#00467F]/20 focus:border-[#00467F] block transition-all duration-200 outline-none hover:bg-white"
                value={newEditor.editorName}
                onChange={(e) => setNewEditor({ ...newEditor, editorName: e.target.value })}
                placeholder="Enter full name"
              />
            </div>
          </div>
           <div className="relative">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Journal</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <BookOpen size={18} />
              </div>
              <select
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-[#00467F]/20 focus:border-[#00467F] block transition-all duration-200 outline-none hover:bg-white appearance-none"
                value={newEditor.journalId}
                onChange={(e) => setNewEditor({ ...newEditor, journalId: e.target.value })}
              >
                <option value="">Select Journal</option>
                {journals.map((journal) => (
                  <option key={journal._id} value={journal._id}>
                    {journal.journalTitle || journal.username || "Unknown Journal"}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Email </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Mail size={18} />
              </div>
              <input
                type="email"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-[#00467F]/20 focus:border-[#00467F] block transition-all duration-200 outline-none hover:bg-white"
                value={newEditor.email}
                onChange={(e) => setNewEditor({ ...newEditor, email: e.target.value })}
                placeholder="email@example.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="relative">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Designation <span className="text-red-500">*</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Briefcase size={18} />
                </div>
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-[#00467F]/20 focus:border-[#00467F] block transition-all duration-200 outline-none hover:bg-white"
                  value={newEditor.designation}
                  onChange={(e) => setNewEditor({ ...newEditor, designation: e.target.value })}
                  placeholder="e.g. Professor"
                />
              </div>
            </div>

            <div className="relative">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Country <span className="text-red-500">*</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Globe size={18} />
                </div>
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-[#00467F]/20 focus:border-[#00467F] block transition-all duration-200 outline-none hover:bg-white"
                  value={newEditor.country}
                  onChange={(e) => setNewEditor({ ...newEditor, country: e.target.value })}
                  placeholder="Enter country"
                />
              </div>
            </div>
          </div>

          <div className="relative">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Institution <span className="text-red-500">*</span></label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Building2 size={18} />
              </div>
              <input
                type="text"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-[#00467F]/20 focus:border-[#00467F] block transition-all duration-200 outline-none hover:bg-white"
                value={newEditor.institution}
                onChange={(e) => setNewEditor({ ...newEditor, institution: e.target.value })}
                placeholder="Enter university or organization"
              />
            </div>
          </div>
        </div>
      </Modal>


      {/* View Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title={<div className="text-xl font-bold text-gray-800 flex items-center gap-2"><User size={24} /> Editor Details</div>}
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
        {selectedEditor && (
            <div className="space-y-6">
                 <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
                    <div className="bg-blue-50 p-3 rounded-full">
                        <User size={32} className="text-[#00467F]" />
                    </div>
                    <div>
                        <h4 className="text-xl font-bold text-[#00467F]">{selectedEditor.editorName}</h4>
                        <p className="text-sm text-gray-500">{selectedEditor.designation}</p>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                        <Mail size={18} className="text-red-500 min-w-4" />
                        <div className="flex-grow">
                            <p className="text-xs text-gray-500 uppercase font-semibold">Email</p>
                            <p className="font-medium text-gray-900 break-all">{selectedEditor.email}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                        <Globe size={18} className="text-purple-500 min-w-4" />
                        <div className="flex-grow">
                            <p className="text-xs text-gray-500 uppercase font-semibold">Country</p>
                            <p className="font-medium text-gray-900">{selectedEditor.country}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                        <Building2 size={18} className="text-green-500 min-w-4" />
                        <div className="flex-grow">
                            <p className="text-xs text-gray-500 uppercase font-semibold">Institution</p>
                            <p className="font-medium text-gray-900">{selectedEditor.institution}</p>
                        </div>
                    </div>

                     <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                        <BookOpen size={18} className="text-[#00467F] min-w-4" />
                        <div className="flex-grow">
                            <p className="text-xs text-gray-500 uppercase font-semibold">Journal</p>
                            <p className="font-medium text-gray-900">
                                {typeof selectedEditor.journalId === 'object' && selectedEditor.journalId !== null
                                    ? (selectedEditor.journalId as any).journalTitle || (selectedEditor.journalId as any).journalName 
                                    : "N/A"}
                            </p>
                        </div>
                    </div>
                 </div>
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">Delete Editor?</h3>
            <p className="text-gray-500">
                Are you sure you want to delete <span className="font-semibold text-gray-900">{selectedEditor?.editorName}</span>? 
                This action cannot be undone.
            </p>
        </div>
      </Modal>
    </div>
  );
};

export default EditorsBoard;
