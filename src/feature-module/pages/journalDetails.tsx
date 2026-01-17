import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { URLS, ImageUrl } from "../../Urls";
import Modal from "../../components/ui/Modal";
import DoiIcon from "../../assets/images/doi-image.png";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
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
  BookOpen,
  Briefcase,
  Building2,
  Globe,
  Phone,
  Book,
  Tag,
  Upload
} from "lucide-react";
import { all_routes } from "../../router/all_routes";

const tabs = [
  "Journal Home",
  "Editorial Board",
  "Volumes/Issues",
  "Articles",
  "Current Issue",
  // "Archive Page",
];

const JournalHome = () => {
  const navigate = useNavigate();
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
  
  const [currentIssueData, setCurrentIssueData] = useState<any>(null);
  const [currentIssueLoading, setCurrentIssueLoading] = useState(false);
  const [currentIssueError, setCurrentIssueError] = useState("");

  const userRole = localStorage.getItem("userRole") || "";
  const canManageJournal = userRole === "journal" || userRole === "admin";

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [issueToDelete, setIssueToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isEditorModalOpen, setIsEditorModalOpen] = useState(false);
  const [isEditorEditMode, setIsEditorEditMode] = useState(false);
  const [selectedEditor, setSelectedEditor] = useState<any>(null);
  const [editorForm, setEditorForm] = useState({
    editorName: "",
    email: "",
    designation: "",
    institution: "",
    country: "",
  });

  const [isEditorDeleteModalOpen, setIsEditorDeleteModalOpen] = useState(false);
  const [editorToDelete, setEditorToDelete] = useState<any>(null);
  const [isDeletingEditor, setIsDeletingEditor] = useState(false);

  const [isJournalModalOpen, setIsJournalModalOpen] = useState(false);
  const [isJournalSubmitting, setIsJournalSubmitting] = useState(false);
  const [journalForm, setJournalForm] = useState({
    email: "",
    mobile: "",
    journalName: "",
    journalTitle: "",
    journalISSN: "",
    journalCategory: "",
    journalDescription: "",
  });
  const [journalImageFile, setJournalImageFile] = useState<File | null>(null);
  const [journalBgImageFile, setJournalBgImageFile] = useState<File | null>(null);
  const [journalImagePreview, setJournalImagePreview] = useState<string | null>(null);
  const [journalBgImagePreview, setJournalBgImagePreview] = useState<string | null>(null);

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

    fetch(`${URLS.ISSUES}/archives/${journal._id}`, {
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

  const fetchAllJournalArticles = () => {
    if (!journal?._id) return;
    setArticlesLoading(true);
    fetch(`${URLS.ARTICLES}/journal/${journal._id}`)
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
    if (activeTab === "Current Issue" && journal?._id) {
        fetchCurrentIssue();
    }
    if (activeTab === "Articles" && journal?._id) {
        fetchAllJournalArticles();
    }
  }, [activeTab, journal, viewIssue]);

  const fetchCurrentIssue = () => {
    if (!journal?._id) return;
    setCurrentIssueLoading(true);
    setCurrentIssueError("");

    fetch(`${URLS.ISSUES}/latest/${journal._id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.success) {
          setCurrentIssueData(data);
        } else {
          setCurrentIssueData(null);
          setCurrentIssueError(data.message || "No current issue found");
        }
      })
      .catch(() => {
        setCurrentIssueData(null);
        setCurrentIssueError("Failed to load current issue");
      })
      .finally(() => setCurrentIssueLoading(false));
  };

  const fetchJournal = () => {
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
  };

  useEffect(() => {
    fetchJournal();
  }, [searchParams]);

  const loadEditors = () => {
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
  };

  useEffect(() => {
    if (journal) {
      loadEditors();
    }
  }, [journal]);

  const openAddEditorModal = () => {
    setEditorForm({
      editorName: "",
      email: "",
      designation: "",
      institution: "",
      country: "",
    });
    setSelectedEditor(null);
    setIsEditorEditMode(false);
    setIsEditorModalOpen(true);
  };

  const openEditEditorModal = (editor: any) => {
    setEditorForm({
      editorName: editor.editorName || "",
      email: editor.email || "",
      designation: editor.designation || "",
      institution: editor.institution || "",
      country: editor.country || "",
    });
    setSelectedEditor(editor);
    setIsEditorEditMode(true);
    setIsEditorModalOpen(true);
  };

  const handleEditorFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setEditorForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveEditor = async () => {
    if (!editorForm.editorName || !editorForm.email) {
      alert("Please fill in Name and Email");
      return;
    }
    if (!journal?._id) return;

    const token = localStorage.getItem("authToken") || "";

    let url = URLS.EDITORS;
    let method = "POST";

    if (isEditorEditMode && selectedEditor?._id) {
      url = `${URLS.EDITORS}/${selectedEditor._id}`;
      method = "PUT";
    }

    const payload = {
      ...editorForm,
      journalId: journal._id,
    };

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
      if (!res.ok) {
        throw new Error(data?.message || "Failed to save editor");
      }
      alert(isEditorEditMode ? "Editor updated successfully" : "Editor added successfully");
      setIsEditorModalOpen(false);
      loadEditors();
    } catch (error) {
      alert("Failed to save editor");
    }
  };

  const openEditJournalModal = () => {
    if (!journal) return;
    setJournalForm({
      email: journal.email || "",
      mobile: journal.mobile || "",
      journalName: journal.journalName || "",
      journalTitle: journal.journalTitle || "",
      journalISSN: journal.journalISSN || "",
      journalCategory: journal.journalCategory || "",
      journalDescription: journal.journalDescription || "",
    });
    setJournalImageFile(null);
    setJournalBgImageFile(null);
    setJournalImagePreview(
      journal.journalImage ? `${ImageUrl}${journal.journalImage}` : null
    );
    setJournalBgImagePreview(
      journal.journalBgImage ? `${ImageUrl}${journal.journalBgImage}` : null
    );
    setIsJournalModalOpen(true);
  };

  const handleJournalInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setJournalForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleJournalDescriptionChange = (value: string) => {
    setJournalForm((prev) => ({ ...prev, journalDescription: value }));
  };

  const handleJournalImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setJournalImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setJournalImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleJournalBgImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setJournalBgImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setJournalBgImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeJournalImage = () => {
    setJournalImageFile(null);
    setJournalImagePreview(null);
  };

  const removeJournalBgImage = () => {
    setJournalBgImageFile(null);
    setJournalBgImagePreview(null);
  };

  const handleJournalSave = async () => {
    if (!journal?._id) return;
    if (
      !journalForm.email ||
      !journalForm.mobile ||
      !journalForm.journalName ||
      !journalForm.journalTitle ||
      !journalForm.journalISSN
    ) {
      alert("Please fill in all required fields");
      return;
    }

    setIsJournalSubmitting(true);

    try {
      const token = localStorage.getItem("authToken") || "";
      const data = new FormData();

      data.append("email", journalForm.email);
      data.append("mobile", journalForm.mobile);
      data.append("journalName", journalForm.journalName);
      data.append("journalTitle", journalForm.journalTitle);
      data.append("journalISSN", journalForm.journalISSN);
      data.append("journalCategory", journalForm.journalCategory);
      data.append("journalDescription", journalForm.journalDescription);

      if (journalImageFile) {
        data.append("journalImage", journalImageFile);
      }
      if (journalBgImageFile) {
        data.append("journalBgImage", journalBgImageFile);
      }

      const url = `${URLS.USERS}/update/${journal._id}`;

      const response = await fetch(url, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: data,
      });

      const result = await response.json();

      if (response.ok) {
        alert("Journal updated successfully!");
        setIsJournalModalOpen(false);
        fetchJournal();
      } else {
        alert(result.message || "Failed to update journal");
      }
    } catch (error) {
      alert("An error occurred while updating the journal");
    } finally {
      setIsJournalSubmitting(false);
    }
  };

  const handleDeleteEditor = (editor: any) => {
    setEditorToDelete(editor);
    setIsEditorDeleteModalOpen(true);
  };

  const confirmDeleteEditor = async () => {
    if (!editorToDelete?._id) return;
    const token = localStorage.getItem("authToken") || "";
    setIsDeletingEditor(true);

    try {
      const res = await fetch(`${URLS.EDITORS}/${editorToDelete._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || "Failed to delete editor");
      }
      alert("Editor deleted successfully");
      setIsEditorDeleteModalOpen(false);
      setEditorToDelete(null);
      loadEditors();
    } catch (error) {
      alert("Failed to delete editor");
    } finally {
      setIsDeletingEditor(false);
    }
  };



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
          {canManageJournal && journal && (
            <div className="absolute right-4 top-4 md:right-8 md:top-6">
              <button
                onClick={openEditJournalModal}
                className="px-4 py-2 rounded-full bg-white text-[#00467F] text-sm font-semibold shadow-sm hover:bg-gray-100 transition-colors"
              >
                Edit Journal
              </button>
            </div>
          )}
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
                {canManageJournal && (
                  <div className="flex justify-end">
                    <button
                      onClick={openAddEditorModal}
                      className="px-4 py-2 bg-[#00467F] text-white rounded-lg text-sm font-medium hover:bg-[#003366] transition-colors inline-flex items-center gap-2 shadow-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Add Editor
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
                  {paginatedEditors.map((e, idx) => (
                    <div
                      key={e._id ?? idx}
                      className="rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow flex flex-col"
                    >
                      <div className="h-1.5 bg-[#00467F] rounded-t-xl" />

                      <div className="p-5 flex flex-col gap-3">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-[#00467F]" />
                            <h3 className="font-semibold text-[#031E40]">
                              {e.editorName || "-"}
                            </h3>
                          </div>
                          {canManageJournal && (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => openEditEditorModal(e)}
                                className="p-2 text-[#e1b225] bg-[#e1b225]/10 hover:bg-[#e1b225]/20 rounded-lg transition-colors"
                                title="Edit Editor"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteEditor(e)}
                                className="p-2 text-[#bd3846] bg-[#bd3846]/10 hover:bg-[#bd3846]/20 rounded-lg transition-colors"
                                title="Delete Editor"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>

                        <p className="text-sm font-medium text-[#00467F]">
                          {e.designation || "-"}
                        </p>

                        <div className="flex items-start gap-2 text-sm text-gray-700">
                          <University className="h-4 w-4 mt-0.5 text-gray-500" />
                          <span>{e.institution || "-"}</span>
                        </div>

                        {e.country && (
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <MapPin className="h-4 w-4 text-gray-500" />
                            <span>{e.country}</span>
                          </div>
                        )}

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

                {editors.length > pageSize && (
                  <div className="mt-8 flex justify-between items-center border-t border-gray-100 pt-4">
                    <span className="text-sm text-gray-500">
                      Showing{" "}
                      {paginatedEditors.length > 0
                        ? (currentPage - 1) * pageSize + 1
                        : 0}{" "}
                      to{" "}
                      {Math.min(currentPage * pageSize, editors.length)} of{" "}
                      {editors.length} entries
                    </span>

                    <div className="flex gap-1">
                      <button
                        onClick={() =>
                          setCurrentPage(Math.max(1, currentPage - 1))
                        }
                        disabled={currentPage === 1}
                        className={`px-3 py-1.5 border border-gray-200 rounded-md text-sm font-medium transition-colors
                          ${
                            currentPage === 1
                              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                              : "bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900 cursor-pointer"
                          }`}
                      >
                        Previous
                      </button>

                      {Array.from(
                        { length: totalEditorPages },
                        (_, i) => i + 1
                      ).map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-1.5 border rounded-md text-sm font-medium transition-colors
                            ${
                              page === currentPage
                                ? "bg-[#00467F] text-white border-[#00467F]"
                                : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:text-gray-900"
                            }`}
                        >
                          {page}
                        </button>
                      ))}

                      <button
                        onClick={() =>
                          setCurrentPage(
                            Math.min(totalEditorPages, currentPage + 1)
                          )
                        }
                        disabled={currentPage === totalEditorPages}
                        className={`px-3 py-1.5 border border-gray-200 rounded-md text-sm font-medium transition-colors
                          ${
                            currentPage === totalEditorPages
                              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                              : "bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900 cursor-pointer"
                          }`}
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


        {activeTab === "Current Issue" && (
          <div className="space-y-8">
            {currentIssueLoading && (
              <div className="flex justify-center p-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00467F]"></div>
              </div>
            )}

            {currentIssueError && (
               <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                  <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-3" />
                  <p className="text-gray-500">{currentIssueError}</p>
               </div>
            )}

            {!currentIssueLoading && !currentIssueError && currentIssueData && (
              <div>
                <h2 className="text-2xl font-bold text-[#031E40] mb-2">Current Issue</h2>
                <p className="text-gray-600 mb-8">
                  The latest issue of {journal?.journalTitle} features cutting-edge research and insights from leading experts in the field.
                </p>

                <h3 className="text-xl font-bold text-gray-800 mb-6">
                  Volume {currentIssueData.latestIssue?.volume}, Issue {currentIssueData.latestIssue?.issue}
                </h3>

                <div className="space-y-6">
                  {currentIssueData.articles?.map((article: any) => (
                    <div
                      key={article._id}
                      className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
                    >
                      {/* Header: Badge + DOI */}
                      <div className="flex justify-between items-start mb-4">
                        <span className="bg-[#031E40] text-white text-xs font-semibold px-3 py-1 rounded-full uppercase">
                          {article.articleType}
                        </span>
                        <div className="flex items-center gap-2">
                          <img src={DoiIcon} alt="DOI" className="w-6 h-6 object-contain" />
                          <span className="text-gray-600 text-sm font-medium">
                            : {article.doiNumber || "N/A"}
                          </span>
                        </div>
                      </div>

                      {/* Title */}
                      <h4 className="text-lg font-bold text-[#031E40] mb-2 leading-tight">
                        {article.articleTitle}
                      </h4>

                      {/* Authors */}
                      <p className="text-sm text-gray-600 mb-4">
                        <span className="font-bold text-gray-800">Authors : </span>
                        {article.authorName}
                      </p>

                      {/* Footer: Dates + Buttons */}
                      <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-4 border-t border-gray-100">
                        <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar size={14} /> Rec. Date:{" "}
                            {article.submissionDate
                              ? new Date(article.submissionDate).toLocaleDateString()
                              : "-"}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar size={14} /> Acc. Date:{" "}
                            {article.acceptanceDate
                              ? new Date(article.acceptanceDate).toLocaleDateString()
                              : "-"}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar size={14} /> Pub. Date:{" "}
                            {article.publicationDate
                              ? new Date(article.publicationDate).toLocaleDateString()
                              : "-"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}


        {activeTab === "Articles" && (
          <div className="space-y-8">
             {articlesLoading ? (
                  <div className="flex justify-center p-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00467F]"></div>
                  </div>
                ) : articles.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No articles found for this journal.</p>
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
        )}

        {/* OTHER TABS */}
        {activeTab !== "Journal Home" &&
          activeTab !== "Editorial Board" &&
          activeTab !== "Volumes/Issues" &&
          activeTab !== "Current Issue" &&
          activeTab !== "Articles" && (
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

      <Modal
        isOpen={isJournalModalOpen}
        onClose={() => setIsJournalModalOpen(false)}
        title="Edit Journal"
        maxWidth="max-w-4xl"
        footer={
          <>
            <button
              onClick={() => setIsJournalModalOpen(false)}
              className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:text-gray-900 transition-all duration-200 focus:ring-2 focus:ring-gray-200 outline-none"
              disabled={isJournalSubmitting}
            >
              Cancel
            </button>
            <button
              onClick={handleJournalSave}
              disabled={isJournalSubmitting}
              className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-[#00467F] to-[#0078A8] rounded-xl hover:shadow-lg hover:shadow-blue-900/20 hover:from-[#031E40] hover:to-[#00467F] transition-all duration-200 transform hover:-translate-y-0.5 focus:ring-2 focus:ring-[#00467F] outline-none disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isJournalSubmitting ? "Saving..." : "Save Journal"}
            </button>
          </>
        }
      >
        <div className="space-y-5">
          <div className="pb-4 border-b border-gray-100">
            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
              User Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="relative">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">
                  Email *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    name="email"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-[#00467F]/20 focus:border-[#00467F] block transition-all duration-200 outline-none hover:bg-white"
                    value={journalForm.email}
                    onChange={handleJournalInputChange}
                    placeholder="email@example.com"
                  />
                </div>
              </div>

              <div className="relative">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">
                  Mobile *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Phone size={18} />
                  </div>
                  <input
                    type="text"
                    name="mobile"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-[#00467F]/20 focus:border-[#00467F] block transition-all duration-200 outline-none hover:bg-white"
                    value={journalForm.mobile}
                    onChange={handleJournalInputChange}
                    placeholder="Enter mobile number"
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
              Journal Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <div className="relative">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">
                  Journal Name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Book size={18} />
                  </div>
                  <input
                    type="text"
                    name="journalName"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-[#00467F]/20 focus:border-[#00467F] block transition-all duration-200 outline-none hover:bg-white"
                    value={journalForm.journalName}
                    onChange={handleJournalInputChange}
                    placeholder="e.g. Japan"
                  />
                </div>
              </div>

              <div className="relative">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">
                  Journal Title *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <BookOpen size={18} />
                  </div>
                  <input
                    type="text"
                    name="journalTitle"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-[#00467F]/20 focus:border-[#00467F] block transition-all duration-200 outline-none hover:bg-white"
                    value={journalForm.journalTitle}
                    onChange={handleJournalInputChange}
                    placeholder="e.g. Japan Medical Journal"
                  />
                </div>
              </div>

              <div className="relative">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">
                  ISSN Number *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Tag size={18} />
                  </div>
                  <input
                    type="text"
                    name="journalISSN"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-[#00467F]/20 focus:border-[#00467F] block transition-all duration-200 outline-none hover:bg-white"
                    value={journalForm.journalISSN}
                    onChange={handleJournalInputChange}
                    placeholder="e.g. 852-456"
                  />
                </div>
              </div>

              <div className="relative">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">
                  Category
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Tag size={18} />
                  </div>
                  <select
                    name="journalCategory"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-[#00467F]/20 focus:border-[#00467F] block transition-all duration-200 outline-none hover:bg-white"
                    value={journalForm.journalCategory}
                    onChange={handleJournalInputChange}
                  >
                    <option value="">Select Category</option>
                    <option value="Medical">Medical</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Science">Science</option>
                    <option value="Others">Others</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">
                Journal Image
              </label>
              <div
                className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:bg-gray-50 transition-colors cursor-pointer relative"
                onClick={() =>
                  document.getElementById("jd-journal-image-upload")?.click()
                }
              >
                <div className="space-y-1 text-center">
                  {journalImagePreview ? (
                    <div className="relative inline-block">
                      <img
                        src={journalImagePreview}
                        alt="Preview"
                        className="h-32 object-contain rounded-md"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeJournalImage();
                        }}
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
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF up to 10MB
                      </p>
                    </>
                  )}
                  <input
                    id="jd-journal-image-upload"
                    name="journalImage"
                    type="file"
                    className="sr-only"
                    onChange={handleJournalImageChange}
                    accept="image/*"
                  />
                </div>
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">
                Journal Background Image
              </label>
              <div
                className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:bg-gray-50 transition-colors cursor-pointer relative"
                onClick={() =>
                  document
                    .getElementById("jd-journal-bg-image-upload")
                    ?.click()
                }
              >
                <div className="space-y-1 text-center">
                  {journalBgImagePreview ? (
                    <div className="relative inline-block">
                      <img
                        src={journalBgImagePreview}
                        alt="Preview"
                        className="h-32 object-contain rounded-md"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeJournalBgImage();
                        }}
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
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF up to 10MB
                      </p>
                    </>
                  )}
                  <input
                    id="jd-journal-bg-image-upload"
                    name="journalBgImage"
                    type="file"
                    className="sr-only"
                    onChange={handleJournalBgImageChange}
                    accept="image/*"
                  />
                </div>
              </div>
            </div>

            <div className="relative">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">
                Description
              </label>
              <div className="react-quill-container">
                <style>{`
                  .ql-container {
                    min-height: 200px;
                    border-bottom-left-radius: 0.5rem;
                    border-bottom-right-radius: 0.5rem;
                  }
                  .ql-toolbar {
                    border-top-left-radius: 0.5rem;
                    border-top-right-radius: 0.5rem;
                  }
                `}</style>
                <ReactQuill
                  theme="snow"
                  value={journalForm.journalDescription}
                  onChange={handleJournalDescriptionChange}
                  placeholder="Enter journal description..."
                  modules={{
                    toolbar: [
                      [{ header: [1, 2, false] }],
                      ["bold", "italic", "underline", "strike", "blockquote"],
                      [
                        { list: "ordered" },
                        { list: "bullet" },
                        { indent: "-1" },
                        { indent: "+1" },
                      ],
                      ["link", "image"],
                      ["clean"],
                    ],
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isEditorModalOpen}
        onClose={() => setIsEditorModalOpen(false)}
        title={isEditorEditMode ? "Edit Editor" : "Add New Editor"}
        maxWidth="max-w-4xl"
        footer={
          <>
            <button
              onClick={() => setIsEditorModalOpen(false)}
              className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:text-gray-900 transition-all duration-200 focus:ring-2 focus:ring-gray-200 outline-none"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveEditor}
              className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-[#00467F] to-[#0078A8] rounded-xl hover:shadow-lg hover:shadow-blue-900/20 hover:from-[#031E40] hover:to-[#00467F] transition-all duration-200 transform hover:-translate-y-0.5 focus:ring-2 focus:ring-[#00467F] outline-none"
            >
              {isEditorEditMode ? "Update Editor" : "Save Editor"}
            </button>
          </>
        }
      >
        <div className="space-y-5">
          <div className="relative">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">
              Editor Name *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <User size={18} />
              </div>
              <input
                type="text"
                name="editorName"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-[#00467F]/20 focus:border-[#00467F] block transition-all duration-200 outline-none hover:bg-white"
                value={editorForm.editorName}
                onChange={handleEditorFormChange}
                placeholder="Enter full name"
              />
            </div>
          </div>

          <div className="relative">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">
              Journal
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <BookOpen size={18} />
              </div>
              <input
                type="text"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border border-gray-200 text-gray-900 text-sm rounded-xl"
                value={journal?.journalTitle || journal?.journalName || ""}
                readOnly
              />
            </div>
          </div>

          <div className="relative">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">
              Email *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Mail size={18} />
              </div>
              <input
                type="email"
                name="email"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-[#00467F]/20 focus:border-[#00467F] block transition-all duration-200 outline-none hover:bg-white"
                value={editorForm.email}
                onChange={handleEditorFormChange}
                placeholder="email@example.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="relative">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">
                Designation
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Briefcase size={18} />
                </div>
                <input
                  type="text"
                  name="designation"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-[#00467F]/20 focus:border-[#00467F] block transition-all duration-200 outline-none hover:bg-white"
                  value={editorForm.designation}
                  onChange={handleEditorFormChange}
                  placeholder="e.g. Professor"
                />
              </div>
            </div>

            <div className="relative">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">
                Country
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Globe size={18} />
                </div>
                <input
                  type="text"
                  name="country"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-[#00467F]/20 focus:border-[#00467F] block transition-all duration-200 outline-none hover:bg-white"
                  value={editorForm.country}
                  onChange={handleEditorFormChange}
                  placeholder="Enter country"
                />
              </div>
            </div>
          </div>

          <div className="relative">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">
              Institution
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Building2 size={18} />
              </div>
              <input
                type="text"
                name="institution"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-[#00467F]/20 focus:border-[#00467F] block transition-all duration-200 outline-none hover:bg-white"
                value={editorForm.institution}
                onChange={handleEditorFormChange}
                placeholder="Enter university or organization"
              />
            </div>
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

      <Modal
        isOpen={isEditorDeleteModalOpen}
        onClose={() => setIsEditorDeleteModalOpen(false)}
        title={
          <div className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Trash2 size={24} className="text-red-600" /> Confirm Delete
          </div>
        }
        footer={
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setIsEditorDeleteModalOpen(false)}
              className="px-5 py-2.5 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={confirmDeleteEditor}
              disabled={isDeletingEditor}
              className="px-5 py-2.5 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 shadow-lg shadow-red-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2"
            >
              {isDeletingEditor ? "Deleting..." : "Delete Editor"}
            </button>
          </div>
        }
      >
        <div className="py-4">
          <p className="text-gray-600 text-base leading-relaxed">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-gray-900">
              {editorToDelete?.editorName}
            </span>
            ? This action cannot be undone.
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default JournalHome;
