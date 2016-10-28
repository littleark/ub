var API_KEY="AIzaSyD8ruGJznTm8dx9TbE4DzQ7izO6T-et454";

var googleMapsClient = require('@google/maps').createClient({
  key: API_KEY
});

googleMapsClient.geocode({
	address: '1600 Amphitheatre Parkway, Mountain View, CA'
}, function(err,response){
	if(!err) {
		console.log(response.json.results)
	}
})