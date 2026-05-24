const db = require('../db/database');

class Logger {
  async log(accountId, action, status, message, errorDetails = null) {
    await db.run(
      'INSERT INTO logs (account_id, action, status, message, error_details) VALUES (?, ?, ?, ?, ?)',
      [accountId, action, status, message, errorDetails]
    );

    const prefix = status === 'error' ? '❌' : status === 'warning' ? '⚠️' : '✅';
    console.log(`${prefix} [${action}] ${message}`);
  }

  async getLogs(limit = 50) {
    return await db.all(
      'SELECT * FROM logs ORDER BY created_at DESC LIMIT ?',
      [limit]
    );
  }

  async getLogsByAccount(accountId, limit = 50) {
    return await db.all(
      'SELECT * FROM logs WHERE account_id = ? ORDER BY created_at DESC LIMIT ?',
      [accountId, limit]
    );
  }
}

module.exports = Logger;
