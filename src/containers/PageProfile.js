import React from 'react'
import { connect } from 'react-redux'
import PresentationalComponent from '../components/PageProfile'
import { getUrl, getHostname } from '../api/browser'
import { setObjectHostname } from '../actions'

function PageProfile({ subscription, onChangeHostname }) {

  React.useEffect(() => {
    getUrl().then(url => onChangeHostname(getHostname(url)))
  }, [])

  return React.createElement(PresentationalComponent, { subscription })
}

const mapStateToProps = state => ({
  subscription: { hostname: state.objectHostname }
})
const mapDispatchToProps = dispatch => ({
  onChangeHostname: h => dispatch(setObjectHostname(h))
})
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PageProfile)
