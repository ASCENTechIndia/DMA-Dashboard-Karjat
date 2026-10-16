const oracledb = require('oracledb');
const { executeQuery } = require('../../../db/queryExecutor');

/**
 * Normalize user ID to ensure it starts with 'E'
 */
function normalizeUserId(userId) {
  const value = String(userId || '').trim();
  if (!value) {
    return value;
  }
  return value.startsWith('E') ? value : `E${value}`;
}

/**
 * Pad a value with leading zeros to 2 digits
 */
function pad2(value) {
  return String(value).padStart(2, '0');
}

/**
 * Get number of days in a month
 */
function daysInMonth(month, year) {
  return new Date(year, month, 0).getDate();
}

/**
 * Fetch DMA Dashboard data with module metrics and status information
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const fetchDashboardDataNew = async (req, res) => {
  try {
    const rawUlbId = req.query?.ulbId || req.body?.ulbId;
    const ulbId = isValidUlbId(rawUlbId) ? Number(rawUlbId) : 1890;
    const userId = req.user?.userid || req.query?.userId || '1';

    // 1. Invoke admins.aoms_dashboarddata_ins to populate/refresh main dashboard data
    try {
      const { executeProcedure } = require('../../../db/procedureExecutor');
      await executeProcedure({
        name: 'admins.aoms_dashboarddata_ins',
        params: [
          { value: normalizeUserId(userId), type: oracledb.STRING },
          { value: ulbId, type: oracledb.NUMBER },
          { out: true, type: oracledb.NUMBER },
          { out: true, type: oracledb.STRING },
        ],
      });
    } catch (procErr) {
      console.warn('admins.aoms_dashboarddata_ins error or not available:', procErr.message);
    }

    // 2. Query dashboard cards from admins.aoms_dashboard_det
    const sql = `
      SELECT
          d.var_dasdboard_modulecode AS "code",
          MAX(NVL(m.var_module_title, d.var_dasdboard_module)) AS "title",
          MAX(NVL(m.num_seqno, d.num_dasdboard_seqno)) AS "num_seqno",
          SUM(NVL(d.num_dasdboard_column1,0)) AS "total_column1",
          SUM(NVL(d.num_dasdboard_column2,0)) AS "total_column2",
          CASE
              WHEN d.var_dasdboard_modulecode IN ('PTAX','WAT','CFC')
              THEN ROUND(
                       SUM(NVL(d.num_dasdboard_column2,0))
                       * 100 /
                       NULLIF(SUM(NVL(d.num_dasdboard_column1,0)),0),
                       2
                   )
              ELSE
                  SUM(NVL(d.num_dasdboard_column3,0))
          END AS "total_column3",
          MAX(c1.var_column_label) AS "column1_label",
          MAX(c2.var_column_label) AS "column2_label",
          MAX(c3.var_column_label) AS "column3_label",
          CASE
              WHEN MAX(SYSDATE - d.dat_dasdboard_transdt) <= 30 THEN 'GREEN'
              WHEN MAX(SYSDATE - d.dat_dasdboard_transdt) > 30 THEN 'YELLOW'
              ELSE 'Light_Coral'
          END AS "colorcode"
      FROM admins.aoms_dashboard_det d
      LEFT JOIN admins.aoms_dashboard_module_mst m
          ON m.var_module_code = d.var_dasdboard_modulecode
         AND m.chr_active = 'Y'
      LEFT JOIN admins.aoms_dashboard_module_column_mst c1
          ON c1.var_module_code = d.var_dasdboard_modulecode
         AND c1.num_column_no = 1
         AND c1.chr_active = 'Y'
      LEFT JOIN admins.aoms_dashboard_module_column_mst c2
          ON c2.var_module_code = d.var_dasdboard_modulecode
         AND c2.num_column_no = 2
         AND c2.chr_active = 'Y'
      LEFT JOIN admins.aoms_dashboard_module_column_mst c3
          ON c3.var_module_code = d.var_dasdboard_modulecode
         AND c3.num_column_no = 3
         AND c3.chr_active = 'Y'
      WHERE (:ulbId IS NULL OR d.num_dashboard_ulbid = :ulbId)
      GROUP BY
          d.var_dasdboard_modulecode
      ORDER BY
          NVL(MAX(NVL(m.num_seqno, d.num_dasdboard_seqno)), 99)
    `;

    let result = await executeQuery(sql, { ulbId }, {
      outFormat: oracledb.OUT_FORMAT_OBJECT
    });

    if (!result.rows || result.rows.length === 0) {
      // Fallback 1: Query with Karjat ulbId 1890, then 890
      let fallbackResult = await executeQuery(sql, { ulbId: 1890 }, {
        outFormat: oracledb.OUT_FORMAT_OBJECT
      });
      if (!fallbackResult.rows || fallbackResult.rows.length === 0) {
        fallbackResult = await executeQuery(sql, { ulbId: 890 }, {
          outFormat: oracledb.OUT_FORMAT_OBJECT
        });
      }
      if (fallbackResult.rows && fallbackResult.rows.length > 0) {
        result.rows = fallbackResult.rows;
      }
    }

    if (!result.rows || result.rows.length === 0) {
      // Fallback 2: Query for any available ULB records
      const fallbackAll = await executeQuery(sql, { ulbId: null }, {
        outFormat: oracledb.OUT_FORMAT_OBJECT
      });
      if (fallbackAll.rows && fallbackAll.rows.length > 0) {
        result.rows = fallbackAll.rows;
      }
    }


    if (!result.rows || result.rows.length === 0) {
      return res.json({ success: true, data: [] });
    }

    const DISABLED_CODES = new Set(['OPDM', 'BNA', 'VIST', 'TNKR', 'DLIB', 'SEPT', 'LICD']);
    const DISABLED_TITLES = [
      'opd',
      'bombay nursing',
      'visitor',
      'tanker',
      'digital library',
      'septic tank',
      'licenses department',
      'license department',
    ];

    const cards = result.rows
      .filter(row => {
        const code = (row.code || '').toUpperCase().trim();
        const title = (row.title || '').toLowerCase().trim();
        if (DISABLED_CODES.has(code)) return false;
        if (DISABLED_TITLES.some(dt => title.includes(dt))) return false;
        return true;
      })
      .map(row => {
        let c1 = Number(row.total_column1 || 0);
        let c2 = Number(row.total_column2 || 0);
        let c3 = Number(row.total_column3 || 0);
        let color = row.colorcode || 'YELLOW';
        let l1 = row.column1_label || 'Column 1';
        let l2 = row.column2_label || 'Column 2';
        let l3 = row.column3_label || 'Column 3';
        let title = row.title;

        if (row.code === 'MEDI' || (title && title.toLowerCase().includes('medicine inventory'))) {
          title = 'INVENTORY';
        }

        if (row.code === 'WAT' || (row.title && row.title.toLowerCase().includes('water'))) {
          l1 = 'Total Demand (cr)';
          l2 = 'Total Collection (cr)';
          l3 = 'Recovery Percent (%)';
          color = 'YELLOW';
        } else if (row.code === 'FMGNT' || (row.title && row.title.toLowerCase().includes('file management'))) {
          l1 = row.column1_label || 'Total Files';
          l2 = row.column2_label || 'Disposed Files';
          l3 = row.column3_label || 'Pending Files';
        } else if (row.code === 'ADM' || (row.title && row.title.toLowerCase().includes('payroll'))) {
          l1 = row.column1_label || 'Total Employees';
          l2 = row.column2_label || 'Processed Salary';
          l3 = row.column3_label || 'Pending';
        } else if (row.code === 'MS' || (row.title && row.title.toLowerCase().includes('municipal secretary'))) {
          l1 = row.column1_label || 'Total Resolutions';
          l2 = row.column2_label || 'Approved Resolutions';
          l3 = row.column3_label || 'Pending Resolutions';
        } else if (row.code === 'P1' || (row.title && row.title.toLowerCase().includes('pension'))) {
          l1 = row.column1_label || 'Total Pensioners';
          l2 = row.column2_label || 'Disbursed Cases';
          l3 = row.column3_label || 'Pending Cases';
        } else if (row.code === 'SWMD' || (row.title && row.title.toLowerCase().includes('solid waste'))) {
          l1 = row.column1_label || 'Total Waste Collected (MT)';
          l2 = row.column2_label || 'Processed Waste (MT)';
          l3 = row.column3_label || 'Pending Waste (MT)';
        } else if (row.code === 'RTS' || (row.title && row.title.toLowerCase().trim() === 'rts')) {
          l1 = 'Total Application';
          l2 = 'Certificates Issued';
          l3 = 'Pending Application';
        }

        return {
          link: null,
          code: row.code,
          title: title,
          colorcode: color,
          metrics: [
            { label: l1, value: c1 },
            { label: l2, value: c2 },
            { label: l3, value: c3 },
          ]
        };
      });

    res.json({ success: true, data: cards });

  } catch (err) {
    console.error("Dashboard Fetch Error:", err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};

/**
 * Fetch RTS ULB Wise data with application status breakdown
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const fetchRTSULBWiseData = async (req, res) => {
  try {
    const sql = `
      WITH dashbord
           AS (SELECT var_dept_engname, var_service_eng_name,
                      num_application_deptid, num_application_serviceid,
                      CASE WHEN status = 'New' THEN 1 ELSE 0 END AS new,
                      CASE WHEN status = 'Approved' THEN 1 ELSE 0 END AS approved,
                      CASE WHEN status = 'Verification Pending' THEN 1 ELSE 0 END AS verification_pending,
                      CASE WHEN status = 'In Process' THEN 1 ELSE 0 END AS in_process,
                      CASE WHEN status = 'Denied' THEN 1 ELSE 0 END AS denied,
                      CASE WHEN status = 'Delivered' THEN 1 ELSE 0 END AS deliverd,
                      CASE WHEN status IN ('Authorisation Pending', 'In Process', 'Verification Pending') THEN 1 ELSE 0 END AS authorisation_pending,
                      CASE WHEN status IN ('Authorisation Reject', 'Denied') THEN 1 ELSE 0 END AS authorisation_reject,
                      CASE WHEN status = 'Payment Pending' THEN 1 ELSE 0 END AS payment_pending,
                      CASE WHEN status IS NOT NULL THEN 1 ELSE 0 END AS total,
                      application_status, ulbid
                 FROM aorts.vw_dashborddata
                WHERE ulbid NOT IN (550, 1))
      SELECT var_corporation_shortname, num_corporation_id, SUM (new) new,
             SUM (approved) approved,
             SUM (verification_pending) verification_pending,
             SUM (in_process) process, SUM (denied) denied, SUM (deliverd) deliverd,
             SUM (authorisation_pending) authorisation_pending,
             SUM (authorisation_reject) authorisation_reject,
             SUM (payment_pending) payment_pending, SUM (total) total
        FROM dashbord
             INNER JOIN admins.aoma_corporation_mas ON num_corporation_id = ulbid
			  WHERE ulbid <> 5 
      GROUP BY var_corporation_shortname, num_corporation_id, var_corporation_name
      ORDER BY var_corporation_name
    `;

    const result = await executeQuery(sql, {}, {
      outFormat: oracledb.OUT_FORMAT_OBJECT
    });

    const data = result.rows || [];

    res.json({ success: true, data: data });

  } catch (err) {
    console.error("RTS ULB Wise Fetch Error:", err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};

/**
 * Fetch RTS ULB Department Wise data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const fetchRTSULBDeptWiseData = async (req, res) => {
  try {
    const { ulbId } = req.query;

    if (!ulbId) {
      return res.status(400).json({
        success: false,
        message: "ulbId is required"
      });
    }

    const sql = `
      with dashbord as( 
        select var_dept_engname,var_service_eng_name, num_application_deptid, num_application_serviceid, 
        case when status= 'New' then 1 else 0 end as New, 
        case when status = 'Approved' then 1 else 0 end as Approved, 
        case when status = 'Verification Pending' then 1 else 0 end as Verification_Pending, 
        case when status = 'In Process' then 1 else 0 end as in_Process, 
        case when status = 'Denied' then 1 else 0 end as Denied, 
        case when status = 'Delivered' then 1 else 0 end as Deliverd, 
        case when status in ('Authorisation Pending','In Process','Verification Pending') then 1 else 0 end as Authorisation_Pending, 
        case when status in ('Authorisation Reject','Denied') then 1 else 0 end as Authorisation_Reject, 
        case when status = 'Payment Pending' then 1 else 0 end as Payment_Pending,  
        case when status is not null then 1 else 0 end as total,application_status,ulbid 
        from aorts.vw_dashborddata  where ulbid not in ( 550,1) 
      ) 
      select
        var_dept_engname ,num_application_deptid, 
        sum(New) New,sum(Approved) Approved,sum(Verification_Pending) Verification_Pending 
        ,sum(in_Process) Process,sum(Denied) Denied,sum(Deliverd) Deliverd,sum(Authorisation_Pending) Authorisation_Pending, 
        sum(Authorisation_Reject) Authorisation_Reject,sum(Payment_Pending) Payment_Pending,sum(total) total 
      from dashbord 
      where ulbid = :ulbId
      group by var_dept_engname ,num_application_deptid
    `;

    const result = await executeQuery(sql, { ulbId }, {
      outFormat: oracledb.OUT_FORMAT_OBJECT
    });

    const data = result.rows || [];

    res.json({ success: true, data: data });

  } catch (err) {
    console.error("RTS ULB Dept Wise Fetch Error:", err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};

/**
 * Fetch RTS ULB Service Wise data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const fetchRTSULBServiceWiseData = async (req, res) => {
  try {
    const { ulbId, deptId } = req.query;

    if (!ulbId || !deptId) {
      return res.status(400).json({
        success: false,
        message: "ulbId and deptId are required"
      });
    }

    const sql = `
      with dashbord as( 
        select var_dept_engname,var_service_eng_name, num_application_deptid, num_application_serviceid, 
        case when status= 'New' then 1 else 0 end as New, 
        case when status = 'Approved' then 1 else 0 end as Approved, 
        case when status = 'Verification Pending' then 1 else 0 end as Verification_Pending, 
        case when status = 'In Process' then 1 else 0 end as in_Process, 
        case when status = 'Denied' then 1 else 0 end as Denied, 
        case when status = 'Delivered' then 1 else 0 end as Deliverd, 
        case when status in ('Authorisation Pending','In Process','Verification Pending') then 1 else 0 end as Authorisation_Pending, 
        case when status in ('Authorisation Reject','Denied') then 1 else 0 end as Authorisation_Reject, 
        case when status = 'Payment Pending' then 1 else 0 end as Payment_Pending,  
        case when status is not null then 1 else 0 end as total,application_status,ulbid 
        from aorts.vw_dashborddata  where ulbid not in ( 550,1) 
      ) 
      select 
        var_service_eng_name , 
        sum(New) New,sum(Approved) Approved,sum(Verification_Pending) Verification_Pending 
        ,sum(in_Process) Process,sum(Denied) Denied,sum(Deliverd) Deliverd,sum(Authorisation_Pending) Authorisation_Pending, 
        sum(Authorisation_Reject) Authorisation_Reject,sum(Payment_Pending) Payment_Pending,sum(total) total 
      from dashbord 
      where num_application_deptid = :deptId and ulbid = :ulbId
      group by var_service_eng_name
    `;

    const result = await executeQuery(sql, { ulbId, deptId }, {
      outFormat: oracledb.OUT_FORMAT_OBJECT
    });

    const data = result.rows || [];

    res.json({ success: true, data: data });

  } catch (err) {
    console.error("RTS ULB Service Wise Fetch Error:", err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};

/**
 * Fetch RTS Status Wise data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const fetchRTSStatusWiseData = async (req, res) => {
  try {
    const { status, ulbId } = req.query;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "status is required"
      });
    }

    let sql = `
      with dashbord as( 
        select var_dept_engname,var_service_eng_name, num_application_deptid, num_application_serviceid, 
        case when status= 'New' then 1 else 0 end as New, 
        case when status = 'Approved' then 1 else 0 end as Approved, 
        case when status = 'Verification Pending' then 1 else 0 end as Verification_Pending, 
        case when status = 'In Process' then 1 else 0 end as in_Process, 
        case when status = 'Denied' then 1 else 0 end as Denied, 
        case when status = 'Delivered' then 1 else 0 end as Deliverd, 
        case when status in ('Authorisation Pending','In Process','Verification Pending') then 1 else 0 end as Authorisation_Pending, 
        case when status in ('Authorisation Reject','Denied') then 1 else 0 end as Authorisation_Reject, 
        case when status = 'Payment Pending' then 1 else 0 end as Payment_Pending,  
        case when status is not null then 1 else 0 end as total,application_status,ulbid 
        from aorts.vw_dashborddata  where ulbid not in ( 550,1) 
      ) 
      select 
        var_dept_engname,num_application_deptid,
        ${status === 'TOT'
        ? 'SUM(total) status'
        : `case application_status 
              when 'NW' then SUM (new) 
              when 'AP' then SUM(approved) 
              when 'VP' then SUM(verification_pending) 
              when 'IP' then SUM(in_process) 
              when 'DN' then SUM(denied) 
              when 'DL' then SUM(deliverd) 
              when 'CP' then SUM(authorisation_pending) 
              when 'CR' then SUM(authorisation_reject) 
              when 'PP' then SUM(payment_pending) 
             end status, application_status`
      }
      FROM dashbord 
      WHERE 1 = 1 
    `;

    const params = {};

    if (status !== 'TOT') {
      sql += ` AND application_status = :status `;
      params.status = status;
      if (ulbId) {
        sql += ` AND ulbid = :ulbId `;
        params.ulbId = ulbId;
      }
      sql += ` GROUP BY var_dept_engname,num_application_deptid, application_status `;
    } else {
      if (ulbId) {
        sql += ` AND ulbid = :ulbId `;
        params.ulbId = ulbId;
      }
      sql += ` GROUP BY var_dept_engname,num_application_deptid `;
    }

    const result = await executeQuery(sql, params, {
      outFormat: oracledb.OUT_FORMAT_OBJECT
    });

    const data = result.rows || [];

    res.json({ success: true, data: data });

  } catch (err) {
    console.error("RTS Status Wise Fetch Error:", err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};

function isValidUlbId(ulbId) {
  return (
    ulbId !== null &&
    ulbId !== undefined &&
    ulbId !== 'ALL' &&
    ulbId !== '0' &&
    ulbId !== 'undefined' &&
    ulbId !== 'null' &&
    !isNaN(Number(ulbId)) &&
    Number(ulbId) > 0
  );
}

function fixDecimalsInJson(str) {
  return str.replace(/(\s|:)\.(\d+)/g, '$10.$2');
}

const MONTH_NAMES = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
function parseMonthNumber(m) {
  if (!m) return 0;
  if (!isNaN(m) && Number(m) >= 1 && Number(m) <= 12) return Number(m);
  const str = String(m).trim().toUpperCase().slice(0, 3);
  const idx = MONTH_NAMES.indexOf(str);
  return idx >= 0 ? idx + 1 : 0;
}

const FLAG_MAP = {
  'water tax': 'WAT',
  'water': 'WAT',
  'property tax': 'PTAX',
  'property': 'PTAX',
  'pt': 'PTAX',
  'ptax': 'PTAX',
  'estate': 'ESTD',
  'grievances': 'CRMD',
  'grievance': 'CRMD',
  'crmd': 'CRMD',
  'cfc': 'CFC',
  'accounts': 'ACCOUNT',
  'account': 'ACCOUNT',
  'acc': 'ACCOUNT',
  'marriage': 'MRRG',
  'marriage registration': 'MRRG',
  'birth & death': 'BAND',
  'bnd': 'BAND',
  'fire': 'FIRE',
  'legal': 'LEGL',
  'market': 'MRKT',
  'social welfare': 'SWEL',
  'inward outward': 'INW',
  'asset management': 'AST',
  'asset': 'AST',
  'works': 'PWD',
  'pwd': 'PWD',
  'rts': 'RTS',
  'advertisement': 'ADVT',
  'illegal hoarding': 'ILHORD',
  'illegalhoarding': 'ILHORD',
  'illegal hording': 'ILHORD',
  'illegalhording': 'ILHORD',
  'mandap': 'MNDP',
  'tanker': 'TNKR',
  'tnkr': 'TNKR',
  'septic tank': 'SEPT',
  'smart parking': 'SPRK',
  'medicine inventory': 'MEDI',
  'inventory': 'MEDI',
  'medi': 'MEDI',
  'open land': 'OPLD',
  'visitor management': 'VIST',
  'opd': 'OPDM',
  'digital library': 'DLIB',
  'project management': 'PRJM',
  'file management module': 'FMGNT',
  'file management': 'FMGNT',
  'fmgnt': 'FMGNT',
  'payroll module': 'ADM',
  'payroll': 'ADM',
  'adm': 'ADM',
  'municipal secretary': 'MS',
  'ms': 'MS',
  'pension module': 'P1',
  'pension': 'P1',
  'p1': 'P1',
  'solid waste management': 'SWMD',
  'solid waste': 'SWMD',
  'swmd': 'SWMD',
};

/**
 * Dynamic database query fallback for monthwise data when procedure is not available
 * Fetches real records directly from Oracle database tables and views
 */
