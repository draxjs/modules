export const formatDate = (isoDate:string, locale:string = 'es-AR' ) => {
  if (!isoDate || isNaN(new Date(isoDate).getTime())) {
    return '';
  }
  const date = new Date(isoDate);
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
};
