import React, { useState, useEffect } from 'react';
import '../styles/dashboard.css';
import axios from 'axios';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Table = () => {
  // ─── Main summary data ──────────────────────────────────────────────────
  const [rowsData, setRowsData] = useState([]);
  const [totals, setTotals] = useState({
    corporation: 'TOTAL',
    applicationReceived: 0,
    approved: 0,
    authorisationReject: 0,
    authorisationPending: 0,
    paymentPending: 0,
    paymentReceived: 0,
    certificateIssued: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const hasMoreThanMax = rowsData.length > 10;

  useEffect(() => {
    const fetchSummaryData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/dashboard/RTSULBWiseadd`);
        console.log("res", response);
        if (!response.data.success) {
          throw new Error(`${response.message}`);
        }
        const items = Array.isArray(response.data) ? response.data.data : (response.data.data || []);
        const computedTotals = {
          corporation: 'TOTAL',
          applicationReceived: 0,
          approved: 0,
          authorisationReject: 0,
          authorisationPending: 0,
          paymentPending: 0,
          paymentReceived: 0,
          certificateIssued: 0,
        };

        const formattedItems = items.map(item => {
          const formattedItem = {
            corporation: item.VAR_CORPORATION_SHORTNAME || 'Unknown',
            ulbId: item.NUM_CORPORATION_ID,
            applicationReceived: Number(item.TOTAL || 0),
            approved: Number(item.APPROVED || 0),
            authorisationReject: Number(item.AUTHORISATION_REJECT || 0),
            authorisationPending: Number(item.AUTHORISATION_PENDING || 0),
            paymentPending: Number(item.PAYMENT_PENDING || 0),
            paymentReceived: Number(item.NEW || 0),
            certificateIssued: Number(item.DELIVERD || 0),
          };

          computedTotals.applicationReceived += formattedItem.applicationReceived;
          computedTotals.approved += formattedItem.approved;
          computedTotals.authorisationReject += formattedItem.authorisationReject;
          computedTotals.authorisationPending += formattedItem.authorisationPending;
          computedTotals.paymentPending += formattedItem.paymentPending;
          computedTotals.paymentReceived += formattedItem.paymentReceived;
          computedTotals.certificateIssued += formattedItem.certificateIssued;

          return formattedItem;
        });

        setRowsData(formattedItems);
        setTotals(computedTotals);
      } catch (err) {
        console.error("Error fetching RTSULBWise data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSummaryData();
  }, []);

  const colKeys = [
    'applicationReceived',
    'approved',
    'authorisationReject',
    'authorisationPending',
    'paymentPending',
    'paymentReceived',
    'certificateIssued',
  ];

  const colLabels = {
    applicationReceived: 'Application Received',
    approved: 'Approved',
    authorisationReject: 'Authorisation Reject',
    authorisationPending: 'Authorisation Pending',
    paymentPending: 'Payment Pending',
    paymentReceived: 'Payment Received',
    certificateIssued: 'Certificate Issued',
  };

  // ─── State ──────────────────────────────────────────────────────────────
  const [view, setView] = useState('summary'); // 'summary', 'departments', 'services'
  const [selectedCorporation, setSelectedCorporation] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [selectedUlbId, setSelectedUlbId] = useState(null);
  const [departmentData, setDepartmentData] = useState({});
  const [serviceData, setServiceData] = useState({});
  const [statusData, setStatusData] = useState([]);
  const [selectedStatusLabel, setSelectedStatusLabel] = useState('');

  const keyToStatus = {
    applicationReceived: 'TOT',
    approved: 'AP',
    authorisationReject: 'CR',
    authorisationPending: 'CP',
    paymentPending: 'PP',
    paymentReceived: 'NW',
    certificateIssued: 'DL',
  };

  // ─── Toast state ──────────────────────────────────────────────────────
  const [toastMessage, setToastMessage] = useState(null);
  const [showToast, setShowToast] = useState(false);

  // ─── Handlers ──────────────────────────────────────────────────────────
  const handleCellClick = (corporation, columnKey, value) => {
    const label = colLabels[columnKey] || columnKey;
    setToastMessage(`${corporation} · ${label}: ${value.toLocaleString()}`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleStatusClick = async (columnKey, ulbId) => {
    const status = keyToStatus[columnKey];
    if (!status) return;

    setSelectedStatusLabel(colLabels[columnKey]);
    setView('status');

    try {
      setLoading(true);
      const url = ulbId 
        ? `${API_BASE_URL}/dashboard/RTSStatusWise?status=${status}&ulbId=${ulbId}`
        : `${API_BASE_URL}/dashboard/RTSStatusWise?status=${status}`;
      
      const response = await axios.get(url);
      console.log("status", response);
      if (!response.data.success) {
        throw new Error(`${response.data.message || "Failed to load status data"}`);
      }
      
      const items = Array.isArray(response.data) ? response.data.data : (response.data.data || []);
      
      const formattedItems = items.map(item => ({
        department: item.VAR_DEPT_ENGNAME || 'Unknown',
        deptId: item.NUM_APPLICATION_DEPTID,
        count: Number(item.STATUS || 0),
        applicationStatus: item.APPLICATION_STATUS || status
      }));

      setStatusData(formattedItems);
    } catch (err) {
      console.error("Error fetching status data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCorporationClick = async (corpName, ulbId) => {
    setSelectedCorporation(corpName);
    setSelectedUlbId(ulbId);
    setView('departments');

    if (!departmentData[corpName]) {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/dashboard/RTSULBDeptWise?ulbId=${ulbId}`);
        if (!response.data.success) {
          throw new Error(`${response.message || "Failed to load departments"}`);
        }
        
        const items = Array.isArray(response.data) ? response.data.data : (response.data.data || []);
        
        const formattedItems = items.map(item => ({
          department: item.VAR_DEPT_ENGNAME ||  'Unknown',
          applicationReceived: Number(item.TOTAL || 0),
          approved: Number(item.APPROVED || 0),
          authorisationReject: Number(item.AUTHORISATION_REJECT || 0),
          authorisationPending: Number(item.AUTHORISATION_PENDING || 0),
          paymentPending: Number(item.PAYMENT_PENDING || 0),
          paymentReceived: Number(item.NEW || 0),
          certificateIssued: Number(item.DELIVERD || 0),
          deptId: item.NUM_APPLICATION_DEPTID
        }));

        setDepartmentData(prev => ({ ...prev, [corpName]: formattedItems }));
      } catch (err) {
        console.error("Error fetching department data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDepartmentClick = async (deptName, deptId) => {
    setSelectedDepartment(deptName);
    setView('services');

    if (selectedUlbId && deptId) {
      // Create a key for caching
      const cacheKey = `${selectedCorporation}_${deptName}`;
      
      if (!serviceData[cacheKey]) {
        try {
          setLoading(true);
          const response = await axios.get(`${API_BASE_URL}/dashboard/RTSULBServiceWise?ulbId=${selectedUlbId}&deptId=${deptId}`);
          if (!response.data.success) {
            throw new Error(`${response.message || "Failed to load services"}`);
          }
          
          const items = Array.isArray(response.data) ? response.data.data : (response.data.data || []);
          
          const formattedItems = items.map(item => ({
            service: item.VAR_SERVICE_ENG_NAME || 'Unknown',
            applicationReceived: Number(item.TOTAL || 0),
            approved: Number(item.APPROVED || 0),
            authorisationReject: Number(item.AUTHORISATION_REJECT || 0),
            authorisationPending: Number(item.AUTHORISATION_PENDING || 0),
            paymentPending: Number(item.PAYMENT_PENDING || 0),
            paymentReceived: Number(item.NEW || 0),
            certificateIssued: Number(item.DELIVERD || 0),
          }));

          setServiceData(prev => ({ ...prev, [cacheKey]: formattedItems }));
        } catch (err) {
          console.error("Error fetching service data:", err);
          setError(err.message);
        } finally {
          setLoading(false);
        }
      }
    }
  };

  const handleBackToSummary = () => {
    setView('summary');
    setSelectedCorporation(null);
    setSelectedDepartment(null);
  };

  const handleBackToDepartments = () => {
    setView('departments');
    setSelectedDepartment(null);
  };

  const computeStatusTotal = (items) => {
    return items.reduce((acc, item) => acc + item.count, 0);
  };

  const formatNumber = (num) => num.toLocaleString();

  // ─── Helpers to compute totals ─────────────────────────────────────────
  const computeDeptTotals = (depts) => {
    const totals = { applicationReceived: 0, approved: 0, authorisationReject: 0, authorisationPending: 0, paymentPending: 0, paymentReceived: 0, certificateIssued: 0 };
    depts.forEach(d => {
      totals.applicationReceived += d.applicationReceived;
      totals.approved += d.approved;
      totals.authorisationReject += d.authorisationReject;
      totals.authorisationPending += d.authorisationPending;
      totals.paymentPending += d.paymentPending;
      totals.paymentReceived += d.paymentReceived;
      totals.certificateIssued += d.certificateIssued;
    });
    return totals;
  };

  const computeServiceTotals = (services) => {
    const totals = { applicationReceived: 0, approved: 0, authorisationReject: 0, authorisationPending: 0, paymentPending: 0, paymentReceived: 0, certificateIssued: 0 };
    services.forEach(s => {
      totals.applicationReceived += s.applicationReceived;
      totals.approved += s.approved;
      totals.authorisationReject += s.authorisationReject;
      totals.authorisationPending += s.authorisationPending;
      totals.paymentPending += s.paymentPending;
      totals.paymentReceived += s.paymentReceived;
      totals.certificateIssued += s.certificateIssued;
    });
    return totals;
  };

  // ─── Render ────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger m-3" role="alert">
        Failed to load dashboard data: {error}
      </div>
    );
  }

  // ─── Determine title and back button ──────────────────────────────────
  let title = 'RTS Dashboard';
  let backButton = null;

  if (view === 'departments') {
    title = `${selectedCorporation} – Department-wise Breakdown`;
    backButton = (
      <button className="btn btn-sm btn-outline-primary ms-auto" onClick={handleBackToSummary}>
        <i className="bi bi-arrow-left me-1"></i> Back to Summary
      </button>
    );
  } else if (view === 'services') {
    title = `${selectedCorporation} → ${selectedDepartment} – Service-wise Breakdown`;
    backButton = (
      <button className="btn btn-sm btn-outline-primary ms-auto" onClick={handleBackToDepartments}>
        <i className="bi bi-arrow-left me-1"></i> Back to Departments
      </button>
    );
  } else if (view === 'status') {
    title = `${selectedCorporation} – ${selectedStatusLabel} Breakdown`;
    backButton = (
      <button className="btn btn-sm btn-outline-primary ms-auto" onClick={() => {
        if (selectedUlbId) {
          setView('services');
        } else {
          setView('summary');
        }
      }}>
        <i className="bi bi-arrow-left me-1"></i> Back
      </button>
    );
  }

  return (
    <>
      <div className="dma-card">
        <div className="dma-card-header">
          <div className="dma-card-icon" style={{ background: 'var(--dma-navy)' }}>
            <i className="bi bi-table" style={{ color: '#fff' }}></i>
          </div>
          <h5 className="dma-card-title">{title}</h5>
          {backButton}
        </div>

        <div className="dma-card-body">
          <div className="dma-table-scroll">
            {view === 'summary' && (
              // ─── SUMMARY TABLE ──────────────────────────────────────────
              <div
                className="dma-table-scroll"
                style={{
                  maxHeight: hasMoreThanMax ? "400px" : "auto",
                  overflowY: hasMoreThanMax ? "auto" : "visible",
                }}
              >
                <table className="dma-table table table-bordered">
                  <thead>
                    <tr>
                      <th style={{ width: '30px' }}>Sr. No.</th>
                      <th className="text-center">Corporation</th>
                      <th className="text-center">Application Received</th>
                      <th className="text-center">Approved</th>
                      <th className="text-center">Authorisation Reject</th>
                      <th className="text-center">Authorisation Pending</th>
                      <th className="text-center">Payment Pending</th>
                      <th className="text-center">Payment Received</th>
                      <th className="text-center">Certificate Issued</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rowsData.map((row, index) => (
                      <tr key={row.corporation}>
                        <td className="text-center">{index + 1}</td>
                        <td className='text-center'>
                          <button
                            className="btn btn-link p-0 fw-bold text-decoration-underline"
                            style={{ color: 'var(--dma-blue)' }}
                            onClick={() => handleCorporationClick(row.corporation, row.ulbId)}
                          >
                            {row.corporation}
                            <i className="bi bi-box-arrow-up-right ms-1 small"></i>
                          </button>
                        </td>
                        {colKeys.map((key) => {
                          const value = row[key];
                          const isZero = value === 0;
                          const isDhuleAppReceived =
                            row.corporation &&
                            row.corporation.toString().toLowerCase().trim() === "dhule" &&
                            key === "applicationReceived";

                          return (
                            <td key={key} className="text-center">
                              {isDhuleAppReceived ? (
                                <a
                                  href="https://rtsdashboard.dhulecorporation.in/"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn btn-link btn-sm p-0 text-primary text-decoration-underline"
                                  style={{ cursor: "pointer", color: "var(--dma-blue)" }}
                                >
                                  {formatNumber(value)}
                                </a>
                              ) : isZero ? (
                                <span className="text-muted">{formatNumber(value)}</span>
                              ) : (
                                <button
                                  className="btn btn-link btn-sm p-0 text-primary text-decoration-none"
                                  onClick={() => handleCellClick(row.corporation, key, value)}
                                  style={{ cursor: "pointer", color: "var(--dma-blue)" }}
                                >
                                  {formatNumber(value)}
                                  <i className="bi bi-chevron-right ms-1 small"></i>
                                </button>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td className="text-center"></td>
                      <td className="text-center">{totals.corporation}</td>
                      {colKeys.map((key) => {
                        const value = totals[key];
                        const isZero = value === 0;
                        return (
                          <td key={key} className="text-center">
                            {isZero ? (
                              <span className="text-muted">{formatNumber(value)}</span>
                            ) : (
                              <button
                                className="btn btn-link btn-sm p-0 text-white text-decoration-none"
                                onClick={() => handleCellClick('TOTAL', key, value)}
                                style={{ cursor: 'pointer', fontWeight: 700 }}
                              >
                                {formatNumber(value)}
                                <i className="bi bi-chevron-right ms-1 small"></i>
                              </button>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}

            {view === 'departments' && (
              // ─── DEPARTMENT TABLE ──────────────────────────────────────
              selectedCorporation && departmentData[selectedCorporation] ? (
                <table className="dma-table table table-bordered">
                  <thead>
                    <tr>
                      <th style={{ width: '60px' }}>Sr. No.</th>
                      <th>Department</th>
                      <th className="text-center">Application Received</th>
                      <th className="text-center">Approved</th>
                      <th className="text-center">Authorisation Reject</th>
                      <th className="text-center">Authorisation Pending</th>
                      <th className="text-center">Payment Pending</th>
                      <th className="text-center">Payment Received</th>
                      <th className="text-center">Certificate Issued</th>
                    </tr>
                  </thead>
                  <tbody>
                    {departmentData[selectedCorporation].map((dept, idx) => (
                      <tr key={idx}>
                        <td className="text-center">{idx + 1}</td>
                        <td>
                          <button
                            className="btn btn-link p-0 fw-bold text-decoration-underline"
                            style={{ color: 'var(--dma-blue)' }}
                            onClick={() => handleDepartmentClick(dept.department, dept.deptId)}
                          >
                            {dept.department}
                            <i className="bi bi-box-arrow-up-right ms-1 small"></i>
                          </button>
                        </td>
                        {colKeys.map((key) => (
                          <td key={key} className="text-center">
                            {formatNumber(dept[key])}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td className="text-center"></td>
                      <td><strong>Total</strong></td>
                      {(() => {
                        const deptTotals = computeDeptTotals(departmentData[selectedCorporation]);
                        return colKeys.map(key => (
                          <td key={key} className="text-center"><strong>{formatNumber(deptTotals[key])}</strong></td>
                        ));
                      })()}
                    </tr>
                  </tfoot>
                </table>
              ) : (
                <p className="text-muted">No department data available for {selectedCorporation}.</p>
              )
            )}

            {view === 'services' && (
              // ─── SERVICE TABLE ─────────────────────────────────────────
              selectedCorporation && selectedDepartment && serviceData[`${selectedCorporation}_${selectedDepartment}`] ? (
                <table className="dma-table table table-bordered">
                  <thead>
                    <tr>
                      <th style={{ width: '60px' }}>Sr. No.</th>
                      <th>Service</th>
                      <th className="text-center">Application Received</th>
                      <th className="text-center">Approved</th>
                      <th className="text-center">Authorisation Reject</th>
                      <th className="text-center">Authorisation Pending</th>
                      <th className="text-center">Payment Pending</th>
                      <th className="text-center">Payment Received</th>
                      <th className="text-center">Certificate Issued</th>
                    </tr>
                  </thead>
                  <tbody>
                    {serviceData[`${selectedCorporation}_${selectedDepartment}`].map((svc, idx) => (
                      <tr key={idx}>
                        <td className="text-center">{idx + 1}</td>
                        <td>{svc.service}</td>
                        {colKeys.map((key) => (
                          <td key={key} className="text-center">
                            {formatNumber(svc[key])}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td className="text-center"></td>
                      <td><strong>Total</strong></td>
                      {(() => {
                        const svcTotals = computeServiceTotals(serviceData[`${selectedCorporation}_${selectedDepartment}`]);
                        return colKeys.map(key => {
                          const value = svcTotals[key];
                          const isZero = value === 0;
                          return (
                            <td key={key} className="text-center">
                              {isZero ? (
                                <span className="text-muted">{formatNumber(value)}</span>
                              ) : (
                                <button
                                  className="btn btn-link btn-sm p-0 text-white text-decoration-underline"
                                  onClick={() => handleStatusClick(key, selectedUlbId)}
                                  style={{ cursor: 'pointer', fontWeight: 700 }}
                                >
                                  {formatNumber(value)}
                                  <i className="bi bi-chevron-right ms-1 small"></i>
                                </button>
                              )}
                            </td>
                          );
                        });
                      })()}
                    </tr>
                  </tfoot>
                </table>
              ) : (
                <p className="text-muted">No service data available for {selectedDepartment}.</p>
              )
            )}

            {view === 'status' && (
              // ─── STATUS TABLE ──────────────────────────────────────────
              statusData.length > 0 ? (
                <table className="dma-table table table-bordered">
                  <thead>
                    <tr>
                      <th style={{ width: '60px' }}>Sr. No.</th>
                      <th>Department</th>
                      <th className="text-center">{selectedStatusLabel}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {statusData.map((item, idx) => (
                      <tr key={idx}>
                        <td className="text-center">{idx + 1}</td>
                        <td>{item.department}</td>
                        <td className="text-center">{formatNumber(item.count)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td className="text-center"></td>
                      <td><strong>Total</strong></td>
                      <td className="text-center"><strong>{formatNumber(computeStatusTotal(statusData))}</strong></td>
                    </tr>
                  </tfoot>
                </table>
              ) : (
                <p className="text-muted">No data available.</p>
              )
            )}
          </div>
        </div>
      </div>

      {/* ─── Toast ────────────────────────────────────────────────────── */}
      {showToast && (
        <div className="position-fixed bottom-0 end-0 p-3" style={{ zIndex: 1050 }}>
          <div className="toast show align-items-center text-white bg-dark border-0">
            <div className="d-flex">
              <div className="toast-body">
                <i className="bi bi-info-circle me-2"></i>
                {toastMessage}
              </div>
              <button
                type="button"
                className="btn-close btn-close-white me-2 m-auto"
                onClick={() => setShowToast(false)}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Table;