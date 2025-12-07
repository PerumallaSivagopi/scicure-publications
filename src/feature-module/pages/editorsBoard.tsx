import React, { useState, useEffect, useMemo } from "react";
import "../../assets/css/onboarding.css";
import { Eye, Edit, Trash2, Plus, User, Mail, Briefcase, Building2, Globe, BookOpen } from "lucide-react";
import Modal from "../../components/ui/Modal";

interface Editor {
  _id?: string;
  editorName?: string;
  email?: string;
  designation?: string;
  institution?: string;
  country?: string;
  journalId?: {
    journalName?: string;
    journalId?: string;
    _id?: string;
  };
}

const EditorsBoard = () => {
  const [editors, setEditors] = useState<Editor[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // New state for Modal and Form
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [journals, setJournals] = useState<any[]>([]);
  const [newEditor, setNewEditor] = useState({
    editorName: "",
    email: "",
    designation: "",
    institution: "",
    country: "",
    journalId: "",
  });

  // Fetch Journals for dropdown
  useEffect(() => {
    const token = localStorage.getItem("authToken") || "";
    fetch('https://scicure-publications-backend-1.onrender.com/api/users', {
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

  const handleSaveEditor = () => {
    if (!newEditor.editorName || !newEditor.email) {
      alert("Please fill in required fields (Name, Email)");
      return;
    }

    const token = localStorage.getItem("authToken") || "";
    fetch("https://scicure-publications-backend-1.onrender.com/api/editors", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(newEditor)
    })
    .then(res => res.json())
    .then(result => {
      alert("Editor added successfully!");
      setIsAddModalOpen(false);
      // Reload or refetch editors
      window.location.reload();
    })
    .catch(err => {
      console.error("Error adding editor:", err);
      alert("Failed to add editor");
    });
  };

  useEffect(() => {
    const token = localStorage.getItem("authToken") || "";
    fetch("https://scicure-publications-backend-1.onrender.com/api/editors", {
      method: "GET",
      headers: {
        "content-type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((result) => {
        if (Array.isArray(result)) {
          setEditors(result);
        } else {
          setEditors([]);
        }
      })
      .catch((err) => {
        console.error("Error fetching editors:", err);
        setEditors([]);
      });
  }, []);

  const handleView = (row: Editor) => console.log("View clicked", row);
  const handleEdit = (row: Editor) => console.log("Edit clicked", row);
  const handleDelete = (row: Editor) => {
    if (window.confirm("Are you sure you want to delete this editor?")) {
      console.log("Deleted", row);
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
        item.journalId?.journalName?.toLowerCase().includes(term)
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
                    <a href="/index">Dashboard</a>
                  </li>
                  <li className="breadcrumb-item active">Editors Board</li>
                </ul>
              </div>
              <button
                className="px-4 py-2 bg-[#00467F] text-white rounded-lg flex items-center gap-2 hover:bg-[#031E40] transition-colors"
                onClick={() => setIsAddModalOpen(true)}
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
                        <th>Editor Name</th>
                        <th>Email</th>
                        <th>Designation</th>
                        <th>Institution</th>
                        <th>Journal Name</th>
                        <th>Country</th>
                        <th>Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {paginatedData.length > 0 ? (
                        paginatedData.map((row, index) => (
                          <tr key={row._id || index}>
                            <td>{(currentPage - 1) * pageSize + index + 1}</td>
                            <td>{row.editorName || "-"}</td>
                            <td>{row.email || "-"}</td>
                            <td>{row.designation || "-"}</td>
                            <td>{row.institution || "-"}</td>

                            {/* FIXED HERE */}
                            <td>{row.journalId?.journalName || "-"}</td>

                            <td>{row.country || "-"}</td>

                            <td>
                              <div style={{ display: "flex", gap: 10 }}>
                                <Eye
                                  size={18}
                                  color="#3e99a8"
                                  onClick={() => handleView(row)}
                                />
                                <Edit
                                  size={18}
                                  color="#e1b225"
                                  onClick={() => handleEdit(row)}
                                />
                                <Trash2
                                  size={18}
                                  color="#bd3846"
                                  onClick={() => handleDelete(row)}
                                />
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={8}
                            style={{ textAlign: "center", padding: 20 }}
                          >
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
                          className={`paginate_button ${
                            page === currentPage ? "current" : ""
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
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Editor"
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
              Save Editor
            </button>
          </>
        }
      >
        <div className="space-y-5">
          <div className="relative">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Editor Name *</label>
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
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Email *</label>
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
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Designation</label>
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
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Country</label>
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
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Institution</label>
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
    </div>
  );
};

export default EditorsBoard;
