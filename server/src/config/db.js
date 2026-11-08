const mysql = require('mysql2/promise');
const mockStore = require('./mockStore');

let pool = null;
let useMock = false;

const poolConfig = {
  host:            process.env.DB_HOST     || 'localhost',
  port:            parseInt(process.env.DB_PORT) || 3306,
  user:            process.env.DB_USER     || 'root',
  password:        process.env.DB_PASSWORD || '',
  database:        process.env.DB_NAME     || 'planova',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit:      0,
  timezone:        '+00:00',
};

// If connecting to cloud DB (like TiDB, Aiven, or any non-localhost host), enable SSL
if (poolConfig.host && poolConfig.host !== 'localhost' && poolConfig.host !== '127.0.0.1') {
  poolConfig.ssl = { minVersion: 'TLSv1.2', rejectUnauthorized: true };
}

try {
  pool = mysql.createPool(poolConfig);
} catch (err) {
  console.warn('⚠️ Could not create MySQL pool. Falling back to in-memory store.');
  useMock = true;
}

// Test connection on startup
if (pool) {
  pool.getConnection()
    .then(conn => {
      console.log('✅ MySQL connected to database:', process.env.DB_NAME || 'planova');
      conn.release();
    })
    .catch(err => {
      console.warn('⚠️ MySQL connection failed (' + err.message + ').');
      console.log('💡 PLANOVA is running with in-memory database fallback (all features active).');
      console.log('   To use MySQL, set DB_PASSWORD in server/.env and run database/schema.sql & seed.sql.');
      useMock = true;
    });
}

const logQuery = (sql, params) => {
  const cleanSql = sql.trim().replace(/\s+/g, ' ');
  console.log(`\x1b[36m[SQL QUERY]\x1b[0m ${cleanSql}`);
  if (params && params.length > 0) {
    const formattedParams = params.map(p =>
      typeof p === 'string' && p.length > 60 ? `"${p.slice(0, 60)}..."` : JSON.stringify(p)
    ).join(', ');
    console.log(`\x1b[90m            Params: [${formattedParams}]\x1b[0m`);
  }
};

const dbWrapper = {
  async execute(sql, params = []) {
    logQuery(sql, params);
    if (useMock) {
      return mockStore.execute(sql, params);
    }
    try {
      return await pool.execute(sql, params);
    } catch (err) {
      if (err.code === 'ECONNREFUSED' || err.code === 'ER_ACCESS_DENIED_ERROR' || err.code === 'ER_BAD_DB_ERROR') {
        useMock = true;
        console.warn('⚠️ Switching to in-memory fallback due to database error:', err.message);
        return mockStore.execute(sql, params);
      }
      throw err;
    }
  },

  async getConnection() {
    if (useMock) {
      const conn = await mockStore.getConnection();
      const origExec = conn.execute.bind(conn);
      conn.execute = async (sql, params = []) => {
        logQuery(sql, params);
        return origExec(sql, params);
      };
      return conn;
    }
    try {
      const conn = await pool.getConnection();
      const origExec = conn.execute.bind(conn);
      conn.execute = async (sql, params = []) => {
        logQuery(sql, params);
        return origExec(sql, params);
      };
      return conn;
    } catch (err) {
      if (err.code === 'ECONNREFUSED' || err.code === 'ER_ACCESS_DENIED_ERROR' || err.code === 'ER_BAD_DB_ERROR') {
        useMock = true;
        return this.getConnection();
      }
      throw err;
    }
  }
};

module.exports = dbWrapper;


