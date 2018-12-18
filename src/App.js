import React, { Component } from 'react';
// import { BrowserRouter as Router, Route, NavLink, Prompt } from "react-router-dom";
// import { TransitionGroup, CSSTransition } from "react-transition-group";
import {
  BrowserRouter as Router,
  // Switch,
  Route,
  // NavLink,
  // Redirect
} from "react-router-dom";
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import pink from '@material-ui/core/colors/pink';
import blue from '@material-ui/core/colors/blue';
import logo from './logo.svg';
import './App.css';
import TopMenu from './components/TopMenu'
import TonePlayer from './components/TonePlayer'
import PitchTrainer from './components/PitchTrainer'

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
      <MuiThemeProvider theme={theme}>
        <Router>
          <div className="App">
            <div id="dashboard">
              <TopMenu />
              <div className="content">
                <Route exact path="/" component={Home} />
                <Route exact path="/Tone" component={TonePlayer} />
                <Route exact path="/Pitch" component={PitchTrainer} />
                {/* <Route exact path="/Midi" component={MidiTrainer} /> */}
              </div>
            </div>
          </div>
          {/* TODO: Add footer */}
        </Router>
      </MuiThemeProvider>
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
