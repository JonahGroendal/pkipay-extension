import Tab2 from './Tab2.js'
import { drizzleConnect } from 'drizzle-react'
import namehash from 'eth-ens-namehash'
import PropTypes from 'prop-types'

const mapStateToProps = (state, props) => {
  return {
    drizzleStatus: state.drizzleStatus,
    Gratis: state.contracts.Gratis
  }
}

const Tab2Container = drizzleConnect(Tab2, mapStateToProps)

export default Tab2Container
