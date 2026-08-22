function truncateAtWord(value, maxLength) {
  if (value.length <= maxLength) return value;

  const shortened = value.slice(0, maxLength + 1);
  const lastWhitespace = shortened.search(/\s+\S*$/);

  return (lastWhitespace > 0 ? shortened.slice(0, lastWhitespace) : shortened)
    .trim()
    .slice(0, maxLength);
}

module.exports = { truncateAtWord };
