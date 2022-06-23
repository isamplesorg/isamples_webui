import Cookies from 'universal-cookie';
import {
  useState
} from "react";
import {
  DOIFIELDS_REQUIRED,
  DOIFIELDS_RECOMMENDED,
  ISAMPLES_RECOMMENDED
} from "fields";
import 'css/DOIs.css';

const MIN_DRAFT = 1;
const MAX_DRAFT = 100;

// initialize all recommend fileds
const recommended_fields = [
  ...Object.keys(ISAMPLES_RECOMMENDED).filter((field) => Object.keys(ISAMPLES_RECOMMENDED[field]).includes('description')),
  ...Object.keys(DOIFIELDS_RECOMMENDED).filter((field) => Object.keys(DOIFIELDS_RECOMMENDED[field]).includes('description'))]
const recommended_info = {}
recommended_fields.forEach((field) => recommended_info[field] = false);

function DOIs() {
  const cookie = new Cookies();
  // State for form inputs
  const [inputs, setInputs] = useState({});

  // State for fields information box
  const [info, setInfo] = useState({
    'num_drafts': 1,
    ...recommended_info
  });

  // State for if schema is collapse
  const [collapse, setCollapse] = useState({});

  // State for loading
  const [loading, setLoading] = useState(false);

  // Generate data json sent to the endpoints
  const json_dict = () => {
    const { suffix, titles, creators, num_drafts, ...fields } = inputs;
    return {
      'orcid_id': cookie.get('orcid'),
      "num_drafts": suffix ? 1 : (num_drafts || MIN_DRAFT),
      'datacite_metadata': {
        'data': {
          'type': 'dois',
          'attributes': {
            'doi': suffix ? `${window.config.datacite_prefix}/${suffix}` : undefined,
            'prefix': window.config.datacite_prefix,
            'suffix': suffix ? suffix : undefined,
            'types': {
              'resourceTypeGeneral': 'PhysicalObject',
            },
            'creators': [
              creators
            ],
            'titles': [
              {
                'title': titles
              }
            ],
            'publisher': window.config.datacite_publisher[0],
            ...fields
          }
        }
      }
    }
  }

  // Handle textarea content
  const handleChange = (event) => {
    const name = event.target.name;
    let value = event.target.value;

    // limit the checkbox
    if (name === 'num_drafts') {
      setInputs(values => ({ ...values, [name]: Math.max(MIN_DRAFT, Math.min(+value, MAX_DRAFT)) }));
      return;
    }

    // Check if the field's value is number
    if (!isNaN(parseFloat(value)) && isFinite(value)) {
      value = +value;
      setInputs(values => ({ ...values, [name]: value }));
      return;
    }
    setInputs(values => ({ ...values, [name]: !value.trim() ? undefined : value }));
  }

  // Handle submit form
  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(!loading)
    // fetch the identifiers from endpoints
    fetch(`${window.config.dois_draft}`, {
      'method': 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': cookie.get('access_token'),
      },
      'body': JSON.stringify(json_dict())
    })
      .then((res) => {
        // check the POST return status
        const { status } = res;
        if (status === 200) {
          return res.json();
        }
        throw new Error(res.json());
      })
      .then((result) => {
        alert("Successful created DOI(s) \nDownloading Record(s)");
        downloadDraft(result);
      },
        (error) => {
          alert("Failled to create DOI(s)");
        }
      )
      .finally(() => {
        setLoading(false)
      })
  }

  // a function to generate draft file based on returned identifiers
  const downloadDraft = (identifiers) => {
    const { datacite_metadata } = json_dict();

    const output = identifiers.map((identifier) => ({ identifier, ...datacite_metadata }));

    let element = document.createElement("a");
    element.setAttribute("href", "data:application/csv;charset=utf-8," + encodeURIComponent(JSON.stringify(output, null, "\t")));
    element.setAttribute("download", `template.json`);

    element.style.display = "none";
    document.body.appendChild(element);

    element.click();
    document.body.removeChild(element);
  }

  // Clear all inputs
  const handleClear = () => {
    setInputs({});
  }

  // Toggle function for schemas
  const toggle = (event) => {
    const name = event.target.getAttribute('name');
    setInfo({ ...info, [name]: !info[name] });
  }

  // Handle the required field inputs
  const inputGroupRequired = (field) => {
    if (field === 'suffix') {
      return <input name={field} type="text" onChange={handleChange} value={inputs[field] || ""} />
    }

    // Check if the fields have initial values.
    if (Object.keys(DOIFIELDS_REQUIRED[field]).includes('value')) {
      if (DOIFIELDS_REQUIRED[field]['type'] === 'string') {
        return <input name={field} type="text" disabled value={DOIFIELDS_REQUIRED[field]['value']} />
      } else if (DOIFIELDS_REQUIRED[field]['type'] === 'array') {
        const value = DOIFIELDS_REQUIRED[field]['value'];
        return (
          <>
            {
              value.length > 1 ?
                <select name={field} onChange={handleChange} required>
                  <option></option>
                  {value.map((v, i) => (
                    <option key={i} value={v}>{v}</option>
                  ))}
                </select>
                :
                <input name={field} type="text" disabled value={DOIFIELDS_REQUIRED[field]['value'][0]} />
            }
          </>
        )
      }
    }

    // check the type of fields
    if (DOIFIELDS_REQUIRED[field]['type'] === 'number') {
      return <input name={field} type="number" min="0" onChange={handleChange} value={inputs[field] || ""} required />
    }
    return <input name={field} type="text" onChange={handleChange} value={inputs[field] || ""} required />
  }

  // Handle recommended field input
  const inputGroupRecommended = (schema, field, required) => {
    if (schema[field]['type'] === 'number') {
      return <input name={field} type="number" min="0" onChange={handleChange} value={inputs[field] || ""} required={required} />
    }

    if (Object.keys(schema[field]).includes('items')) {
      return <select name={field} onChange={handleChange} required={required}>
        <option></option>
        {
          schema[field]['items'].map((option, i) => (
            <option key={i} value={option}>{option}</option>
          ))
        }
      </select>
    }

    if (schema[field]['type'] === 'string') {
      return <textarea name={field} onChange={handleChange} value={inputs[field] || ""} required={required} />
    }

    return <input name={field} type="text" onChange={handleChange} value={inputs[field] || ""} required={required} />
  }

  // Create bootstrap pane box fpr each inputs
  const createInputsGroup = (schema, heading, required) => {
    return (
      <div className="panel panel-default">
        <div className="panel-heading" onClick={() => { setCollapse({ ...collapse, [heading]: !collapse[heading] }) }}>
          <h3 className="panel-title">{heading}
            <span className={collapse[heading] ? 'glyphicon glyphicon-collapse-up' : 'glyphicon glyphicon-collapse-down'} />
          </h3>
        </div>
        <div className="panel-body" style={{ display: collapse[heading] ? 'block' : 'none' }}>
          <ul>
            {Object.keys(schema).map((field, i) => (
              <li key={i}>
                <label className="label__input" htmlFor={field}>{field.charAt(0).toUpperCase() + field.slice(1)}
                  {Object.keys(schema[field]).includes('description') ?
                    <>
                      <span
                        onMouseOver={toggle}
                        onMouseOut={toggle}
                        className="span__info glyphicon glyphicon-info-sign"
                        name={field} />
                      <div className={info[field] ? "form__popbox form_popbox--show" : "form__popbox"}>
                        {schema[field]['description']}
                      </div>
                    </> : null}</label>
                {inputGroupRecommended(schema, field, required)}
              </li>
            ))}
          </ul>
        </div>
      </div>
    )
  }

  return (
    <div className="dois__container">
      <form className="form__container" onSubmit={handleSubmit}>
        <div className="panel panel-default">
          <div className="panel-heading"><h2 className="panel-title">Required Fields</h2></div>
          <div className="panel-body">
            <ul>
              {Object.keys(DOIFIELDS_REQUIRED).map((field, i) => (
                <li key={i}>
                  <label className="label__input" htmlFor={field}>{field.charAt(0).toUpperCase() + field.slice(1)}</label>
                  {inputGroupRequired(field)}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="panel panel-default">
          <div className="panel-heading"><h2 className="panel-title">Recommended Fields</h2></div>
          {createInputsGroup(ISAMPLES_RECOMMENDED, "iSample Schema", false)}
          {createInputsGroup(DOIFIELDS_RECOMMENDED, "DOIs Schema", false)}
        </div>
        <div className="panel panel-default">
          <div className="panel-heading"><h2 className="panel-title">Number of Draft</h2></div>
          <div className="panel-body">
            <div className="draft__container">
              <label className="label__input" htmlFor="draft">Range: 1 - 100</label>
              <input name='num_drafts' type='number' onChange={handleChange} value={inputs['num_drafts'] || 1} />
            </div>
          </div>
        </div>
        <div className="btn__group">
          <input className="btn btn-default" type="button" value='Clear' onClick={handleClear} />
          <input className="btn btn-default" type="Submit" />
        </div>
      </form>
      <div>
        <textarea className='textarea__json' value={JSON.stringify(json_dict(), null, "\t")} readOnly />
      </div>
      <div style={{ display: loading ? "block" : "none" }}>
        <div className="background-spinner"></div>
        <div className="lds-spinner">
          <div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
        </div>
      </div>
    </div>

  )
}

export default DOIs;
