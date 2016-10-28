import {
	select
} from 'd3-selection';
import {
	geoMercator,
	geoPath
} from 'd3-geo';
import * as topojson from 'topojson';
import {
	json as d3_json,
	csv
} from 'd3-fetch';

export default (options) => {
	console.log(options)

	let map_sf = select(options.container).append("div").attr("class","map-sf"),
		box= map_sf.node().getBoundingClientRect();

	console.log(box)
	let svg = map_sf
					.append("svg")
					.attr("width",box.width)
					.attr("height",box.height)

	let WIDTH = box.width,
		HEIGHT = box.height;


	let projection = geoMercator()
					    .center([-122.433701, 37.767683])
					    .scale(25000)
					    .translate([WIDTH / 2, HEIGHT / 2]);

	//xMin,yMin -122.737,37.449 : xMax,yMax -122.011,37.955

	let geopath = geoPath()
					.projection(projection);

	d3_json("../assets/data/sf_small_simplified.json").then(function(sf) {

		console.log(sf)

		svg.append("path")
				.datum(topojson.feature(sf,sf.objects.sf_small))
				.attr("d",geopath)

		let stuff = topojson.feature(sf,sf.objects.sf_small)

		console.log(stuff)

		csv("../assets/data/film.csv").then(function(films){
			csv("../assets/data/locations.csv").then(function(locations){
				console.log(locations)

				films.forEach(film=>{
					let location=locations.find(location=>{
						return location.location.indexOf(film.Locations)>-1
					});
					if(!location) {
						console.log(film)	
					} else {
						film.coordinates={
							lon:+location.lon,
							lat:+location.lat
						}	
					}
					
					
				})

				let areas={};

				films.forEach(film=>{
					if(!areas[film.Title]) {
						areas[film.Title]=film;
						areas[film.Title].locations=[]
					}
					areas[film.Title].locations.push(film.coordinates)
				})
				console.log(areas)
				return;

				/*let location=svg.selectAll("g.location")
						.data(locations)
						.enter()
						.append("g")
							.attr("class","location")
							.attr("data-info",d=>d.location)
							.attr("transform",d=>{
								let coord=projection([+d.lon,+d.lat])
								console.log(coord);
								let x=coord[0],
									y=coord[1];
								return `translate(${x},${y})`;
							})

				location.append("circle")
							.attr("cx",0)
							.attr("cy",0)
							.attr("r",4)*/

			})
		});

	});


}