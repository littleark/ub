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
import {
	mean
} from 'd3-array';
import {
	entries
} from 'd3-collection';
import {
	line as d3_line
} from 'd3-shape';

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
					    .scale(250000)
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
						areas[film.Title].locations=[];
						areas[film.Title].coords=[];
					}
					if(film.coordinates) {
						areas[film.Title].locations.push(film.coordinates)
						let coords=projection([+film.coordinates.lon,+film.coordinates.lat])
						areas[film.Title].coords.push(coords)
					}
				})

				for(let title in areas) {
					/* jshint loopfunc: true */
					//console.log(title,areas[title])
					areas[title].location_mean={
						lon:mean(areas[title].locations,l=>+l.lon),
						lat:mean(areas[title].locations,l=>+l.lat)
					}
					let coord_mean=[
						mean(areas[title].coords,l=>l[0]),
						mean(areas[title].coords,l=>l[1])
					];
					areas[title].coord_mean=coord_mean;

					areas[title].coords=areas[title].coords.sort((a,b)=>{
																let alpha=Math.atan2(a.y-coord_mean[1],a.x-coord_mean[0]),
																		beta=Math.atan2(b.y-coord_mean[1],b.x-coord_mean[0])
																return alpha - beta;
															})

					//areas[title].
				}


				let area_line=d3_line()
												.x(d=>d[0])
												.y(d=>d[1])

				let location=svg.selectAll("g.area")
						.data(entries(areas))
						.enter()
						.append("g")
							.attr("class","area")
							.attr("data-info",d=>d.key)

				location.append("path")
									.attr("d",d=>{
										let points=d.value.coords;
										console.log(points)
										return area_line(points)
										//return line()
									})

				// location.append("circle")
				// 			.attr("cx",0)
				// 			.attr("cy",0)
				// 			.attr("r",4)*/

			})
		});

	});


}
