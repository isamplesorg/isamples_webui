/**
 * Settings for the application
 *
 * The isamples API service endpoint
 * for production is "https://mars.cyverse.org"
 */

export const settings = {
    // The main API service endpoint
    serviceEndpoint: 'https://mars.cyverse.org',
    //serviceEndpoint: 'http://localhost:8000',

    // Default Solr query
    defaultQuery: '*:*',

    // Configuration for the records view
    records: {

        // Height of the table div
        tableHeight: '40vh',

        // Number of records to retrieve in a page
        pageSize: 100,

        // Columns to show in the table
        columns: [
            {title:"ID", field:"id"},
            {title:"Source", field:"source"},
            {title:"Label", field:"label"},
            {title:"hasContext...", field:"hasContextCategory"},
            {title:"hasMaterial...", field:"hasMaterialCategory"},
            {title:"hasSpecimen...", field:"hasSpecimenCategory"},
            {title:"Produced", field:"producedBy_resultTime"},
            {title:"Keywords", field:"keywords"},
        ],
    }
};
