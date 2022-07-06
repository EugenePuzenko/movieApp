import { Spin, Card, Rate } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { v4 as uuidv4 } from 'uuid';

import { Consumer } from '../MovieServiceContext/MovieServiceContext';
import { getRateColor } from '../helpers';

const { Meta } = Card;

const antIcon = (
  <LoadingOutlined
    style={{
      fontSize: 50,
    }}
    spin
  />
);

const MovieCard = ({ movie, onImgLoaded, onRate }) => {
  return (
    <div className="card-list-item">
      {movie.load && <Spin className="spin" indicator={antIcon} />}
      <Consumer>
        {(value) => {
          return (
            <Card
              className="movie-card"
              hoverable
              cover={<img onLoad={() => onImgLoaded(movie.id)} alt="movie poster" src={movie.poster} />}
            >
              <div className="title-wrapper">
                <Meta title={movie.title} description={movie.release_date} />
                <span className={getRateColor(movie.vote_average)}>{movie.vote_average}</span>
              </div>
              <div className="additional">
                <div className="genre">
                  {value.map((element) => {
                    return movie.genre_ids.map((currentElement) => {
                      return currentElement === element.id ? (
                        <span key={uuidv4()} className="genre-item">
                          {element.name}
                        </span>
                      ) : null;
                    });
                  })}
                </div>
                <p className="overview">{movie.overview}</p>
              </div>
              <Rate count={10} allowHalf onChange={(v) => onRate(v, movie.id)} value={movie.own_vote} />
            </Card>
          );
        }}
      </Consumer>
    </div>
  );
};

export default MovieCard;
