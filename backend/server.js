const express = require("express");
const session = require("express-session");
const passport = require("passport");
const SamlStrategy = require("passport-saml").Strategy;
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 5000;

// Configurazione CORS
app.use(
  cors({
    origin: "http://localhost:3000", // URL del frontend React
    credentials: true,
  })
);

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Configurazione sessioni
app.use(
  session({
    secret: "your-secret-key-change-this-in-production",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Imposta a true in produzione con HTTPS
      maxAge: 1000 * 60 * 60 * 24, // 24 ore
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Configurazione SAML Strategy
const samlConfig = {
  // URL del tuo Entra ID tenant
  entryPoint: "https://login.microsoftonline.com/YOUR-TENANT-ID/saml2",

  // Entity ID della tua applicazione (configurato in Entra ID)
  issuer: "http://localhost:5000",

  // URL dove Entra ID invierà la risposta SAML
  callbackUrl: "http://localhost:5000/auth/saml/callback",

  // URL per il logout
  logoutUrl: "https://login.microsoftonline.com/YOUR-TENANT-ID/saml2",
  logoutCallbackUrl: "http://localhost:5000/auth/saml/logout/callback",

  // Certificato di Entra ID per validare le firme (scaricabile dal portale Azure)
  cert: `-----BEGIN CERTIFICATE-----
MIIC8DCCAdigAwIBAgIQWJSRbob8oLpCwjv5KUyJ+TANBgkqhkiG9w0BAQsFADA0MTIwMAYDVQQD
EylNaWNyb3NvZnQgQXp1cmUgRmVkZXJhdGVkIFNTTyBDZXJ0aWZpY2F0ZTAeFw0yNTA4MTEwNzE3
NDJaFw0yODA4MTEwNzE3MzlaMDQxMjAwBgNVBAMTKU1pY3Jvc29mdCBBenVyZSBGZWRlcmF0ZWQg
U1NPIENlcnRpZmljYXRlMIIBIjANBgkqhkiG9w0BsssFAAOCAQ8AMIIBCgKCAQEAqRK886oF4nL7
7350t0hj3VqQjdluuv4GIlayeG8RjBwpFFGyFvMxEUxP5KBPobEGfUDdPg3y+G90k6Aldar1vx34
N5wWXuz0aMiBKl4ZLDwYVhMgzWfVMFIm2XgQnLL3unIwvjPRKul8/fVNNcidbbqV8U3KPZvXemJz
x1xKIAccroV7i339z7IyubmuxP8MxO69AVGqA5HT1D56Tht0bPuI3aAFo07PWHLBhuQRVlirfCfX
Ay1eoRrA4Q8ZFBT49AHTbVxCFDuqNkzu1pHbCH3ITKGgsY7NxFRymZRFmMu9L+M9NSDH3qgfl/5l
lb/4Qo6opkH728N5zZwowHwTrQIDAQABMA0GCSqGSIb3DQEBCwUAA4IBAQBQAHrbNXPRWSFjRXKf
oVhaaaZ5i5Cqa0hkzZ18VNdZ69b/aaQkvDr6XQykWMIdiyFXnPqZSKIJsE0O/ZtYgGiZy+lcJJYy
Nu5t9x/Ht+Eyv5TtjU2v/O4PggVfnycuQpwb1LtZcEtQncVgIbRA9kpZDRgaLn5bpk+YHvk/TCox
q0auqpV3isqIBfhlrg6Pb8zJuYw0PDa/Jf/HIn1hobPS2PCgVN1ImMSfqzYqoWQdPLVv0kUY1X9w
JaUiBrInZtDIPlMlKLx2OPQerzGRqZFyEO+fGLpom6bqQg0n6HVyJAGVBfpGydsk+HpLKYkfZ46B
3h7D5Bse/PcuIF7mJvRk
-----END CERTIFICATE-----`,

  // Configurazioni aggiuntive
  disableRequestedAuthnContext: true,
  acceptedClockSkewMs: 0,
  //   attributeConsumingServiceIndex: 0,
  signatureAlgorithm: "sha256",
  digestAlgorithm: "sha256",
};

passport.use(
  new SamlStrategy(samlConfig, function (profile, done) {
    // Qui puoi salvare o recuperare l'utente dal database
    const user = {
      id: profile.nameID,
      email:
        profile.email ||
        profile[
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
        ],
      name:
        profile.displayName ||
        profile["http://schemas.microsoft.com/identity/claims/displayname"],
      firstName:
        profile.firstName ||
        profile[
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname"
        ],
      lastName:
        profile.lastName ||
        profile[
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname"
        ],
      groups:
        profile.groups ||
        profile[
          "http://schemas.microsoft.com/ws/2008/06/identity/claims/groups"
        ],
    };

    console.log("SAML Profile ricevuto:", profile);
    return done(null, user);
  })
);

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});

// Routes per l'autenticazione SAML

// Inizia il processo di autenticazione SAML
app.get(
  "/auth/saml/login",
  passport.authenticate("saml", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  function (req, res) {
    res.redirect("/");
  }
);

// Callback per la risposta SAML da Entra ID
app.post(
  "/auth/saml/callback",
  bodyParser.urlencoded({ extended: false }),
  passport.authenticate("saml", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  function (req, res) {
    // Successo - reindirizza al frontend
    res.redirect("http://localhost:3000/dashboard");
  }
);

// Logout SAML
app.get("/auth/saml/logout", function (req, res) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    // Inizia il processo di logout SAML
    passport._strategy("saml").logout(req, function (err, requestUrl) {
      if (err) {
        return res.status(500).send("Errore durante il logout");
      }
      res.redirect(requestUrl);
    });
  });
});

// Callback per il logout SAML
app.post(
  "/auth/saml/logout/callback",
  bodyParser.urlencoded({ extended: false }),
  function (req, res) {
    req.logout(function (err) {
      if (err) {
        return next(err);
      }
      res.redirect("http://localhost:3000/");
    });
  }
);

// Routes API

// Verifica se l'utente è autenticato
app.get("/api/user", function (req, res) {
  if (req.isAuthenticated()) {
    res.json({
      authenticated: true,
      user: req.user,
    });
  } else {
    res.json({
      authenticated: false,
      user: null,
    });
  }
});

// Metadata SAML per la configurazione in Entra ID
app.get("/auth/saml/metadata", function (req, res) {
  const metadata = passport._strategy("saml").generateServiceProviderMetadata(
    null, // Certificato pubblico (opzionale)
    null // Certificato pubblico (opzionale)
  );
  res.type("application/xml");
  res.send(metadata);
});

// Route di test
app.get("/health", function (req, res) {
  res.json({ status: "OK", message: "Server SAML funzionante" });
});

// Gestione errori
app.use(function (err, req, res, next) {
  console.error("Errore SAML:", err);
  res.status(500).json({
    error: "Errore interno del server",
    message: err.message,
  });
});

app.listen(PORT, function () {
  console.log(`🚀 Server SAML avviato su http://localhost:${PORT}`);
  console.log(
    `📋 Metadata SAML disponibili su: http://localhost:${PORT}/auth/saml/metadata`
  );
  console.log(`🔐 Login SAML: http://localhost:${PORT}/auth/saml/login`);
});
