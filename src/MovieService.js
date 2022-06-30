import posterNotFound from './moviePosterNotFound.jpg';

export default class MovieService {
  requestHeaders = {
    method: 'GET',
    redirect: 'follow',
  };

  async getResource(name, page) {
    const res = await fetch(
      `https://api.themoviedb.org/3/search/movie?api_key=cb1f3214193c8c6eefeff82353c05087&language=en-US&query=${name}&page=${page}&include_adult=false`,
      this.requestHeaders
    );

    if (!res.ok) {
      throw new Error(`Request to ${this.url} was rejected. Status: ${res.status}`);
    }

    const body = await res.json();
    return body;
  }

  async getPoster(path) {
    if (path) {
      const res = await fetch(`https://image.tmdb.org/t/p/w500${path}`);

      if (!res.ok) {
        throw new Error(`Request to ${this.url} was rejected. Status: ${res.status}`);
      }

      const img = await res.url;
      return img;
    }

    return posterNotFound;
  }

  async getGenres() {
    const res = await fetch(
      'https://api.themoviedb.org/3/genre/movie/list?api_key=cb1f3214193c8c6eefeff82353c05087&language=en-US'
    );

    if (!res.ok) {
      throw new Error(`Request to ${this.url} was rejected. Status: ${res.status}`);
    }

    const list = await res.json();

    return list.genres;
  }
}
