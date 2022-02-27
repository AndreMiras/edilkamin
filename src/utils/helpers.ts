const fireplaceRegex = /[0-9A-Fa-f]{12}/g;

const isValidFireplace = (fireplace: string) => fireplaceRegex.test(fireplace);

export { isValidFireplace };
