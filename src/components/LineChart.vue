<template>
	<div id="line-chart">
		<div id="selectSection">
			<select name="type" id="type" @change="getType($event)" v-model="form.type" >
				<option v-for="(item,index) in types" :key="index" :value="item.value" :label="item.name"></option>
			</select>
			<select name="detailedType" id="detailedType" @change="onGenerate()" v-model="form.detailedType" >
				<option v-for="(item,index) in detailedTypes" :key="index" :value="item.value" :label="item.name"></option>
			</select>
			<select name="category" id="category" @change="onGenerate()" >
				<option value="attacks">攻击次数</option>
				<option value="killed">死亡人数</option>
				<option value="wounded">受伤人数</option>
			</select>
		</div>
		<div id="line-chart-graph"></div>
	</div>
</template>

<script>
	import * as d3 from 'd3';
	import typeSelect from '../assets/json/LineChartSelect.json'

	var data = [], result = []
	var svg
	var margin
	var x, xAxis, y, yAxis
	var category = 'attacks'
	var focus, focusText
	var svgrect
	var line1, line2, crosspoint
	var text1, text2
	// 含边距的总宽高
	var totalWidth = 1000
	var totalHeight = 600
	var width, height

	var bisect = d3.bisector(d => d.year).left;

	function categoryMap(category) {
		if (category == 'attacks') {
			return '袭击次数'
		} else if (category == 'killed') {
			return '死亡人数'
		} else if (category == 'wounded') {
			return '受伤人数'
		}
	}

	function procData(type, category) {
		var filteredData = data.filter(d => d.type == type)
		result = filteredData.map(d => ({
			year: d.year,
			value: d[category]
		}))
		return result
	}

	export default {
		name: 'LineChart',
		data() {
			return {
				// type代表一级地区选择，detailedType代表二级，category代表指标
				types: '',
				detailedTypes: '',
				form: {
					type: '',
					detailedType: '',
					category: ''
				}
			};
		},
		created: function() {
			this.types = typeSelect.body
			this.form.type = this.types[0].value
			this.detailedTypes = this.types[0].children
			this.form.detailedType = this.detailedTypes[0].value
		},
		methods: {
			init: function() {
				data = this.getLineChartData()
				margin = {
						top: 100,
						right: 150,
						bottom: 30,
						left: 50
					},
					width = totalWidth - margin.left - margin.right,
					height = totalHeight - margin.top - margin.bottom;
				svg = d3.select("#line-chart-graph")
					.append("svg")
					.attr("width", width + margin.left + margin.right)
					.attr("height", height + margin.top + margin.bottom)
					.append("g")
					.attr("transform",
						"translate(" + margin.left + "," + margin.top + ")");

				x = d3.scaleLinear().range([0, width]);
				xAxis = d3.axisBottom().scale(x).ticks((2018 - 1970) / 5).tickFormat(d3.format("d"));

				svg.append("g")
					.attr("transform", "translate(0," + height + ")")
					.attr("class", "myXaxis")

				y = d3.scaleLinear().range([height, 0]);
				yAxis = d3.axisLeft().scale(y);

				svg.append("g")
					.attr("class", "myYaxis")
				
				
				let mouseover = function() {
					focus.style("opacity", 0.8)
					line1.style("opacity", 0.8)
					line2.style("opacity", 0.8)
					focusText.style("opacity", 0.9)
					text1.style("opacity", 0.9)
					text2.style("opacity", 0.9)
				}
				
				let mousemove = function(e) {
					// recover coordinate we need
					//console.log();
					var x0 = x.invert(d3.pointer(e)[0]);
					var i = bisect(result, x0, 1);
					let selectedData = result[i]
					//console.log(category);
					
					focus
						.attr("cx", x(selectedData.year))
						.attr("cy", y(selectedData.value))
					
					line1
						.attr("x1", 0)
						.attr("x2", svgrect.width)
						.attr("y1", y(selectedData.value))
						.attr("y2", y(selectedData.value))
					line2
						.attr("x1", x(selectedData.year))
						.attr("x2", x(selectedData.year))
						.attr("y1", 0)
						.attr("y2", svgrect.height)
					focusText
						.attr("cx", x(selectedData.year) + 20)
						.attr("cy", y(selectedData.value) - 50)
					text1.text('年份: ' + selectedData.year)
						.attr("x", x(selectedData.year) + 20)
						.attr("dy", y(selectedData.value) - 50)
					text2.text(categoryMap(category) +': ' + selectedData.value)
					.attr("x",  x(selectedData.year) + 15)
					.attr("dy","1.5em")
				}
				
				let mouseout = function() {
					focus.style("opacity", 0)
					line1.style("opacity", 0)
					line2.style("opacity", 0)
					focusText.style("opacity", 0)
				}

				focus = svg
					.append('g')
					.append('circle')
					.attr("stroke", "black")
					.attr("fill", "black")
					.attr('r', 4)
					.style("opacity", 0)
				line1 = svg
					.append('line')
					.attr("stroke", "black")
					.attr("stroke-width", 1)
					.style("opacity", 0)
				line2 = svg
					.append('line')
					.attr("stroke", "black")
					.attr("stroke-width", 1)
					.style("opacity", 0)
				// Create the text that travels along the curve of chart
				focusText = svg
					.append('g')
					.append('text')
				text1 = focusText
					.append('tspan')
					.attr('id', 't1')
					.style("opacity", 0)
					.attr("text-anchor", "left")
					.attr("alignment-baseline", "middle")
				text2 = focusText
					.append('tspan')
					.attr('id','t2')
					.style("opacity", 0)
					.attr("text-anchor", "left")
					.attr("alignment-baseline", "middle")
				
				// Create a rect on top of the svg area: this rectangle recovers mouse position
				svg
					.append('rect')
					.style("fill", "none")
					.style("pointer-events", "all")
					.attr('width', width)
					.attr('height', height)
					.on('mouseover', mouseover)
					.on('mousemove', mousemove)
					.on('mouseout', mouseout);
					
				svgrect = svg.node().getBoundingClientRect()

				this.update(procData(1, 'attacks'))
			},
			// Create a function that takes a dataset as input and update the plot:
			update: function(data) {
				// Create the X axis:
				x.domain([1970, 2018]);
				svg.selectAll(".myXaxis").transition()
					.duration(2000)
					.call(xAxis);
				// create the Y axis
				y.domain([0, d3.max(data,  d => d.value)]);
				svg.selectAll(".myYaxis")
					.transition()
					.duration(2000)
					.call(yAxis);
				// Create a update selection: bind to the new data
				var u = svg.selectAll(".lineTest")
					.data([data],d => d.year);
				// Update the line
				const max = d3.max(data, d => +d.value);
				var color = d3.scaleSequential(y.domain(), d3.interpolateTurbo)
				svg.append("linearGradient")
					.attr("id", "line-gradient")
					.attr("gradientUnits", "userSpaceOnUse")
					.attr("x1", 0)
					.attr("y1", y(0))
					.attr("x2", 0)
					.attr("y2", y(max))
					.selectAll("stop")
					.data(d3.ticks(0, 1, 10))
					.join("stop")
					.attr("offset", d => d)
					.attr("stop-color", color.interpolator());

				u
					.enter()
					.append("path")
					.attr("class", "lineTest")
					.merge(u)
					.transition()
					.duration(2000)
					.attr("d", d3.line()
						.x(d => x(d.year))
						.y(d => y(d.value)))
					.attr("fill", "none")
					.attr("stroke", "url(#line-gradient)")
					.attr("stroke-width", 3.5)
			},
			getType: function(event) {
				let type = event.target.value
				if (type == 'world') {
					this.detailedTypes = this.types[0].children
				} else if (type == 'region') {
					this.detailedTypes = this.types[1].children
				} else if (type == 'country') {
					this.detailedTypes = this.types[2].children
				}
				//console.log(this.detailedTypes);
			},
			onGenerate: function() {
				let type = d3.select(this.$el)
					.select('#detailedType').node().value
				category = d3.select(this.$el)
					.select('#category').node().value
				this.update(procData(type, category))
			}
		},
	};
