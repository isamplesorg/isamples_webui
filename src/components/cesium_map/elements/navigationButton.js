import { render } from "react-dom";
import info from "../../../images/NavigationHelp/info.svg";
import colorbind from "../utilities";

/**
 * A function component to return a new legend button.
 */
const InformationButton = () => {

  function toggle() {
    const legend = document.getElementById('legend');
    if (legend.classList.contains("cesium-navigation-help-visible")) {
      document.getElementById('legend').classList.remove('cesium-navigation-help-visible')
    } else {
      document.getElementById('legend').classList.add('cesium-navigation-help-visible')
    }
  }

  return (
    <span className="cesium-navigationHelpButton-wrapper">
      <button className="cesium-button cesium-toolbar-button cesium-navigation-help-button"
        onClick={() => toggle()}>
        <img src={info} alt="informatioin icon"></img>
      </button>
      <div id="legend"
        className="cesium-navigation-help"
        style={{ minWidth: "200px" }}>
        <div className="cesium-click-navigation-help cesium-navigation-help-instructions cesium-click-navigation-help-visible">
          <table>
            <tbody>
              <tr>
                <td>
                  <svg style={{ color: 'white' }} xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" className="bi bi-alt" viewBox="0 0 16 16">
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
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32">
                    <rect width="32" height="32" style={{ fill: colorbind[0] }} />
                  </svg>
                </td>
                <td>
                  <div className="cesium-navigation-help-details" style={{ fontSize: 12 }}>Overlapped Records &gt; 50</div>
                </td>
              </tr>
              <tr>
                <td>
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32">
                    <rect width="32" height="32" style={{ fill: colorbind[1] }} />
                  </svg>
                </td>
                <td>
                  <div className="cesium-navigation-help-details" style={{ fontSize: 12 }}>Overlapped Records &gt; 40</div>
                </td>
              </tr>
              <tr>
                <td>
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32">
                    <rect width="32" height="32" style={{ fill: colorbind[2] }} />
                  </svg>
                </td>
                <td>
                  <div className="cesium-navigation-help-details" style={{ fontSize: 12 }}>Overlapped Records &gt; 30</div>
                </td>
              </tr>
              <tr>
                <td>
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32">
                    <rect width="32" height="32" style={{ fill: colorbind[3] }} />
                  </svg>
                </td>
                <td>
                  <div className="cesium-navigation-help-details" style={{ fontSize: 12 }}>Overlapped Records &gt; 20</div>
                </td>
              </tr>
              <tr>
                <td>
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32">
                    <rect width="32" height="32" style={{ fill: colorbind[4] }} />
                  </svg>
                </td>
                <td>
                  <div className="cesium-navigation-help-details" style={{ fontSize: 12 }}>Overlapped Records &gt; 10</div>
                </td>
              </tr>
              <tr>
                <td>
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32">
                    <rect width="32" height="32" style={{ fill: colorbind[5] }} />
                  </svg>
                </td>
                <td>
                  <div className="cesium-navigation-help-details" style={{ fontSize: 12 }}>Overlapped Records &lt;= 10</div>
                </td>
              </tr>
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
  const viewButton = document.querySelector("div.cesium-viewer-bottom")
  render("", viewButton);
}
