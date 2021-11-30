import {
  p,
  r,
  s
} from "./chunk-MQ2DMGPF.js";
import "./chunk-XVZR6UTJ.js";

// src/js/isamples-login.js
var ISamplesLogin = class extends s {
  static get styles() {
    return r`
      :host {
        display: block;
        padding: 0;
        color: var(--oauth-autho-text-color, #000);
      }
    `;
  }
  static get properties() {
    return {
      authService: { type: String },
      error: { type: String },
      username: { type: String },
      authenticated: { type: Boolean },
      persist: { type: Boolean }
    };
  }
  constructor() {
    super();
    this.authenticated = false;
    this.username = "";
    this.error = "";
    this.authService = "";
    this._clientid = null;
    this._token = null;
    this.persist = false;
  }
  connectedCallback() {
    super.connectedCallback();
    if (this.persist) {
      this.loadCredentials();
    }
    window.addEventListener("message", this._handleAuthenticationMessage);
  }
  disconnectedCallback() {
    window.removeEventListener("message", this._handleAuthenticationMessage);
    super.disconnectedCallback();
  }
  loadCredentials() {
    navigator.credentials.get({ password: true, mediation: "optional" }).then((cred) => {
      this._token = cred.password;
      this.username = cred.id;
      this.authenticated = true;
      this.notifyCredentialsChanged();
    }).catch((err) => {
      console.warn(`Error reading credentials: ${err}`);
    });
  }
  storeCredentials() {
    const cred = new PasswordCredential({
      id: this.username,
      password: this._token
    });
    navigator.credentials.store(cred).then(() => {
      console.log(`CREDS = ${cred.id}`);
      console.log(`CREDS = ${cred.password}`);
    }).catch((err) => {
      console.warn(`Error storing creds: ${err}`);
    });
  }
  notifyCredentialsChanged() {
    const e = new CustomEvent("credentials-changed", {
      detail: { authenticated: this.authenticated },
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(e);
  }
  _handleAuthenticationMessage = (event) => {
    if (event.data.name === "auth-info") {
      if (event.data.info.token !== void 0) {
        this._token = event.data.info.token;
        this.username = event.data.info.login;
        this.authenticated = true;
        if (this.persist) {
          this.storeCredentials();
        }
        this.notifyCredentialsChanged();
      }
    }
  };
  getToken() {
    return this._token;
  }
  initiateLogin(event) {
    window.open(this.authService, "_blank", `width=480,height=640,left=${event.screenX},top=${event.screenY}`);
  }
  logout() {
    this._token = null;
    this.username = "";
    if (this.authenticated) {
      this.authenticated = false;
      this.notifyCredentialsChanged();
    }
  }
  render() {
    if (this.authenticated) {
      return p`
        <button @click=${this.logout}>Logout ${this.username}</button>
      `;
    }
    return p` <button @click=${this.initiateLogin}>GitHub Login</button> `;
  }
};
window.customElements.define("isamples-login", ISamplesLogin);
export {
  ISamplesLogin
};
