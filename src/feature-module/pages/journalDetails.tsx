import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { URLS, ImageUrl } from "../../Urls";
import Modal from "../../components/ui/Modal";
import {
  Mail,
  University,
  MapPin,
  User,
  Edit,
  Trash2,
  Plus,
  X,
  Eye,
  ArrowLeft,
  FileText,
  Calendar,
  AlertTriangle,
  BookOpen
} from "lucide-react";

const tabs = [
  "Journal Home",
  "Editorial Board",
  "Abstracting and Indexing",
  "Volumes/Issues",
  "Articles Inpress",
  "Current Issue",
  // "Archive Page",
];

const JournalHome = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("Journal Home");
  const [editors, setEditors] = useState<any[]>([]);
  const [editorsLoading, setEditorsLoading] = useState(false);
  const [editorsError, setEditorsError] = useState("");
  const [journal, setJournal] = useState<any>(null);
  const [journalLoading, setJournalLoading] = useState(false);
  const [journalError, setJournalError] = useState("");
  const [archive, setArchive] = useState<any[]>([]);
const [archiveLoading, setArchiveLoading] = useState(false);
const [archiveError, setArchiveError] = useState("");
const [showIssueModal, setShowIssueModal] = useState(false);
const [isEdit, setIsEdit] = useState(false);
const [selectedIssue, setSelectedIssue] = useState<any>(null);
const [formData, setFormData] = useState({
    year: "",
    volume: "",
    issue: "",
    publishedDate: "",
  });
  const [viewIssue, setViewIssue] = useState<any>(null);
  const [articles, setArticles] = useState<any[]>([]);
  const [articlesLoading, setArticlesLoading] = useState(false);
  
  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [issueToDelete, setIssueToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, viewIssue]);

  const fetchArchive = () => {
    if (!journal?._id) return;
    const token = localStorage.getItem("authToken") || "";
    setArchiveLoading(true);
    setArchiveError("");

    fetch(`${URLS.ISSUES}/archive/${journal._id}`, {
      method: "GET",
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.success) {
          setArchive(data.archive || []);
        } else {
          setArchive([]);
          setArchiveError("No archive data available");
        }
      })
      .catch(() => {
        setArchive([]);
        setArchiveError("Failed to load volumes & issues");
      })
      .finally(() => setArchiveLoading(false));
  };

  const fetchArticles = (issueId: string) => {
    setArticlesLoading(true);
    fetch(`${URLS.ARTICLES}/issue/${issueId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.success) {
          setArticles(data.articles || []);
        } else {
          setArticles([]);
        }
      })
      .catch(() => {
        setArticles([]);
      })
      .finally(() => setArticlesLoading(false));
  };

  useEffect(() => {
    if (activeTab === "Volumes/Issues" && journal?._id && !viewIssue) {
      fetchArchive();
    }
  }, [activeTab, journal, viewIssue]);

  useEffect(() => {
    const id = searchParams.get("id");
    const jid = searchParams.get("jid");
    const token = localStorage.getItem("authToken") || "";
    setJournalLoading(true);
    setJournalError("");
    fetch(URLS.USERS, {
      method: "GET",
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((result) => {
        let list: any[] = [];
        if (result?.data && Array.isArray(result.data)) {
          list = result.data.filter((x: any) => x.role === "journal");
        } else if (Array.isArray(result)) {
          list = result.filter((x: any) => x.role === "journal");
        }
        let found =
          list.find((x: any) => String(x._id) === String(id)) ||
          list.find((x: any) => String(x.journalId) === String(jid)) ||
          null;
        setJournal(found);
        if (!found) setJournalError("Journal not found");
      })
      .catch(() => {
        setJournalError("Failed to load journal");
        setJournal(null);
      })
      .finally(() => setJournalLoading(false));
  }, [searchParams]);

  useEffect(() => {
    const token = localStorage.getItem("authToken") || "";
    setEditorsLoading(true);
    setEditorsError("");

    fetch(URLS.EDITORS, {
      method: "GET",
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((result) => {
        let list: any[] = [];
        if (Array.isArray(result)) list = result;
        else if (result && Array.isArray(result?.data)) list = result.data;
        if (journal?._id) {
          list = list.filter((e: any) => {
            if (typeof e.journalId === "object" && e.journalId) {
              return String(e.journalId._id) === String(journal._id);
            }
            return String(e.journalId) === String(journal._id);
          });
        }
        setEditors(list);
      })
      .catch(() => {
        setEditorsError("Failed to load editors");
        setEditors([]);
      })
      .finally(() => setEditorsLoading(false));
  }, [journal]);



  const handleDeleteIssue = (issue: any) => {
    setIssueToDelete(issue);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteIssue = async () => {
    if (!issueToDelete?._id) return;
    
    const token = localStorage.getItem("authToken") || "";
    setIsDeleting(true);

    try {
      const res = await fetch(`${URLS.ISSUES}/${issueToDelete._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (data.success) {
        // alert("Issue deleted successfully");
        setIsDeleteModalOpen(false);
        setIssueToDelete(null);
        fetchArchive();
      } else {
        alert(data.message || "Failed to delete issue");
      }
    } catch {
      alert("Failed to delete issue");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaveIssue = async () => {
    const token = localStorage.getItem("authToken") || "";
    const payload = {
      year: Number(formData.year),
      volume: Number(formData.volume),
      issue: Number(formData.issue),
      publishedDate: formData.publishedDate,
    };

    const url = isEdit
      ? `${URLS.ISSUES}/${selectedIssue._id}`
      : `${URLS.ISSUES}`;

    const method = isEdit ? "PUT" : "POST";
    
    // Add journalId if creating new issue
    if (!isEdit && journal?._id) {
       // @ts-ignore
       payload.journalId = journal._id;
    }

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        alert(`Issue ${isEdit ? "updated" : "created"} successfully`);
        setShowIssueModal(false);
        fetchArchive();
      }
    } catch {
      alert("Failed to save issue");
    }
  };

  const paginatedEditors = editors.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  const totalEditorPages = Math.ceil(editors.length / pageSize);

  const paginatedArticles = articles.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  const totalArticlePages = Math.ceil(articles.length / pageSize);

  return (
    <div className="w-full">
      {/* HERO SECTION */}
      <section
        className="relative h-[180px] sm:h-[220px] md:h-[260px] w-full bg-cover bg-center"
        style={{
          backgroundImage: `url('${
            journal?.journalBgImage
              ? `${ImageUrl}${journal.journalBgImage}`
              : journal?.journalImage
              ? `${ImageUrl}${journal.journalImage}`
              : "/journal-hero.jpg"
          }')`,
        }}
      >
        <div className="absolute inset-0 bg-black/55" />

        <div className="relative z-10 h-full max-w-7xl mx-auto px-4 flex flex-col justify-center">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
            {journal?.journalTitle || journal?.journalName || "Journal"}
          </h1>

          <p className="mt-2 text-white/90 text-sm md:text-base">
            Open Access Journal
          </p>

          <span className="absolute right-4 bottom-4 md:right-8 md:bottom-6 text-white font-semibold">
            {journal?.journalISSN ? `ISSN: ${journal.journalISSN}` : ""}
          </span>
        </div>
      </section>

      {/* TABS */}
      <section className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          {/* Desktop Tabs */}
          <div className="hidden md:flex flex-wrap gap-2 py-3">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`rounded-full px-5 py-2 text-sm font-medium border transition-all
                  ${
                    activeTab === tab
                      ? "bg-[#00467F] text-white border-[#00467F]"
                      : "bg-white text-gray-800 border-gray-300 hover:bg-[#00467F]/10 hover:text-[#00467F]"
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Mobile Tabs */}
          <div className="md:hidden flex gap-2 overflow-x-auto py-3">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`whitespace-nowrap rounded-full px-5 py-2 text-sm font-medium border transition-all
                  ${
                    activeTab === tab
                      ? "bg-[#00467F] text-white border-[#00467F]"
                      : "bg-white text-gray-800 border-gray-300 hover:bg-[#00467F]/10 hover:text-[#00467F]"
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* TAB CONTENT */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        {/* JOURNAL HOME */}
        {activeTab === "Journal Home" && (
          <div className="grid grid-cols-1 lg:grid-cols-[7fr_3fr] gap-8 items-start">
            <div className="space-y-4">
              {journalLoading && (
                <div className="text-sm text-gray-500">Loading journal...</div>
              )}
              {journalError && (
                <div className="text-sm text-red-600">{journalError}</div>
              )}
              {!journalLoading && !journalError && journal?.journalDescription ? (
                <div
                  className="prose max-w-none text-gray-700"
                  dangerouslySetInnerHTML={{ __html: journal.journalDescription }}
                />
              ) : (
                <p className="text-gray-600 leading-relaxed">
                  No description available.
                </p>
              )}
            </div>
            <img
              src={
                journal?.journalImage
                  ? `${ImageUrl}${journal.journalImage}`
                  : journal?.journalImage
                  ? `${ImageUrl}${journal.journalImage}`
                  : "/journal-hero.jpg"
              }
              alt="Journal"
              className="w-full rounded-xl border border-gray-200 shadow-sm object-cover max-h-[300px]"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "https://via.placeholder.com/640x420?text=Journal+Image";
              }}
            />
          </div>
        )}

        {/* EDITORIAL BOARD */}
        {activeTab === "Editorial Board" && (
          <div className="space-y-6">
            {editorsLoading && (
              <p className="text-sm text-gray-500">Loading editors...</p>
            )}

            {editorsError && (
              <p className="text-sm text-red-600">{editorsError}</p>
            )}

            {!editorsLoading && !editorsError && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
                  {paginatedEditors.map((e, idx) => (
                    <div
                      key={e._id ?? idx}
                      className="rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow flex flex-col"
                    >
                      <div className="h-1.5 bg-[#00467F] rounded-t-xl" />

                      <div className="p-5 flex flex-col gap-3">
                        {/* Name */}
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-[#00467F]" />
                          <h3 className="font-semibold text-[#031E40]">
                            {e.editorName || "-"}
                          </h3>
                        </div>

                        {/* Designation */}
                        <p className="text-sm font-medium text-[#00467F]">
                          {e.designation || "-"}
                        </p>

                        {/* Institution */}
                        <div className="flex items-start gap-2 text-sm text-gray-700">
                          <University className="h-4 w-4 mt-0.5 text-gray-500" />
                          <span>{e.institution || "-"}</span>
                        </div>

                        {/* Country */}
                        {e.country && (
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <MapPin className="h-4 w-4 text-gray-500" />
                            <span>{e.country}</span>
                          </div>
                        )}

                        {/* Email */}
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-gray-500" />
                          <a
                            href={`mailto:${e.email}`}
                            className="text-[#00467F] hover:underline break-all"
                          >
                            {e.email || "-"}
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}

                  {editors.length === 0 && (
                    <p className="text-sm text-gray-500">
                      No editors available.
                    </p>
                  )}
                </div>

                {/* Pagination */}
                {editors.length > pageSize && (
                  <div className="mt-8 flex justify-between items-center border-t border-gray-100 pt-4">
                    <span className="text-sm text-gray-500">
                      Showing {paginatedEditors.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{' '}
                      {Math.min(currentPage * pageSize, editors.length)} of {editors.length} entries
                    </span>

                    <div className="flex gap-1">
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

                      {Array.from({ length: totalEditorPages }, (_, i) => i + 1).map((page) => (
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

                      <button
                        onClick={() => setCurrentPage(Math.min(totalEditorPages, currentPage + 1))}
                        disabled={currentPage === totalEditorPages}
                        className={`px-3 py-1.5 border border-gray-200 rounded-md text-sm font-medium transition-colors
                          ${currentPage === totalEditorPages 
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                            : 'bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900 cursor-pointer'}`}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === "Volumes/Issues" && (
          <div className="space-y-8">
            {viewIssue ? (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="flex items-center gap-4 mb-6">
                  <button
                    onClick={() => setViewIssue(null)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                  </button>
                  <div>
                    <h3 className="text-2xl font-bold text-[#031E40]">
                      Volume {viewIssue.volume}, Issue {viewIssue.issue}
                    </h3>
                    <p className="text-gray-500 text-sm">
                      Year: {viewIssue.year} • Published:{" "}
                      {new Date(viewIssue.publishedDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {articlesLoading ? (
                  <div className="flex justify-center p-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00467F]"></div>
                  </div>
                ) : articles.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No articles found in this issue.</p>
                  </div>
                ) : (
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-700 font-medium border-b border-gray-200">
                          <tr>
                            <th className="px-6 py-4">Article Title</th>
                            <th className="px-6 py-4">Author(s)</th>
                            <th className="px-6 py-4">Type</th>
                            <th className="px-6 py-4">DOI</th>
                            <th className="px-6 py-4">Accepted</th>
                            <th className="px-6 py-4">Published</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {paginatedArticles.map((art) => (
                            <tr
                              key={art._id}
                              className="hover:bg-gray-50/50 transition-colors"
                            >
                              <td className="px-6 py-4 font-medium text-[#00467F]">
                                {art.articleTitle}
                              </td>
                              <td
                                className="px-6 py-4 text-gray-600 max-w-[200px] truncate"
                                title={art.authorName}
                              >
                                {art.authorName}
                              </td>
                              <td className="px-6 py-4">
                                <span className="px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100">
                                  {art.articleType}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-gray-500">
                                {art.doiNumber || "-"}
                              </td>
                              <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                                {art.acceptanceDate
                                  ? new Date(art.acceptanceDate).toLocaleDateString()
                                  : "-"}
                              </td>
                              <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                                {art.publicationDate
                                  ? new Date(art.publicationDate).toLocaleDateString()
                                  : "-"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                     {/* Pagination for Articles */}
                     {articles.length > pageSize && (
                        <div className="flex justify-between items-center p-4 border-t border-gray-100">
                          <span className="text-sm text-gray-500">
                            Showing {paginatedArticles.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{' '}
                            {Math.min(currentPage * pageSize, articles.length)} of {articles.length} entries
                          </span>

                          <div className="flex gap-1">
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

                            {Array.from({ length: totalArticlePages }, (_, i) => i + 1).map((page) => (
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

                            <button
                              onClick={() => setCurrentPage(Math.min(totalArticlePages, currentPage + 1))}
                              disabled={currentPage === totalArticlePages}
                              className={`px-3 py-1.5 border border-gray-200 rounded-md text-sm font-medium transition-colors
                                ${currentPage === totalArticlePages 
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                  : 'bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900 cursor-pointer'}`}
                            >
                              Next
                            </button>
                          </div>
                        </div>
                      )}
                  </div>
                )}
              </div>
            ) : (
              <>
                {archiveLoading && (
                  <div className="flex justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00467F]"></div>
                  </div>
                )}

                {archiveError && (
                  <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm">
                    {archiveError}
                  </div>
                )}

                {!archiveLoading && !archiveError && archive.length === 0 && (
                  <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    <p className="text-gray-500">No volumes or issues found.</p>
                    <button
                      onClick={() => {
                        setIsEdit(false);
                        setSelectedIssue(null);
                        setFormData({
                          year: "",
                          volume: "",
                          issue: "",
                          publishedDate: "",
                        });
                        setShowIssueModal(true);
                      }}
                      className="mt-4 px-4 py-2 bg-[#00467F] text-white rounded-lg text-sm font-medium hover:bg-[#003366] transition-colors inline-flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add First Issue
                    </button>
                  </div>
                )}

                {/* Add Button Header */}
                {archive.length > 0 && (
                  <div className="flex justify-end m-0">
                    <button
                      onClick={() => {
                        setIsEdit(false);
                        setSelectedIssue(null);
                        setFormData({
                          year: "",
                          volume: "",
                          issue: "",
                          publishedDate: "",
                        });
                        setShowIssueModal(true);
                      }}
                      className="px-4 py-2 bg-[#00467F] text-white rounded-lg text-sm font-medium hover:bg-[#003366] transition-colors inline-flex items-center gap-2 shadow-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Add Issue
                    </button>
                  </div>
                )}

                {!archiveLoading &&
                  !archiveError &&
                  archive.map((yearBlock) => (
                    <div key={yearBlock.year} className="relative">
                      <div className="flex items-center gap-4 mb-6">
                        <h3 className="text-2xl font-bold text-[#031E40]">
                          {yearBlock.year}
                        </h3>
                        <div className="h-px bg-gray-200 flex-1"></div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {yearBlock.issues.map((issue: any) => (
                          <div
                            key={issue._id}
                            className="group bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg transition-all duration-300 hover:border-[#00467F]/30 relative overflow-hidden"
                          >
                            <div className="absolute top-0 left-0 w-1 h-full bg-[#00467F] opacity-0 group-hover:opacity-100 transition-opacity"></div>

                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <span className="text-xs font-semibold tracking-wider text-[#00467F] uppercase bg-[#00467F]/5 px-2 py-1 rounded-md">
                                  Volume {issue.volume}
                                </span>
                              </div>
                              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => {
                                    setViewIssue({ ...issue, year: yearBlock.year });
                                    fetchArticles(issue._id);
                                  }}
                                  className="p-2 text-[#3e99a8] bg-[#3e99a8]/10 hover:bg-[#3e99a8]/20 rounded-lg transition-colors"
                                  title="View Articles"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    setIsEdit(true);
                                    setSelectedIssue(issue);
                                    setFormData({
                                      year: yearBlock.year,
                                      volume: issue.volume,
                                      issue: issue.issue,
                                      publishedDate: issue.publishedDate?.slice(
                                        0,
                                        10
                                      ),
                                    });
                                    setShowIssueModal(true);
                                  }}
                                  className="p-2 text-[#e1b225] bg-[#e1b225]/10 hover:bg-[#e1b225]/20 rounded-lg transition-colors"
                                  title="Edit Issue"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteIssue(issue)}
                                  className="p-2 text-[#bd3846] bg-[#bd3846]/10 hover:bg-[#bd3846]/20 rounded-lg transition-colors"
                                  title="Delete Issue"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            <h4 className="text-base font-bold text-gray-900 mb-1.5">
                              Issue {issue.issue}
                            </h4>

                            <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                              <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                              {new Date(issue.publishedDate).toLocaleDateString(
                                undefined,
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                }
                              )}
                            </div>

                            <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                              <span className="text-xs font-medium text-gray-600">
                                {issue.articleCount} Articles
                              </span>
                              {issue.articleCount > 0 && (
                                <span className="flex h-1.5 w-1.5 rounded-full bg-green-500"></span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
              </>
            )}
          </div>
        )}


        {/* OTHER TABS */}
        {activeTab !== "Journal Home" &&
          activeTab !== "Editorial Board" &&
          activeTab !== "Volumes/Issues" && (
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h3 className="text-lg font-semibold text-[#031E40] mb-2">
                {activeTab}
              </h3>
              <p className="text-sm text-gray-600">
                Content for <strong>{activeTab}</strong> will appear here.
              </p>
            </div>
          )}
      </section>

      {/* ISSUE MODAL */}
      <Modal
        isOpen={showIssueModal}
        onClose={() => setShowIssueModal(false)}
        title={
          <div className="text-xl font-bold text-gray-800 flex items-center gap-2">
            {isEdit ? <Edit size={24} /> : <Plus size={24} />}
            {isEdit ? "Edit Issue" : "Create New Issue"}
          </div>
        }
        footer={
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowIssueModal(false)}
              className="px-5 py-2.5 rounded-lg text-gray-700 font-medium hover:bg-gray-200/50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveIssue}
              className="px-5 py-2.5 rounded-lg bg-[#00467F] text-white font-medium hover:bg-[#003366] shadow-lg shadow-[#00467F]/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {isEdit ? "Update Issue" : "Create Issue"}
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Year</label>
            <input
              type="number"
              placeholder="e.g. 2024"
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#00467F]/20 focus:border-[#00467F] transition-all outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Volume</label>
              <input
                type="number"
                placeholder="e.g. 1"
                value={formData.volume}
                onChange={(e) => setFormData({ ...formData, volume: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#00467F]/20 focus:border-[#00467F] transition-all outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Issue</label>
              <input
                type="number"
                placeholder="e.g. 1"
                value={formData.issue}
                onChange={(e) => setFormData({ ...formData, issue: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#00467F]/20 focus:border-[#00467F] transition-all outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Published Date</label>
            <input
              type="date"
              value={formData.publishedDate}
              onChange={(e) => setFormData({ ...formData, publishedDate: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#00467F]/20 focus:border-[#00467F] transition-all outline-none"
            />
          </div>
        </div>
      </Modal>

      {/* DELETE CONFIRMATION MODAL */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title={
          <div className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Trash2 size={24} className="text-red-600" /> Confirm Delete
          </div>
        }
        footer={
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-5 py-2.5 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={confirmDeleteIssue}
              disabled={isDeleting}
              className="px-5 py-2.5 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 shadow-lg shadow-red-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2"
            >
              {isDeleting ? "Deleting..." : "Delete Issue"}
            </button>
          </div>
        }
      >
        <div className="py-4">
          <p className="text-gray-600 text-base leading-relaxed">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-gray-900">
              Volume {issueToDelete?.volume}, Issue {issueToDelete?.issue}
            </span>
            ? This action cannot be undone.
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default JournalHome;
