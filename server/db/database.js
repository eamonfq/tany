const path = require('path');
const fs = require('fs');
const initSqlJs = require('sql.js');

const DB_PATH = path.join(__dirname, 'eventos_tany.db');

let dbInstance = null;

class PreparedStatement {
  constructor(db, sql) {
    this.db = db;
    this.sql = sql;
  }

  run(params = []) {
    this.db.exec(this.sql, Array.isArray(params) ? params : [params]);
    const changes = this.db.getRowsModified();
    const lastInsertRowid = this._getLastId();
    this.db.save();
    return { changes, lastInsertRowid };
  }

  get(params = []) {
    try {
      const stmt = this.db.db.prepare(this.sql);
      if (Array.isArray(params) && params.length > 0) {
        stmt.bind(params);
      }
      if (stmt.step()) {
        const columns = stmt.getColumnNames();
        const values = stmt.get();
        stmt.free();
        const row = {};
        columns.forEach((col, i) => { row[col] = values[i]; });
        return row;
      }
      stmt.free();
      return null;
    } catch (e) {
      return null;
    }
  }

  all(params = []) {
    try {
      const results = [];
      const stmt = this.db.db.prepare(this.sql);
      if (Array.isArray(params) && params.length > 0) {
        stmt.bind(params);
      }
      while (stmt.step()) {
        const columns = stmt.getColumnNames();
        const values = stmt.get();
        const row = {};
        columns.forEach((col, i) => { row[col] = values[i]; });
        results.push(row);
      }
      stmt.free();
      return results;
    } catch (e) {
      return [];
    }
  }

  _getLastId() {
    try {
      const result = this.db.db.exec('SELECT last_insert_rowid() as id');
      if (result.length > 0 && result[0].values.length > 0) {
        return result[0].values[0][0];
      }
      return null;
    } catch (e) {
      return null;
    }
  }
}

class DatabaseWrapper {
  constructor(sqlDb) {
    this.db = sqlDb;
  }

  prepare(sql) {
    return new PreparedStatement(this, sql);
  }

  exec(sql, params) {
    if (params && params.length > 0) {
      const stmt = this.db.prepare(sql);
      stmt.bind(params);
      stmt.step();
      stmt.free();
    } else {
      this.db.run(sql);
    }
  }

  execMultiple(sql) {
    this.db.run(sql);
  }

  save() {
    const data = this.db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
  }

  getRowsModified() {
    return this.db.getRowsModified();
  }
}

async function initDatabase() {
  const SQL = await initSqlJs();

  let sqlDb;
  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    sqlDb = new SQL.Database(fileBuffer);
    console.log('Database loaded from file');
  } else {
    sqlDb = new SQL.Database();
    console.log('Creating new database...');

    const wrapper = new DatabaseWrapper(sqlDb);

    // Run schema
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    wrapper.execMultiple(schema);
    wrapper.save();
    console.log('Schema created');

    dbInstance = wrapper;
    return wrapper;
  }

  dbInstance = new DatabaseWrapper(sqlDb);
  return dbInstance;
}

function getDb() {
  if (!dbInstance) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return dbInstance;
}

module.exports = { initDatabase, getDb };
