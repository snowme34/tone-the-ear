// to remove
import getNotesBetween from '../util/getNotesBetween'
import RANGES from '../constants/RANGES'

const ranges = RANGES;

const NOTERANGES = ranges.map(([a,b]) => {getNotesBetween(a,b)});

export default NOTERANGES;