import { html, css, LitElement } from 'lit';

export class ISamplesLogin extends LitElement {
  static get styles() {
    return css`
      :host {
        display: block;
        padding: 25px;
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
    };
  }

  constructor() {
    super();
    this.authenticated = false;
    this.username = '';
    this.error = '';
    this.authService = '';
    this._clientid = null;
    this._token = null;
  }

  connectedCallback() {
    super.connectedCallback();
    this.loadCredentials();
    window.addEventListener('message', this._handleAuthenticationMessage)
  }

  disconnectedCallback() {
    window.removeEventListener('message', this._handleAuthenticationMessage)
    super.disconnectedCallback();
  }

  loadCredentials() {
    navigator.credentials
      .get({ password: true, mediation: 'optional' })
      .then(cred => {
        // console.log(`CRED = ${cred.password}`);
        this._token = cred.password;
        this.username = cred.id;
        this.authenticated = true;
        this.notifyCredentialsChanged();
      })
      // eslint-disable-next-line no-unused-vars
      .catch(err => {
        // console.log(`Error reading credentials: ${err}`);
      });
  }

  storeCredentials() {
    // eslint-disable-next-line no-undef
    const cred = new PasswordCredential({
      id: this.username,
      password: this._token,
    });
    navigator.credentials
      .store(cred)
      .then(() => {
        // console.log(`CREDS = ${cred.id}`);
        // console.log(`CREDS = ${cred.password}`);
      })
      // eslint-disable-next-line no-unused-vars
      .catch(err => {
        // console.log(`Error storing creds: ${err}`);
      });
  }

  notifyCredentialsChanged() {
    const e = new CustomEvent("credentials-changed", {
      detail: {authenticated: this.authenticated},
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(e);
  }

  _handleAuthenticationMessage = (event) => {
    if (event.data.name === "auth-info") {
      if (event.data.info.token !== undefined) {
        this._token = event.data.info.token;
        this.username = event.data.info.login;
        this.authenticated = true;
        this.notifyCredentialsChanged();
      }
    }
  }

  getToken() {
    return this._token;
  }

  initiateLogin(event) {
    window.open(
      this.authService,
      '_blank',
      `width=480,height=640,left=${event.screenX},top=${event.screenY}`
    );
  }

  logout() {
    this._token = null;
    this.username = '';
    this.authenticated = false;
    this.notifyCredentialsChanged();
  }

  render() {
    if (this.authenticated) {
      return html`
        <button @click=${this.logout}>Logout ${this.username}</button>
      `;
    }
    return html` <button @click=${this.initiateLogin}>GitHub Login</button> `;
  }
}

window.customElements.define('isamples-login', ISamplesLogin)