const { exec } = require("node:child_process");

function checkPostgresConnection() {
  exec("docker exec postgres-dev pg_isready --host localhost", handleReturn);

  function handleReturn(error, stdout) {
    if (stdout.search("accepting connections") === -1) {
      process.stdout.write(".");
      checkPostgresConnection();
      return;
    }

    console.log("Postgres está aceitando conexões!");
  }
}

process.stdout.write("Aguardando o Postgres aceitar conexões...");
checkPostgresConnection();
