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

export const isEnsName = str => (
  !!str && (str.slice(-4) === '.eth' || str.slice(-5) === '.test')
)

export const isDomainName = str => (
  !!str && str.includes('.') && !isEnsName(str)
)

export const isEnsNode = str => (
  !!str && str.slice(0, 2) === '0x' && str.length === 66
)