</script>

<style scoped>
	#selectSection{
		margin-top: 1.25rem;
	}
	#type{
		color: #273747;
		font-family: helvetica;
		font-size: 0.875rem;
		width: 5.625rem;
		height: 1.75rem;
		border: 0.125rem solid rgb(43, 189, 218);
		appearance: none;
		background-color: rgb(235, 239, 242);
		background: url(../assets/img/down.png) 4.0625rem center  no-repeat;
		padding-left: 0.3125rem;
	}
	#detailedType{
		color: #273747;
		margin-left: 0.625rem;
		font-family: helvetica;
		font-size: 0.875rem;
		width: 12.5rem;
		height: 1.75rem;
		border: 0.125rem solid rgb(71, 209, 106);
		appearance: none;
		background-color: rgb(235, 239, 242);
		background: url(../assets/img/down.png) 10.9375rem center no-repeat;
		padding-left: 0.3125rem;
	}
	#category{
		color: #273747;
		margin-left: 0.625rem;
		font-family: helvetica;
		font-size: 0.875rem;
		width: 5.625rem;
		height: 1.75rem;
		border: 0.125rem solid rgb(247, 105, 25);
		appearance: none;
		background-color: rgb(235, 239, 242);
		background: url(../assets/img/down.png) 4.0625rem center no-repeat;
		padding-left: 0.3125rem;
	}
	#category:hover{
		background-color: rgba(189, 196, 202,70%);
	}
	#detailedType:hover{
		background-color: rgba(189, 196, 202,70%);
	}
	#type:hover{
		background-color: rgba(189, 196, 202,70%);
	}
	svg {
		font-family: "Microsoft YaHei", Arial, Helvetica, sans-serif, "宋体";
	}
</style>
