import React, { useState, useEffect, useMemo, useRef } from "react";
import "../../assets/css/onboarding.css";
import { Eye, Edit, Trash2, Check, X, Upload, Plus, User, Mail, FileText, Calendar, Tag, BookOpen, Layers, Hash } from "lucide-react";
import { URLS, ImageUrl } from "../../Urls";
import { all_routes } from "../../router/all_routes";
import Modal from "../../components/ui/Modal";

interface Article {
  _id?: string;
  articleId?: string;
  articleTitle?: string;
  journalId?: string | {
    _id?: string;
    journalName?: string;
    journalId?: string;
  };
  issueId?: string | {
    _id?: string;
    volume?: string;
    issue?: string;
    year?: string;
  };
  authorName?: string;
  authorEmail?: string;
  articleType?: string;
  abstract?: string;
  keywords?: string;
  doiNumber?: string;
  submissionDate?: string;
  acceptanceDate?: string;
  publicationDate?: string;
  volumeNumber?: string;
  issueNumber?: string;
  manuscriptFile?: string;
  coverImage?: string;
  articleStatus?: string;
  publisherName?: string;
  // date?: string; 
}

interface Journal {
  _id: string;
  journalName?: string;
  username?: string;
  role?: string;
}

const getCurrentUserRole = () => {
  return (localStorage.getItem("userRole") || "").toLowerCase();
};

const getCurrentJournalUserId = () => {
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

  return journalUserId;
};

