const options = {
  'First of the month': firstOfNextMonth,
  'Last of the month': lastOfThisMonth
}
// For testing, add option to send TXs 30 seconds after scheduling them
if (process.env.REACT_APP_ACTUAL_ENV !== 'production')
  options['In 30 Seconds'] = in30Seconds

export default options


function firstOfNextMonth(now) {
  let year = (new Date(now)).getFullYear()
  let monthIndex = (new Date(now)).getMonth() + 1
  if (monthIndex === 12) {
    year += 1
    monthIndex = 0
  }
  return new Date(year, monthIndex, 1)
}

function lastOfThisMonth(now) {
  return new Date(firstOfNextMonth(now).valueOf() - 86400000) // 86400000ms == 1day
}

function in30Seconds(now) {
  let year = (new Date(now)).getFullYear()
  let monthIndex = (new Date(now)).getMonth()
  const date = new Date()
  const day = date.getDate()
  const hours = date.getHours()
  const minutes = date.getMinutes()
  const seconds = date.getSeconds()
  const unixTime = (new Date(year, monthIndex, day, hours, minutes, seconds)).valueOf()

  return new Date(unixTime + 30000)
}
