import { Col, Row, Card, Alert, Input, List, Tabs, Rate } from 'antd';
import { v4 as uuidv4 } from 'uuid';
import { debounce } from 'lodash';
import React from 'react';
import './App.css';

import MovieService from '../MovieService';
import { Provider, Consumer } from '../MovieServiceContext';
import { cutDescription, getFormatDate, getRateColor } from '../helpers';

import MovieCard from './MovieCard';

const { Meta } = Card;
const { TabPane } = Tabs;

export default class App extends React.Component {
  movies = new MovieService();

  state = {
    moviesList: [],
    ratedMovies: JSON.parse(localStorage.getItem('rated'))
      ? JSON.parse(localStorage.getItem('rated'))
      : localStorage.setItem('rated', JSON.stringify([])),
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

        this.updateMovie(e.target.value);
      }
    }, 300);

    this.inputRef = React.createRef();
  }

  componentDidMount() {
    this.getGenresList();
    window.addEventListener('offline', () => {
      this.isOffline();
    });
    window.addEventListener('online', () => {
      this.isOnline();
    });

    this.inputRef.current.focus();
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

  onImgLoaded(id) {
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
  }

  onRequestError() {
    this.setState({ requestError: true });
  }

  async onPage(e) {
    this.updateMovie(this.state.searchString, e);
  }

  async getGenresList() {
    const responce = await this.movies.getGenres();
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

  isOffline() {
    this.setState({ isOffline: true });
  }

  isOnline() {
    this.setState({ isOffline: false });
  }

  async updateMovie(search, pageNumber = 1) {
    try {
      const listOfMovies = await this.movies.getResource(search, pageNumber);

      if (!listOfMovies.results.length) {
        this.setState({ moviesList: [], emptyList: true });
      } else {
        listOfMovies.results.forEach(async (movie) => {
          try {
            if (movie) {
              const poster = await this.movies.getPoster(movie.poster_path);

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
    } catch {
      this.onRequestError();
    }
  }

  render() {
    const { moviesList, requestError, isOffline, emptyList, ratedMovies, currentPage, genres } = this.state;

    const requestErrorMessage = requestError ? (
      <Alert description="Error loading movie list. Please reload page." type="error" className="alert" />
    ) : null;

    const offlineMessage = isOffline ? <div className="offline-message">Lost internet connection</div> : null;

    const emptyListMessage = emptyList ? <div>Search result: 0 matches</div> : null;

    return (
      <Provider value={genres}>
        {offlineMessage}
        <Tabs defaultActiveKey="1" centered>
          <TabPane tab="Search" key="1">
            <Row>
              <Col className="gutter-row" span={14} offset={5}>
                <Input placeholder="Type to search..." onChange={this.search} ref={this.inputRef} />
                {requestErrorMessage}
                <List
                  pagination={{
                    pageSize: 6,
                    size: 'small',
                    current: currentPage,
                    showSizeChanger: false,
                    onChange: (e) => {
                      this.onPage(e);
                    },
                  }}
                  locale={{ emptyText: emptyListMessage }}
                  dataSource={moviesList}
                  renderItem={(item) =>
                    item.error ? (
                      <Alert key={item.id} description="Movie not found." type="warning" className="error-movie" />
                    ) : (
                      <MovieCard movie={item} onImgLoaded={() => this.onImgLoaded(item.id)} onRate={this.onRate} />
                    )
                  }
                />
              </Col>
            </Row>
          </TabPane>
          <TabPane tab="Rated" key="2">
            <Row>
              <Col className="gutter-row" span={14} offset={5}>
                <List
                  pagination={{
                    pageSize: 6,
                    size: 'small',
                  }}
                  locale={{ emptyText: emptyListMessage }}
                  dataSource={ratedMovies}
                  renderItem={(item) => (
                    <div className="card-list-item">
                      <Consumer>
                        {(value) => {
                          return (
                            <Card className="movie-card" hoverable cover={<img alt="movie poster" src={item.poster} />}>
                              <div className="title-wrapper">
                                <Meta title={item.title} description={item.release_date} />
                                <span className={getRateColor(item.vote_average)}>{item.vote_average}</span>
                              </div>
                              <div className="additional">
                                <div className="genre">
                                  {value.map((element) => {
                                    return item.genre_ids.map((currentElement) => {
                                      return currentElement === element.id ? (
                                        <span key={uuidv4()} className="genre-item">
                                          {element.name}
                                        </span>
                                      ) : null;
                                    });
                                  })}
                                </div>
                                <p className="overview">{item.overview}</p>
                              </div>
                              <Rate count={10} allowHalf value={item.own_vote} disabled />
                            </Card>
                          );
                        }}
                      </Consumer>
                    </div>
                  )}
                />
              </Col>
            </Row>
          </TabPane>
        </Tabs>
      </Provider>
    );
  }
}
