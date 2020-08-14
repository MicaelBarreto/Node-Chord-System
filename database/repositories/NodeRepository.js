class NodeRepository {
    constructor(dao) {
      this.dao = dao
    }

    dropTable() {
      const sql = `DROP TABLE IF EXISTS nodes`;
      return this.dao.run(sql);
    }
  
    createTable() {
      const sql = `
      CREATE TABLE IF NOT EXISTS nodes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        value VARCHAR(255) NOT NULL,
        mac_address VARCHAR(255) NOT NULL,
        next_node INTEGER NOT NULL,
        active BOOLEAN NOT NULL)`;
      return this.dao.run(sql);
    }

    create(value, mac_address, nextNode, active) {
      return this.dao.run(
        `INSERT INTO nodes (value, mac_address, next_node, active)
          VALUES (?, ?, ?, ?)`,
        [value, mac_address, nextNode, active]);
    }

    update(node) {
      const { id, value, mac_address, next_node, active } = node

      return this.dao.run(
        `UPDATE nodes
          SET value = ?,
          mac_address = ?,
          next_node = ?,
          active = ?
        WHERE id = ?`,
        [value, mac_address, next_node, active, id]
      );
    }

    setActive(nodeId, active) {
      return this.dao.run(
        `UPDATE nodes
          SET active = ?
        WHERE id = ?`,
        [active, nodeId]
      );
  }

    delete(id) {
      return this.dao.run(
        `DELETE FROM nodes WHERE id = ?`,
        [id]
      );
    }

    getById(id) {
      return this.dao.get(
        `SELECT * FROM nodes WHERE id = ?`,
        [id]);
    }

    getByNode(node) {
      return this.dao.get(
        `SELECT * FROM nodes WHERE id = ?`,
        [node]);
    }

    getActiveNode() {
      return this.dao.get(
        `SELECT * FROM nodes WHERE active = ? LIMIT 1`,
        [true]);
    }

    getLastNode() {
      return this.dao.get(
        `SELECT * FROM nodes WHERE next_node = ? ORDER BY id LIMIT 1 `,
        [1]);
    }

    getByNextNode(node) {
      return this.dao.get(
        `SELECT * FROM nodes WHERE next_node = ?`,
        [node]);
    }

    getAll() {
      return this.dao.all(`SELECT * FROM nodes`);
    }
}
  
module.exports = NodeRepository;