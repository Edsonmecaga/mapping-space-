import '../node_modules/satellite.js/dist/satellite.js';

// Sample TLE
var tleLine1 = '1 22675U 93036A   21276.17839191  .00000002  00000-0  10243-4 0  9996',
    tleLine2 = '2 22675  74.0390 232.5178 0025684 327.3669  32.5893 14.32581635478700';

// Initialize a satellite record
var satrec = satellite.twoline2satrec(tleLine1, tleLine2);

//  Propagate satellite using time since epoch (in minutes).
var positionAndVelocity = satellite.sgp4(satrec, 100.52);

//  Or you can use a JavaScript Date
var positionAndVelocity = satellite.propagate(satrec, new Date());

// The position_velocity result is a key-value pair of ECI coordinates.
// These are the base results from which all other coordinates are derived.
var positionEci = positionAndVelocity.position,
    velocityEci = positionAndVelocity.velocity;

// Set the Observer at 122.03 West by 36.96 North, in RADIANS
var observerGd = {
    longitude: satellite.degreesToRadians(-122.0308),
    latitude: satellite.degreesToRadians(36.9613422),
    height: 0.370
};

// You will need GMST for some of the coordinate transforms.
// http://en.wikipedia.org/wiki/Sidereal_time#Definition
var gmst = satellite.gstime(new Date());

// You can get ECF, Geodetic, Look Angles, and Doppler Factor.
var positionEcf   = satellite.eciToEcf(positionEci, gmst),
    observerEcf   = satellite.geodeticToEcf(observerGd),
    positionGd    = satellite.eciToGeodetic(positionEci, gmst),
    lookAngles    = satellite.ecfToLookAngles(observerGd, positionEcf),
    dopplerFactor = satellite.dopplerFactor(observerEcf, positionEcf, 0.0025684);

// The coordinates are all stored in key-value pairs.
// ECI and ECF are accessed by `x`, `y`, `z` properties.
var satelliteX = positionEci.x,
    satelliteY = positionEci.y,
    satelliteZ = positionEci.z;

// Look Angles may be accessed by `azimuth`, `elevation`, `range_sat` properties.
var azimuth   = lookAngles.azimuth,
    elevation = lookAngles.elevation,
    rangeSat  = lookAngles.rangeSat;

// Geodetic coords are accessed via `longitude`, `latitude`, `height`.
var longitude = positionGd.longitude,
    latitude  = positionGd.latitude,
    height    = positionGd.height;

//  Convert the RADIANS to DEGREES.
var longitudeDeg = satellite.degreesLong(longitude),
    latitudeDeg  = satellite.degreesLat(latitude);

console.log(longitudeDeg);
console.log(latitudeDeg);
