export default {
  'First of the month': firstOfNextMonth,
  'Last of the month': lastOfThisMonth
}

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
