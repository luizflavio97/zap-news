import database from "/infra/database.js";

async function status(req, res) {
  const updatedAt = new Date().toISOString();
  const databaseVersion = await database
    .query("SHOW server_version;")
    .then((result) => {
      return result.rows[0].server_version;
    });

  const maxConnections = await database
    .query("SHOW max_connections;")
    .then((result) => {
      return result.rows[0].max_connections;
    });

  const databaseName = process.env.POSTGRES_DB;
  const activeConnections = await database.query({
    text: "SELECT count(*)::int FROM pg_stat_activity WHERE datname = $1;",
    values: [databaseName],
  });

  res.status(200).send({
    updated_at: updatedAt,
    dependencies: {
      database: {
        db_version: databaseVersion,
        max_connections: parseInt(maxConnections),
        active_connections: activeConnections.rows[0].count,
      },
    },
  });
}

export default status;
