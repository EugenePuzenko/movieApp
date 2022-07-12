import React from 'react';
import { Col, Row, List, Rate, Card } from 'antd';
import { v4 as uuidv4 } from 'uuid';

import { Consumer } from '../MovieServiceContext/MovieServiceContext';
import { getRateColor } from '../helpers';

const { Meta } = Card;

const RatedTab = ({ ratedMovies }) => {
  return (
    <Row>
      <Col className="gutter-row" span={14} offset={5}>
        <List
          pagination={{
            pageSize: 6,
            hideOnSinglePage: true,
            size: 'small',
          }}
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
  );
};

export default RatedTab;
