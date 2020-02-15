export function truncateForDisplay(str, maxLen) {
  if (str.length > maxLen) {
    if (str.slice(0, 2) === '0x') {
      // discard middle of string
      const numBeginChars = parseInt(maxLen/2)
      const numEndChars = maxLen - numBeginChars - 1
      return str.slice(0, numBeginChars).concat(String.fromCharCode(8230), str.slice(-1 * numEndChars))
    }
    else {
      // discard end of string
      return str.slice(0, maxLen - 1).concat(String.fromCharCode(8230))
    }
  }
  else {
    return str
  }
}
