import React, { useState, useEffect, useMemo } from "react";
import "../../assets/css/onboarding.css";
import { Eye, Edit, Trash2, Mail, User, CheckCircle, XCircle, AlertTriangle, BookOpen } from "lucide-react"; // Added new icons
import { URLS } from "../../Urls";
import Modal from "../../components/ui/Modal";

interface Contact {
  _id: string;
  fullName: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

const ContactEnquiriesPage = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false); // State for loading

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    const token = localStorage.getItem("authToken") || "";
    try {
      const res = await fetch(URLS.CONTACTS, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await res.json();
      setContacts(result.data || []);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      // Handle error display
    }
  };

  /**
   * API call to change the status of isRead to true.
   * Endpoint: URL.CONTACTS/:id
   */
  const markAsRead = async () => {
    if (!selectedContact || selectedContact.isRead) return; // 1. Pre-check

    setIsUpdatingStatus(true);
    const token = localStorage.getItem("authToken") || "";
    try {
      const res = await fetch(`${URLS.CONTACTS}/${selectedContact._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isRead: true }), // 2. Payload Check
      });

      if (res.ok) { // 3. Response Check
        // Optimistically update the selected contact's status
        setSelectedContact({ ...selectedContact, isRead: true });
        // Update the main contacts array
        setContacts((prev) =>
          prev.map((c) =>
            c._id === selectedContact._id ? { ...c, isRead: true } : c
          )
        );
        alert("Contact marked as read.");
      } else {
        // Handle API error
        console.error("Failed to mark as read"); // 4. Error Logging
      }
    } catch (error) {
      console.error("Error marking as read:", error);
    } finally {
      setIsUpdatingStatus(false);
      setIsUpdateModalOpen(false); // 5. Modal Close
    }
  };
  const deleteContact = async () => {
    if (!selectedContact) return;

    const token = localStorage.getItem("authToken") || "";
    try {
      await fetch(`${URLS.CONTACTS}/${selectedContact._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // Filter out the deleted contact
      setContacts((prev) =>
        prev.filter((c) => c._id !== selectedContact._id)
      );
      alert("Contact deleted successfully.");
    } catch (error) {
      console.error("Error deleting contact:", error);
    } finally {
      setIsDeleteModalOpen(false);
      setSelectedContact(null); // Clear selected contact
    }
  };

  const trimText = (text: string, length = 40) =>
    text.length > length ? text.slice(0, length) + "..." : text;

  /* 🔍 Search and Pagination Logic (kept as-is) */
  const filteredData = useMemo(() => {
    if (!searchTerm) return contacts;
    const term = searchTerm.toLowerCase();
    return contacts.filter((item) =>
      Object.values(item).some((val) =>
        String(val).toLowerCase().includes(term)
      )
    );
  }, [searchTerm, contacts]);

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  // Utility to open view modal and optionally mark as read if unread
  const handleView = (contact: Contact) => {
    setSelectedContact(contact);
    setIsViewModalOpen(true);
    // Optional: Auto-mark as read when viewing, or keep it separate.
    // Based on the request for a separate 'Edit' action to mark as read,
    // I will keep the view action non-mutating for now.
  };

  // Utility to open update modal
  const handleEdit = (contact: Contact) => {
    setSelectedContact(contact);
    setIsUpdateModalOpen(true);
  };

  // Utility to open delete modal
  const handleDelete = (contact: Contact) => {
    setSelectedContact(contact);
    setIsDeleteModalOpen(true);
  };

  // Reusable button styles for the table actions
  const actionButtonClass = "p-1 rounded-full hover:bg-gray-100 transition-colors cursor-pointer text-gray-600";
  const viewButtonClass = `text-blue-500 ${actionButtonClass}`;
  const editButtonClass = `text-yellow-500 ${actionButtonClass}`;
  const deleteButtonClass = `text-red-500 ${actionButtonClass}`;
  const modalButtonBase = "btn px-4 py-2 font-semibold rounded-lg shadow-md transition duration-300 ease-in-out flex items-center justify-center gap-2";

  return (
    <div className="page-wrapper">
      <div className="content container-fluid">
        <div className="page-header">
          <div>
                <h3 className="page-title">Contact Enquiries</h3>
                <ul className="breadcrumb">
                  <li className="breadcrumb-item">
                    <a href="/index">Dashboard</a>
                  </li>
                  <li className="breadcrumb-item active">Contact Enquiries</li>
                </ul>
              </div>
        </div>

        <div className="card">
          <div className="card-body">
            {/* Controls */}
            <div className="table-controls flex justify-between mb-4">
                <div>
                <label style={{ marginRight: 10 }}>Show entries:</label>
              <select
                className="form-select form-select-sm"
                value={pageSize}
                onChange={(e) => {
                  setPageSize(+e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
              </select>
                </div>
              <input
                type="text"
                className="form-control form-control-sm w-64"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            {/* Table */}
            <div className="table-responsive">
              <table className="table table-striped table-hover">
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Full Name</th>
                    <th>Email</th>
                    <th>Subject</th>
                    <th>Message</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedData.length ? (
                    paginatedData.map((row, index) => (
                      <tr key={row._id} className={!row.isRead ? 'bg-yellow-50/50' : ''}> {/* Highlight unread rows */}
                        <td>{(currentPage - 1) * pageSize + index + 1}</td>
                        <td>{row.fullName}</td>
                        <td>{row.email}</td>
                        <td>{trimText(row.subject)}</td>
                        <td>{trimText(row.message)}</td>
                        <td>
                          <span
                            className={`badge ${
                              row.isRead ? "badge-success" : "badge-warning"
                            }`}
                          >
                            {row.isRead ? "Read" : "Unread"}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: 10 }}>
                            <Eye
                              size={25}
                              className={viewButtonClass}
                              onClick={() => handleView(row)}
                            />
                            <Edit
                              size={25}
                              className={editButtonClass}
                              onClick={() => handleEdit(row)}
                            />
                            <Trash2
                              size={25}
                              className={deleteButtonClass}
                              onClick={() => handleDelete(row)}
                            />
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center py-4">
                        <p className="text-gray-500">No records found</p>
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

      {/* 👁 Styled View Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title={<div className="text-xl font-bold text-gray-800 flex items-center gap-2"><BookOpen size={24} /> Enquiry Details</div>}
      >
        {selectedContact && (
          <div className="p-4 bg-gray-50 rounded-lg space-y-4">
            <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-md shadow-sm">
              <User size={18} className="text-blue-500 min-w-4" />
              <div className="flex-grow">
                <p className="text-sm text-gray-500">Full Name</p>
                <p className="font-medium text-gray-900">{selectedContact.fullName}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-md shadow-sm">
              <Mail size={18} className="text-red-500 min-w-4" />
              <div className="flex-grow">
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium text-gray-900">{selectedContact.email}</p>
              </div>
            </div>
            
            <div className="p-3 bg-white border border-gray-200 rounded-md shadow-sm">
              <p className="text-sm font-semibold text-gray-600 mb-1">Subject</p>
              <p className="text-gray-800">{selectedContact.subject}</p>
            </div>
            
            <div className="p-3 bg-white border border-gray-200 rounded-md shadow-sm">
              <p className="text-sm font-semibold text-gray-600 mb-1">Message</p>
              <div className="whitespace-pre-wrap max-h-60 overflow-y-auto p-2 bg-gray-100 rounded-md border border-dashed border-gray-300">
                {selectedContact.message}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* ✏️ Styled Update Modal (Mark as Read) */}
      <Modal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        title={<div className="text-xl font-bold text-gray-800 flex items-center gap-2"><Edit size={24} /> Update Enquiry Status</div>}
      >
        <div className="p-4 space-y-4 text-center">
          <p className="text-lg text-gray-700">
            You are about to update the read status for:
          </p>
          <p className="font-bold text-blue-600 text-xl">{selectedContact?.fullName}</p>
          
          <div className="p-4 border rounded-lg flex items-center justify-center gap-3">
            <span className="text-md font-medium text-gray-600">Current Status:</span>
            {selectedContact?.isRead ? (
                <span className="text-lg font-bold text-green-600 flex items-center gap-1">
                    <CheckCircle size={20} /> Read
                </span>
            ) : (
                <span className="text-lg font-bold text-yellow-600 flex items-center gap-1">
                    <AlertTriangle size={20} /> Unread
                </span>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={() => setIsUpdateModalOpen(false)}
            className={`${modalButtonBase} btn-secondary`}
          >
            Cancel
          </button>
          <button
            onClick={markAsRead}
            className={`${modalButtonBase} btn-primary bg-green-500 hover:bg-green-600 text-white`}
            disabled={selectedContact?.isRead || isUpdatingStatus}
          >
            {isUpdatingStatus ? (
              'Updating...'
            ) : selectedContact?.isRead ? (
              <><CheckCircle size={18} /> Already Read</>
            ) : (
              <><CheckCircle size={18} /> Mark as Read</>
            )}
          </button>
        </div>
      </Modal>

      {/* 🗑 Styled Delete Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title={<div className="text-xl font-bold text-red-600 flex items-center gap-2"><Trash2 size={24} /> Confirm Deletion</div>}
      >
        <div className="p-4 space-y-4 text-center">
          <AlertTriangle size={48} className="text-red-500 mx-auto" />
          <p className="text-lg text-gray-700">
            Are you absolutely sure you want to permanently delete the enquiry from:
          </p>
          <p className="font-bold text-red-700 text-xl">{selectedContact?.fullName}</p>
          <p className="text-sm text-gray-500">This action cannot be undone.</p>
        </div>
        
        <div className="mt-6 flex justify-end gap-3">
            <button 
                onClick={() => setIsDeleteModalOpen(false)}
                className={`${modalButtonBase} btn-secondary`}
            >
                Cancel
            </button>
            <button 
                onClick={deleteContact}
                className={`${modalButtonBase} btn-danger bg-red-600 hover:bg-red-700 text-white`}
            >
                <XCircle size={18} /> Delete Permanently
            </button>
        </div>
      </Modal>
    </div>
  );
};

export default ContactEnquiriesPage;