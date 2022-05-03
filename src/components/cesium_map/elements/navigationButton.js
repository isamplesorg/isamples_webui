import { render } from "react-dom";
import info from "../../../images/NavigationHelp/info.svg";
import { colorbind, source } from "../config_cesium";


const Labels = (id, color, text) =>
  <tr key={id}>
    <td>
      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40">
        <rect width="40" height="40" style={{ fill: color }} />
      </svg>
    </td>
    <td>
      <div className="cesium-navigation-help-details" style={{ fontSize: 15 }}>{text}</div>
    </td>
  </tr>;

/**
 * A function component to return a new legend button.
 */
const InformationButton = () => {

  function toggle() {
    const legend = document.getElementById('legend');
    if (legend.classList.contains("cesium-navigation-help-visible")) {
      legend.classList.remove('cesium-navigation-help-visible')
    } else {
      legend.classList.add('cesium-navigation-help-visible')
    };
  };

  return (
    <span className="cesium-navigationHelpButton-wrapper">
      <button className="cesium-button cesium-toolbar-button cesium-navigation-help-button"
        onClick={() => toggle()}>
        <img src={info} alt="informatioin icon"></img>
      </button>
      <div id="legend"
        className="cesium-navigation-help"
        style={{ minWidth: "200px" }}>
        <div className="cesium-click-navigation-help-visible">
          <table className="cesium-navigation-help-instructions">
            <tbody>
              <tr>
                <td>
                  <svg style={{ color: 'white' }} xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" className="bi bi-alt" viewBox="0 0 16 16">
                    <path d="M1 13.5a.5.5 0 0 0 .5.5h3.797a.5.5 0 0 0 .439-.26L11 3h3.5a.5.5 0 0 0 0-1h-3.797a.5.5 0 0 0-.439.26L5 13H1.5a.5.5 0 0 0-.5.5zm10 0a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 0-1h-3a.5.5 0 0 0-.5.5z" fill="white"></path>
                  </svg>
                </td>
                <td>
                  <div className="cesium-navigation-help-pan">Bounding Box</div>
                  <div className="cesium-navigation-help-details" style={{ fontSize: 12 }}>
                    ALT + Left click to draw
                  </div>
                </td>
              </tr>
              <tr>
                <td>
                  <img src="http://localhost:3000/cesium/Widgets/Images/NavigationHelp/MouseLeft.svg" width="40" height="40" alt="Mouseleft"></img>
                </td>
                <td>
                  <div className="cesium-navigation-help-pan">Copy Identifier</div>
                  <div className="cesium-navigation-help-details" style={{ fontSize: 12 }}>
                    Left click to copy identifier
                  </div>
                </td>
              </tr>
              {source.map((e, i) => (Labels(i, colorbind[i], e)))}
            </tbody>
          </table>
        </div>
      </div>
    </span>
  );
}

/**
 * A function to add legend button into the Cesium map toolbar
 */
export function addButton() {
  const toolbar = document.querySelector("div.cesium-viewer-toolbar")

  // react render will overwrite the content in the container
  // So, we need a temporary container
  const temp = document.createElement("span");
  toolbar.appendChild(temp);
  render(<InformationButton />, temp);
}
