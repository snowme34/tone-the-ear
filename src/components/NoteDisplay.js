import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

const styles = {
  card: {
    minWidth: 275,
  },
  bullet: {
    display: 'inline-block',
    margin: '0 2px',
    transform: 'scale(0.8)',
  },
  title: {
    fontSize: 14,
  },
  pos: {
    marginBottom: 12,
  },
};

function NoteDisplay(props) {
  let note = props.note;
  if(!note.length) note = ['_'];
  const { classes } = props;
  return (
    <Card className={classes.card}>
      <CardContent>
        <Typography className={classes.title} color="textSecondary" gutterBottom>
        </Typography>
        <Typography className={classes.pos} color="textSecondary">
        </Typography>
        <Typography component="p">
        The note being played is:
        </Typography>
        <Typography variant="h5" component="h2">
        {note}
        </Typography>
      </CardContent>
    </Card>
  );
}

NoteDisplay.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(NoteDisplay);