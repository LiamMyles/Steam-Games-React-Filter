import React from "react"
import ReactDOM from "react-dom"
import registerServiceWorker from "./registerServiceWorker"
import "./index.css"

import SteamGames from "./components/SteamGames/SteamGames"

ReactDOM.render(
  <SteamGames gamesFetchUrl="./data/steam-games-with-names.json" />,
  document.getElementById("root")
)
registerServiceWorker()
