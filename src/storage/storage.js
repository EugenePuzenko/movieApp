const storage = JSON.parse(localStorage.getItem('rated'))
  ? JSON.parse(localStorage.getItem('rated'))
  : localStorage.setItem('rated', JSON.stringify([]));

export default storage;
