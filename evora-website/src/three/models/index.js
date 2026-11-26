import basin from './basin.js';
import shower from './shower.js';
import vanity from './vanity.js';
import bathtub from './bathtub.js';
import tileWall from './tileWall.js';
import wc from './wc.js';

/** Procedural model registry, keyed by showcase slot id. */
export const MODELS = {
  basin, shower, vanity, bathtub, tiles: tileWall, wc,
};
