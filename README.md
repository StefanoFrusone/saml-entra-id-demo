# 🔐 SAML Authentication con Microsoft Entra ID

Esempio completo di autenticazione SAML 2.0 usando **React** + **Node.js** con **Microsoft Entra ID** (ex Azure AD).

## 📋 Indice

- [Caratteristiche](#-caratteristiche)
- [Prerequisiti](#-prerequisiti)
- [Installazione Rapida](#-installazione-rapida)
- [Configurazione Microsoft Entra ID](#-configurazione-microsoft-entra-id)
- [Configurazione Backend](#-configurazione-backend)
- [Avvio dell'Applicazione](#-avvio-dellapplicazione)
- [Troubleshooting](#-troubleshooting)
- [Struttura del Progetto](#-struttura-del-progetto)
- [Tecnologie Utilizzate](#-tecnologie-utilizzate)

## ✨ Caratteristiche

- ✅ **Autenticazione SAML 2.0** completa con Microsoft Entra ID
- ✅ **Frontend React** moderno con Vite
- ✅ **Backend Node.js** con Express e Passport-SAML
- ✅ **Single Sign-On (SSO)** funzionante
- ✅ **Logout SAML** con fallback locale
- ✅ **UI responsive** con design moderno
- ✅ **Logging dettagliato** per debugging
- ✅ **Gestione errori** robusta

## 🛠️ Prerequisiti

- **Node.js** versione 16 o superiore
- **npm** versione 8 o superiore
- **Account Microsoft Azure** con accesso a Entra ID
- **Permessi amministrativi** nel tenant Azure

## 🚀 Installazione Rapida

```bash
# 1. Clona il repository
git clone https://github.com/StefanoFrusone/saml-entra-id-demo.git
cd saml-entra-id-demo

# 2. Installa tutte le dipendenze
npm run install:all

# 3. Configura Microsoft Entra ID (vedi sezione successiva)

# 4. Configura il backend (vedi sezione successiva)

# 5. Avvia l'applicazione
npm run dev
```

L'applicazione sarà disponibile su:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000

## ⚙️ Configurazione Microsoft Entra ID

### Passo 1: Creare Enterprise Application

1. Accedi al [portale Azure](https://portal.azure.com)
2. Vai a **Microsoft Entra ID** → **Enterprise applications**
3. Clicca **+ New application**
4. Seleziona **+ Create your own application**
5. Nome: `SAML Demo App`
6. Seleziona: **"Integrate any other application you don't find in the gallery (Non-gallery)"**
7. Clicca **Create**

### Passo 2: Configurare SAML

1. Nella nuova applicazione, vai a **Single sign-on**
2. Seleziona **SAML**
3. Clicca **Edit** nella sezione **Basic SAML Configuration**

**Inserisci questi valori:**

| Campo | Valore |
|-------|--------|
| **Identifier (Entity ID)** | `http://localhost:5000` |
| **Reply URL (Assertion Consumer Service URL)** | `http://localhost:5000/auth/saml/callback` |
| **Sign on URL** | `https://localhost:3000` |
| **Logout URL** | `https://localhost:5000/auth/saml/logout/callback` |

4. Clicca **Save**

### Passo 3: Scaricare il Certificato

1. Nella sezione **SAML Signing Certificate**
2. Trova **Certificate (Base64)**
3. Clicca **Download**
4. Salva il file come `certificate.cer` nella cartella `backend/`

### Passo 4: Ottenere il Tenant ID

1. Vai a **Microsoft Entra ID** → **Overview**
2. Copia il **Tenant ID** dalla sezione Properties
3. Esempio: `aa2dda38-70cc-43ad-9337-1e085352c85b`

### Passo 5: Assegnare Utenti (Opzionale)

1. Vai a **Users and groups**
2. Clicca **+ Add user/group**
3. Seleziona gli utenti che potranno accedere
4. Clicca **Assign**

## 🔧 Configurazione Backend

### Leggere il Certificato

```bash
# Vai nella cartella backend
cd backend

# Leggi il contenuto del certificato
cat certificate.cer

# Oppure su Windows
type certificate.cer
```

Il contenuto sarà simile a:
```
-----BEGIN CERTIFICATE-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...
[molte righe di caratteri]
...
-----END CERTIFICATE-----
```

### Configurare server.js

Apri il file `backend/server.js` e modifica la sezione `samlConfig`:

```javascript
const samlConfig = {
  // 1. Sostituisci YOUR-TENANT-ID con il tuo Tenant ID
  entryPoint: "https://login.microsoftonline.com/YOUR-TENANT-ID/saml2",
  
  // 2. Mantieni questi URL per sviluppo locale
  issuer: "http://localhost:5000",
  callbackUrl: "http://localhost:5000/auth/saml/callback",
  logoutUrl: "https://login.microsoftonline.com/YOUR-TENANT-ID/saml2",
  logoutCallbackUrl: "http://localhost:5000/auth/saml/logout/callback",
  
  // 3. Incolla qui il contenuto COMPLETO del certificato
  cert: `-----BEGIN CERTIFICATE-----
MIIC8DCCAdigAwIBAgIQWJSRbob8oLpCwjv5KUyJ+TANBgkqhkiG9w0BAQsFADA0...
[tutto il contenuto del tuo certificato]
...
-----END CERTIFICATE-----`,
  
  // 4. Configurazioni tecniche (NON modificare)
  disableRequestedAuthnContext: true,
  acceptedClockSkewMs: 0,
  signatureAlgorithm: "sha256",
  digestAlgorithm: "sha256",
};
```

**⚠️ IMPORTANTE:** 
- Sostituisci `YOUR-TENANT-ID` con il **TUO** Tenant ID
- Copia il certificato **completo** inclusi BEGIN/END CERTIFICATE

## 🎮 Avvio dell'Applicazione

### Avvio Completo (Consigliato)

```bash
# Avvia frontend e backend insieme
npm run dev
```

### Avvio Separato

```bash
# Terminale 1 - Backend
npm run dev:backend

# Terminale 2 - Frontend  
npm run dev:frontend
```

### Altri Comandi Utili

```bash
# Build per produzione
npm run build

# Reinstalla tutte le dipendenze
npm run clean && npm run install:all

# Solo backend in modalità produzione
npm run start
```

## 🧪 Test dell'Applicazione

### Test del Flusso SAML

1. **Apri** http://localhost:3000
2. **Clicca** "Accedi con SAML"
3. **Inserisci** le credenziali Microsoft
4. **Verifica** il reindirizzamento alla dashboard
5. **Controlla** i dati utente visualizzati

### Verifica dei Metadata

Vai su http://localhost:5000/auth/saml/metadata per vedere i metadata XML del Service Provider.

### Test degli Endpoint

- **Health Check**: http://localhost:5000/health
- **User Status**: http://localhost:5000/api/user
- **SAML Login**: http://localhost:5000/auth/saml/login

## 🐛 Troubleshooting

### Errori Comuni

#### 1. "AADSTS750055: SAML message was not properly DEFLATE-encoded"

**Soluzione**: Aggiungi `skipRequestCompression: true` nel `samlConfig`:

```javascript
const samlConfig = {
  // ... altre configurazioni
  skipRequestCompression: true,  // Aggiungere questa riga
  disableRequestedAuthnContext: true,
};
```

#### 2. "AADSTS50011: The reply URL does not match"

**Soluzione**: Verifica che gli URL in Entra ID siano identici a quelli nel codice:
- Reply URL: `http://localhost:5000/auth/saml/callback`
- Entity ID: `http://localhost:5000`

#### 3. "Invalid signature" o errori di certificato

**Soluzione**: 
1. Riscaricare il certificato da Azure
2. Verificare che sia copiato completamente (inclusi BEGIN/END)
3. Non lasciare spazi extra all'inizio o alla fine

#### 4. "Cannot GET /auth/saml/login"

**Soluzione**: 
1. Verificare che il backend sia avviato sulla porta 5000
2. Controllare i log del backend per errori
3. Verificare la configurazione CORS

#### 5. Problemi di CORS

**Soluzione**: Verificare che il frontend sia su porta 3000 e il backend su porta 5000.

### Debug Avanzato

#### Abilitare Logging Dettagliato

Nel `server.js`, la funzione di callback della strategia SAML già include logging dettagliato:

```javascript
passport.use(new SamlStrategy(samlConfig, function (profile, done) {
  console.log("SAML Profile ricevuto:", profile);
  // ... resto del codice
}));
```

#### Controllare i Log di Azure

1. Nel portale Azure, vai alla tua Enterprise Application
2. **Monitoring** → **Sign-ins**
3. Cerca i tentativi di login per vedere errori dettagliati

### Checklist di Verifica

- [ ] Node.js versione 16+ installato
- [ ] Tenant ID corretto nel codice
- [ ] Certificato copiato completamente
- [ ] URL callback identici in Azure e nel codice
- [ ] Backend avviato sulla porta 5000
- [ ] Frontend avviato sulla porta 3000
- [ ] Utente assegnato all'applicazione in Azure
- [ ] Firewall non blocca le porte

## 📁 Struttura del Progetto

```
saml-entra-id-demo/
├── package.json                 # Root package.json con scripts
├── README.md                    # Questa documentazione
├── .gitignore                   # File da ignorare in Git
│
├── backend/                     # Server Node.js
│   ├── package.json            # Dipendenze backend
│   ├── server.js               # Server Express con SAML
│   └── certificate.cer         # Certificato Entra ID (da scaricare)
│
└── frontend/                    # App React
    ├── package.json            # Dipendenze frontend
    ├── vite.config.js          # Configurazione Vite + proxy
    ├── index.html              # Template HTML
    └── src/
        ├── main.jsx            # Entry point React
        ├── App.jsx             # Componente principale
        └── App.css             # Stili dell'applicazione
```

## 🛡️ Sicurezza per Produzione

Quando deploy in produzione:

### 1. Variabili d'Ambiente

Crea un file `.env` nel backend:

```bash
# .env
TENANT_ID=your-tenant-id-here
SAML_CERT_PATH=./certificate.cer
SESSION_SECRET=your-super-secret-key
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com
BACKEND_URL=https://api.yourdomain.com
```

### 2. Configurazioni HTTPS

```javascript
// Sessioni sicure
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS only
    sameSite: 'none',
    maxAge: 1000 * 60 * 60 * 24,
    httpOnly: true
  }
}));
```

### 3. Aggiornare Entra ID

Cambia gli URL da localhost ai domini reali:
- **Entity ID**: `https://api.yourdomain.com`
- **Reply URL**: `https://api.yourdomain.com/auth/saml/callback`
- **Sign-on URL**: `https://yourdomain.com`

## 🔧 Tecnologie Utilizzate

### Backend
- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **Passport** - Middleware di autenticazione
- **passport-saml** - Strategia SAML per Passport
- **express-session** - Gestione sessioni

### Frontend
- **React 18** - Libreria UI
- **Vite** - Build tool veloce
- **React Router** - Routing client-side
- **Axios** - Client HTTP

### Protocolli
- **SAML 2.0** - Security Assertion Markup Language
- **SP-Initiated SSO** - Service Provider Initiated Single Sign-On

## 📚 Risorse Utili

- [Microsoft Entra SAML Documentation](https://docs.microsoft.com/en-us/azure/active-directory/develop/single-sign-on-saml-protocol)
- [Passport-SAML Documentation](https://github.com/node-saml/passport-saml)
- [SAML 2.0 Specification](http://docs.oasis-open.org/security/saml/v2.0/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)

## 🤝 Contribuire

1. Fork del progetto
2. Crea un branch per la feature (`git checkout -b feature/AmazingFeature`)
3. Commit delle modifiche (`git commit -m 'Add some AmazingFeature'`)
4. Push del branch (`git push origin feature/AmazingFeature`)
5. Apri una Pull Request

## 📄 Licenza

Questo progetto è distribuito sotto licenza MIT. Vedi il file `LICENSE` per maggiori dettagli.

## 👨‍💻 Autore

**Stefano Frusone** - [stefano.frusone@gmail.com](mailto:stefano.frusone@gmail.com)


---

## 🆘 Supporto

Se incontri problemi:

1. **Controlla** la sezione [Troubleshooting](#-troubleshooting)
2. **Verifica** la [Checklist](#checklist-di-verifica)
3. **Apri** una [Issue](https://github.com/StefanoFrusone/saml-entra-id-demo/issues)
4. **Contatta** il maintainer

**Happy Coding!** 🚀
