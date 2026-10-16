const express = require('express');
const validate = require('../../../middleware/validate.middleware');
const { authRequired } = require('../../../middleware/auth');
const { dmaDashboardQuerySchema, rtsULBWiseQuerySchema, rtsULBDeptWiseQuerySchema, rtsULBServiceWiseQuerySchema, rtsStatusWiseQuerySchema, monthwiseServiceQuerySchema } = require('./DMADashboard.validation');
const {
  dmaDashboardHandler,
  rtsULBWiseHandler,
  rtsULBDeptWiseHandler,
  rtsULBServiceWiseHandler,
  rtsStatusWiseHandler,
  monthwiseServiceHandler,
  monthwiseFetchHandler,
  waterTaxDemandHandler,
  estateStatsHandler,
} = require('./DMADashboard.controller');


const router = express.Router();

/**
 * GET /api/dashboard/DashboardDataNew
 * Fetch DMA Dashboard data with modules, metrics, and status information
 */
router.get(
  '/DashboardDataNew',
  validate(dmaDashboardQuerySchema, { source: 'query' }),
  dmaDashboardHandler
);
router.get('/FetchDashboardDataNew', dmaDashboardHandler);

/**
 * GET /api/dashboard/MonthwiseFetch & /MonthwiseService
 * Fetch service-wise month breakdown data using admins.aoma_dmadashboardmonthwise_fetch
 */
router.get('/MonthwiseFetch', monthwiseFetchHandler);
router.get('/MonthwiseService', monthwiseServiceHandler);

/**
 * GET /api/dashboard/WaterTaxTotalDemand
 */
router.get('/WaterTaxTotalDemand', waterTaxDemandHandler);

/**
 * GET /api/dashboard/EstateStats
 */
router.get('/EstateStats', estateStatsHandler);

/**
 * GET /api/dashboard/RTSULBWiseadd
 * Fetch RTS ULB wise data with application status breakdown
 */
router.get(
  '/RTSULBWiseadd',
  validate(rtsULBWiseQuerySchema, { source: 'query' }),
  rtsULBWiseHandler
);

/**
 * GET /api/dashboard/RTSULBDeptWise
 * Fetch RTS ULB Department Wise data with application status breakdown
 */
router.get(
  '/RTSULBDeptWise',
  validate(rtsULBDeptWiseQuerySchema, { source: 'query' }),
  rtsULBDeptWiseHandler
);

/**
 * GET /api/dashboard/RTSULBServiceWise
 * Fetch RTS ULB Service Wise data with application status breakdown
 */
router.get(
  '/RTSULBServiceWise',
  validate(rtsULBServiceWiseQuerySchema, { source: 'query' }),
  rtsULBServiceWiseHandler
);

/**
 * GET /api/dashboard/RTSStatusWise
 * Fetch RTS Status Wise data
 */
router.get(
  '/RTSStatusWise',
  validate(rtsStatusWiseQuerySchema, { source: 'query' }),
  rtsStatusWiseHandler
);

module.exports = router;

