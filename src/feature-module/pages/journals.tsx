import React, { useState, useEffect, useMemo } from 'react';
import '../../assets/css/onboarding.css';
import { Eye, Edit, Trash2 } from "lucide-react";

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

  useEffect(() => {
    fetch('https://scicure-publications-backend-1.onrender.com/api/users')
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
  }, []);

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
            <div className="col">
              <h3 className="page-title">Journals</h3>
              <ul className="breadcrumb">
                <li className="breadcrumb-item"><a href="/index">Dashboard</a></li>
                <li className="breadcrumb-item active">Journals</li>
              </ul>
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
    </div>
  );
};

export default JournalsPage;
