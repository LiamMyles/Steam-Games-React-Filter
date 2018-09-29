import React from "react"

/**
 * Adjusts the text that displays for the playtime based on the
 * playtime passed to it. i.e. hours/Hour minutes/minute
 *
 * @param {this.props} {playTimeMinutes}
 * @returns
 */
const PlayTime = ({ playTimeMinutes }) => {
  const hours = Math.floor(playTimeMinutes / 60)
  const minutes = Math.floor(playTimeMinutes % 60)
  const hourText = hours === 1 ? "Hour" : "Hours"
  const minuteText = minutes === 1 ? "Minute" : "Minutes"
  return (
    <h3>
      {hours !== 0 ? `${hours} ${hourText}` : null}
      {hours !== 0 && minutes !== 0 ? ` and ` : null}
      {minutes !== 0 ? `${minutes} ${minuteText}` : null}
      {playTimeMinutes !== 0 ? " Played" : "No Play Time"}
    </h3>
  )
}
/**
 * Generates buttons for paging though content based on the props passed in
 *
 * @param {this.props} {previousPageFn, nextPageFn, currentPage, totalPages}
 */
const PaginationButtons = ({
  previousPageFn,
  nextPageFn,
  currentPage,
  totalPages
}) => {
  let buttonsStatus = { next: false, previous: false }
  if (totalPages === currentPage) {
    buttonsStatus.next = true
  }
  if (currentPage === 1) {
    buttonsStatus.previous = true
  }
  return (
    <div className="steam-games__pagination-buttons">
      <p>
        <strong>
          Current page is: {currentPage} out of{" "}
          {totalPages !== 0 ? totalPages : 1}
        </strong>
      </p>
      <div>
        <button
          onClick={previousPageFn}
          data-total-pages={totalPages}
          disabled={buttonsStatus.previous}
        >
          Previous Page
        </button>
        <button
          onClick={nextPageFn}
          data-total-pages={totalPages}
          disabled={buttonsStatus.next}
        >
          Next Page
        </button>
      </div>
    </div>
  )
}

/**
 * Generates a list of games
 *
 * @param {Array} gamesList steamGamesList
 * @param {String} imgPath
 * @param {String} imgType
 */
const SteamGamesList = ({ gamesList, imgPath, imgType }) => (
  <ul className="steam-games__games-list">
    {gamesList.map(({ appid, name, playtime_forever: playTime }) => (
      <li key={appid}>
        <h2>{name}</h2>
        <img
          src={`${imgPath}${appid}${imgType}`}
          alt=""
          width="460"
          height="215"
        />
        <PlayTime playTimeMinutes={playTime} />
        <a
          href={`https://store.steampowered.com/app/${appid}/`}
          target="_blank"
        >
          {`Check out ${name} on Steam`}
        </a>
      </li>
    ))}
  </ul>
)

/**
 * Displays checkboxes on the page for each item in the filterList
 * provided
 *
 * @param {this.props object} {filterList, onChangeFn}
 * @returns
 */
const FilterCheckboxes = ({ filterList, onChangeFn }) => {
  return (
    <React.Fragment>
      {filterList.length !== 0 ? (
        <ul>
          {filterList.map(
            (
              { start, end, isChecked, isUnplayed, filteredGameCount },
              index
            ) => {
              const key = `${start + end}-${index}`
              const startHours = Math.round(start / 60)
              const endHours = Math.round(end / 60)
              let labelText = `${startHours} to ${endHours} hours (${filteredGameCount})`
              if (isUnplayed) {
                labelText = `Unplayed Games (${filteredGameCount})`
              } else if (end === 0) {
                labelText = `${startHours} to less than 1 hour (${filteredGameCount})`
              }
              return (
                <li key={key}>
                  <label htmlFor={key}>{labelText}</label>
                  <input
                    id={key}
                    type="checkbox"
                    onChange={onChangeFn}
                    data-index={index}
                    checked={isChecked}
                  />
                </li>
              )
            }
          )}
        </ul>
      ) : null}
    </React.Fragment>
  )
}

/**
 * JSX for ordering radio buttons
 *
 * @param {function} { onChangeFn }
 */
const OrderRadioButtons = ({ onChangeFn }) => (
  <div className="steam-games__order-list">
    <div>
      <label htmlFor="order-most-time">Order by Most Played</label>
      <input
        type="radio"
        name="order"
        value="most-time"
        id="order-most-time"
        onChange={onChangeFn}
      />
    </div>
    <div>
      <label htmlFor="order-least-time">Order by Least Played</label>
      <input
        type="radio"
        name="order"
        value="least-time"
        id="order-least-time"
        onChange={onChangeFn}
      />
    </div>
    <div>
      <label htmlFor="order-alphabetical">Order Alphabetically</label>
      <input
        name="order"
        type="radio"
        value="alphabetical"
        id="order-alphabetical"
        onChange={onChangeFn}
      />
    </div>
    <div>
      <label htmlFor="order-default">No Order</label>
      <input
        name="order"
        type="radio"
        value="default"
        id="order-default"
        onChange={onChangeFn}
      />
    </div>
  </div>
)
/**
 * All options and the filtering menu
 *
 * @param {*} {
 *   collapsedData,
 *   totalGames,
 *   filteredGamesCount,
 *   playtimeFilters,
 *   toggleFiltersFn,
 *   updatePlaytimeFilterFn,
 *   updateSearchTextFn,
 *   updateOrderFn
 * }
 */
const FilterMenu = ({
  collapsedData,
  totalGames,
  filteredGamesCount,
  playtimeFilters,
  toggleFiltersFn,
  updatePlaytimeFilterFn,
  updateSearchTextFn,
  updateOrderFn
}) => (
  <React.Fragment>
    <div className="steam-games__filter-header">
      <h2 id="steamGamesFilterList">Filter Group</h2>
      <button onClick={toggleFiltersFn}>{collapsedData.buttonText}</button>
    </div>
    <div
      className={`steam-games__filter-options ${
        collapsedData.filterOptionsClass
      }`}
      role="group"
      aria-labelledby="steamGamesFilterList"
    >
      <h3>
        Displaying {totalGames} Out of {filteredGamesCount} Games
      </h3>
      <FilterCheckboxes
        filterList={playtimeFilters}
        onChangeFn={updatePlaytimeFilterFn}
      />
      <div className="steam-games__filter-search">
        <label htmlFor="gamesSearchBox">Search Games</label>
        <input id="gamesSearchBox" type="text" onChange={updateSearchTextFn} />
      </div>
      <OrderRadioButtons onChangeFn={updateOrderFn} />
    </div>
  </React.Fragment>
)

export { PaginationButtons, SteamGamesList, FilterMenu }
