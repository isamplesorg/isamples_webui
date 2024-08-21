import React, { useEffect, useState, useRef } from "react";
import { solrQuery } from "solr-faceted-search-react";
import { store } from "redux/store";
import { CSVLink } from "react-csv";
import cx from "classnames";

const MAX_ROWS = 100000;

const CsvExport = (props) => {
  const { bootstrapCss } = props;
  const [collapse, setCollapse] = useState(false);
  const [downloadData, setDownloadData] = useState("");
  const [formInfo, setFormInfo] = useState({
    start: 0,
    rows: MAX_ROWS
  })
  const csvRef = useRef();

  // Generate filename based on the query parameters
  const filename = `${store.getState()['query']['searchFields']
    .filter(field => field.value)
    ?.map(field => field.value)
    .flat(2)
    .concat([formInfo.start, store.getState()['results']['numFound'] > formInfo.rows ? formInfo.rows : store.getState()['results']['numFound']])
    .map(e => {
      if (typeof e === "object") {
        return "bounding_box";
      }

      return e.toString().replace(/[^a-zA-Z0-9 ]/g, "");
    })
    .filter(word => word.length)
    .join("_")}.csv`;

  const formattedQueryParam = "'" + solrQuery.getQFQSolrQueryParamValues(store.getState()['query']).fq.split(',').join(' AND ') + "'";
  
  const handleClick = () => {
    setCollapse(prev => !prev);
    setFormInfo(prev => ({ ...prev, rows: MAX_ROWS }))
  }

  useEffect(() => {
    if (csvRef.current && downloadData) {
      csvRef.current.link.click();
    }

    return () => {
      setDownloadData("");
    }
  }, [downloadData])


  return (
    <>
      <button
        onClick={handleClick}
        className={cx({
          btn: bootstrapCss,
          "btn-default": bootstrapCss,
          "pull-right": bootstrapCss,
          "btn-xs": bootstrapCss
        })}>
        Export
      </button>
      <form className={"csv__choice" + (collapse ? " active" : "")} >
        <div>  <a href="https://github.com/isamplesorg/isamples_inabox/blob/develop/docs/export_service.md" target="_blank" rel="noopener noreferrer">query</a> : {formattedQueryParam} </div>
        <button
            className="btn btn-default"
            onClick={() => navigator.clipboard.writeText("-q " + formattedQueryParam || "") }>
            Copy query 
        </button>
      </form>

      <CSVLink
        data={downloadData}
        filename={filename}
        className='hidden'
        ref={csvRef}
        target='_blank'
      />
    </>
  );
}

export default CsvExport;
