import React from 'react';
import { Col, Row, Alert, Input, List } from 'antd';

import MovieCard from './MovieCard';

const SearchTab = ({ moviesList, onImgLoaded, search, onRate, onPage, currentPage, emptyList, requestError }) => {
  const requestErrorMessage = requestError && (
    <Alert description="Error loading movie list. Please reload page." type="error" className="alert" />
  );

  const emptyListMessage = emptyList && <div>Search result: 0 matches</div>;

  return (
    <Row>
      <Col className="gutter-row" span={14} offset={5}>
        <Input placeholder="Type to search..." onChange={search} />
        {requestErrorMessage}
        <List
          pagination={{
            pageSize: 6,
            hideOnSinglePage: true,
            size: 'small',
            current: currentPage,
            showSizeChanger: false,
            onChange: (e) => {
              onPage(e);
            },
          }}
          locale={{ emptyText: emptyListMessage }}
          dataSource={moviesList}
          renderItem={(item) =>
            item.error ? (
              <Alert key={item.id} description="Movie not found." type="warning" className="error-movie" />
            ) : (
              <MovieCard movie={item} onImgLoaded={onImgLoaded} onRate={onRate} />
            )
          }
        />
      </Col>
    </Row>
  );
};

export default SearchTab;
