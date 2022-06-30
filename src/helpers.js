import format from 'date-fns/format';

export const cutDescription = (movieDescr, limit) => {
  let text = movieDescr.trim();
  if (text.length <= limit) return text;
  text = text.slice(0, limit);
  const lastSpace = text.lastIndexOf(' ');
  if (lastSpace > 0) {
    text = text.substr(0, lastSpace);
  }
  return `${text} ...`;
};

export const getFormatDate = (data) => {
  try {
    return format(new Date(data), 'MMMM d, yyyy');
  } catch {
    return 'unknown release data';
  }
};

export const getRateColor = (count) => {
  if (count >= 0 && count <= 3) return 'rate-block low';
  if (count > 3 && count <= 5) return 'rate-block average';
  if (count > 5 && count <= 7) return 'rate-block high';
  if (count > 7) return 'rate-block highest';
  return 'rate-block';
};
