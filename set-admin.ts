/**
 * RUN: npx ts-node set-admin.ts "tu@correo.com"
 */
const admin = require("firebase-admin");
const fs = require("fs");

try {
  const envStr = fs.readFileSync(".env.local", "utf-8");
  for (const line of envStr.split("\n")) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || "";
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      }
      if (value.startsWith("'") && value.endsWith("'")) {
        value = value.slice(1, -1);
      }
      process.env[key] = value;
    }
  }
} catch (e) {
  console.log("No se pudo leer .env.local de forma manual.");
}

if (!admin.apps.length) {
  const serviceAccountRaw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!serviceAccountRaw) {
    console.error("No se encontró FIREBASE_SERVICE_ACCOUNT_JSON en .env.local");
    process.exit(1);
  }

  const serviceAccount = JSON.parse(serviceAccountRaw);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

async function makeAdmin(email: string) {
  try {
    const usersRef = db.collection("users");
    const snapshot = await usersRef.where("email", "==", email).get();

    if (snapshot.empty) {
      console.log(`No se encontró ningún usuario con el correo: ${email}`);
      console.log("Asegúrate de haber iniciado sesión / creado cuenta primero en la plataforma.");
      process.exit(1);
    }

    const userDoc = snapshot.docs[0];
    await userDoc.ref.update({ role: "ADMIN" });

    console.log(`¡Éxito! El usuario ${email} ahora es Administrador.`);
    console.log("Por favor, cierra sesión y vuelve a entrar en la plataforma para actualizar tu perfil.");
    process.exit(0);
  } catch (error) {
    console.error("Error asignando rol:", error);
    process.exit(1);
  }
}

const targetEmail = process.argv[2];
if (!targetEmail) {
  console.log("Uso: npx ts-node set-admin.ts <correo-del-usuario>");
  process.exit(1);
}

makeAdmin(targetEmail);
