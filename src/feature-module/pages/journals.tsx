import React, { useState, useEffect, useMemo } from 'react';
import '../../assets/css/onboarding.css'; import { Eye, Edit, Trash2, User, Mail, Lock, Phone, Book, BookOpen, FileText, Tag, Upload, X } from "lucide-react";
import Modal from '../../components/ui/Modal';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';


interface Journal {
  journalId: string;
  journalTitle: string;
  journalCategory: string;
  journalISSN: string;
  createdAt: string;
  status: string;
  journalImage?: string;
}

const JournalsPage = () => {
  const [journals, setJournals] = useState<Journal[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    userName: '',
    email: '',
    password: '',
    mobile: '',
    journalName: '',
    journalTitle: '',
    journalISSN: '',
    journalCategory: '',
    journalDescription: ''
  });

  const [journalImage, setJournalImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    fetchJournals();
  }, []);

  const fetchJournals = () => {
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

  const handleSubmit = async () => {
    // Validation
    if (!formData.userName || !formData.email || !formData.password || !formData.mobile ||
      !formData.journalName || !formData.journalTitle || !formData.journalISSN) {
      alert("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("authToken") || "";
      const data = new FormData();

      data.append('userName', formData.userName);
      data.append('email', formData.email);
      data.append('password', formData.password);
      data.append('mobile', formData.mobile);
      data.append('journalName', formData.journalName);
      data.append('journalTitle', formData.journalTitle);
      data.append('journalISSN', formData.journalISSN);
      data.append('journalCategory', formData.journalCategory);
      data.append('journalDescription', formData.journalDescription);

      if (journalImage) {
        data.append('journalImage', journalImage);
      }

      const response = await fetch('https://scicure-publications-backend-1.onrender.com/api/users/create', {
        method: 'POST',
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: data
      });

      const result = await response.json();

      if (response.ok) {
        alert("Journal added successfully!");
        setIsAddModalOpen(false);
        resetForm();
        fetchJournals();
      } else {
        alert(result.message || "Failed to add journal");
      }
    } catch (error) {
      console.error("Error adding journal:", error);
      alert("An error occurred while adding the journal");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      userName: '',
      email: '',
      password: '',
      mobile: '',
      journalName: '',
      journalTitle: '',
      journalISSN: '',
      journalCategory: '',
      journalDescription: ''
    });
    setJournalImage(null);
    setImagePreview(null);
  };

  const handleView = (row: Journal) => console.log("View clicked", row);
  const handleEdit = (row: Journal) => console.log("Edit clicked", row);
  const handleDelete = (row: Journal) => {
    if (window.confirm("Are you sure you want to delete this entry?")) {
      console.log("Deleted", row);
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
                  <li className="breadcrumb-item"><a href="/index">Dashboard</a></li>
                  <li className="breadcrumb-item active">Journals</li>
                </ul>
              </div>
              <button
                className="px-4 py-2 bg-[#00467F] text-white rounded-lg flex items-center gap-2 hover:bg-[#031E40] transition-colors"
                onClick={() => setIsAddModalOpen(true)}
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
                <div className="table-controls" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                  <div>
                    <label htmlFor="pageSize" style={{ marginRight: '10px' }}>Show entries:</label>
                    <select
                      id="pageSize"
                      value={pageSize}
                      onChange={(e) => { setPageSize(parseInt(e.target.value)); setCurrentPage(1); }}
                      style={{ padding: '6px 8px', border: '1px solid #ddd', borderRadius: '4px' }}
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                    </select>
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchTerm}
                      onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                      style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px', width: '200px' }}
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
                            <div style={{ display: "flex", gap: "10px" }}>
                              <span title="View"><Eye size={18} color="#3e99a8ff" onClick={() => handleView(row)} /></span>
                              <span title="Edit"><Edit size={18} color="#e1b225ff" onClick={() => handleEdit(row)} /></span>
                              <span title="Delete"><Trash2 size={18} color="#bd3846ff" onClick={() => handleDelete(row)} /></span>
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
                <div className="pagination-info" style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', color: '#666' }}>
                    Showing {paginatedData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{' '}
                    {Math.min(currentPage * pageSize, filteredData.length)} of {filteredData.length} entries
                  </span>

                  <div className="pagination" style={{ display: 'flex', gap: '5px' }}>
                    {/* Previous Button */}
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="paginate_button"
                      style={{
                        padding: '6px 12px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        backgroundColor: currentPage === 1 ? '#e9ecef' : 'white',
                        cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                        opacity: currentPage === 1 ? 0.5 : 1
                      }}
                    >
                      Previous
                    </button>

                    {/* Page Numbers */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`paginate_button ${page === currentPage ? 'current' : ''}`}
                        style={{
                          padding: '6px 12px',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          backgroundColor: page === currentPage ? '#3a98d9' : 'white',
                          color: page === currentPage ? 'white' : '#333',
                          cursor: 'pointer'
                        }}
                      >
                        {page}
                      </button>
                    ))}

                    {/* Next Button */}
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="paginate_button"
                      style={{
                        padding: '6px 12px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        backgroundColor: currentPage === totalPages ? '#e9ecef' : 'white',
                        cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                        opacity: currentPage === totalPages ? 0.5 : 1
                      }}
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
        title="Add New Journal"
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
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">User Name *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    name="userName"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-[#00467F]/20 focus:border-[#00467F] block transition-all duration-200 outline-none hover:bg-white"
                    value={formData.userName}
                    onChange={handleInputChange}
                    placeholder="Enter user name"
                  />
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
                    name="email"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-[#00467F]/20 focus:border-[#00467F] block transition-all duration-200 outline-none hover:bg-white"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="email@example.com"
                  />
                </div>
              </div>

              <div className="relative">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Password *</label>
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
                    placeholder="Enter password"
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
                      [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
                      ['link', 'image'],
                      ['clean']
                    ],
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default JournalsPage;
