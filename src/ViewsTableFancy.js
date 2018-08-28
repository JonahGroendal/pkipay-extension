import React from 'react'
import EnhancedViewsTable from './EnhancedViewsTable'
import BrowserStorageContext from './BrowserStorageContext'
import StorageDbContext from './StorageDbContext'

const ViewsTableFancy = props => {
  return (
    <BrowserStorageContext.Consumer>
      {({ state }) => <StorageDbContext.Consumer>
        {storageDb => <EnhancedViewsTable
          views={storageDb.views}
          subs={{}}
          budget={state.settings.budget}
        />}
      </StorageDbContext.Consumer>}
    </BrowserStorageContext.Consumer>
  )
}

export default ViewsTableFancy
