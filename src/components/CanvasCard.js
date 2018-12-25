import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose'
import { withStyles } from '@material-ui/core/styles';
import classnames from 'classnames';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
// import CardMedia from '@material-ui/core/CardMedia';
import CardContent from '@material-ui/core/CardContent';
// import CardActions from '@material-ui/core/CardActions';
import Collapse from '@material-ui/core/Collapse';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
// import red from '@material-ui/core/colors/red';
// import FavoriteIcon from '@material-ui/icons/Favorite';
// import ShareIcon from '@material-ui/icons/Share';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
// import MoreVertIcon from '@material-ui/icons/MoreVert';

const styles = theme => ({
  card: {
    [theme.breakpoints.down('sm')]: {
      width: '100%',
    },
    [theme.breakpoints.up('md')]: {
      width: '80%',
      maxWidth: '80%',
    },
    [theme.breakpoints.up('lg')]: {
      width: '80%',
      maxWidth: '80%',
    },
    margin: 'auto',
  },
  cardCanvas: {
    'overflow-x': 'auto',
  },
  media: {
    height: 0,
    paddingTop: '56.25%', // 16:9
  },
  actions: {
    display: 'flex',
  },
  expand: {
    transform: 'rotate(0deg)',
    transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.shortest,
    }),
    marginLeft: 'auto',
  },
  expandOpen: {
    transform: 'rotate(180deg)',
  },
});

class InnerCanvasCard extends React.Component {
  state = { expanded: true };

  handleExpandClick = () => {
    this.setState(state => ({ expanded: !state.expanded }));
  };

  handleCanvasClick() {
    if(this.props.onCanvasClick) {
      this.props.onCanvasClick();
      // this.forceUpdate();
    }
  }

  componentDidMount() {
    if(this.props.onMount) this.props.onMount();
  }

  render() {
    const { classes } = this.props;

    return (
      <Card className={classes.card}>
        <CardHeader
          title={this.props.title}
          subheader={this.props.subheader}
          action={
            <IconButton
                className={classnames(classes.expand, {
                  [classes.expandOpen]: this.state.expanded,
                })}
                onClick={this.handleExpandClick}
                aria-expanded={this.state.expanded}
                aria-label="Show"
              >
                <ExpandMoreIcon />
            </IconButton>
          }
        />
        <Collapse in={this.state.expanded} timeout="auto">
          {(this.props.noCanvas) ? (
            <CardContent className={classes.cardCanvas}> 
              {this.props.children}
            </CardContent>
          ) : (
            <CardContent className={classes.cardCanvas}> 
              <canvas id={this.props.canvasID} ref={this.props.canvasRef} onClick={() => this.handleCanvasClick()}> </canvas>
            </CardContent>
          )}

          {/* <CardActions className={classes.actions} disableActionSpacing>
            <IconButton aria-label="Add to favorites">
              <FavoriteIcon />
            </IconButton>
            <IconButton aria-label="Share">
              <ShareIcon />
            </IconButton>
          </CardActions> */}

          <CardContent>

            <Typography paragraph>
              {this.props.footText}
            </Typography>

          </CardContent>
        </Collapse>
      </Card>
    );
  }
}

InnerCanvasCard.propTypes = {
  classes: PropTypes.object.isRequired,
};

const CanvasCard = (Component) => React.forwardRef((props, ref) => {
    return <Component {...props} canvasRef={ref} />;
});

export default compose(
  CanvasCard,
  withStyles(styles),
)(InnerCanvasCard);