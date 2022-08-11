import { render } from "react-dom";
import info from "images/NavigationHelp/info.svg";
import reset from "images/NavigationHelp/reset.png";
import { colorbind, source } from "fields";


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
const InformationButton = (props) => {

  const toggle = () => {
    const legend = document.getElementById('legend');
    if (legend.classList.contains("cesium-navigation-help-visible")) {
      legend.classList.remove('cesium-navigation-help-visible')
    } else {
      legend.classList.add('cesium-navigation-help-visible')
    };
  };

  const facet = props.facet || source;

  return (
    <>
      <button className="cesium-button cesium-toolbar-button cesium-navigation-help-button"
        onClick={toggle}>
        <img src={info} alt="informatioin icon"></img>
      </button>
      <div id="legend"
        className="cesium-navigation-help"
        style={{ minWidth: "200px" }}>
        <div className="cesium-click-navigation-help-visible">
          <table className="cesium-navigation-help-instructions" >
            <tbody style={{ height: "400px", overflow: "auto", display: "block", border: "white solid 1px" }}>
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
                  <img src="./cesium/Widgets/Images/NavigationHelp/MouseLeft.svg" width="40" height="40" alt="Mouseleft"></img>
                </td>
                <td>
                  <div className="cesium-navigation-help-pan">Copy Identifier</div>
                  <div className="cesium-navigation-help-details" style={{ fontSize: 12 }}>
                    Left click to copy identifier
                  </div>
                </td>
              </tr>
              {facet.map((e, i) => (Labels(i, colorbind[i], e)))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

/**
 * a refresh button component
 * @param {*} props a variable to contain all required information
 */
export const RefreshButton = (props) => {
  const { viewer, refresh } = props;
  return (
    <button className="cesium-button cesium-toolbar-button cesium-navigation-help-button"
      onClick={() => refresh(viewer.currentView.latitude, viewer.currentView.longitude)}>
      <img src={reset} alt="informatioin icon" width="24" height="24" ></img>
    </button>
  );
}

/**
 * A function to add legend button into the Cesium map toolbar
 */
export function addButton(facet, SpatialViewer, refresh) {
  const toolbar = document.querySelector("div.cesium-viewer-toolbar")

  if (document.querySelector("span#isamples-legend") === null) {
    // react render will overwrite the content in the container
    // So, we need a temporary container
    const infoButton = document.createElement("span");
    infoButton.className = "cesium-navigationHelpButton-wrapper";
    infoButton.id = "isamples-legend";
    toolbar?.appendChild(infoButton);
    render(<InformationButton facet={facet} />, infoButton);
  } else {
    const infoButton = document.querySelector("span#isamples-legend");
    render(<InformationButton facet={facet} />, infoButton);
  }


  // add refresh button
  const viewer = document.querySelector("div.cesium-viewer");
  const refreshButton = document.createElement("span");
  refreshButton.className = "cesium-navigationHelpButton-wrapper Cesium-refresh";
  viewer?.insertBefore(refreshButton, viewer.firstChild.nextSibling);
  render(<RefreshButton viewer={SpatialViewer} refresh={refresh} />, refreshButton);
}
