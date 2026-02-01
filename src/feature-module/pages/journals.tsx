import React, { useState, useEffect, useMemo } from 'react';
import '../../assets/css/onboarding.css'; import { Eye, Edit, Trash2, User, Mail, Lock, Phone, Book, BookOpen, FileText, Tag, Upload, X, Calendar, Hash, Layers } from "lucide-react";
import { URLS, ImageUrl } from '../../Urls';
import Modal from '../../components/ui/Modal';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { all_routes } from '../../router/all_routes';


interface Journal {
  _id?: string;
  journalId: string;
  journalTitle: string;
  journalCategory: string;
  journalISSN: string;
  createdAt: string;
  status: string;
  journalImage?: string;
  journalBgImage?: string;
  journalName?: string;
  journalDescription?: string;
  journalAboutUs?: string;
  userName?: string; // from User model
  email?: string;    // from User model
  mobile?: string;   // from User model
  role?: string;
}

const JournalsPage = () => {
  const [journals, setJournals] = useState<Journal[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    mobile: '',
    journalName: '',
    journalTitle: '',
    journalISSN: '',
    journalCategory: '',
    journalDescription: '',
    journalAboutUs: ''
  });

  const [journalImage, setJournalImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [journalBgImage, setJournalBgImage] = useState<File | null>(null);
  const [bgImagePreview, setBgImagePreview] = useState<string | null>(null);

  // View/Delete State
  const [selectedJournal, setSelectedJournal] = useState<Journal | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    fetchJournals();
  }, []);

  const fetchJournals = () => {
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

          const editId = searchParams.get('editId');
          if (editId) {
            const found = journalData.find(
              (j: any) => String(j._id) === String(editId)
            );
            if (found) {
              handleEdit(found as any);
            }
          }
        } else {
          setJournals([]);
        }
      })
      .catch(err => {
        console.error("Error fetching journals:", err);
        setJournals([]);
      });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setJournalImage(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setJournalImage(null);
    setImagePreview(null);
  };

  const handleBgImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setJournalBgImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setBgImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeBgImage = () => {
    setJournalBgImage(null);
    setBgImagePreview(null);
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.email || !formData.mobile ||
      !formData.journalName || !formData.journalTitle || !formData.journalISSN) {
      alert("Please fill in all required fields (Password is required only for new journals)");
      return;
    }

    if (!isEditMode && !formData.password) {
      alert("Password is required for new journals");
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("authToken") || "";
      const data = new FormData();

      data.append('email', formData.email);
      if (formData.password) data.append('password', formData.password); // Only append if provided
      data.append('mobile', formData.mobile);
      data.append('journalName', formData.journalName);
      data.append('journalTitle', formData.journalTitle);
      data.append('journalISSN', formData.journalISSN);
      data.append('journalCategory', formData.journalCategory);
      data.append('journalDescription', formData.journalDescription);
      data.append('journalAboutUs', formData.journalAboutUs);
      // Status is handled by backend or separate toggle usually, but sticking to existing logic if needed
      // If we want to update status, we need to add it to formData or handle it separately.
      // For now, assuming basic update.

      if (journalImage) {
        data.append('journalImage', journalImage);
      }
      if (journalBgImage) {
        data.append('journalBgImage', journalBgImage);
      }

      let url = `${URLS.USERS}/create`;
      let method = 'POST';

      if (isEditMode && selectedJournal) {
        url = `${URLS.USERS}/update/${selectedJournal._id}`;
        method = 'PUT';
      }

      const response = await fetch(url, {
        method: method,
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: data
      });

      const result = await response.json();

      if (response.ok) {
        alert(isEditMode ? "Journal updated successfully!" : "Journal added successfully!");
        setIsAddModalOpen(false);
        resetForm();
        fetchJournals();
      } else {
        alert(result.message || "Operation failed");
      }
    } catch (error) {
      console.error("Error saving journal:", error);
      alert("An error occurred while saving the journal");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      mobile: '',
      journalName: '',
      journalTitle: '',
      journalISSN: '',
      journalCategory: '',
      journalDescription: '',
      journalAboutUs: ''
    });
    setJournalImage(null);
    setImagePreview(null);
    setJournalBgImage(null);
    setBgImagePreview(null);
    setSelectedJournal(null);
    setIsEditMode(false);
  };

  const handleView = (row: Journal) => {
    const id = row._id;
    const jid = row.journalId;
    if (id) {
      navigate(`${all_routes.journalDetails}?id=${encodeURIComponent(id)}`);
    } else if (jid) {
      navigate(`${all_routes.journalDetails}?jid=${encodeURIComponent(jid)}`);
    } else {
      setSelectedJournal(row);
      setIsViewModalOpen(true);
    }
  };

  const handleEdit = (row: any) => { // Using any to access all fields from backend response easily without strict typing for now
    setSelectedJournal(row);
    setFormData({
      email: row.email || '',
      password: '', // Password not shown
      mobile: row.mobile || '',
      journalName: row.journalName || '',
      journalTitle: row.journalTitle || '',
      journalISSN: row.journalISSN || '',
      journalCategory: row.journalCategory || '',
      journalDescription: row.journalDescription || '',
      journalAboutUs: row.journalAboutUs || ''
    });
    if (row.journalImage) {
      // Assuming backend returns full path or filename. If filename, construct path.
      // Based on other code, it might be just filename. But let's check view.
      // Set preview if possible. For now, just setting it if it's a full URL or construct it.
      setImagePreview(`${ImageUrl}${row.journalImage}`);
    } else {
      setImagePreview(null);
    }
    if (row.journalBgImage) {
      setBgImagePreview(`${ImageUrl}${row.journalBgImage}`);
    } else {
      setBgImagePreview(null);
    }

    setIsEditMode(true);
    setIsAddModalOpen(true);
  };

  const handleDelete = (row: Journal) => {
    setSelectedJournal(row);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedJournal) return;

    try {
      const token = localStorage.getItem("authToken") || "";
      const response = await fetch(`${URLS.USERS}/delete/${selectedJournal._id}`, {
        method: 'DELETE',
        headers: {
          "Authorization": `Bearer ${token}`,
        }
      });

      if (response.ok) {
        alert("Journal deleted successfully");
        fetchJournals();
      } else {
        alert("Failed to delete journal");
      }
    } catch (error) {
      console.error("Error deleting journal:", error);
      alert("Error deleting journal");
    } finally {
      setIsDeleteModalOpen(false);
      setSelectedJournal(null);
    }
  };

  // Filter data
  const filteredData = useMemo(() => {
    const dataToFilter = Array.isArray(journals) ? journals : [];
    if (!searchTerm) return dataToFilter;

    const term = searchTerm.toLowerCase();
    return dataToFilter.filter(item =>
      Object.values(item).some(value =>
        String(value).toLowerCase().includes(term)
      )
    );
  }, [searchTerm, journals]);

  // Paginate
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
                <h3 className="page-title">Journals</h3>
                <ul className="breadcrumb">
                  <li className="breadcrumb-item">
                    <a href={all_routes.index}>Dashboard</a>
                  </li>
                  <li className="breadcrumb-item active">Journals</li>
                </ul>
              </div>
              <button
                className="px-4 py-2 bg-[#00467F] text-white rounded-lg flex items-center gap-2 hover:bg-[#031E40] transition-colors"
                onClick={() => { resetForm(); setIsAddModalOpen(true); }}
              >
                Add Journal
              </button>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-12">
            <div className="card">
              <div className="card-body">
                {/* Controls */}
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

                {/* Table */}
                <table className="table table-striped table-hover">
                  <thead>
                    <tr>
                      <th>Journal ID</th>
                      <th>Title</th>
                      <th>Category</th>
                      <th>ISSN Number</th>
                      <th>Created Date</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedData.length > 0 ? (
                      paginatedData.map((row, idx) => (
                        <tr key={idx}>
                          <td>{row.journalId}</td>
                          <td>{row.journalTitle || '-'}</td>
                          <td>{row.journalCategory || '-'}</td>
                          <td>{row.journalISSN || '-'}</td>
                          <td>{new Date(row.createdAt).toLocaleDateString()}</td>
                          <td>
                            <span className={`badge ${row.status.toLowerCase() === 'active' ? 'badge-success' : 'badge-warning'}`}>
                              ● {row.status}
                            </span>
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
                        <td colSpan={7} style={{ textAlign: 'center', padding: '20px' }}>No records found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
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
        title={isEditMode ? "Edit Journal" : "Add New Journal"}
        maxWidth="max-w-4xl"
        footer={
          <>
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:text-gray-900 transition-all duration-200 focus:ring-2 focus:ring-gray-200 outline-none"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-[#00467F] to-[#0078A8] rounded-xl hover:shadow-lg hover:shadow-blue-900/20 hover:from-[#031E40] hover:to-[#00467F] transition-all duration-200 transform hover:-translate-y-0.5 focus:ring-2 focus:ring-[#00467F] outline-none disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : 'Save Journal'}
            </button>
          </>
        }
      >
        <div className="space-y-5">
          {/* User Details Section */}
          <div className="pb-4 border-b border-gray-100">
            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">User Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="relative">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Email *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    name="email"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-[#00467F]/20 focus:border-[#00467F] block transition-all duration-200 outline-none hover:bg-white"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="email@example.com"
                  />
                </div>
              </div>

              <div className="relative">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Password {isEditMode ? "(Leave blank to keep current)" : "*"}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    name="password"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-[#00467F]/20 focus:border-[#00467F] block transition-all duration-200 outline-none hover:bg-white"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder={isEditMode ? "Enter new password" : "Enter password"}
                  />
                </div>
              </div>

              <div className="relative">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Mobile *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Phone size={18} />
                  </div>
                  <input
                    type="text"
                    name="mobile"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-[#00467F]/20 focus:border-[#00467F] block transition-all duration-200 outline-none hover:bg-white"
                    value={formData.mobile}
                    onChange={handleInputChange}
                    placeholder="Enter mobile number"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Journal Details Section */}
          <div>
            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Journal Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <div className="relative">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Journal Name *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Book size={18} />
                  </div>
                  <input
                    type="text"
                    name="journalName"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-[#00467F]/20 focus:border-[#00467F] block transition-all duration-200 outline-none hover:bg-white"
                    value={formData.journalName}
                    onChange={handleInputChange}
                    placeholder="e.g. Japan"
                  />
                </div>
              </div>

              <div className="relative">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Journal Title *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <BookOpen size={18} />
                  </div>
                  <input
                    type="text"
                    name="journalTitle"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-[#00467F]/20 focus:border-[#00467F] block transition-all duration-200 outline-none hover:bg-white"
                    value={formData.journalTitle}
                    onChange={handleInputChange}
                    placeholder="e.g. Japan Medical Journal"
                  />
                </div>
              </div>

              <div className="relative">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">ISSN Number *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Tag size={18} />
                  </div>
                  <input
                    type="text"
                    name="journalISSN"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-[#00467F]/20 focus:border-[#00467F] block transition-all duration-200 outline-none hover:bg-white"
                    value={formData.journalISSN}
                    onChange={handleInputChange}
                    placeholder="e.g. 852-456"
                  />
                </div>
              </div>

              <div className="relative">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Category</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Tag size={18} />
                  </div>
                  <select
                    name="journalCategory"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-900
                 text-sm rounded-xl focus:ring-2 focus:ring-[#00467F]/20 focus:border-[#00467F]
                 block transition-all duration-200 outline-none hover:bg-white"
                    value={formData.journalCategory}
                    onChange={handleInputChange}
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

            {/* Image Upload */}
            <div className="mb-5">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Journal Image</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:bg-gray-50 transition-colors cursor-pointer relative"
                onClick={() => document.getElementById('journal-image-upload')?.click()}>
                <div className="space-y-1 text-center">
                  {imagePreview ? (
                    <div className="relative inline-block">
                      <img src={imagePreview} alt="Preview" className="h-32 object-contain rounded-md" />
                      <button
                        onClick={(e) => { e.stopPropagation(); removeImage(); }}
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
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                    </>
                  )}
                  <input
                    id="journal-image-upload"
                    name="journalImage"
                    type="file"
                    className="sr-only"
                    onChange={handleImageChange}
                    accept="image/*"
                  />
                </div>
              </div>
            </div>

            {/* Background Image Upload */}
            <div className="mb-5">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Journal Background Image</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:bg-gray-50 transition-colors cursor-pointer relative"
                onClick={() => document.getElementById('journal-bg-image-upload')?.click()}>
                <div className="space-y-1 text-center">
                  {bgImagePreview ? (
                    <div className="relative inline-block">
                      <img src={bgImagePreview} alt="Preview" className="h-32 object-contain rounded-md" />
                      <button
                        onClick={(e) => { e.stopPropagation(); removeBgImage(); }}
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
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                    </>
                  )}
                  <input
                    id="journal-bg-image-upload"
                    name="journalBgImage"
                    type="file"
                    className="sr-only"
                    onChange={handleBgImageChange}
                    accept="image/*"
                  />
                </div>
              </div>
            </div>

            {/* Description (React Quill) */}
            <div className="relative">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Description</label>
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
                  value={formData.journalDescription}
                  onChange={(value) => setFormData(prev => ({ ...prev, journalDescription: value }))}
                  placeholder="Enter journal description..."
                  modules={{
                    toolbar: [
                      [{ 'header': [1, 2, false] }],
                      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                      [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
                      ['link', 'image'],
                      ['clean']
                    ],
                  }}
                />
              </div>
            </div>

            <div className="relative mt-5">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">
                Journal About Us
              </label>

              <ReactQuill
                theme="snow"
                value={formData.journalAboutUs}
                onChange={(value) =>
                  setFormData(prev => ({ ...prev, journalAboutUs: value }))
                }
                placeholder="Enter About Us content..."
              />
            </div>

          </div>
        </div>
      </Modal>

      {/* View Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title={<div className="text-xl font-bold text-gray-800 flex items-center gap-2"><BookOpen size={24} /> Journal Details</div>}
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
        {selectedJournal && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-6 border-b border-gray-100 pb-6">
              <div className="w-full md:w-1/3">
                {selectedJournal.journalImage ? (
                  <img
                    src={`${ImageUrl}${selectedJournal.journalImage}`}
                    alt={selectedJournal.journalTitle}
                    className="w-full h-auto rounded-xl shadow-md object-cover border border-gray-100"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x400?text=No+Image';
                    }}
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 border border-gray-200">
                    <BookOpen size={48} />
                  </div>
                )}
              </div>
              <div className="w-full md:w-2/3 space-y-4">
                <div>
                  <h4 className="text-2xl font-bold text-[#00467F] mb-1">{selectedJournal.journalTitle}</h4>
                  <p className="text-gray-600 font-medium">{selectedJournal.journalName}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-lg border border-gray-100">
                    <Hash size={18} className="text-blue-500" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold">Journal ID</p>
                      <p className="text-sm font-medium text-gray-900">{selectedJournal.journalId}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-lg border border-gray-100">
                    <Hash size={18} className="text-purple-500" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold">ISSN</p>
                      <p className="text-sm font-medium text-gray-900">{selectedJournal.journalISSN}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-lg border border-gray-100">
                    <Layers size={18} className="text-orange-500" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold">Category</p>
                      <p className="text-sm font-medium text-gray-900">{selectedJournal.journalCategory}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-lg border border-gray-100">
                    <Calendar size={18} className="text-green-500" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold">Created</p>
                      <p className="text-sm font-medium text-gray-900">{new Date(selectedJournal.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-lg border border-gray-100">
                    <div className={`w-2 h-2 rounded-full ${selectedJournal.status.toLowerCase() === 'active' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold">Status</p>
                      <p className={`text-sm font-medium ${selectedJournal.status.toLowerCase() === 'active' ? 'text-green-600' : 'text-yellow-600'}`}>
                        {selectedJournal.status}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {(selectedJournal as any).journalDescription && (
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <h5 className="text-sm font-bold text-gray-900 uppercase mb-3 flex items-center gap-2">
                  <FileText size={16} /> Description
                </h5>
                <div className="prose prose-sm max-w-none text-gray-600" dangerouslySetInnerHTML={{ __html: (selectedJournal as any).journalDescription }} />
              </div>
            )}

            {(selectedJournal as any).journalAboutUs && (
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mt-4">
                <h5 className="text-sm font-bold text-gray-900 uppercase mb-3">
                  About Us
                </h5>
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: (selectedJournal as any).journalAboutUs
                  }}
                />
              </div>
            )}

            {/* Contact Information */}
            <div>
              <h5 className="text-sm font-bold text-gray-900 uppercase mb-3 flex items-center gap-2">
                <User size={16} /> Contact Information
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                  <User size={18} className="text-blue-500 min-w-4" />
                  <div className="flex-grow">
                    <p className="text-xs text-gray-500 uppercase font-semibold">Name</p>
                    <p className="font-medium text-gray-900">{(selectedJournal as any).userName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                  <Mail size={18} className="text-red-500 min-w-4" />
                  <div className="flex-grow">
                    <p className="text-xs text-gray-500 uppercase font-semibold">Email</p>
                    <p className="font-medium text-gray-900 break-all">{(selectedJournal as any).email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                  <Phone size={18} className="text-green-500 min-w-4" />
                  <div className="flex-grow">
                    <p className="text-xs text-gray-500 uppercase font-semibold">Mobile</p>
                    <p className="font-medium text-gray-900">{(selectedJournal as any).mobile}</p>
                  </div>
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">Delete Journal?</h3>
          <p className="text-gray-500">
            Are you sure you want to delete <span className="font-semibold text-gray-900">{selectedJournal?.journalTitle}</span>?
            This action cannot be undone.
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default JournalsPage;
