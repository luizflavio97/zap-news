test("GET to /api/v1/status should return 200", async () => {
  const res = await fetch("http://localhost:3000/api/v1/status");
  expect(res.status).toBe(200);

  const response = await res.json();

  //response console log
  console.log(response);

  const parsedDDate = new Date(response.updated_at).toISOString();
  expect(response.updated_at).toEqual(parsedDDate);

  expect(response.dependencies.database.db_version).toEqual("16.0");
  expect(response.dependencies.database.max_connections).toEqual(100);
  expect(response.dependencies.database.active_connections).toEqual(1);
});