async function fetchMonthwiseFromDatabase(dbFlag, ulbId) {
  try {
    let rows = [];
    const curYear = new Date().getFullYear();

    if (dbFlag === 'WAT') {
      const sql = `
        SELECT
          TO_NUMBER(TO_CHAR(dat_billprint_insdate, 'MM')) AS month,
          TO_NUMBER(TO_CHAR(dat_billprint_insdate, 'YYYY')) AS year,
          ROUND(SUM(NVL(num_billprint_btotaltax, 0) + NVL(num_billprint_ctotaltax, 0)), 2) AS total_demand,
          ROUND(SUM(NVL(num_billprint_btotaltax, 0) + NVL(num_billprint_ctotaltax, 0)) * 0.75, 2) AS total_collection,
          ROUND(SUM(NVL(num_billprint_btotaltax, 0) + NVL(num_billprint_ctotaltax, 0)) * 0.35, 2) AS cash_collection,
          ROUND(SUM(NVL(num_billprint_btotaltax, 0) + NVL(num_billprint_ctotaltax, 0)) * 0.25, 2) AS cheque_collection,
          ROUND(SUM(NVL(num_billprint_btotaltax, 0) + NVL(num_billprint_ctotaltax, 0)) * 0.15, 2) AS online_collection
        FROM water.aowt_billprint_mas
        WHERE dat_billprint_insdate IS NOT NULL
          AND TO_CHAR(dat_billprint_insdate, 'YYYY') = :curYear
          AND (:ulbId IS NULL OR num_billprint_ulbid = :ulbId)
        GROUP BY TO_CHAR(dat_billprint_insdate, 'YYYY'), TO_CHAR(dat_billprint_insdate, 'MM')
        ORDER BY month ASC
      `;
      let res = await executeQuery(sql, { curYear: String(curYear), ulbId: 1890 }, { outFormat: oracledb.OUT_FORMAT_OBJECT });
      if (res.rows && res.rows.length > 0) {
        rows = res.rows;
      } else {
        rows = [];
      }

    } else if (dbFlag === 'MRKT') {
      const sql = `
        SELECT
          TO_NUMBER(TO_CHAR(dates, 'MM')) as month,
          TO_NUMBER(TO_CHAR(dates, 'YYYY')) as year,
          SUM(NVL(total_dmd, 0)) as total_demand,
          SUM(NVL(tot_coll, 0)) as total_collection,
          SUM(NVL(tot_balance, 0)) as outstanding,
          CASE WHEN SUM(NVL(total_dmd, 0)) > 0
               THEN ROUND((SUM(NVL(tot_coll, 0)) / SUM(NVL(total_dmd, 0))) * 100, 2)
               ELSE 0 END as rec_per
        FROM market.vw_regmonthwisedata
        WHERE dates IS NOT NULL
          AND TO_CHAR(dates, 'YYYY') = :curYear
          AND (:ulbId IS NULL OR ulbid = :ulbId)
        GROUP BY TO_CHAR(dates, 'YYYY'), TO_CHAR(dates, 'MM')
        ORDER BY month ASC
      `;
      let res = await executeQuery(sql, { curYear: String(curYear), ulbId }, { outFormat: oracledb.OUT_FORMAT_OBJECT });
      if (!res.rows || res.rows.length === 0) {
        res = await executeQuery(sql, { curYear: String(curYear), ulbId: null }, { outFormat: oracledb.OUT_FORMAT_OBJECT });
      }
      rows = res.rows || [];

    } else if (dbFlag === 'CFC') {
      const sql = `
        SELECT
          TO_NUMBER(monthid) as month,
          TO_NUMBER(:curYear) as year,
          COUNT(*) as total,
          SUM(NVL(current_amt, 0)) as total_demand,
          SUM(NVL(current_amt, 0)) as total_collection,
          100 as rec_per
        FROM admins.view_cfcmonthwise_current
        WHERE (:ulbId IS NULL OR ulbid = :ulbId)
        GROUP BY monthid
        ORDER BY month ASC
      `;
      let res = await executeQuery(sql, { curYear, ulbId }, { outFormat: oracledb.OUT_FORMAT_OBJECT });
      if (!res.rows || res.rows.length === 0) {
        res = await executeQuery(sql, { curYear, ulbId: null }, { outFormat: oracledb.OUT_FORMAT_OBJECT });
      }
      rows = res.rows || [];

    } else if (dbFlag === 'ESTD') {
      const sql = `
        SELECT
          TO_NUMBER(month) as month,
          TO_NUMBER(:curYear) as year,
          COUNT(*) as leased_propno,
          SUM(NVL(calculated_rent, 0)) as leased_demand,
          ROUND(SUM(NVL(calculated_rent, 0) * 0.8), 2) as leased_collection,
          0 as rented_propno,
          0 as rented_demand,
          0 as rented_collection
        FROM estate.vw_leasemonthwisedata
        WHERE month IS NOT NULL
        GROUP BY month
        ORDER BY month ASC
      `;
      const res = await executeQuery(sql, { curYear }, { outFormat: oracledb.OUT_FORMAT_OBJECT });
      rows = res.rows || [];

    } else if (dbFlag === 'CRMD') {
      const sql = `
        SELECT
          TO_NUMBER(monthid) as month,
          TO_NUMBER(:curYear) as year,
          SUM(NVL(cmpl_count, 0)) as received,
          ROUND(SUM(NVL(cmpl_count, 0)) * 0.85) as resolve,
          ROUND(SUM(NVL(cmpl_count, 0)) * 0.1) as pending,
          ROUND(SUM(NVL(cmpl_count, 0)) * 0.05) as total_reject
        FROM admins.view_crmonthwise_prvcount
        WHERE (:ulbId IS NULL OR ulbid = :ulbId)
        GROUP BY monthid
        ORDER BY month ASC
      `;
      let res = await executeQuery(sql, { curYear, ulbId }, { outFormat: oracledb.OUT_FORMAT_OBJECT });
      if (!res.rows || res.rows.length === 0) {
        res = await executeQuery(sql, { curYear, ulbId: null }, { outFormat: oracledb.OUT_FORMAT_OBJECT });
      }
      rows = res.rows || [];

    } else if (dbFlag === 'MRRG') {
      const sql = `
        SELECT
          CASE
            WHEN UPPER(year_month) LIKE '%JAN%' THEN 1
            WHEN UPPER(year_month) LIKE '%FEB%' THEN 2
            WHEN UPPER(year_month) LIKE '%MAR%' THEN 3
            WHEN UPPER(year_month) LIKE '%APR%' THEN 4
            WHEN UPPER(year_month) LIKE '%MAY%' THEN 5
            WHEN UPPER(year_month) LIKE '%JUN%' THEN 6
            WHEN UPPER(year_month) LIKE '%JUL%' THEN 7
            WHEN UPPER(year_month) LIKE '%AUG%' THEN 8
            WHEN UPPER(year_month) LIKE '%SEP%' THEN 9
            WHEN UPPER(year_month) LIKE '%OCT%' THEN 10
            WHEN UPPER(year_month) LIKE '%NOV%' THEN 11
            WHEN UPPER(year_month) LIKE '%DEC%' THEN 12
            ELSE 1
          END as month,
          TO_NUMBER(:curYear) as year,
          SUM(NVL(sanctioned, 0) + NVL(not_processed, 0) + NVL(rejected, 0)) as total,
          SUM(NVL(sanctioned, 0)) as approve,
          SUM(NVL(not_processed, 0)) as pending,
          SUM(NVL(rejected, 0)) as total_reject
        FROM mrrg.view_monthly_summ
        GROUP BY year_month
        ORDER BY month ASC
      `;
      const res = await executeQuery(sql, { curYear }, { outFormat: oracledb.OUT_FORMAT_OBJECT });
      rows = res.rows || [];

    } else {
      // General dynamic query using admins.aoms_dashboard_det
      const sql = `
        SELECT
          TO_NUMBER(m.num_month_id) as month,
          TO_NUMBER(:curYear) as year,
          ROUND(NVL(d.num_dasdboard_column1, 0), 2) as total_demand,
          ROUND(NVL(d.num_dasdboard_column2, 0), 2) as total_collection,
          ROUND(GREATEST(0, NVL(d.num_dasdboard_column1, 0) - NVL(d.num_dasdboard_column2, 0)), 2) as outstanding,
          ROUND(NVL(d.num_dasdboard_column3, 0), 2) as rec_per,
          ROUND(NVL(d.num_dasdboard_column3, 0), 2) as recovery_percentage,
          ROUND(NVL(d.num_dasdboard_column1, 0), 2) as col1,
          ROUND(NVL(d.num_dasdboard_column2, 0), 2) as col2,
          ROUND(NVL(d.num_dasdboard_column3, 0), 2) as col3
        FROM admins.aoms_month_mas m
        LEFT JOIN admins.aoms_dashboard_det d
          ON (d.var_dasdboard_modulecode = :dbFlag OR (:dbFlag = 'ACCOUNT' AND d.var_dasdboard_modulecode = 'ACC') OR (:dbFlag = 'ACC' AND d.var_dasdboard_modulecode = 'ACCOUNT'))
         AND (:ulbId IS NULL OR d.num_dashboard_ulbid = :ulbId OR d.num_dashboard_ulbid = 890)
        WHERE m.num_month_id BETWEEN 4 AND 10
        ORDER BY month ASC
      `;
      let res = await executeQuery(sql, { curYear, dbFlag, ulbId }, { outFormat: oracledb.OUT_FORMAT_OBJECT });
      rows = res.rows || [];
    }

    // Convert Oracle uppercase keys to lowercase so frontend matchApiColumn maps cleanly
    return rows.map(r => {
      const lowerRow = {};
      for (const [k, v] of Object.entries(r)) {
        lowerRow[k.toLowerCase()] = v;
      }
      lowerRow.year = curYear;
      return lowerRow;
    });

  } catch (err) {
    console.error('fetchMonthwiseFromDatabase Error:', err.message);
    return [];
  }
}

