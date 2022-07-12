import { Tabs } from 'antd';
import { v4 as uuidv4 } from 'uuid';
import { debounce } from 'lodash';
import React from 'react';
import './App.css';

import { getResource, getPoster, getGenres } from '../MovieService/MovieService';
import { Provider } from '../MovieServiceContext/MovieServiceContext';
import { cutDescription, getFormatDate } from '../helpers';
import storage from '../storage/storage';

import SearchTab from './SearchTab';
import RatedTab from './RatedTab';

const { TabPane } = Tabs;

export default class App extends React.Component {
  state = {
    moviesList: [],
    ratedMovies: storage,
    requestError: false,
    isOffline: false,
    searchString: '',
    emptyList: false,
    currentPage: 1,
    genres: [],
  };

  constructor(props) {
    super(props);

    this.search = debounce((e) => {
      this.setState({ moviesList: [] });
      if (e.target.value) {
        this.setState({
          searchString: e.target.value,
          currentPage: 1,
        });

        this.getMoviesList(e.target.value);
      }
    }, 300);
  }

  componentDidMount() {
    this.getGenresList();

    window.addEventListener('offline', () => {
      this.showOfflineMessage(true);
    });
    window.addEventListener('online', () => {
      this.showOfflineMessage(false);
    });
  }

  onCardError() {
    this.setState(({ moviesList }) => {
      return {
        moviesList: [
          ...moviesList,
          {
            error: true,
            id: uuidv4(),
          },
        ],
      };
    });
  }

  onImgLoaded = (id) => {
    this.setState(({ moviesList }) => {
      const index = moviesList.findIndex((el) => el.id === id);
      return {
        moviesList: [
          ...moviesList.slice(0, index),
          { ...moviesList[index], load: false },
          ...moviesList.slice(index + 1),
        ],
      };
    });
  };

  onRequestError() {
    this.setState({ requestError: true });
  }

  onPage = (e) => {
    this.getMoviesList(this.state.searchString, e);
  };

  async getGenresList() {
    const responce = await getGenres();
    this.setState({ genres: responce });
  }

  onRate = (value, id) => {
    this.setState(({ moviesList }) => {
      const index = moviesList.findIndex((el) => el.id === id);

      const saved = JSON.parse(localStorage.getItem('rated'));

      const keys = Object.keys(saved);
      let res = [{ ...moviesList[index], own_vote: value }, ...saved];
      keys.forEach((key) => {
        if (saved[key].id === id) {
          res = [...saved.slice(0, key), { ...saved[key], own_vote: value }, ...saved.slice(key + 1)];
        }
      });

      localStorage.setItem('rated', JSON.stringify(res));

      return {
        moviesList: [
          ...moviesList.slice(0, index),
          { ...moviesList[index], own_vote: value },
          ...moviesList.slice(index + 1),
        ],
        ratedMovies: JSON.parse(localStorage.getItem('rated')),
      };
    });
  };

  async getMoviesList(search, pageNumber = 1) {
    try {
      const listOfMovies = await getResource(search, pageNumber);

      if (!listOfMovies.results.length) {
        this.setState({ moviesList: [], emptyList: true });
      } else {
        this.getPosterList(listOfMovies.results, pageNumber);
      }
    } catch {
      this.onRequestError();
    }
  }

  getPosterList(listOfMovies, pageNumber) {
    listOfMovies.forEach(async (movie) => {
      try {
        if (movie) {
          const poster = await getPoster(movie.poster_path);

          this.setState(({ moviesList }) => {
            return {
              moviesList: [
                ...moviesList,
                {
                  id: movie.id,
                  poster,
                  title: cutDescription(movie.title, 20),
                  overview: cutDescription(movie.overview, 160),
                  release_date: getFormatDate(movie.release_date),
                  genre_ids: movie.genre_ids,
                  vote_average: movie.vote_average,
                  own_vote: 0,
                  load: true,
                  error: false,
                },
              ],
              emptyList: false,
              currentPage: pageNumber,
              requestError: false,
            };
          });
        }
      } catch {
        this.onCardError();
      }
    });
  }

  showOfflineMessage(bool) {
    this.setState({ isOffline: bool });
  }

  render() {
    const { moviesList, requestError, isOffline, emptyList, ratedMovies, currentPage, genres } = this.state;
    const { onImgLoaded, onRate, onPage, search } = this;

    const offlineMessage = isOffline && <div className="offline-message">Lost internet connection</div>;

    return (
      <Provider value={genres}>
        {offlineMessage}
        <Tabs defaultActiveKey="1" centered>
          <TabPane tab="Search" key="1">
            <SearchTab
              moviesList={moviesList}
              onImgLoaded={onImgLoaded}
              requestError={requestError}
              onRate={onRate}
              currentPage={currentPage}
              onPage={onPage}
              emptyList={emptyList}
              search={search}
            />
          </TabPane>
          <TabPane tab="Rated" key="2">
            <RatedTab ratedMovies={ratedMovies} />
          </TabPane>
        </Tabs>
      </Provider>
    );
  }
}
