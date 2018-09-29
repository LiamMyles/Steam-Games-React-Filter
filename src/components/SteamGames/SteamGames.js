import React, { Component } from "react"
import {
  PaginationButtons,
  SteamGamesList,
  FilterMenu
} from "./SteamGamesExtraComponents"
import "./SteamGames.css"
class SteamGames extends Component {
  constructor(props) {
    super(props)
    this.state = {
      gamesLoaded: false,
      gamesList: [],
      totalGames: 0,
      filteredTotalGames: 0,
      currentPage: 1,
      playtimeFilters: [],
      searchFilter: "",
      orderType: "",
      collapseFilters: true
    }
  }

  //============================================
  //===================Events===================
  //============================================

  /**
   * Updates the current page, insuring it doesn't go past
   * the totalPages currently being shown.
   *
   * @memberof SteamGames
   */
  nextPage = event => {
    const totalPages = event.currentTarget.dataset.totalPages
    this.setState(prevState => {
      let newState = { ...prevState }
      if (prevState.currentPage > totalPages) {
        newState.currentPage = totalPages
      } else {
        newState.currentPage = prevState.currentPage + 1
      }
      return newState
    })
  }

  /**
   * Updates the current page, insuring it doesn't go below
   * the totalPages currently being shown.
   *
   * @memberof SteamGames
   */
  previousPage = event => {
    const totalPages = event.currentTarget.dataset.totalPages

    this.setState(prevState => {
      let newState = { ...prevState }
      if (prevState.currentPage > totalPages) {
        newState.currentPage = totalPages - 1
      } else if (newState.currentPage !== 0) {
        newState.currentPage = prevState.currentPage - 1
      } else {
        newState.currentPage = prevState.currentPage
      }
      return newState
    })
  }
  /**
   * Updates the checked state of the pressed playtime filter option
   *
   * @memberof SteamGames
   */
  updatePlaytimeFilter = event => {
    const { index } = event.currentTarget.dataset
    this.setState(prevState => {
      let newState = { ...prevState }
      newState.playtimeFilters[index].isChecked = !prevState.playtimeFilters[
        index
      ].isChecked

      return newState
    })
  }

  /**
   * Updates state with the text from the search filter
   *
   * @memberof SteamGames
   */
  updateSearchText = event => {
    const searchInput = event.currentTarget.value
    this.setState({ searchFilter: searchInput })
  }

  /**
   * Updates the filtered games array order based on the order type selected
   *
   * @memberof SteamGames
   */
  updateOrder = event => {
    this.setState({ orderType: event.currentTarget.value })
  }

  /**
   * Toggles the display state of the filter menu
   *
   * @memberof SteamGames
   */
  toggleFilters = () => {
    this.setState(prevState => {
      let newState = { ...prevState }
      newState.collapseFilters = !prevState.collapseFilters
      return newState
    })
  }
  //============================================
  //==============Logic Functions===============
  //============================================

  /**
   * Created a function generated from this.state.playtimeFilters data.
   * The returned function can be passed an {int} compareValue that checks if the compareValue
   * is in range
   *
   * @param {int} start of the range
   * @param {int} end of the range
   * @param {Boolean} isUnplayed
   * @memberof SteamGames
   * @returns {Function} Function that determines if the passed value is in range
   */
  playtimeRangeCheck = (start, end, isUnplayed) => compareValue => {
    let valueInRange = false
    if (
      (compareValue <= start && compareValue > end) ||
      (isUnplayed === true && compareValue === 0)
    ) {
      valueInRange = true
    }
    return valueInRange
  }

  /**
   * Takes in a game list, and applies the selected playtimeFilters to the passed games list.
   *
   * @param {Array} gamesList Array of games
   * @memberof SteamGames
   * @returns {Array} Filtered Games list
   */
  filterPlaytimes(gamesList, playtimeFilters) {
    const enabledPlaytimeFilters = playtimeFilters.filter(
      ({ isChecked }) => !isChecked
    )

    const playtimeRangeValidationCheckers = enabledPlaytimeFilters.map(
      ({ start, end, isUnplayed }) => {
        return this.playtimeRangeCheck(start, end, isUnplayed)
      }
    )

    //Filters out any games that fit the range found in the EnabledPlaytimeFilters
    const filteredGames = gamesList.filter(({ playtime_forever }) => {
      const inFilterRange = playtimeRangeValidationCheckers.some(
        playtimeFilter => playtimeFilter(playtime_forever)
      )
      return !inFilterRange
    })

    return filteredGames
  }

