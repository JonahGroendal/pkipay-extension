import React from 'react'
import { connect } from 'react-redux'
import PageProfile from '../components/PageProfile'
import { getUrl, getHostname } from '../api/browser'
import { setObjectHostname } from '../actions'

function PageProfileContainer({ subscription, onChangeHostname }) {

  React.useEffect(() => {
    getUrl().then(url => onChangeHostname(getHostname(url)))
  }, [])

  return React.createElement(PageProfile, { subscription })
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
)(PageProfileContainer)
