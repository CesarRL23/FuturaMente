var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
/**
 * RUN: npx ts-node set-admin.ts "tu@correo.com"
 */
var admin = require("firebase-admin");
var fs = require("fs");
try {
    var envStr = fs.readFileSync(".env.local", "utf-8");
    for (var _i = 0, _a = envStr.split("\n"); _i < _a.length; _i++) {
        var line = _a[_i];
        var match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (match) {
            var key = match[1];
            var value = match[2] || "";
            if (value.startsWith('"') && value.endsWith('"')) {
                value = value.slice(1, -1);
            }
            if (value.startsWith("'") && value.endsWith("'")) {
                value = value.slice(1, -1);
            }
            process.env[key] = value;
        }
    }
}
catch (e) {
    console.log("No se pudo leer .env.local de forma manual.");
}
if (!admin.apps.length) {
    var serviceAccountRaw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (!serviceAccountRaw) {
        console.error("No se encontró FIREBASE_SERVICE_ACCOUNT_JSON en .env.local");
        process.exit(1);
    }
    var serviceAccount = JSON.parse(serviceAccountRaw);
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}
var db = admin.firestore();
function makeAdmin(email) {
    return __awaiter(this, void 0, void 0, function () {
        var usersRef, snapshot, userDoc, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    usersRef = db.collection("users");
                    return [4 /*yield*/, usersRef.where("email", "==", email).get()];
                case 1:
                    snapshot = _a.sent();
                    if (snapshot.empty) {
                        console.log("No se encontr\u00F3 ning\u00FAn usuario con el correo: ".concat(email));
                        console.log("Asegúrate de haber iniciado sesión / creado cuenta primero en la plataforma.");
                        process.exit(1);
                    }
                    userDoc = snapshot.docs[0];
                    return [4 /*yield*/, userDoc.ref.update({ role: "ADMIN" })];
                case 2:
                    _a.sent();
                    console.log("\u00A1\u00C9xito! El usuario ".concat(email, " ahora es Administrador."));
                    console.log("Por favor, cierra sesión y vuelve a entrar en la plataforma para actualizar tu perfil.");
                    process.exit(0);
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    console.error("Error asignando rol:", error_1);
                    process.exit(1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
var targetEmail = process.argv[2];
if (!targetEmail) {
    console.log("Uso: npx ts-node set-admin.ts <correo-del-usuario>");
    process.exit(1);
}
makeAdmin(targetEmail);
