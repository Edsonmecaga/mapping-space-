import '../node_modules/satellite.js/dist/satellite.js';


hola = () =>{
    console.log('holaaaaa');
}

var globoWorld = new WorldWind.WorldWindow("canvasOne");

globoWorld.addLayer(new WorldWind.BMNGOneImageLayer());
globoWorld.addLayer(new WorldWind.BMNGLandsatLayer());


globoWorld.addLayer(new WorldWind.CompassLayer());
globoWorld.addLayer(new WorldWind.CoordinatesDisplayLayer(globoWorld));
globoWorld.addLayer(new WorldWind.ViewControlsLayer(globoWorld));

// fetchData = () =>{
//   var url = 'https://www.space-track.org/ajaxauth/login';
//   var config = {
//                   method: 'POST',
//                   headers: {
//                               'Accept':'application/json',
//                               'Content-Type':'application/json'
//                             },
//                   mode:'no-cors',
//                   body: {
//                           identity: 'crew288@innovaccion.mx',
//                           password: 'passNasHac!!21PrimTracksatel'
//                         }
//               };
//
//   fetch(url, config)
//   .then(data=>{
//     console.log(data);
//   });
// }
var url = 'data.csv';

d3.csv(url, function(err, data) {
 for(var i=0; i<100; i++){

   // Sample TLE
   var tleLine1 = data[i].TLE_LINE1,
       tleLine2 = data[i].TLE_LINE2,
       period = data[i].PERIOD,
       eccentricity = data[i].ECCENTRICITY,
       name = data[i].OBJECT_NAME,
       type = data[i].OBJECT_TYPE,
       altura = data[i].APOGEE;

   // Initialize a satellite record
   var satrec = satellite.twoline2satrec(tleLine1, tleLine2);

   //  Propagate satellite using time since epoch (in minutes).
   var positionAndVelocity = satellite.sgp4(satrec, period);

   //  Or you can use a JavaScript Date
   var positionAndVelocity = satellite.propagate(satrec, new Date());

   if(positionAndVelocity[0] === false){
     console.log('esta mal');
   }else{
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
         dopplerFactor = satellite.dopplerFactor(observerEcf, positionEcf, eccentricity);

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


     var placemarkLayer = new WorldWind.RenderableLayer("Placemark");
     globoWorld.addLayer(placemarkLayer);

     var placemarkAttributes = new WorldWind.PlacemarkAttributes(null);

     placemarkAttributes.imageOffset = new WorldWind.Offset(
         WorldWind.OFFSET_FRACTION, 0.3,
         WorldWind.OFFSET_FRACTION, 0.0);

     placemarkAttributes.labelAttributes.color = WorldWind.Color.YELLOW;
     placemarkAttributes.labelAttributes.offset = new WorldWind.Offset(
                 WorldWind.OFFSET_FRACTION, 0.5,
                 WorldWind.OFFSET_FRACTION, 1.0);

     // placemarkAttributes.imageSource = WorldWind.configuration.baseUrl + "images/view/view-pitch-up-32x32.png";
     // placemarkAttributes.imageSource = "http://localhost/NasaChallenge/images/escombros.png";

     var position = new WorldWind.Position(latitudeDeg, longitudeDeg, altura);
     var placemark = new WorldWind.Placemark(position, false, placemarkAttributes);

     var mark = '';
     if(type === 'DEBRIS'){
       mark = 'x';
     }else if (type === 'PAYLOAD') {
       mark = 'p';
     }else if (type === 'ROCKET_BODY') {
       mark = 'i';
     }else if (type === 'TBA') {
       mark = 't';
     }

     placemark.label = mark;//+" " +
         // "Latitud " + placemark.position.latitude.toPrecision(4).toString() + "\n" +
         // "Longitud " + placemark.position.longitude.toPrecision(5).toString();
     placemark.alwaysOnTop = true;

     placemarkLayer.addRenderable(placemark);
   }
 }
});

