/**
 * Class that manages the config for the annotation tool that is given
 */
export class AnnotationTool {
    
    constructor (tool) {
        this.tool = tool; 
        this.searchURL = ""; // endpoint for searching an annotation
        this.baseURL = ""; // endpoint for creating, deleting, updating an annotation
        this.initializeURL();
    }

    /**
     * Initialze the URL endpoints based on the tool given
     */
    initializeURL () {
        let _this = this; 
        switch(this.tool){
            case "hypothesis":
                _this.searchURL = "https://api.hypothes.is/api/search?";
                _this.baseURL = "https://api.hypothes.is";
                break;
            default:
        }
    }
    
    get getBaseUrl () {
        return this.baseURL;
    }

    get getSearchUrl() {
        return this.searchURL;
    }
}