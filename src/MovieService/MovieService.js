import posterNotFound from '../moviePosterNotFound.jpg';

const baseURL = 'https://api.themoviedb.org/3/';

class MovieService {
  async getResource(name, page) {
    const res = await fetch(
      `${baseURL}search/movie?api_key=${process.env.REACT_APP_KEY}&language=en-US&query=${name}&page=${page}&include_adult=false`,
      {
        method: 'GET',
        redirect: 'follow',
      }
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
    const res = await fetch(`${baseURL}genre/movie/list?api_key=${process.env.REACT_APP_KEY}&language=en-US`);

    if (!res.ok) {
      throw new Error(`Request to ${this.url} was rejected. Status: ${res.status}`);
    }

    const list = await res.json();
    return list.genres;
  }
}

export const { getResource, getPoster, getGenres } = new MovieService();
