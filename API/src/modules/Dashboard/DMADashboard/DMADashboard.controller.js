const {
  fetchDashboardData,
  fetchRTSULBWise,
  fetchRTSULBDeptWise,
  fetchRTSULBServiceWise,
  fetchRTSStatusWise,
  fetchMonthwiseService,
  fetchWaterTaxDemand,
  fetchEstateStatistics,
} = require('./DMADashboard.service');
const { logApiSuccess, logApiError } = require('../../../utils/log');

/**
 * Controller handler for fetching DMA Dashboard data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware
 */
async function dmaDashboardHandler(req, res, next) {
  try {
    logApiSuccess(req, 200, {}, 'DMA Dashboard request initiated');
    return await fetchDashboardData(req, res);
  } catch (error) {
    logApiError(req, 500, error.message, 'DMA Dashboard error');
    return next(error);
  }
}

/**
 * Controller handler for fetching RTS ULB Wise data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware
 */
async function rtsULBWiseHandler(req, res, next) {
  try {
    logApiSuccess(req, 200, {}, 'RTS ULB Wise data request initiated');
    return await fetchRTSULBWise(req, res);
  } catch (error) {
    logApiError(req, 500, error.message, 'RTS ULB Wise data error');
    return next(error);
  }
}

/**
 * Controller handler for fetching RTS ULB Department Wise data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware
 */
async function rtsULBDeptWiseHandler(req, res, next) {
  try {
    logApiSuccess(req, 200, {}, 'RTS ULB Dept Wise data request initiated');
    return await fetchRTSULBDeptWise(req, res);
  } catch (error) {
    logApiError(req, 500, error.message, 'RTS ULB Dept Wise data error');
    return next(error);
  }
}

/**
 * Controller handler for fetching RTS ULB Service Wise data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware
 */
async function rtsULBServiceWiseHandler(req, res, next) {
  try {
    logApiSuccess(req, 200, {}, 'RTS ULB Service Wise data request initiated');
    return await fetchRTSULBServiceWise(req, res);
  } catch (error) {
    logApiError(req, 500, error.message, 'RTS ULB Service Wise data error');
    return next(error);
  }
}

/**
 * Controller handler for fetching RTS Status Wise data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware
 */
async function rtsStatusWiseHandler(req, res, next) {
  try {
    logApiSuccess(req, 200, {}, 'RTS Status Wise data request initiated');
    return await fetchRTSStatusWise(req, res);
  } catch (error) {
    logApiError(req, 500, error.message, 'RTS Status Wise data error');
    return next(error);
  }
}

/**
 * Controller handler for fetching month-wise service data (Estate, Water, etc.)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware
 */
async function monthwiseServiceHandler(req, res, next) {
  try {
    logApiSuccess(req, 200, {}, 'Monthwise Service data request initiated');
    return await fetchMonthwiseService(req, res);
  } catch (error) {
    logApiError(req, 500, error.message, 'Monthwise Service data error');
    return next(error);
  }
}

/**
 * Controller handler for Water Tax Total Demand
 */
async function waterTaxDemandHandler(req, res, next) {
  try {
    logApiSuccess(req, 200, {}, 'Water Tax Demand request initiated');
    return await fetchWaterTaxDemand(req, res);
  } catch (error) {
    logApiError(req, 500, error.message, 'Water Tax Demand error');
    return next(error);
  }
}

/**
 * Controller handler for Estate Statistics
 */
async function estateStatsHandler(req, res, next) {
  try {
    logApiSuccess(req, 200, {}, 'Estate Stats request initiated');
    return await fetchEstateStatistics(req, res);
  } catch (error) {
    logApiError(req, 500, error.message, 'Estate Stats error');
    return next(error);
  }
}

module.exports = {
  dmaDashboardHandler,
  rtsULBWiseHandler,
  rtsULBDeptWiseHandler,
  rtsULBServiceWiseHandler,
  rtsStatusWiseHandler,
  monthwiseServiceHandler,
  monthwiseFetchHandler: monthwiseServiceHandler,
  waterTaxDemandHandler,
  estateStatsHandler,
};
