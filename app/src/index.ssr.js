import React, { Component }  from 'react';
import {Provider} from 'react-redux'
import { StaticRouter } from 'react-router-dom';
import App from './App';
import database from 'firebase-database';
//import {init as firebaseInit} from './firebase/firebase'

import configureStore from './config/configStore'


//let store = configureStore()

class AppSsr extends Component{

  constructor(props){
    super(props)
    this.state = {
      store:configureStore(props.init)
    }
    database.initializeApp(props.fireConf)
  }

  render(){

    let {req,context} = this.props;

    return (
      <Provider store={this.state.store}>
        <StaticRouter
            location={req.url}
            context={context}
          >
            <App />
          </StaticRouter>
      </Provider>
     
    )
  }
}

export default AppSsr;