  /**
   * Returns an object of the min and max playtimes from the
   * gamesList state
   *
   * @returns {Object} Min and Max playtime
   */
  getMinAndMaxPlaytime(gamesList) {
    const maxMinutes = gamesList.reduce(
      (highest, current) =>
        highest > current.playtime_forever ? highest : current.playtime_forever
    )
    const minMinutes = gamesList.reduce(
      (lowest, current) =>
        lowest < current.playtime_forever ? lowest : current.playtime_forever
    )

    return { maxPlaytime: maxMinutes, minPlaytime: minMinutes }
  }

  /**
   * Gets the current and total pages as an object
   *
   * @param {Array} gamesList
   * @param {Int} currentPage
   *
   * @returns {Object} Current and Total Pages
   */
  getPaginationPages(gamesList) {
    const { currentPage } = this.state
    const { gamesPerPage } = this.props
    const totalPages = Math.ceil(gamesList.length / gamesPerPage)

    return { currentPage, totalPages }
  }

  /**
   * fetches the gameState from the gamesFetch
   *
   * @returns {Promise} Promise that returns new state to be used
   * @memberof SteamGames
   */
  fetchGameState() {
    const { gamesFetchUrl } = this.props

    const promise = new Promise(resolve => {
      fetch(gamesFetchUrl)
        .then(response => response.json())
        .then(({ response: { game_count: gamesCount, games } }) => {
          resolve({
            gamesLoaded: true,
            gamesList: games,
            totalGames: gamesCount
          })
        })
    })

    return promise
  }

  /**
   * Generates the state used for displaying the playTime checkboxes.
   *
   * Returns a promise so it can be chained to set state at a later point
   *
   * @param {Object} newState
   * @returns Promise which passes the newState object
   * @memberof SteamGames
   */
  generatePlaytimeFiltersToState(newState) {
    const promise = new Promise(resolve => {
      const { checkboxes, filterUnplayed } = this.props.hoursFilterRange
      const { gamesList } = newState
      const { maxPlaytime, minPlaytime } = this.getMinAndMaxPlaytime(gamesList)
      const playtimeRange = Math.round((maxPlaytime - minPlaytime) / checkboxes)
      let playtimeFilters = []

      for (let count = 1; count <= checkboxes; count++) {
        let end = maxPlaytime - playtimeRange * count
        let start = end + playtimeRange
        end = end <= 0 ? 0 : end
        playtimeFilters.push({ start, end, isChecked: true, isUnplayed: false })
      }
      //if the prop for filtering out unplayed games has been set, push an extra
      //item into the array to generate an extra checkbox
      if (filterUnplayed) {
        playtimeFilters.push({
          start: 0,
          end: 0,
          isChecked: true,
          isUnplayed: true
        })
      }

      const filterCountWithGameCounts = playtimeFilters.map(filterObject => {
        const { start, end, isUnplayed } = filterObject
        const newFilterObject = { ...filterObject }
        const filteredArray = gamesList.filter(({ playtime_forever }) =>
          this.playtimeRangeCheck(start, end, isUnplayed)(playtime_forever)
        )
        newFilterObject.filteredGameCount = filteredArray.length
        return newFilterObject
      })
      newState.playtimeFilters = filterCountWithGameCounts
      resolve(newState)
    })

    return promise
  }

  /**
   * Pagination passed array and returns the current current states page
   * and the prop amount of pages
   *
   * @param {Array} gamesList
   * @param {Int} currentPage
   */
  getCurrentGamesForPage(gamesList, currentPage) {
    const { gamesPerPage } = this.props
    const startIndex = currentPage * gamesPerPage - gamesPerPage
    const finishIndex = currentPage * gamesPerPage
    const gamesForPage = gamesList.slice(startIndex, finishIndex)

    return gamesForPage
  }
  /**
   * Takes a passed games list and returns a reorder version of that list
   * based on the this.state.orderType
   *
   * @param {Array} gamesList
   * @returns {Array} Ordered games list
   * @memberof SteamGames
   */
  orderGamesList(gamesList) {
    const { orderType } = this.state
    let reorderedGamesList = [...gamesList]

    const sortCompareFunction = isAscending => {
      const ascendingCompare = (a, b) => {
        if (a > b) {
          return -1
        } else if (a < b) {
          return 1
        }
        return 0
      }
      const descendingCompare = (a, b) => {
        if (a < b) {
          return -1
        } else if (a > b) {
          return 1
        }
        return 0
      }

      return isAscending ? ascendingCompare : descendingCompare
    }
    switch (orderType) {
      case "most-time":
        reorderedGamesList.sort(
          ({ playtime_forever: a }, { playtime_forever: b }) =>
            sortCompareFunction(true)(a, b)
        )
        break
      case "least-time":
        reorderedGamesList.sort(
          ({ playtime_forever: a }, { playtime_forever: b }) =>
            sortCompareFunction(false)(a, b)
        )
        break
      case "alphabetical":
        reorderedGamesList.sort(({ name: a }, { name: b }) =>
          sortCompareFunction(false)(a, b)
        )
        break

      default:
        reorderedGamesList = gamesList
    }

    return reorderedGamesList
  }

