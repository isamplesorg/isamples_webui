/**
 * Module for interacting with GH issues for records
 *
 * https://octokit.github.io/rest.js/v18
 */

//import { request } from "@octokit/request";
import { request } from "https://cdn.skypack.dev/@octokit/request";


export class GitHubIssues {

    constructor( authId ) {
        this.authId = authId;
        this.orgname = "isamplesorg";
        this.repo = "metadata";
        this.user = "";
    }

    getToken() {
        const ele = document.getElementById(this.authId);
        if (ele !== undefined) {
            if (ele.authenticated) {
                return ele.getToken();
            }
        }
        return null;
    }

    /**
     * https://docs.github.com/en/rest/reference/users
     *
     * @returns {Promise<*>}
     */
    async getUser() {
        const token = this.getToken();
        const user = await request('GET /user', {
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
            return
        }
        const title = this.issueTitleForId(identifier);
        let q = `${title} in:title type:issue repo:${this.orgname}/${this.repo}`;
        console.log(`Token: ${token}`);
        request('GET /search/issues', {
            headers: {
                authorization: `token ${token}`
            },
            q: q
        }).then(response => {
            console.log(response);
        }).catch(error => {
            console.error(error);
        })
    }

    /**
     * https://docs.github.com/en/rest/reference/issues#create-an-issue
     *
     * @param identifier
     * @param bodyText
     * @param labels
     * @returns {Promise<void>}
     */
    async createIssue(identifier, bodyText, labels) {
        // empty label list if not defined
        labels ??= [];
        const token = this.getToken();
        const userInfo = await this.getUser();
        console.log(userInfo);
        console.log(token);
        const issue = await request('POST /repos/{owner}/{repo}/issues', {
            headers: {
                Authorization: `token ${token}`
            },
            owner: this.orgname,
            repo: this.repo,
            title: this.issueTitleForId(identifier),
            body: bodyText,
            milestone: null,
            labels: labels,
        });
        return issue;
    }
}
