import pkg from "pg";
const { Client } = pkg;


async function initDB() {
	const client = new Client({
		host: "localhost", // or "127.0.0.1"
		port: 5432,
		user: "postgres",
		password: "pass",
		database: "xnessdb", // use the DB you created earlier
	});

	try {
		await client.connect();
		console.log("✅ Connected to PostgreSQL");

		// Step 1: Create table
		await client.query(`
      CREATE TABLE IF NOT EXISTS trade (
        time  TIMESTAMPTZ NOT NULL,
        asset TEXT NOT NULL,
        price DOUBLE PRECISION NOT NULL
      );
    `);

		// Step 2: Convert to hypertable (safe check if already created)
		await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM timescaledb_information.hypertables WHERE hypertable_name = 'trade'
        ) THEN
          PERFORM create_hypertable('trade', 'time');
        END IF;
      END$$;
    `);

		console.log("✅ Hypertable 'trade' ready");
	} catch (err) {
		console.error("❌ Error initializing DB:", err);
	} finally {
		await client.end();
		console.log("🔌 Connection closed");
	}
}

initDB();
