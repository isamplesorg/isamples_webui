import { AnnotationTool } from "./annotation_tool";

/**
 * Describes a class to manage annotation
 */
export class Annotation {
    constructor(tool, auth_token) {
        this.annot_tool = new AnnotationTool(tool);
        this.auth_token = auth_token; 
    }
    
    /**
     * Get the annotation information by the annotation id 
     * @param {*} ID annotation id 
     * @returns json response of the annotation 
     */
    async getAnnotByID(ID) {
        const url = new URL(`api/annotations/${ID}`, this.annot_tool.baseURL);
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${this.auth_token}`
            },
        })
        return response.json();
    }

    /**
     * Get the annotation information associated to a specific record
     * @param {*} recordID record identifier
     * @returns json response of the annotation 
     */
    async getAnnotByRecordID(recordID) {
    
        let url = new URL(this.annot_tool.searchURL)
        url.searchParams.append('uri', encodeURI(recordID));
        url.searchParams.append('tag', 'iSamples');
        url = decodeURIComponent(url);
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${this.auth_token}`
            },
        })
        return response.json();
    }

    /**
     * Get the annotation information associated by user id that was made in iSamples
     * @param {*} userID user account
     * @returns json response of list of annotations
     */
    async getAnnotByUserID(userID) {
        const url = new URL(this.annot_tool.searchURL)
        url.searchParams.append('user', userID);
        url.searchParams.append('tag', 'iSamples');

        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${this.auth_token}`
            },
        })
        return response.json();
    }


    /**
     * Get the list of all annotations of iSamples 
     * @returns json response of list of annotations
     */
    async getAllAnnotations() {
        const url = new URL(this.annot_tool.searchURL)
        url.searchParams.append('tag', 'iSamples');

        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${this.auth_token}`
            }
        })
        return response.json();
    }

    /**
     * Create an annotation with the given content to the record 
     * @param {*} content text field of annotation
     * @param {*} recordID record id of the record
     * @returns 
     */
    async postAnnotation(content, recordID) {

        const data = {
            uri : recordID,
            text: content,
            tags: ["iSamples"] // marker for isamples annotation
        }

        const url = new URL("api/annotations",this.annot_tool.baseURL);
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${this.auth_token}`
            },
            body: JSON.stringify(data)
        });
        return response.json();
    }

    /**
     * Update content of an annotation
     * @param {*} content 
     * @param {*} ID annotation id 
     */
    async updateAnnotation(content, ID) {
        const data = {
            uri : ID,
            text: content
        }

        const url = new URL(`api/annotations/${ID}`, this.annot_tool.baseURL);
        const response = await fetch(url, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${this.auth_token}`
            },
            body: JSON.stringify(data)
        });
        return response.json();
    }

    /**
     * Delete the annotation of given record id 
     * @param {*} ID 
     */
    async deleteAnnotation (ID) {
        const url = new URL(`api/annotations/${ID}`, this.annot_tool.baseURL);
        const response = await fetch(url, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${this.auth_token}`
            }
        });
        return response.json();
    }

    /**
     * Hide the group's annotation with the given ID
     * This requires the user to have moderator permission to hide the annotation
     * @param {*} ID 
     */
    async hideGroupAnnotation (ID) {
        const url = new URL(`api/annotations/${ID}/hide`, this.annot_tool.baseURL);
        await fetch(url, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${this.auth_token}`
            }
        });
    }

     /**
     * Delete the group's annotation with the given ID
     * This requires the user to have moderator permission to delete the annotation
     * @param {*} ID 
     */
     async deleteGroupAnnotation (ID) {
        const url = new URL(`api/annotations/${ID}/hide`, this.annot_tool.baseURL);
        await fetch(url, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${this.auth_token}`
            }
        });
    }


}

