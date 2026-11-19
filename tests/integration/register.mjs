import { register } from "node:module";

register("./alias-loader.mjs", import.meta.url);

if (!process.env.FIRESTORE_EMULATOR_HOST) {
  console.error(
    "Las pruebas de integración solo se ejecutan contra el emulador de Firestore.\n" +
      "Usa: npm run test:integration",
  );
  process.exit(1);
}
