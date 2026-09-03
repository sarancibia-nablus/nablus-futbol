export const encodeId = (id) => {
  if (!id) return '';
  return btoa(id).replace(/=/g, '').split('').reverse().join('');
};

export const decodeId = (encoded) => {
  if (!encoded) return '';
  try {
    let str = encoded.split('').reverse().join('');
    while (str.length % 4 !== 0) str += '=';
    return atob(str);
  } catch (e) {
    return null;
  }
};
