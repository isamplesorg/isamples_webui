import React, { useEffect, useState, useRef } from "react";
import { solrQuery } from "solr-faceted-search-react";
import { store } from "redux/store";
import { CSVLink } from "react-csv";
import cx from "classnames";

const MAX_ROWS = 100000;

const CsvExport = (props) => {
  const { bootstrapCss } = props;
  const [isLoading, setIsLoading] = useState(false);
  const [collapse, setCollapse] = useState(false);
  const [downloadData, setDownloadData] = useState("");
  const [downloadStatus, setDownloadStatus] = useState("");
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

  const fetchCsvResult = async () => {
    const { query } = store.getState();
    const queryString = solrQuery.solrQuery({
      ...query,
      rows: formInfo.rows,
      start: formInfo.start
    }, { wt: "csv" });
    const API = `${query.url}?${queryString}`;

    setIsLoading(true);

    fetch(API).then(res => res.text()).then(res => {
      setDownloadData(res);
      setIsLoading(false);
      setDownloadStatus("Download SuccessFul!")
    },
      err => {
        setDownloadStatus("Download Failed!")
      })
  }

  const handleClick = () => {
    setCollapse(prev => !prev);
    setDownloadStatus("");
    setFormInfo(prev => ({ ...prev, rows: MAX_ROWS }))
  }

  const handleChange = (e) => {
    const id = e.target.getAttribute("name");
    const { value } = e.target;

    let newValue = +value;
    if (+value > MAX_ROWS && id === 'rows') {
      newValue = +MAX_ROWS;
    }

    if (id === 'start' && +value > store.getState()['results']['numFound']) {
      newValue = +store.getState()['results']['numFound'];
    }

    setFormInfo(prev => ({ ...prev, [id]: newValue }))
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchCsvResult();
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
        Export csv
      </button>

      <form className={"csv__choice" + (collapse ? " active" : "")} onSubmit={handleSubmit}>
        <div>
          <label>
            Start:
          </label>
          <input
            name="start"
            type='number'
            min={0}
            max={store.getState()['results']['numFound']}
            onChange={handleChange}
            value={formInfo["start"]}
          />
        </div>
        <div>
          <label>
            Rows:
          </label>
          <input
            name="rows"
            type='number'
            min={0}
            max={MAX_ROWS}
            onChange={handleChange}
            value={formInfo["rows"] || MAX_ROWS} />
        </div>
        <span><span className="glyphicon glyphicon-info-sign"></span> &nbsp; Record limit: 100000</span>
        <div className="loadingExport" style={{ display: isLoading ? 'block' : "none" }}>
          <div className="loadingTrack bg-primary"></div>
        </div>
        {downloadStatus}
        <button type="submit" className="btn btn-default pull-right btn-xs">Download</button>
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
