function classifySourceChange({
  activeSource,
  lastObservedSource,
  pendingProgrammaticSource
}) {
  if (pendingProgrammaticSource !== null) {
    return activeSource === pendingProgrammaticSource
      ? "programmatic-applied"
      : "await-programmatic";
  }

  return activeSource === lastObservedSource ? "unchanged" : "user-edit";
}

module.exports = {
  classifySourceChange
};
