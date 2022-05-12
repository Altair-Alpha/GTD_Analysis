<template>
	<div id='choropleth'>
		<div id='selectSection'>
			<select name="category" id="category">
				<option value="attacks">袭击次数</option>
				<option value="killed">死亡人数</option>
			</select>
		<button @click="onGenerate">生成</button>
		</div>
		<div id="choropleth-graph"></div>
		<div id="tooltip"></div>
	</div>
</template>

<script>
	import * as d3 from 'd3';
	import * as geo from 'd3-geo-projection'

	var svg, g
	var projection
	var zoom
	var path
	var width = 1200,
		height = 600
	var tooltip
	var rawData = [],
		data = []
	var attackScale = [205, 1565, 2910, 4838, 7994, 14410]
	var killedScale = [277, 2535, 5169, 11315, 19046, 25222]
	var curScale
	var dataMap = new Map()
	var color

	function procData(category) {
		if (category == 'attacks') {
			curScale = attackScale
		} else if (category == 'killed') {
			curScale = killedScale
		}
		data = rawData.map(d => ({
			name: d.name,
			code: d.code,
			value: d. [category]
		}));
		for (let i = 0; i < data.length; i++) {
			dataMap.set(data[i].code, data[i].value)
		}
	}

	var mouseMove = function(e) {
		tooltip
			.style('left', (e.pageX + 15) + 'px')
			.style('top', (e.pageY - 35) + 'px')
	}
	
function zoomed(event) {
		const {transform} = event;
		g.attr("transform", transform);
		g.attr("stroke-width", 1 / transform.k);
}

	export default {
		name: 'Choropleth',
		created() {

		},
		mounted() {
			// The svg
			svg = d3.select('#choropleth-graph')
				.append("svg")
				.attr("width", width)
				.attr("height", height)
				.on('mousemove', mouseMove)
			tooltip = d3.select('#tooltip')
				.style('display', 'none');

			projection = d3.geoMercator()
				.scale(180)
				.center([0, 20])
				.translate([width / 2, height / 2]);

			path = d3.geoPath(projection);
			
			zoom = d3.zoom()
				.scaleExtent([1, 8])
				.on("zoom", zoomed);
		},
		methods: {
			init: function() {
				rawData = this.getChoroplethData()
			},
			draw() {
				// 消除全部地图会闪动
				d3.select("#choropleth-graph").selectAll("g").remove()

				let mouseOver = function(e) {
					//console.log(e.toElement);
					d3.selectAll(".Country")
						.transition()
						.duration(200)
						.style("opacity", .5)
					d3.select(e.toElement)
						.transition()
						.duration(200)
						.style("opacity", 1)
						.style("stroke", "black")
					tooltip.style('display', 'block');
					let cid = e.toElement.id
					//console.log(cid);

					let country = rawData.find(function(item) {
						return item.name == cid
					})
					if (typeof(country) == 'undefined') {
						country = {
							name: cid,
							killed: 0,
							attacks: 0
						}
					}
					let text = country.name + '\n\n袭击数: ' + country.attacks + '\n死亡数: ' + country.killed
					tooltip.text(text)
				}

				let mouseLeave = function(e) {
					d3.selectAll(".Country")
						.transition()
						.duration(200)
						.style("opacity", .8)
					e.fromElement.style.setProperty('stroke', 'transparent')
					tooltip.style('display', 'none');
				}

				d3.json("world.geojson").then(function(topo) {
					//等比例
					color = d3.scaleSequential()
						.domain(d3.extent(Array.from(dataMap.values())))
						.interpolator(d3.interpolateYlGnBu)
						.unknown("#ccc")

					//*
					// 7挡阈值
					color = d3.scaleThreshold()
						.domain(curScale)
						.range(d3.schemeOranges[7]);
					//*/;
				g = svg.append("g")
				g
					.selectAll("path")
					.data(topo.features)
					.enter()
					.append("path")
					// draw each country
					.attr("d", path)
					// set the color of each country
					.attr("fill", function(d) {
						d.total = dataMap.get(d.id) || 0;
						return color(d.total);
					})
					.style("stroke", "transparent")
					.attr("class", d => "Country")
					.attr("id", d => d.properties.name)
					.style("opacity", .8)
					.on("mouseover", mouseOver)
					.on("mouseleave", mouseLeave)
				
				svg.call(zoom)
				})
			},
			onGenerate: function() {
				let category = d3.select(this.$el)
					.select('#category').node().value
				procData(category)
				this.draw()
			}
		}
	}
</script>

<style>
	#tooltip {
		color: #222;
		background-color: #464646;
		padding: .5em;
		text-shadow: #f5f5f5 0 1px 0;
		border-radius: 3px;
		opacity: 0.9;
		position: absolute;
		font-size: 0.9375rem;
		white-space: pre-line;
		color: white;
		text-align: left;
		width: 7rem;
		height: 6rem;
	}
</style>
