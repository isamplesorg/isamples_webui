import { useState } from "react";

const GenerateDraft = (props) => {
  const [n, setN] = useState(1);
  const { data } = props;
  const handleChange = (event) => {
    const { value, min, max } = event.target;

    setN(Math.max(min, Math.min(value, max)))
  }

  const handleDownload = () => {
    const { datacite_metadata, ...rest } = data;
    for (let i = 1; i < n + 1; i++) {
      let element = document.createElement("a");
      element.setAttribute("href", "data:application/csv;charset=utf-8," + encodeURIComponent(JSON.stringify(datacite_metadata, null, "\t")));
      element.setAttribute("download", `template${i}.json`);

      element.style.display = "none";
      document.body.appendChild(element);

      element.click();
      document.body.removeChild(element);
    }
  }

  return (
    <div className="panel panel-default">
      <div className="panel-heading"><h2 className="panel-title">Generate Draft</h2></div>
      <div className="panel-body">
        <div className="draft__container">
          <input type='number' min={1} max={1000} onChange={handleChange} value={n} />
          <button className="btn btn-default" onClick={handleDownload}>Download</button>
        </div>
      </div>
    </div>
  )
}

export {
  GenerateDraft
}
