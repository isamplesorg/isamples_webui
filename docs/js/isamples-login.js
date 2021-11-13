import { html, css, LitElement } from 'lit';

/**
 * Implements UI element to trigger an OAuth workflow.
 * 
 * Credentials are stored in the browser secure storage if
 * available, and loaded from that location if present.
 * 
 * Emits an event "credentials-changed" when a login
 * or logout is successful.
 * 
 * This component requires a server side action to handle
 * the OAuth workflow. 
 * 
 * 1. This component opens a new window from the server authService
 * 2. The user completes the OAuth workflow
 * 3. The server updates the window with the login details
 * 4. The window sends auth details in a message back to this window
 * 
 */
export class ISamplesLogin extends LitElement {
  static get styles() {
    return css`
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

  /**
   * Load credentials from the Browser secure store.
   * 
   * Only works in a secure context (i.e. page loaded over https)
   */
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
        console.warn(`Error reading credentials: ${err}`);
      });
  }

  /**
   * Request to store credentials in the Browser secure storage location.
   * 
   * Only works in a secure context (i.e. page loaded over https)
   */
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
        console.warn(`Error storing creds: ${err}`);
      });
  }

  /**
   * Send a "credentials-changed" event.
   * 
   * The detail property contains a boolean indicating
   * if the state is authenticated (i.e. login was successful)
   * or not.
   */
  notifyCredentialsChanged() {
    const e = new CustomEvent("credentials-changed", {
      detail: {authenticated: this.authenticated},
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(e);
  }

  /**
   * Handles the required "auth-info" message response from the authentication window.
   * 
   * @param {*} event 
   */
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

  /**
   * Get the token.
   * 
   * @returns The authentication token that may be used by other services
   */
  getToken() {
    return this._token;
  }

  /**
   * Initiates the login process by opening a new window at the authService location.
   * 
   * The opened window handles the authentication workflow and ultimately
   * sends an "auth-info" message back to this window which is handled by
   * this._handleAuthenticationMessage to get the crednetials.
   * 
   * @param {*} event 
   */
  initiateLogin(event) {
    window.open(
      this.authService,
      '_blank',
      `width=480,height=640,left=${event.screenX},top=${event.screenY}`
    );
  }

  /**
   * Logout by discarding the credentials.
   * 
   * A "credentials-changed" event is triggered.
   */
  logout() {
    this._token = null;
    this.username = '';
    if (this.authenticated) {
      this.authenticated = false;
      this.notifyCredentialsChanged();  
    }
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