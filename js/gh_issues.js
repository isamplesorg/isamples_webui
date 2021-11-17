import "./chunk-XVZR6UTJ.js";

// src/js/gh_issues.js
import { request } from "https://cdn.skypack.dev/@octokit/request";
var GitHubIssues = class {
  constructor(authId) {
    this.authId = authId;
    this.orgname = "isamplesorg";
    this.repo = "metadata";
    this.user = "";
  }
  getToken() {
    const ele = document.getElementById(this.authId);
    if (ele !== void 0) {
      if (ele.authenticated) {
        return ele.getToken();
      }
    }
    return null;
  }
  async getUser() {
    const token = this.getToken();
    const user = await request("GET /user", {
      headers: {
        authorization: `token ${token}`
      }
    });
    this.user = user.data.login;
    return user.data;
  }
  issueTitleForId(identifier) {
    return `${identifier}`;
  }
  async findIssue(identifier) {
    const token = this.getToken();
    if (token === null) {
      console.error("Not authenticated!");
      return;
    }
    const title = this.issueTitleForId(identifier);
    let q = `${title} in:title type:issue repo:${this.orgname}/${this.repo}`;
    console.log(`Token: ${token}`);
    request("GET /search/issues", {
      headers: {
        authorization: `token ${token}`
      },
      q
    }).then((response) => {
      console.log(response);
    }).catch((error) => {
      console.error(error);
    });
  }
  async createIssue(identifier, bodyText, labels) {
    labels ??= [];
    const token = this.getToken();
    const userInfo = await this.getUser();
    console.log(userInfo);
    console.log(token);
    const issue = await request("POST /repos/{owner}/{repo}/issues", {
      headers: {
        Authorization: `token ${token}`
      },
      owner: this.orgname,
      repo: this.repo,
      title: this.issueTitleForId(identifier),
      body: bodyText,
      milestone: null,
      labels
    });
    return issue;
  }
};
export {
  GitHubIssues
};
