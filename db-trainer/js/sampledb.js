/* =====================================================================
   SAMPLE DATABASE used by Module 3 (relational algebra + SQL).
   Two small "worlds": a COMPANY and the METRO BUS case study.
   Each table: { columns: [...], rows: [[...], ...] }   (null = NULL)
   You can add tables here; they become available in RA and SQL.
   ===================================================================== */
(function (root) {
  const SAMPLE_DB = {
    // ---------------- COMPANY ----------------
    DEPARTMENT: {
      columns: ['deptid', 'dname', 'location'],
      rows: [
        [1, 'Research', 'Berlin'],
        [2, 'Sales', 'Paris'],
        [3, 'IT', 'Berlin'],
        [4, 'HR', 'Rome'] // HR has no employees (useful for outer joins / MINUS)
      ]
    },
    EMPLOYEE: {
      columns: ['eid', 'name', 'salary', 'deptid', 'city', 'managerid'],
      rows: [
        [101, 'Anna', 2500, 1, 'Berlin', null],
        [102, 'Ben', 900, 1, 'Hamburg', 101],
        [103, 'Clara', 1800, 2, 'Paris', null],
        [104, 'David', 1200, 2, 'Lyon', 103],
        [105, 'Eva', 3200, 3, 'Berlin', null],
        [106, 'Felix', 950, 3, 'Berlin', 105],
        [107, 'Gina', 1500, 3, 'Munich', 105],
        [108, 'Hugo', 700, null, 'Paris', null] // new hire, no department yet
      ]
    },
    PROJECT: {
      columns: ['pid', 'pname', 'deptid', 'budget'],
      rows: [
        [1, 'Apollo', 1, 50000],
        [2, 'Hermes', 2, 20000],
        [3, 'Zeus', 3, 80000],
        [4, 'Athena', 3, 30000]
      ]
    },
    WORKS_ON: {
      columns: ['eid', 'pid', 'hours'],
      rows: [
        [101, 1, 10], [101, 3, 5], [102, 1, 20], [103, 2, 15], [104, 2, 25],
        [105, 1, 4], [105, 2, 6], [105, 3, 30], [105, 4, 10],
        [106, 3, 20], [106, 4, 15], [107, 4, 35], [107, 1, 5]
      ]
    },
    // ---------------- METRO BUS ----------------
    LINE: {
      columns: ['lineno', 'linename', 'color'],
      rows: [
        [1, 'Airport Express', 'Red'],
        [2, 'University Loop', 'Blue'],
        [3, 'Harbor Line', 'Green']
      ]
    },
    STOP: {
      columns: ['stopid', 'stopname', 'zone'],
      rows: [
        [10, 'Central Station', 'A'], [11, 'City Hall', 'A'], [12, 'University', 'B'],
        [13, 'Airport', 'C'], [14, 'Harbor', 'B'], [15, 'Market Square', 'A']
      ]
    },
    LINE_STOP: {
      columns: ['lineno', 'stopid', 'stoporder'],
      rows: [
        [1, 10, 1], [1, 11, 2], [1, 13, 3],
        [2, 10, 1], [2, 15, 2], [2, 12, 3], [2, 11, 4],
        [3, 15, 1], [3, 14, 2]
      ]
    },
    BUS: {
      columns: ['busid', 'plate', 'capacity', 'model'],
      rows: [
        [1, 'BUS-101', 80, 'Citaro'], [2, 'BUS-102', 80, 'Citaro'],
        [3, 'BUS-201', 120, 'Urbino'], [4, 'BUS-301', 60, 'Solaris']
      ]
    },
    DRIVER: {
      columns: ['driverid', 'firstname', 'lastname', 'hiredate'],
      rows: [
        [1, 'Mark', 'Hill', '2019-03-01'], [2, 'Sara', 'Lopez', '2021-06-15'],
        [3, 'Tom', 'Berg', '2023-01-10'], [4, 'Lina', 'Kraus', '2022-09-01'] // Lina has no trips yet
      ]
    },
    DRIVER_PHONE: {
      columns: ['driverid', 'phone'],
      rows: [[1, '555-0101'], [1, '555-0199'], [2, '555-0102'], [3, '555-0103']]
    },
    TRIP: {
      columns: ['tripid', 'lineno', 'busid', 'driverid', 'tripdate', 'departtime'],
      rows: [
        [1, 1, 1, 1, '2026-11-02', '07:00'], [2, 1, 2, 2, '2026-11-02', '08:00'],
        [3, 2, 3, 1, '2026-11-02', '09:30'], [4, 3, 4, 3, '2026-11-03', '07:15'],
        [5, 2, 3, 2, '2026-11-03', '10:00'], [6, 1, 1, 1, '2026-11-03', '07:00'],
        [7, 3, 4, 1, '2026-11-04', '12:00']
      ]
    },
    MAINTENANCE: {
      columns: ['busid', 'recordno', 'servicedate', 'cost'],
      rows: [[1, 1, '2026-01-10', 300], [1, 2, '2026-06-12', 450], [3, 1, '2026-03-03', 800]]
    }
  };

  /** Build CREATE TABLE + INSERT statements for sql.js */
  function sampleDbSql() {
    const q = (v) => v === null ? 'NULL' : (typeof v === 'number' ? String(v) : "'" + String(v).replace(/'/g, "''") + "'");
    let out = '';
    for (const [t, def] of Object.entries(SAMPLE_DB)) {
      const types = def.columns.map((c, i) => {
        const v = def.rows.find(r => r[i] !== null);
        return c + (v && typeof v[i] === 'number' ? ' INTEGER' : ' TEXT');
      });
      out += `CREATE TABLE ${t} (${types.join(', ')});\n`;
      for (const r of def.rows) out += `INSERT INTO ${t} VALUES (${r.map(q).join(', ')});\n`;
    }
    return out;
  }

  root.SAMPLE_DB = SAMPLE_DB;
  root.sampleDbSql = sampleDbSql;
  if (typeof module !== 'undefined') module.exports = { SAMPLE_DB, sampleDbSql };
})(typeof window !== 'undefined' ? window : globalThis);