  /**
   * Returns a filtered games list array based on the various filters
   * that have been set in state.
   *
   * @returns {Array} Filtered list of games
   * @memberof SteamGames
   */
  getFilteredGamesList() {
    const { gamesList, playtimeFilters } = this.state
    let filteredGamesList = [...gamesList]

    filteredGamesList = this.filterPlaytimes(filteredGamesList, playtimeFilters)
    filteredGamesList = this.filterSearchedGames(filteredGamesList)
    filteredGamesList = this.orderGamesList(filteredGamesList)

    return filteredGamesList
  }

  /**
   * filters out the games that isn't in the search filter
   *
   * @param {Array} gamesList
   * @returns {Array} Filtered list of games
   * @memberof SteamGames
   */
  filterSearchedGames(gamesList) {
    const { searchFilter } = this.state
    let filteredGamesList = [...gamesList]
    filteredGamesList = filteredGamesList.filter(game => {
      return game.name.toLowerCase().includes(searchFilter.toLowerCase())
    })

    return filteredGamesList
  }

  /**
   * Gets values that changes based on a boolean
   *
   * @param {Boolean} isCollapsed
   * @returns {Object} Object of values used in JSX
   * @memberof SteamGames
   */
  getJsxValuesForCollapsed(isCollapsed) {
    let collapsedResults = {}

    if (isCollapsed) {
      collapsedResults.buttonText = "+"
      collapsedResults.filterOptionsClass = "hidden"
    } else {
      collapsedResults.buttonText = "–"
      collapsedResults.filterOptionsClass = ""
    }

    return collapsedResults
  }

  /**
   * Gets all of the calculated values for the component render
   *
   * @returns {Object} Objects of all of the necessary values
   * @memberof SteamGames
   */
  getValuesForRender() {
    const filteredGameList = this.getFilteredGamesList()
    const filteredGamesCount = filteredGameList.length
    const {
      currentPage: tempCurrentPage,
      totalPages
    } = this.getPaginationPages(filteredGameList)

    const currentPage =
      tempCurrentPage > totalPages ? totalPages : tempCurrentPage

    const paginatedGamesList = this.getCurrentGamesForPage(
      filteredGameList,
      currentPage
    )

    const collapsedFilterData = this.getJsxValuesForCollapsed(
      this.state.collapseFilters
    )

    return {
      filteredGamesCount,
      currentPage,
      totalPages,
      paginatedGamesList,
      collapsedFilterData
    }
  }

  //============================================
  //=============React Life cycle===============
  //============================================

  componentDidMount() {
    //Gets the game sate from fetch, and uses it to generate filters for state
    //before setting it into state
    this.fetchGameState()
      .then(newState => this.generatePlaytimeFiltersToState(newState))
      .then(newState => this.setState(newState))
  }

  render() {
    const { totalGames, gamesLoaded, playtimeFilters } = this.state
    const { steamImgPath, steamImgType } = this.props
    const {
      filteredGamesCount,
      currentPage,
      totalPages,
      paginatedGamesList,
      collapsedFilterData
    } = this.getValuesForRender()

    return (
      <div className="steam-games__wrapper">
        {gamesLoaded ? (
          <React.Fragment>
            <div className="steam-games__title">
              <h1>Steam Games Filter</h1>
            </div>
            <FilterMenu
              collapsedData={collapsedFilterData}
              totalGames={totalGames}
              filteredGamesCount={filteredGamesCount}
              playtimeFilters={playtimeFilters}
              toggleFiltersFn={this.toggleFilters}
              updatePlaytimeFilterFn={this.updatePlaytimeFilter}
              updateSearchTextFn={this.updateSearchText}
              updateOrderFn={this.updateOrder}
            />
            <PaginationButtons
              className="steam-games__pagination"
              previousPageFn={this.previousPage}
              nextPageFn={this.nextPage}
              currentPage={currentPage}
              totalPages={totalPages}
            />
            <SteamGamesList
              gamesList={paginatedGamesList}
              imgPath={steamImgPath}
              imgType={steamImgType}
            />
            <PaginationButtons
              className="steam-games__pagination"
              previousPageFn={this.previousPage}
              nextPageFn={this.nextPage}
              currentPage={currentPage}
              totalPages={totalPages}
            />
          </React.Fragment>
        ) : null}
      </div>
    )
  }
}

SteamGames.defaultProps = {
  steamImgPath: "https://steamcdn-a.akamaihd.net/steam/apps/",
  steamImgType: "/header.jpg",
  gamesPerPage: 3,
  hoursFilterRange: { checkboxes: 3, filterUnplayed: true }
}

export default SteamGames
