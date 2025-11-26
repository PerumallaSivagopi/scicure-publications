import React, { useState, useMemo } from 'react';
import '../../assets/css/onboarding.css';

const Onboarding = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const data = [
    {
      empId: 'Emp-001',
      name: 'Anthony Lewis',
      email: 'anthony@example.com',
      phone: '(123) 4567 890',
      designation: 'Finance',
      joiningDate: '12 Sep 2024',
      status: 'Active'
    },
    {
      empId: 'Emp-002',
      name: 'Brian Villalobos',
      email: 'brian@example.com',
      phone: '(179) 7382 829',
      designation: 'Developer',
      joiningDate: '24 Oct 2024',
      status: 'Active'
    },
    {
      empId: 'Emp-003',
      name: 'Harvey Smith',
      email: 'harvey@example.com',
      phone: '(184) 2719 738',
      designation: 'Developer',
      joiningDate: '18 Feb 2024',
      status: 'Active'
    },
    {
      empId: 'Emp-004',
      name: 'Stephan Peralt',
      email: 'peral@example.com',
      phone: '(193) 7839 748',
      designation: 'Executive',
      joiningDate: '17 Oct 2024',
      status: 'Active'
    },
    {
      empId: 'Emp-005',
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      phone: '(156) 2841 923',
      designation: 'Manager',
      joiningDate: '05 Nov 2024',
      status: 'Active'
    },
    {
      empId: 'Emp-006',
      name: 'Michael Brown',
      email: 'michael@example.com',
      phone: '(201) 5678 901',
      designation: 'HR',
      joiningDate: '10 Dec 2024',
      status: 'Pending'
    }
  ];

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    const term = searchTerm.toLowerCase();
    return data.filter(item =>
      Object.values(item).some(value =>
        String(value).toLowerCase().includes(term)
      )
    );
  }, [searchTerm]);

  // Paginate data
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
              <h3 className="page-title">E-Onboarding</h3>
              <ul className="breadcrumb">
                <li className="breadcrumb-item"><a href="/">Dashboard</a></li>
                <li className="breadcrumb-item active">E-Onboarding</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-12">
            <div className="card">
              <div className="card-header">
                <h4 className="card-title">Onboarding Employees</h4>
              </div>
              <div className="card-body">
                {/* Search and pagination controls */}
                <div className="table-controls" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                  <div>
                    <label htmlFor="pageSize" style={{ marginRight: '10px' }}>Show entries:</label>
                    <select
                      id="pageSize"
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(parseInt(e.target.value));
                        setCurrentPage(1);
                      }}
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
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                      }}
                      style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px', width: '200px' }}
                    />
                  </div>
                </div>

                {/* Table */}
                <table className="table table-striped table-hover">
                  <thead>
                    <tr>
                      <th>Emp ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Designation</th>
                      <th>Joining Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedData.length > 0 ? (
                      paginatedData.map((row, idx) => (
                        <tr key={idx}>
                          <td>{row.empId}</td>
                          <td>{row.name}</td>
                          <td>{row.email}</td>
                          <td>{row.phone}</td>
                          <td>{row.designation}</td>
                          <td>{row.joiningDate}</td>
                          <td>
                            <span className={`badge ${row.status === 'Active' ? 'badge-success' : 'badge-warning'}`}>
                              ● {row.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td style={{ textAlign: 'center', padding: '20px' }}>
                          No records found
                        </td>
                        <td></td>
                        <td></td>
                        <td></td>
                      </tr>
                    )}
                  </tbody>
                </table>

                {/* Pagination Info and Controls */}
                <div className="pagination-info" style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', color: '#666' }}>
                    Showing {paginatedData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{' '}
                    {Math.min(currentPage * pageSize, filteredData.length)} of {filteredData.length} entries
                  </span>

                  <div className="pagination" style={{ display: 'flex', gap: '5px' }}>
                    
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

export default Onboarding;
