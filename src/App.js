import React, { Component } from 'react';
// import { TransitionGroup, CSSTransition } from "react-transition-group";
import { BrowserRouter as Router, Route, } from "react-router-dom";
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import pink from '@material-ui/core/colors/pink';
import blue from '@material-ui/core/colors/blue';
import { Provider } from 'react-redux'
import { createStore, combineReducers, compose } from 'redux'
import { reactReduxFirebase, firebaseReducer } from 'react-redux-firebase'
import firebase from 'firebase'
import logo from './logo.svg';
import './App.css';
import TopMenu from './components/TopMenu'
import TonePlayer from './components/TonePlayer'
import PitchTrainer from './components/PitchTrainer'
import MidiTrainer from './components/MidiTrainer'

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBR6Vv9bEqeg6Srr2m0CO-QU7fq_gqFj_8",
  authDomain: "fir-tone-the-ear.firebaseapp.com",
  databaseURL: "https://fir-tone-the-ear.firebaseio.com",
  projectId: "fir-tone-the-ear",
  storageBucket: "fir-tone-the-ear.appspot.com",
  messagingSenderId: "852693584093"
};

// react-redux-firebase config
const rrfConfig = {
  userProfile: 'users',
  // useFirestoreForProfile: true // Firestore for Profile instead of Realtime DB
}

// Initialize firebase instance
firebase.initializeApp(firebaseConfig)

// Initialize other services on firebase instance
// firebase.firestore() // <- needed if using firestore
// firebase.functions() // <- needed if using httpsCallable

// Add reactReduxFirebase enhancer when making store creator
const createStoreWithFirebase = compose(
  reactReduxFirebase(firebase, rrfConfig), // firebase instance as first argument
  // reduxFirestore(firebase) // <- needed if using firestore
)(createStore)
 
// Add firebase to reducers
const rootReducer = combineReducers({
  firebase: firebaseReducer,
  // firestore: firestoreReducer // <- needed if using firestore
})
 
// Create store with reducers and initial state
const initialState = {}
const store = createStoreWithFirebase(rootReducer, initialState)

// theme for material ui
const theme = createMuiTheme({
  palette: {
    primary: blue,
    secondary: pink,
  },
  typography: {
    useNextVariants: true,
  },
});

class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <MuiThemeProvider theme={theme}>
          <Router>
            <div className="App">
              <div id="dashboard">
                <TopMenu />
                <div className="content">
                  <Route exact path="/" component={Home} />
                  <Route exact path="/Tone" component={TonePlayer} />
                  <Route exact path="/Pitch" component={PitchTrainer} />
                  <Route exact path="/Midi" component={MidiTrainer} />
                </div>
              </div>
            </div>
            {/* TODO: Add footer */}
          </Router>
        </MuiThemeProvider>
      </Provider>
    );
  }
}

class Home extends React.Component {
	render() {
		return (
    <header className="App-header">
      <img src={logo} className="App-logo" alt="logo" />
      <p>
        This is a site about ear training that is still under development.
      </p>
    </header>);
	}
}

export default App;