const ArticlePage = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [journals, setJournals] = useState<Journal[]>([]);
  const [issues, setIssues] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  const userRole = getCurrentUserRole();
  const currentJournalUserId = getCurrentJournalUserId();

  const [newArticle, setNewArticle] = useState({
    articleTitle: "",
    journalId: userRole === "journal" ? currentJournalUserId : "",
    issueId: "",
    authorName: "",
    authorEmail: "",
    articleType: "",
    abstract: "",
    keywords: "",
    doiNumber: "",
    submissionDate: "",
    acceptanceDate: "",
    publicationDate: "",
    publisherName: "SciCure Publications",
    articleStatus: "Under Review",
  });

  // File states (separate because they are files, not strings)
  const [manuscriptFile, setManuscriptFile] = useState<File | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);

  // Refs for file inputs
  const manuscriptInputRef = useRef<HTMLInputElement>(null);
  const coverImageInputRef = useRef<HTMLInputElement>(null);

  const fetchArticles = () => {
    const token = localStorage.getItem("authToken") || "";
    fetch(URLS.ARTICLES, {
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

        if (userRole === "journal" && currentJournalUserId) {
          list = list.filter((item: any) => {
            let itemJournalId: string | undefined = "";

            if (typeof item.journalId === "object" && item.journalId) {
              itemJournalId =
                (item.journalId as any)._id ||
                (item.journalId as any).journalId ||
                "";
            } else {
              itemJournalId = item.journalId;
            }

            return itemJournalId && String(itemJournalId) === String(currentJournalUserId);
          });
        }

        setArticles(list);
      })
      .catch((err) => {
        console.error("Error fetching articles:", err);
        setArticles([]);
      });
  };

  const fetchJournals = () => {
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
            (item: Journal) => item.role === "journal"
          );

          if (userRole === "journal" && currentJournalUserId) {
            journalData = journalData.filter(
              (j: any) =>
                String(j._id) === String(currentJournalUserId) ||
                String((j as any).journalId) === String(currentJournalUserId)
            );
          }

          setJournals(journalData);
        }
      })
      .catch((err) => console.error("Error fetching journals:", err));
  };

  // Fetch Issues
  const fetchIssues = (journalId: string) => {
    if (!journalId) {
      setIssues([]);
      return;
    }
    const token = localStorage.getItem("authToken") || "";
    fetch(`${URLS.ISSUES}/archives/${journalId}`, {
      method: "GET",
      headers: {
        "content-type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && Array.isArray(data.archive)) {
          // Flatten the archive structure
          const flatIssues: any[] = [];
          data.archive.forEach((yearGroup: any) => {
            if (Array.isArray(yearGroup.issues)) {
              yearGroup.issues.forEach((issue: any) => {
                flatIssues.push({
                  ...issue,
                  label: `Vol ${issue.volume} Issue ${issue.issue} (${yearGroup.year})`
                });
              });
            }
          });
          setIssues(flatIssues);
        } else {
          setIssues([]);
        }
      })
      .catch((err) => {
        console.error("Error fetching issues:", err);
        setIssues([]);
      });
  };

  useEffect(() => {
    fetchArticles();
    fetchJournals();
  }, []);

  // Fetch issues when journal changes
  useEffect(() => {
    if (newArticle.journalId) {
      fetchIssues(newArticle.journalId);
    } else {
      setIssues([]);
    }
  }, [newArticle.journalId]);

  const resetForm = () => {
    setNewArticle({
      articleTitle: "",
      journalId: userRole === "journal" ? currentJournalUserId : "",
      issueId: "",
      authorName: "",
      authorEmail: "",
      articleType: "",
      abstract: "",
      keywords: "",
      doiNumber: "",
      submissionDate: "",
      acceptanceDate: "",
      publicationDate: "",
      publisherName: "SciCure Publications",
      articleStatus: "Under Review",
    });
    setManuscriptFile(null);
    setCoverImage(null);
    setSelectedArticle(null);
    setIsEditMode(false);
    if (manuscriptInputRef.current) manuscriptInputRef.current.value = "";
    if (coverImageInputRef.current) coverImageInputRef.current.value = "";
  };

  const handleEdit = (row: Article) => {
    let jId: string = "";
    if (typeof row.journalId === 'object' && row.journalId !== null) {
      jId = row.journalId._id || "";
    } else {
      jId = row.journalId as string;
    }

    let iId: string = "";
    if (typeof row.issueId === 'object' && row.issueId !== null) {
      iId = row.issueId._id || "";
    } else {
      iId = row.issueId as string;
    }

    setNewArticle({
      articleTitle: row.articleTitle || "",
      journalId: jId,
      issueId: iId,
      authorName: row.authorName || "",
      authorEmail: row.authorEmail || "",
      articleType: row.articleType || "",
      abstract: row.abstract || "",
      keywords: row.keywords || "",
      doiNumber: row.doiNumber || "",
      submissionDate: row.submissionDate ? new Date(row.submissionDate).toISOString().split('T')[0] : "",
      acceptanceDate: row.acceptanceDate ? new Date(row.acceptanceDate).toISOString().split('T')[0] : "",
      publicationDate: row.publicationDate ? new Date(row.publicationDate).toISOString().split('T')[0] : "",
      publisherName: row.publisherName || "SciCure Publications",
      articleStatus: row.articleStatus || "Under Review",
    });

    // Reset files as we don't editing files directly this way usually, or implement preview
    setManuscriptFile(null);
    setCoverImage(null);

    setSelectedArticle(row);
    setIsEditMode(true);
    setIsAddModalOpen(true);
  };

  const handleView = (row: Article) => {
    setSelectedArticle(row);
    setIsViewModalOpen(true);
  };

  const handleDelete = (row: Article) => {
    setSelectedArticle(row);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedArticle) return;

    try {
      const token = localStorage.getItem("authToken") || "";
      const response = await fetch(`${URLS.ARTICLES}/${selectedArticle._id}`, {
        method: 'DELETE',
        headers: {
          "Authorization": `Bearer ${token}`,
        }
      });

      if (response.ok) {
        alert("Article deleted successfully");
        fetchArticles();
      } else {
        alert("Failed to delete article");
      }
    } catch (error) {
      console.error("Error deleting article:", error);
      alert("Error deleting article");
    } finally {
      setIsDeleteModalOpen(false);
      setSelectedArticle(null);
    }
  };

  const handleSave = async () => {
    // Validation
    if (!newArticle.articleTitle || !newArticle.journalId || !newArticle.authorName || !newArticle.authorEmail) {
      alert("Please fill in required fields (Title, Journal, Author Name, Email)");
      return;
    }

    if (!isEditMode && !manuscriptFile) {
      alert("Manuscript file is required for new articles");
      return;
    }

    const formData = new FormData();
    Object.entries(newArticle).forEach(([key, value]) => {
      if (key === "issueId" && !value) return;
      formData.append(key, value);
    });

    if (manuscriptFile) formData.append("manuscriptFile", manuscriptFile);
    if (coverImage) formData.append("coverImage", coverImage);

    const token = localStorage.getItem("authToken") || "";
    let url = URLS.ARTICLES;
    let method = "POST";

    if (isEditMode && selectedArticle) {
      url = `${URLS.ARTICLES}/${selectedArticle._id}`;
      method = "PUT";
    }

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          "Authorization": `Bearer ${token}`,
          // No Content-Type header when sending FormData; browser sets it with boundary
        },
        body: formData
      });

      if (response.ok) {
        alert(isEditMode ? "Article updated successfully!" : "Article added successfully!");
        setIsAddModalOpen(false);
        resetForm();
        fetchArticles();
      } else {
        const err = await response.json();
        alert(`Failed to save article: ${err.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error saving article:", error);
      alert("Error saving article");
    }
  };


  // Filter
  const filteredData = useMemo(() => {
    if (!searchTerm) return articles;

    const term = searchTerm.toLowerCase();

    return articles.filter((item) =>
      item.articleTitle?.toLowerCase().includes(term) ||
      item.authorName?.toLowerCase().includes(term) ||
      (typeof item.journalId === 'object' && (item.journalId as any)?.journalName?.toLowerCase().includes(term))
    );
  }, [searchTerm, articles]);

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
                <h3 className="page-title">Articles</h3>
                <ul className="breadcrumb">
                  <li className="breadcrumb-item">
                    <a
                      href={
                        userRole === "journal" && currentJournalUserId
                          ? `${all_routes.journalDetails}?id=${encodeURIComponent(
                              currentJournalUserId
                            )}`
                          : all_routes.index
                      }
                    >
                      Dashboard
                    </a>
                  </li>
                  <li className="breadcrumb-item active">Articles</li>
                </ul>
              </div>
              <button
                className="px-4 py-2 bg-[#00467F] text-white rounded-lg flex items-center gap-2 hover:bg-[#031E40] transition-colors"
                onClick={() => { resetForm(); setIsAddModalOpen(true); }}
              >
                <Plus size={18} />
                Add Article
              </button>
            </div>
          </div>
        </div>

        {/* TABLE SECTION */}
        <div className="row">
          <div className="col-md-12">
            <div className="card">
              <div className="card-body">
                {/* Search & Entries */}
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
                  >
                    <thead>
                      <tr>
                        <th>S.no</th>
                        <th>Article ID</th>
                        <th style={{ width: "180px" }}>Journal Name</th>
<th style={{ width: "320px" }}>Article Title</th>
<th style={{ width: "160px" }}>Author Name</th>
                        <th>Type</th>
                        <th>Status</th>
                        <th>PDF</th>
                        <th>Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {paginatedData.length > 0 ? (
                        paginatedData.map((row, index) => (
                          <tr key={row._id || index}>
                            <td>{(currentPage - 1) * pageSize + index + 1}</td>
                            <td>{row.articleId || "-"}</td>
                            <td
                              className="table-ellipsis-sm"
                              title={
                                typeof row.journalId === "object"
                                  ? (row.journalId as any)?.journalName
                                  : "-"
                              }
                            >
                              {typeof row.journalId === "object"
                                ? (row.journalId as any)?.journalName
                                : "-"}
                            </td>

                            <td
                              className="table-ellipsis-lg"
                              title={row.articleTitle || "-"}
                            >
                              {row.articleTitle || "-"}
                            </td>

                            <td
                              className="table-ellipsis-sm"
                              title={row.authorName || "-"}
                            >
                              {row.authorName || "-"}
                            </td>

                            <td>{row.articleType || "-"}</td>

                            <td>
                              <span
                                className={`badge ${row.articleStatus === "Accepted"
                                    ? "badge-success"
                                    : row.articleStatus === "Published"
                                      ? "badge-info"
                                      : row.articleStatus === "Rejected"
                                        ? "badge-danger"
                                        : "badge-warning"
                                  }`}
                              >
                                {row.articleStatus || "-"}
                              </span>
                            </td>

                            <td>
                              {row.manuscriptFile ? (
                                <a
                                  href={`${ImageUrl}${row.manuscriptFile}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  style={{ color: "#3e99a8", textDecoration: "underline", display: "flex", alignItems: "center", gap: "4px" }}
                                >
                                <FileText className="w-3.5 h-3.5" />
                                  View
                                </a>
                              ) : (
                                "-"
                              )}
                            </td>

                            <td>
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
                          <td
                            colSpan={9}
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
                            ? 'bg-[#00467F] text-white border-[#00467F]'
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

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => { setIsAddModalOpen(false); resetForm(); }}
        title={isEditMode ? "Edit Article" : "Add New Article"}
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
              onClick={handleSave}
              className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-[#00467F] to-[#0078A8] rounded-xl hover:shadow-lg hover:shadow-blue-900/20 hover:from-[#031E40] hover:to-[#00467F] transition-all duration-200 transform hover:-translate-y-0.5 focus:ring-2 focus:ring-[#00467F] outline-none"
            >
              {isEditMode ? "Update Article" : "Save Article"}
            </button>
          </div>
        }
      >
        <div className="space-y-5">
          {/* Section 1: Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="relative">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Article Title *</label>
              <input
                type="text"
                className="w-full pl-4 pr-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-[#00467F]/20 focus:border-[#00467F] block transition-all duration-200 outline-none hover:bg-white"
                value={newArticle.articleTitle}
                onChange={(e) => setNewArticle({ ...newArticle, articleTitle: e.target.value })}
              />
            </div>
            <div className="relative">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Journal *</label>
              <select
                className="w-full pl-4 pr-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-[#00467F]/20 focus:border-[#00467F] block transition-all duration-200 outline-none hover:bg-white appearance-none"
                value={newArticle.journalId}
                onChange={(e) => setNewArticle({ ...newArticle, journalId: e.target.value })}
                disabled={userRole === "journal"}
              >
                <option value="">Select Journal</option>
                {journals.map((journal) => (
                  <option key={journal._id} value={journal._id}>
                    {journal.journalName || journal.username || "Unknown Journal"}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Section 2: Author Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="relative">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Author Name *</label>
              <input
                type="text"
                className="w-full pl-4 pr-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-[#00467F]/20 focus:border-[#00467F] block transition-all duration-200 outline-none hover:bg-white"
                value={newArticle.authorName}
                onChange={(e) => setNewArticle({ ...newArticle, authorName: e.target.value })}
              />
            </div>
            <div className="relative">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Author Email *</label>
              <input
                type="email"
                className="w-full pl-4 pr-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-[#00467F]/20 focus:border-[#00467F] block transition-all duration-200 outline-none hover:bg-white"
                value={newArticle.authorEmail}
                onChange={(e) => setNewArticle({ ...newArticle, authorEmail: e.target.value })}
              />
            </div>
          </div>

          {/* Section 3: Article Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="relative">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Article Type</label>
              <select
                className="w-full pl-4 pr-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-[#00467F]/20 focus:border-[#00467F] block transition-all duration-200 outline-none hover:bg-white appearance-none"
                value={newArticle.articleType}
                onChange={(e) => setNewArticle({ ...newArticle, articleType: e.target.value })}
              >
                <option value="">Select Type</option>
                <option value="Research">Research</option>
                <option value="Review">Review</option>
                <option value="Case Study">Case Study</option>
                <option value="Short Communication">Short Communication</option>
                <option value="Editorial">Editorial</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="relative">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">DOI Number</label>
              <input
                type="text"
                className="w-full pl-4 pr-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-[#00467F]/20 focus:border-[#00467F] block transition-all duration-200 outline-none hover:bg-white"
                value={newArticle.doiNumber}
                onChange={(e) => setNewArticle({ ...newArticle, doiNumber: e.target.value })}
              />
            </div>
          </div>

          <div className="relative">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Keywords</label>
            <input
              type="text"
              className="w-full pl-4 pr-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-[#00467F]/20 focus:border-[#00467F] block transition-all duration-200 outline-none hover:bg-white"
              value={newArticle.keywords}
              onChange={(e) => setNewArticle({ ...newArticle, keywords: e.target.value })}
              placeholder="Comma separated keywords"
            />
          </div>

          <div className="relative">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Abstract</label>
            <textarea
              className="w-full pl-4 pr-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-[#00467F]/20 focus:border-[#00467F] block transition-all duration-200 outline-none hover:bg-white"
              rows={3}
              value={newArticle.abstract}
              onChange={(e) => setNewArticle({ ...newArticle, abstract: e.target.value })}
            />
          </div>

          {/* Section 4: Dates & Issue */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="relative">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Submission Date</label>
              <input
                type="date"
                className="w-full pl-4 pr-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-[#00467F]/20 focus:border-[#00467F] block transition-all duration-200 outline-none hover:bg-white"
                value={newArticle.submissionDate}
                onChange={(e) => setNewArticle({ ...newArticle, submissionDate: e.target.value })}
              />
            </div>
            <div className="relative">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Acceptance Date</label>
              <input
                type="date"
                className="w-full pl-4 pr-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-[#00467F]/20 focus:border-[#00467F] block transition-all duration-200 outline-none hover:bg-white"
                value={newArticle.acceptanceDate}
                onChange={(e) => setNewArticle({ ...newArticle, acceptanceDate: e.target.value })}
              />
            </div>
            <div className="relative">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Publication Date</label>
              <input
                type="date"
                className="w-full pl-4 pr-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-[#00467F]/20 focus:border-[#00467F] block transition-all duration-200 outline-none hover:bg-white"
                value={newArticle.publicationDate}
                onChange={(e) => setNewArticle({ ...newArticle, publicationDate: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="relative">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Issue</label>
              <select
                className="w-full pl-4 pr-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-[#00467F]/20 focus:border-[#00467F] block transition-all duration-200 outline-none hover:bg-white appearance-none"
                value={typeof newArticle.issueId === 'object' ? (newArticle.issueId as any)?._id : newArticle.issueId}
                onChange={(e) => setNewArticle({ ...newArticle, issueId: e.target.value })}
                disabled={!newArticle.journalId}
              >
                <option value="">Select Issue</option>
                {issues.map((issue) => (
                  <option key={issue._id} value={issue._id}>
                    {issue.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="relative">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Status</label>
              <select
                className="w-full pl-4 pr-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-[#00467F]/20 focus:border-[#00467F] block transition-all duration-200 outline-none hover:bg-white appearance-none"
                value={newArticle.articleStatus}
                onChange={(e) => setNewArticle({ ...newArticle, articleStatus: e.target.value })}
              >
                <option value="Under Review">Under Review</option>
                <option value="Accepted">Accepted</option>
                <option value="Published">Published</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Section 5: File Uploads */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="relative">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Manuscript File</label>
              <div className="relative">
                <input
                  type="file"
                  className="w-full pl-4 pr-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-[#00467F]/20 focus:border-[#00467F] block transition-all duration-200 outline-none hover:bg-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  onChange={(e) => setManuscriptFile(e.target.files ? e.target.files[0] : null)}
                  ref={manuscriptInputRef}
                />
              </div>
              {isEditMode && selectedArticle?.manuscriptFile && !manuscriptFile && (
                <p className="text-xs text-gray-500 mt-1">Current file: {selectedArticle.manuscriptFile}</p>
              )}
            </div>
            <div className="relative">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Cover Image (Optional)</label>
              <div className="relative">
                <input
                  type="file"
                  className="w-full pl-4 pr-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-[#00467F]/20 focus:border-[#00467F] block transition-all duration-200 outline-none hover:bg-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  accept="image/*"
                  onChange={(e) => setCoverImage(e.target.files ? e.target.files[0] : null)}
                  ref={coverImageInputRef}
                />
              </div>
              {isEditMode && selectedArticle?.coverImage && !coverImage && (
                <p className="text-xs text-gray-500 mt-1">Current image: {selectedArticle.coverImage}</p>
              )}
            </div>
          </div>

        </div>
      </Modal>

      {/* View Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title={<div className="text-xl font-bold text-gray-800 flex items-center gap-2"><FileText size={24} /> Article Details</div>}
        maxWidth="max-w-4xl"
        footer={
          <button
            onClick={() => setIsViewModalOpen(false)}
            className="px-5 py-2.5 text-sm font-medium text-white bg-[#00467F] rounded-xl hover:bg-[#031E40] transition-colors"
          >
            Close
          </button>
        }
      >
        {selectedArticle && (
          <div className="space-y-6">
            <div className="border-b border-gray-100 pb-4 flex flex-col md:flex-row justify-between items-start gap-4">
              <div>
                <h4 className="text-xl font-bold text-[#00467F] flex items-center gap-2">
                    <FileText className="w-6 h-6" />
                    {selectedArticle.articleTitle}
                </h4>
                <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                    <span className="flex items-center gap-1"><Hash size={14} /> {selectedArticle.articleId}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><Layers size={14} /> {selectedArticle.articleType}</span>
                </div>
              </div>
              <div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${selectedArticle.articleStatus === "Accepted"
                    ? "bg-green-50 text-green-700 border-green-200"
                    : selectedArticle.articleStatus === "Published"
                      ? "bg-blue-50 text-blue-700 border-blue-200"
                      : selectedArticle.articleStatus === "Rejected"
                        ? "bg-red-50 text-red-700 border-red-200"
                        : "bg-yellow-50 text-yellow-700 border-yellow-200"
                  }`}>
                  {selectedArticle.articleStatus}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                <BookOpen size={18} className="text-blue-500 min-w-4" />
                <div className="flex-grow">
                  <p className="text-xs text-gray-500 uppercase font-semibold">Journal</p>
                  <p className="font-medium text-gray-900">
                    {typeof selectedArticle.journalId === 'object'
                        ? (selectedArticle.journalId as any)?.journalName
                        : "N/A"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                <User size={18} className="text-purple-500 min-w-4" />
                <div className="flex-grow">
                  <p className="text-xs text-gray-500 uppercase font-semibold">Author</p>
                  <div className="flex flex-col">
                      <span className="font-medium text-gray-900">{selectedArticle.authorName}</span>
                      <span className="text-xs text-gray-500">{selectedArticle.authorEmail}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                <Hash size={18} className="text-gray-500 min-w-4" />
                <div className="flex-grow">
                  <p className="text-xs text-gray-500 uppercase font-semibold">DOI</p>
                  <p className="font-medium text-gray-900">{selectedArticle.doiNumber || "-"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                <Layers size={18} className="text-orange-500 min-w-4" />
                <div className="flex-grow">
                  <p className="text-xs text-gray-500 uppercase font-semibold">Volume / Issue</p>
                  <p className="font-medium text-gray-900">{selectedArticle.volumeNumber || "-"} / {selectedArticle.issueNumber || "-"}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg flex items-center gap-3">
                 <Calendar size={18} className="text-gray-500" />
                 <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold">Submitted</p>
                    <p className="font-medium text-gray-900">{selectedArticle.submissionDate ? new Date(selectedArticle.submissionDate).toLocaleDateString() : "-"}</p>
                 </div>
              </div>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg flex items-center gap-3">
                 <Calendar size={18} className="text-green-500" />
                 <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold">Accepted</p>
                    <p className="font-medium text-gray-900">{selectedArticle.acceptanceDate ? new Date(selectedArticle.acceptanceDate).toLocaleDateString() : "-"}</p>
                 </div>
              </div>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg flex items-center gap-3">
                 <Calendar size={18} className="text-blue-500" />
                 <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold">Published</p>
                    <p className="font-medium text-gray-900">{selectedArticle.publicationDate ? new Date(selectedArticle.publicationDate).toLocaleDateString() : "-"}</p>
                 </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <h5 className="text-xs font-semibold text-gray-500 uppercase mb-2 flex items-center gap-2">
                <FileText size={16} /> Abstract
              </h5>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {selectedArticle.abstract || "No abstract available."}
              </p>
            </div>

            <div>
              <h5 className="text-xs font-semibold text-gray-500 uppercase mb-2 flex items-center gap-2">
                <Tag size={16} /> Keywords
              </h5>
              <div className="flex flex-wrap gap-2">
                {selectedArticle.keywords ? selectedArticle.keywords.split(',').map((tag, i) => (
                  <span key={i} className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-lg border border-blue-100">
                    {tag.trim()}
                  </span>
                )) : <span className="text-sm text-gray-500">-</span>}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              {selectedArticle.manuscriptFile && (
                <a
                  href={`${ImageUrl}${selectedArticle.manuscriptFile}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  <FileText size={16} />
                  View Manuscript
                </a>
              )}
              {selectedArticle.coverImage && (
                <a
                  href={`${ImageUrl}${selectedArticle.coverImage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  <FileText size={16} />
                  View Cover Image
                </a>
              )}
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">Delete Article?</h3>
            <p className="text-gray-500">
                Are you sure you want to delete <span className="font-semibold text-gray-900">{selectedArticle?.articleTitle}</span>? 
                This action cannot be undone.
            </p>
        </div>
      </Modal>
    </div>
  );
};

export default ArticlePage;
