const {
  fetchDashboardDataNew,
  fetchRTSULBWiseData,
  fetchRTSULBDeptWiseData,
  fetchRTSULBServiceWiseData,
  fetchRTSStatusWiseData,
  fetchMonthwiseData,
  fetchMonthwiseServiceData,
  fetchWaterTaxTotalDemand,
  fetchEstateStats
} = require('./DMADashboard.repo');

/**
 * Service to fetch dashboard data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function fetchDashboardData(req, res) {
  return await fetchDashboardDataNew(req, res);
}

/**
 * Service to fetch RTS ULB Wise data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function fetchRTSULBWise(req, res) {
  return await fetchRTSULBWiseData(req, res);
}

/**
 * Service to fetch RTS ULB Department Wise data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function fetchRTSULBDeptWise(req, res) {
  return await fetchRTSULBDeptWiseData(req, res);
}

/**
 * Service to fetch RTS ULB Service Wise data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function fetchRTSULBServiceWise(req, res) {
  return await fetchRTSULBServiceWiseData(req, res);
}

/**
 * Service to fetch RTS Status Wise data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function fetchRTSStatusWise(req, res) {
  return await fetchRTSStatusWiseData(req, res);
}

/**
 * Service to fetch month-wise service data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function fetchMonthwiseService(req, res) {
  return await fetchMonthwiseData(req, res);
}

/**
 * Service to fetch water tax demand
 */
async function fetchWaterTaxDemand(req, res) {
  return await fetchWaterTaxTotalDemand(req, res);
}

/**
 * Service to fetch estate stats
 */
async function fetchEstateStatistics(req, res) {
  return await fetchEstateStats(req, res);
}

module.exports = {
  fetchDashboardData,
  fetchRTSULBWise,
  fetchRTSULBDeptWise,
  fetchRTSULBServiceWise,
  fetchRTSStatusWise,
  fetchMonthwiseService,
  fetchMonthwiseData: fetchMonthwiseService,
  fetchWaterTaxDemand,
  fetchEstateStatistics,
};