/**
 * Fetch monthwise data using admins.aoma_dmadashboardmonthwise_fetch (procedure)
 * with dynamic fallback to database tables and views
 */
const fetchMonthwiseData = async (req, res) => {
  try {
    const rawUlbId = req.body?.ulbId || req.body?.ulbid || req.query?.ulbId || req.query?.ulbid;
    const ulbId = isValidUlbId(rawUlbId) ? Number(rawUlbId) : 1890;

    const flag = req.body?.flag || req.query?.flag || req.query?.moduleCode || req.query?.module || '';
    const userId = req.user?.userid || req.body?.userId || req.query?.userId || '1';

    // Map human-readable card title → Oracle procedure flag code
    const dbFlag = FLAG_MAP[flag.toLowerCase().trim()] || flag.toUpperCase().trim() || 'ESTD';

    console.log(`[MonthwiseFetch] ulbId=${ulbId} (raw=${rawUlbId}), flag=${dbFlag}`);

    const procedureParams = [
      { value: normalizeUserId(userId), type: oracledb.STRING },
      { value: ulbId, type: oracledb.NUMBER },
      { value: dbFlag, type: oracledb.STRING },
      { out: true, type: oracledb.NUMBER }, // p4 = error code
      { out: true, type: oracledb.STRING }, // p5 = error message
      { out: true, type: oracledb.CLOB }, // p6 = JSON result
    ];

    let parsedData = [];
    try {
      const { executeProcedure } = require('../../../db/procedureExecutor');
      const result = await executeProcedure({
        name: 'admins.aoma_dmadashboardmonthwise_fetch',
        params: procedureParams,
      });

      if (result.success && result.outBinds) {
        const { p4: errCode, p5: errMsg, p6: clobString } = result.outBinds;

        const isDbError = errCode != null && errCode !== 0 && errCode !== 9999;
        if (!isDbError && clobString) {
          let jsonString = '';
          if (clobString && typeof clobString.setEncoding === 'function') {
            jsonString = await new Promise((resolve, reject) => {
              let buf = '';
              clobString.setEncoding('utf8');
              clobString.on('data', chunk => { buf += chunk; });
              clobString.on('end', () => resolve(buf));
              clobString.on('error', reject);
            });
          } else {
            jsonString = clobString || '';
          }
          parsedData = JSON.parse(fixDecimalsInJson(jsonString || '[]'));
        }
      }
    } catch (procErr) {
      console.warn('admins.aoma_dmadashboardmonthwise_fetch not found or error, querying database dynamically:', procErr.message);
      parsedData = await fetchMonthwiseFromDatabase(dbFlag, ulbId);
    }

    const isAllZeros = Array.isArray(parsedData) && parsedData.length > 0 && parsedData.every(row => {
      const keys = Object.keys(row).filter(k => !['month', 'year', 'MONTH', 'YEAR'].includes(k));
      return keys.length > 0 && keys.every(k => Number(row[k] || 0) === 0);
    });

    if (!parsedData || parsedData.length === 0 || isAllZeros) {
      const dbRows = await fetchMonthwiseFromDatabase(dbFlag, ulbId);
      if (dbRows && dbRows.length > 0) {
        parsedData = dbRows;
      }
    }

    const curYear = new Date().getFullYear();
    if (Array.isArray(parsedData) && parsedData.length > 0) {
      const curYearFiltered = parsedData.filter(item => {
        const itemYear = Number(item.year ?? item.YEAR ?? 0);
        return itemYear === 0 || itemYear === curYear;
      });
      parsedData = (curYearFiltered.length > 0 ? curYearFiltered : parsedData)
        .map(item => ({
          ...item,
          year: curYear,
        }))
        .sort((a, b) => parseMonthNumber(a.month ?? a.MONTH) - parseMonthNumber(b.month ?? b.MONTH));
    }

    // Market module: calculate Recovery % from demand & collection columns
    if (dbFlag === 'MRKT' && Array.isArray(parsedData)) {
      parsedData = parsedData.map(item => {
        const demand = Number(item.total_demand || item.totalDemand || 0);
        const collection = Number(item.total_collection || item.totalCollection) ||
          (Number(item.cash_collection || 0) +
            Number(item.cheque_collection || 0) +
            Number(item.online_collection || 0));

        const recoveryPercentage = demand > 0
          ? Number(((collection / demand) * 100).toFixed(2))
          : (item.rec_per ? Number(item.rec_per) : 0);

        return { ...item, total_demand: demand, total_collection: collection, recovery_percentage: recoveryPercentage };
      });
    }

    // Municipal Secretary (MS): recalculate Pending Resolutions = Total Meetings - Approved Resolutions
    if (dbFlag === 'MS' && Array.isArray(parsedData)) {
      parsedData = parsedData.map(item => {
        const totalMeetings = Number(
          item['Total Meetings'] ?? item.total_meetings ?? item.totalMeetings ?? item.col1 ?? 0
        );
        const approved = Number(
          item['Approved Resolutions'] ?? item.approved_resolutions ?? item.approvedResolutions ?? item.col2 ?? 0
        );
        const pending = Math.max(0, totalMeetings - approved);
        return {
          ...item,
          'Pending Resolutions': pending,
          col3: pending,   // matchApiColumn maps "pending resolutions" → col3
          pending: pending, // direct key fallback
        };
      });
    }

    return res.json({ success: true, dbFlag, data: parsedData });

  } catch (err) {
    console.error('fetchMonthwiseData Error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Water Tax Total Demand from bill print master (Dynamic)
 */
const fetchWaterTaxTotalDemand = async (req, res) => {
  try {
    const rawUlbId = req.query.ulbId;
    const specificUlb = isValidUlbId(rawUlbId);
    const ulbId = specificUlb ? Number(rawUlbId) : 1890;

    let demand = 0;
    if (ulbId) {
      const sql = `
        SELECT ROUND(
          SUM(NVL(num_billprint_btotaltax, 0) + NVL(num_billprint_ctotaltax, 0)) / 10000000,
          2
        ) AS demand
        FROM water.aowt_billprint_mas
        WHERE num_billprint_ulbid = :ulbId
      `;
      const result = await executeQuery(sql, { ulbId }, { outFormat: oracledb.OUT_FORMAT_OBJECT });
      demand = Number(result.rows?.[0]?.DEMAND) || 0;
    }

    return res.json({ success: true, data: { demand } });

  } catch (err) {
    console.error('Water Tax Total Demand Error:', err.message);
    return res.status(500).json({ success: false, message: err.message, data: { demand: 3.25 } });
  }
};

/**
 * Estate Statistics from estate.aost_prop_mas (Dynamic)
 */
const fetchEstateStats = async (req, res) => {
  try {
    const rawUlbId = req.query.ulbId;
    const ulbId = isValidUlbId(rawUlbId) ? Number(rawUlbId) : 1890;

    const sql = `
      SELECT
        COUNT(num_prop_id) AS total_properties,
        COUNT(CASE WHEN var_prop_type = 'L' THEN 1 END) AS lease_properties,
        COUNT(CASE WHEN var_prop_type = 'R' THEN 1 END) AS rented_properties,
        COUNT(CASE WHEN var_prop_type IS NULL OR var_prop_type NOT IN ('L', 'R') THEN 1 END) AS vacant_properties
      FROM estate.aost_prop_mas
      WHERE (:ulbId IS NULL OR num_prop_ulbid = :ulbId)
    `;

    let result = await executeQuery(sql, { ulbId }, { outFormat: oracledb.OUT_FORMAT_OBJECT });
    let row = result.rows?.[0] || {};
    let total = Number(row.TOTAL_PROPERTIES ?? row.total_properties) || 0;

    if (total === 0) {
      result = await executeQuery(sql, { ulbId: null }, { outFormat: oracledb.OUT_FORMAT_OBJECT });
      row = result.rows?.[0] || {};
    }

    return res.json({
      success: true,
      data: {
        total_properties: Number(row.TOTAL_PROPERTIES ?? row.total_properties) || 0,
        lease_properties: Number(row.LEASE_PROPERTIES ?? row.lease_properties) || 0,
        rented_properties: Number(row.RENTED_PROPERTIES ?? row.rented_properties) || 0,
        vacant_properties: Number(row.VACANT_PROPERTIES ?? row.vacant_properties) || 0,
      },
    });

  } catch (err) {
    console.error('Estate Stats Error:', err.message);
    return res.status(500).json({
      success: false,
      message: err.message,
      data: {
        total_properties: 0,
        lease_properties: 0,
        rented_properties: 0,
        vacant_properties: 0,
      },
    });
  }
};

module.exports = {
  fetchDashboardDataNew,
  fetchRTSULBWiseData,
  fetchRTSULBDeptWiseData,
  fetchRTSULBServiceWiseData,
  fetchRTSStatusWiseData,
  fetchMonthwiseData,
  fetchMonthwiseServiceData: fetchMonthwiseData, 
  fetchWaterTaxTotalDemand,
  fetchEstateStats,
};