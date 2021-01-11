const Geocoder = require('mapquest-geocoder/index');
const geocoder = new Geocoder('YOUR-MAPQUEST-API-KEY');
const express = require('express')
var cors = require('cors')
const app = express()
app.use(cors())
const bodyParser = require('body-parser');
app.use(bodyParser.json());
const port = 3000
let cache = {};
app.post('/', (req, res) => {
    try {
        if (req.body && req.body.addresses) {
            console.log(`Request to get ${req.body.addresses.length} geolocations`)
            let payload = [];
            let cachedResponse = {}
            req.body.addresses.map(a => {
                if (cache[a]) {
                    cachedResponse[a] = cache[a]
                } else {
                    payload.push(a)
                }
                return a
            })
            if (payload.length) {  
                try {
                    geocoder.geocode(payload, function(err, locations) {
                        if (err) {
                            console.error(err)
                            res.status(500).send({ error: err })
                            return
                        };
                        let response = {};
                        if (locations&&locations.received && locations.received.length) {
                            locations.received.map(m => {
                                if (m[0]&&m[0].providedLocation &&m[0].providedLocation.location&& m[0].locations && m[0].locations.length && m[0].locations[0].latLng) {
                                    response[m[0].providedLocation.location] = m[0].locations[0].latLng;
                                    if (!cache[m[0].providedLocation.location]) {
                                        cache[m[0].providedLocation.location] = m[0].locations[0].latLng;
                                    }
                                }
                                return m[0]
                            })
                            console.log(`Fetched ${ locations.received.length} geolocations`)
                        }
                        console.log(`Sending ${ Object.keys(response).length + Object.keys(cachedResponse).length} geolocations`)
                       return  res.send({ ...response,...cachedResponse })
                  });
                } catch (e) {
                    console.error(e)
                    return res.status(500).send({ error: e })

                }
            } else {
                console.log(`Sending ${ Object.keys(cachedResponse).length} geolocations`)
               return  res.send({ ...cachedResponse })
            }
        } else {
            console.error('Bad Request')
            return res.status(400).send({ error: 'Bad Request' })
        }
    } catch (e) {
        console.error(e)
        return res.status(500).send({error:e})
    }
    
})


app.listen(port, 'localhost', function() {
    console.log(`Geocode bridge listening at http://localhost:${port}`)
    console.log('Powered by MapQuest')}).on('error', function(err){
    console.log('on error handler');
    console.log(err);
});


process.on('uncaughtException', function(err) {
    console.log('process.on handler');
    console.log(err);
});
