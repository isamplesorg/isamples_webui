import { useState } from "react";
import {
  DOIFIELDS_REQUIRED,
  DOIFIELDS_RECOMMENDED,
  DOIFIELDS_OPTIONAL
} from "pages/DOIfields";
import 'css/DOIs.css'

function DOIs() {
  const [inputs, setInputs] = useState({});

  // Handle textarea content
  const handleChange = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setInputs(values => ({ ...values, [name]: value }))
  }

  // Handle submit form
  const handleSubmit = (event) => {
    console.log(inputs);
    event.preventDefault();
  }

  // Clear all inputs
  const handleClear = () => {
    setInputs({});
  }

  return (
    <>
      <form className="form__container" onSubmit={handleSubmit}>
        <div className="panel panel-default">
          <div className="panel-heading"><h2 className="panel-title">Required Fields</h2></div>
          <div className="panel-body">
            <ul>
              {DOIFIELDS_REQUIRED.map((field, i) => (
                <li key={i}>
                  <label className="label__input" htmlFor={field}>{field}</label>
                  <textarea
                    name={field}
                    type="text"
                    onChange={handleChange}
                    value={inputs[field] || ""}
                    required>
                  </textarea>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="panel panel-default">
          <div className="panel-heading"><h2 className="panel-title">Recommended Fields</h2></div>
          <div className="panel-body">
            <ul>
              {DOIFIELDS_RECOMMENDED.map((field, i) => (
                <li key={i}>
                  <label className="label__input" htmlFor={field}>{field}</label>
                  <textarea
                    name={field}
                    type="text"
                    onChange={handleChange}
                    value={inputs[field] || ""}>
                  </textarea>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="panel panel-default">
          <div className="panel-heading"><h2 className="panel-title">Optional Fields</h2></div>
          <div className="panel-body">
            <ul>
              {DOIFIELDS_OPTIONAL.map((field, i) => (
                <li key={i}>
                  <label className="label__input" htmlFor={field}>{field}</label>
                  <textarea
                    name={field}
                    type="text"
                    onChange={handleChange}
                    value={inputs[field] || ""}>
                  </textarea>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="btn__group">
          <input className="btn btn-default" type="button" value='Clear' onClick={handleClear} />
          <input className="btn btn-default" type="Submit" />
        </div>
      </form>
    </>
  )
}

export default DOIs;
