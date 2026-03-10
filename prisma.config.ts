// import "dotenv/config";
// import path from "node:path";
// import { defineConfig } from "prisma/config";

// export default defineConfig({
//   schema: path.join("prisma", "schema"),
// });



// import "dotenv/config";
// import { defineConfig, env } from "prisma/config";

// export default defineConfig({
//   schema: "prisma/schema/schema.prisma",
//   migrations: {
//     path: "prisma/migrations",
//   },
//   datasource: {
//     url: env("DATABASE_URL"),
//   },
// });


import "dotenv/config";
import path from "node:path";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: path.join("prisma", "schema"),
  migrations: {
    path: path.join("prisma", "schema", "migrations"),
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});