//
// processData = (allText) => {
//    console.log(allText);
//     var allTextLines = allText.split(/\r\n|\n/);
//     var headers = allTextLines[0].split(',');
//     var lines = [];
//
//     for (var i=1; i<allTextLines.length; i++) {
//         var data = allTextLines[i].split(',');
//         if (data.length == headers.length) {
//
//             var tarr = [];
//             for (var j=0; j<headers.length; j++) {
//                 tarr.push(headers[j]+":"+data[j]);
//             }
//             lines.push(tarr);
//         }
//     }
//     console.log(lines);
// }



// basura = (basuraData) =>{
//   for(var i=0; i<basuraData.length; i++){
//
//     var lati = basuraData[i].lat;
//     var long = basuraData[i].lon;
//
//     console.log(lati, long);
//
//
//     var placemarkLayer = new WorldWind.RenderableLayer("Placemark");
//     globoWorld.addLayer(placemarkLayer);
//
//     var placemarkAttributes = new WorldWind.PlacemarkAttributes(null);
//
//     placemarkAttributes.imageOffset = new WorldWind.Offset(
//         WorldWind.OFFSET_FRACTION, 0.3,
//         WorldWind.OFFSET_FRACTION, 0.0);
//
//     placemarkAttributes.labelAttributes.color = WorldWind.Color.YELLOW;
//     placemarkAttributes.labelAttributes.offset = new WorldWind.Offset(
//                 WorldWind.OFFSET_FRACTION, 0.5,
//                 WorldWind.OFFSET_FRACTION, 1.0);
//
//     placemarkAttributes.imageSource = WorldWind.configuration.baseUrl + "images/view/view-pitch-up-32x32.png";
//
//     var position = new WorldWind.Position(lati, long, 64.66);
//     var placemark = new WorldWind.Placemark(position, false, placemarkAttributes);
//
//     placemark.label = "Basura "+i+" ubicacion: \n" +
//         "Latitud " + placemark.position.latitude.toPrecision(4).toString() + "\n" +
//         "Longitud " + placemark.position.longitude.toPrecision(5).toString();
//     placemark.alwaysOnTop = true;
//
//     placemarkLayer.addRenderable(placemark);
//   }
// }

// satelites = (satelitesData) =>{
//   for(var i=0; i<satelitesData.length; i++){
//
//     var lati = satelitesData[i].lat;
//     var long = satelitesData[i].lon;
//
//     console.log(lati, long);
//
//
//     var placemarkLayer = new WorldWind.RenderableLayer("Placemark");
//     globoWorld.addLayer(placemarkLayer);
//
//     var placemarkAttributes = new WorldWind.PlacemarkAttributes(null);
//
//     placemarkAttributes.imageOffset = new WorldWind.Offset(
//         WorldWind.OFFSET_FRACTION, 0.3,
//         WorldWind.OFFSET_FRACTION, 0.0);
//
//     placemarkAttributes.labelAttributes.color = WorldWind.Color.YELLOW;
//     placemarkAttributes.labelAttributes.offset = new WorldWind.Offset(
//                 WorldWind.OFFSET_FRACTION, 0.5,
//                 WorldWind.OFFSET_FRACTION, 1.0);
//
//     placemarkAttributes.imageSource = WorldWind.configuration.baseUrl + "images/crosshair.png";
//
//     var position = new WorldWind.Position(lati, long, 100.0);
//     var placemark = new WorldWind.Placemark(position, false, placemarkAttributes);
//
//     placemark.label = "satelite "+i+" ubicacion: \n" +
//         "Latitud " + placemark.position.latitude.toPrecision(4).toString() + "\n" +
//         "Longitud " + placemark.position.longitude.toPrecision(5).toString();
//     placemark.alwaysOnTop = true;
//
//     placemarkLayer.addRenderable(placemark);
//   }
// }
// basura(basuraData);
// satelites(satelitesData);
