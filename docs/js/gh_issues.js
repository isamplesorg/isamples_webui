/**
 * Module for interacting with GH issues for records
 */

//import { request } from "@octokit/request";
import { request } from "https://cdn.skypack.dev/@octokit/request";


export class GitHubIssues {

    constructor( authId ) {
        this.authId = authId;
        this._token = null;
        this.orgname = "isamplesorg";
        this.repo = "metadata";
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

    issueTitleForId(identifier) {
        return `Core-Record:${identifier}`;
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
}
