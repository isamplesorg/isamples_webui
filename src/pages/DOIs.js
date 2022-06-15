import Cookies from 'universal-cookie';
import {
  useState
} from "react";
import {
  DOIFIELDS_REQUIRED,
  DOIFIELDS_RECOMMENDED
} from "fields";
import 'css/DOIs.css';

function DOIs() {
  const cookie = new Cookies();
  const [inputs, setInputs] = useState({});

  const json_dict = {
    'token': cookie.get('access_token'),
    'orcid_id': cookie.get('orcid'),
    'datacite_metadata': {
      'data': {
        'type': 'dois',
        'attributes': {
          'prefix': window.config.datacite_prefix,
          'types': {
            'resourceTypeGeneral': 'PhysicalObject',
          },
          ...inputs
        }
      }
    }
  }

  const inputGroupRequired = (field) => {
    if (typeof DOIFIELDS_REQUIRED[field] === 'string') {
      return <input name={field} type="text" disabled value={DOIFIELDS_REQUIRED[field]} />
    }

    if (typeof DOIFIELDS_REQUIRED[field] === 'number') {
      return <input name={field} type="number" min="0" onChange={handleChange} value={inputs[field] || new Date().getFullYear()} required />
    }
    return <input name={field} type="text" onChange={handleChange} value={inputs[field] || ""} required />
  }

  const inputGroupRecommended = (field) => {
    if (field.toLowerCase() === 'description') {
      return <textarea name={field} onChange={handleChange} value={inputs[field] || ""} />
    }

    if (Object.keys(DOIFIELDS_RECOMMENDED[field]).includes('items')) {
      return <select name={field} onChange={handleChange}>
        <option></option>
        {

          DOIFIELDS_RECOMMENDED[field]['items'].map((option, i) => (
            <option key={i} value={option}>{option}</option>
          ))
        }
      </select>
    }

    return <input name={field} type="text" onChange={handleChange} value={inputs[field] || ""} />
  }

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
          <div className="panel-body">
            <ul>
              {Object.keys(DOIFIELDS_RECOMMENDED).map((field, i) => (
                <li key={i}>
                  <label className="label__input" htmlFor={field}>{field.charAt(0).toUpperCase() + field.slice(1)}</label>
                  {inputGroupRecommended(field)}
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

      <div>
        <textarea className='textarea__json' value={JSON.stringify(json_dict, null, "\t")} readOnly />
      </div>
    </div>
  )
}

export default DOIs;
