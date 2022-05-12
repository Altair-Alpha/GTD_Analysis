<template>
	<div id="donut-chart">
		<div id="selectSection">
			<select name="gname" id="gname" @change="onGenerate($event)">
				<option v-for="(item,index) in gnames" :key="index" :value="item" :label="item"></option>
			</select>
		</div>
		<div id="donut-chart-graph"></div>
	</div>
</template>

<script>
	import * as d3 from 'd3';

	var rawData = []
	var data = []
	var attackCount = []

	var width = 1400
	var height = 800
	var margin = 40
	var radius = (Math.min(width, height) / 2 - margin) / 2 - 40
	var svg
	var color

	function procData(gname) {
		data = rawData.filter(d => d.name == gname)
		return data
	}

	export default {
		name: 'DonutChart',
		data() {
			return {
				gnames: [],
			}
		},
		methods: {
			init: function() {
				rawData = this.getDonutChartData()
				// 不重复取所有组织名
				this.gnames = [...new Set(rawData.map(d => d.name))]
				// 计算每种type的attack之和
				var sum = 0
				for (let i = 0; i < this.gnames.length; i++) {
					let tempData = rawData.filter(d => d.name == this.gnames[i])
					sum = 0
					for (let j = 0; j < tempData.length; j++) {
						sum += tempData[j].attacks
					}
					sum /= 4
					attackCount.push({name: tempData[0].name, attacks: sum})
				}
				svg = d3.select("#donut-chart-graph")
					.append("svg")
					.attr("width", width)
					.attr("height", height)
				
				procData('Taliban')
				this.draw()
			},
			draw: function() {
				svg.selectAll('*').remove()
				this.drawSingle(1, [width / 4, height / 4], 'Red2Blue')
				this.drawSingle(2, [width * 3 / 4, height / 4], 'Blue2Red')
				this.drawSingle(3, [width / 4, height * 3 / 4], 'Blue2Red')
				this.drawSingle(4, [width * 3 / 4, height * 3 / 4], 'Red2Blue')
			},
			drawSingle: function(type, offset, colorType) {

				let singleData = data.filter(d => d.type == type)

				let g = svg.append("g")
					.attr("transform", "translate(" + offset[0] + "," + offset[1] + ")");

				var pie = d3.pie()
					.padAngle(0.005)
					.sort(null)
					.value(d => d.attacks)

				var data_ready = pie(singleData)

				color = d3.scaleOrdinal()
					.domain(singleData.map(d => d.category))

				if (colorType == 'Red2Blue') {
					color = color.range(d3.quantize(t => d3.interpolateSpectral(t * 0.8 + 0.1), singleData.length))
				} else if (colorType == 'Blue2Red') {
					color = color.range(d3.quantize(t => d3.interpolateSpectral(t * 0.8 + 0.1), singleData.length).reverse())
				}

				var arc = d3.arc()
					.innerRadius(radius * 0.5) // This is the size of the donut hole
					.outerRadius(radius * 0.8)

				// Another arc that won't be drawn. Just for labels positioning
				var outerArc = d3.arc()
					.innerRadius(radius * 0.9)
					.outerRadius(radius * 0.9)

				g
					.selectAll('allSlices')
					.data(data_ready)
					.enter()
					.append('path')
					.attr('d', arc)
					.attr('fill', function(d) {
						return (color(d.data.category))
					})
					.attr("stroke", "white")
					.style("stroke-width", "1px")
					.style("opacity", 0.7)
					.transition().duration(1000)
					.attrTween('d', function(d) {
						var i = d3.interpolate({
							startAngle: 1.1 * Math.PI,
							endAngle: 1.1 * Math.PI
						}, d);
						return function(t) {
							return arc(i(t));
						};
					})

				// Add the polylines between chart and labels:
				g
					.selectAll('allPolylines')
					.data(data_ready.filter((d, i) => type == 4 ? i < 2 : i < 3))
					.enter()
					.append('polyline')
					.attr("stroke", "black")
					.style("fill", "none")
					.attr("stroke-width", 1)
					.attr('points', function(d) {
						var posA = arc.centroid(d) // line insertion in the slice
						var posB = outerArc.centroid(d) // line break: we use the other arc generator that has been built only for that
						var posC = outerArc.centroid(d); // Label position = almost the same as posB
						var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2 // we need the angle to see if the X position will be at the extreme right or extreme left
						posC[0] = radius * 0.95 * (midangle < Math.PI ? 1 : -1); // multiply by 1 or -1 to put it on the right or on the left
						return [posA, posB, posC]
					})
					.style("opacity", 0)
					.transition().delay(1000).duration(800)
					.style("opacity", 1)

				let text = g
					.selectAll('allLabels')
					.data(data_ready.filter((d, i) => type == 4 ? i < 2 : i < 3))
					.enter()
					.append('text')
					.attr('transform', function(d) {
						var pos = outerArc.centroid(d);
						var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
						pos[0] = radius * 0.99 * (midangle < Math.PI ? 1 : -1);
						return 'translate(' + pos + ')';
					})
				text
					.append('tspan')
					.text(d => d.data.category)
					.style('text-anchor', function(d) {
						var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
						return (midangle < Math.PI ? 'start' : 'end')
					})
				text
					.append('tspan')
					.text(d => '次数: ' + d.data.attacks + '     百分比: ' + (100 * d.data.attacks / attackCount.find(item => item.name == d.data.name).attacks).toFixed(2) +'%')
					.attr('x', 0)
					.attr('dy', 20)
					.style('text-anchor', function(d) {
						var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
						return (midangle < Math.PI ? 'start' : 'end')
					})
					.style('white-space', 'pre')
				text
					.style("opacity", 0)
					.transition().delay(1000).duration(800)
					.style("opacity", 1)
			},
			onGenerate: function(e) {
				let gname = e.target.value
				procData(gname)
				this.draw()
			}
		}
	}
</script>

<style>
	#gname{
		color: #273747;
		margin-left: 0.625rem;
		font-family: helvetica;
		font-size: 0.875rem;
		width: 21.875rem;
		height: 2rem;
		border: 0.125rem solid rgb(247, 105, 25);
		appearance: none;
		background-color: rgb(235, 239, 242);
		background: url(../assets/img/down.png) 20.3125rem center no-repeat;
		padding-left: 0.3125rem;
	}
	#gname:hover{
		background-color: rgba(189, 196, 202,70%);
	}
</style>
