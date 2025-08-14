import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import axios from "axios";
import "./App.css";

// Configurazione Axios per includere i cookie
axios.defaults.withCredentials = true;

// Componente per la pagina di login
function LoginPage() {
  return (
    <div className="login-container">
      <div className="login-card">
        <h1>🔐 Autenticazione SAML</h1>
        <p>Accedi usando il tuo account Entra ID (Azure AD)</p>

        <div className="saml-info">
          <h3>📋 Informazioni SAML</h3>
          <ul>
            <li>
              <strong>Identity Provider:</strong> Microsoft Entra ID
            </li>
            <li>
              <strong>Protocol:</strong> SAML 2.0
            </li>
            <li>
              <strong>SSO Type:</strong> SP-Initiated
            </li>
          </ul>
        </div>

        <button
          className="saml-login-btn"
          onClick={() => (window.location.href = "/auth/saml/login")}
        >
          🚀 Accedi con SAML
        </button>

        <div className="technical-details">
          <h4>🔧 Dettagli Tecnici</h4>
          <p>Questo esempio dimostra:</p>
          <ul>
            <li>SP-Initiated SSO flow</li>
            <li>SAML Assertion validation</li>
            <li>Estrazione degli attributi utente</li>
            <li>Gestione della sessione</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// Componente per la dashboard (utente autenticato)
function Dashboard({ user, onLogout, onSimpleLogout }) {
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>✅ Autenticazione SAML Riuscita!</h1>
        {/* <div className="logout-buttons">
          <button className="logout-btn" onClick={onLogout}>
            🚪 Logout Completo (SAML)
          </button>
          <button className="logout-btn-simple" onClick={onSimpleLogout}>
            🔓 Logout Solo Locale
          </button>
        </div> */}
      </div>

      <div className="user-info-card">
        <h2>👤 Informazioni Utente</h2>
        <div className="user-details">
          <div className="user-field">
            <strong>ID:</strong> {user.id}
          </div>
          <div className="user-field">
            <strong>Nome:</strong> {user.name || "Non disponibile"}
          </div>
          <div className="user-field">
            <strong>Nome:</strong> {user.firstName || "Non disponibile"}
          </div>
          <div className="user-field">
            <strong>Cognome:</strong> {user.lastName || "Non disponibile"}
          </div>
          <div className="user-field">
            <strong>Email:</strong> {user.email || "Non disponibile"}
          </div>
          {user.groups && user.groups.length > 0 && (
            <div className="user-field">
              <strong>Gruppi:</strong> {user.groups.join(", ")}
            </div>
          )}
        </div>
      </div>

      <div className="saml-flow-info">
        <h3>🔄 Flusso SAML Completato</h3>
        <div className="flow-steps">
          <div className="step completed">
            <span className="step-number">1</span>
            <span className="step-text">
              Richiesta di autenticazione inviata a Entra ID
            </span>
          </div>
          <div className="step completed">
            <span className="step-number">2</span>
            <span className="step-text">Utente autenticato su Entra ID</span>
          </div>
          <div className="step completed">
            <span className="step-number">3</span>
            <span className="step-text">
              SAML Assertion ricevuta e validata
            </span>
          </div>
          <div className="step completed">
            <span className="step-number">4</span>
            <span className="step-text">Sessione utente creata</span>
          </div>
        </div>
      </div>

      <div className="raw-user-data">
        <h3>🔍 Dati Utente Completi (Debug)</h3>
        <pre className="json-display">{JSON.stringify(user, null, 2)}</pre>
      </div>
    </div>
  );
}

// Componente principale
function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Verifica lo stato di autenticazione al caricamento
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await axios.get("/api/user");
      if (response.data.authenticated) {
        setUser(response.data.user);
      }
    } catch (err) {
      console.error("Errore nel controllo autenticazione:", err);
      setError("Errore di connessione al server");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    // Mostra una modale di scelta del tipo di logout
    const logoutChoice = window.confirm(
      "Scegli il tipo di logout:\n\n" +
        "OK = Logout completo (da tutti i servizi Microsoft)\n" +
        "Annulla = Logout solo da questa app"
    );

    if (logoutChoice) {
      // Logout SAML completo (Single Logout)
      window.location.href = "/auth/saml/logout";
    } else {
      // Logout semplice (solo locale)
      handleSimpleLogout();
    }
  };

  const handleSimpleLogout = async () => {
    try {
      await axios.post("/auth/logout/simple");
      setUser(null);
      window.location.href = "/";
    } catch (error) {
      console.error("Errore durante il logout semplice:", error);
      // Fallback: ricarica la pagina
      window.location.reload();
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Verifica autenticazione in corso...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>⚠️ Errore</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>🔄 Riprova</button>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route
            path="/"
            element={user ? <Navigate to="/dashboard" /> : <LoginPage />}
          />
          <Route
            path="/dashboard"
            element={
              user ? (
                <Dashboard
                  user={user}
                  onLogout={handleLogout}
                  onSimpleLogout={handleSimpleLogout}
                />
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
