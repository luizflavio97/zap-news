import useSWR from "swr";

async function fetchAPI(key) {
  const res = await fetch(key);
  const resBody = await res.json();
  return resBody;
}

function DatabaseStatus() {
  const { isLoading, data } = useSWR("/api/v1/status", fetchAPI, {
    refreshInterval: 2000,
  });

  let updatedAtText = "Loading...";
  let databaseData = {};

  if (!isLoading && data) {
    updatedAtText = new Date(data.updated_at).toLocaleString("pt-br");
    databaseData = data;
  }

  return (
    <>
      <div>Last Updated: {updatedAtText}</div>
      <br />
      <div>
        {isLoading ? (
          <div>Loading database status...</div>
        ) : (
          <>
            <div>
              Active Connections:{" "}
              {databaseData.dependencies.database.active_connections}
            </div>
            <div>
              Max Connections:{" "}
              {databaseData.dependencies.database.max_connections}
            </div>
            <div>
              Database Version: {databaseData.dependencies.database.db_version}
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default function StatusPage() {
  return (
    <>
      <h1>Status</h1>
      <DatabaseStatus />
    </>
  );
}
