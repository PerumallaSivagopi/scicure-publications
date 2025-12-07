import React, { useState, useEffect, useMemo } from "react";
import "../../assets/css/onboarding.css";
import { Eye, Edit, Trash2 } from "lucide-react";

interface Manuscript {
  _id?: string;
  authorName?: string;
  email?: string;
  mobile?: string;
  postalAddress?: string;
  country?: string;

  journalId?: {
    journalName?: string;
    journalId?: string;
    _id?: string;
  };

  articleType?: string;
  menuscriptTitle?: string;
  abstract?: string;
  manuscriptFile?: string;
}

const ManuscriptsPage = () => {
  const [editors, setEditors] = useState<Manuscript[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const token = localStorage.getItem("authToken") || "";
    fetch("https://scicure-publications-backend-1.onrender.com/api/manuscripts",
      {
        method: "GET",
        headers: {
          "content-type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      }
    )
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

  const handleView = (row: Manuscript) => console.log("View clicked", row);
  const handleEdit = (row: Manuscript) => console.log("Edit clicked", row);
  const handleDelete = (row: Manuscript) => {
    if (window.confirm("Are you sure you want to delete this editor?")) {
      console.log("Deleted", row);
    }
  };

  // Search filter including nested journalName
  const filteredData = useMemo(() => {
    if (!searchTerm) return editors;

    const term = searchTerm.toLowerCase();

    return editors.filter((item) => {
      const term = searchTerm.toLowerCase();

      return (
        item.authorName?.toLowerCase().includes(term) ||
        item.email?.toLowerCase().includes(term) ||
        item.mobile?.toLowerCase().includes(term) ||
        item.country?.toLowerCase().includes(term) ||
        item.postalAddress?.toLowerCase().includes(term) ||
        item.articleType?.toLowerCase().includes(term) ||
        item.menuscriptTitle?.toLowerCase().includes(term) ||
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
            <div className="col">
              <h3 className="page-title">Manuscripts</h3>
              <ul className="breadcrumb">
                <li className="breadcrumb-item">
                  <a href="/index">Dashboard</a>
                </li>
                <li className="breadcrumb-item active">Manuscripts</li>
              </ul>
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
                        <th>Author</th>
                        <th>Email</th>
                        <th>Mobile</th>
                        <th>Country</th>
                        <th>Journal Name</th>
                        <th>Manuscript Title</th>
                        <th>Manuscript Type</th>
                        <th>PDF</th>
                        <th>Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {paginatedData.length > 0 ? (
                        paginatedData.map((row, index) => (
                          <tr key={row._id || index}>
                            <td>{(currentPage - 1) * pageSize + index + 1}</td>
                            <td>{row.authorName || "-"}</td>
                            <td>{row.email || "-"}</td>
                            <td>{row.mobile || "-"}</td>
                            <td>{row.country || "-"}</td>

                            <td>{row.journalId?.journalName || "-"}</td>

                            <td>{row.menuscriptTitle || "-"}</td>
                            <td>{row.articleType || "-"}</td>

                            <td>
                              {row.manuscriptFile ? (
                                <a
                                  href={`https://scicure-publications-backend-1.onrender.com/upload/${row.manuscriptFile}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{ color: "#007bff", textDecoration: "underline" }}
                                >
                                  View File
                                </a>
                              ) : (
                                "-"
                              )}
                            </td>

                            <td>
                              <div style={{ display: "flex", gap: 10 }}>
                                <Eye size={18} color="#3e99a8" onClick={() => handleView(row)} />
                                <Edit size={18} color="#e1b225" onClick={() => handleEdit(row)} />
                                <Trash2 size={18} color="#bd3846" onClick={() => handleDelete(row)} />
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={10} style={{ textAlign: "center", padding: 20 }}>
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
        </div>

      </div>
    </div>
  );
};

export default ManuscriptsPage;


