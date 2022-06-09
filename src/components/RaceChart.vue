<template>
	<div id="race-chart">
		<div id="selectSection">
			<select name="category" id="category">
				<option value="attacks">袭击次数</option>
				<option value="killed">死亡人数</option>
			</select>
			<button @click="onGenerate">播放</button>
		</div>
		<div id="race-chart-graph"></div>
	</div>
</template>

<script>
	import * as d3 from 'd3';
	// 原始数据
	var rawData = []
	// 筛选袭击次数/死亡人数的数据
	var data = []
	// 展示前n名
	var n = 12
	var barSize = 40
	var margin = ({
		top: 16,
		right: 6,
		bottom: 6,
		left: 0
	})
	var height = margin.top + barSize * n + margin.bottom
	var width = 1000

	var names
	var datevalues
	var k = 10
	var duration = 140
	
	var gnameMap

	function rank(value) {
		const data = Array.from(names, name => ({
			name,
			value: value(name)
		}));
		data.sort((a, b) => d3.descending(a.value, b.value));
		for (let i = 0; i < data.length; ++i) data[i].rank = Math.min(n, i);
		return data;
	}

	function keyframes() {
		const keyframes = [];
		let ka, a, kb, b;
		for ([[ka, a], [kb, b]] of d3.pairs(datevalues)) {
			for (let i = 0; i < k; ++i) {
				const t = i / k;
				keyframes.push([
					new Date(ka * (1 - t) + kb * t),
					rank(name => (a.get(name) || 0) * (1 - t) + (b.get(name) || 0) * t)
				]);
			}
		}
		keyframes.push([new Date(kb), rank(name => b.get(name) || 0)]);
		return keyframes;
	}

	var nameframes
	var prev
	var next
	var svg

	var x = d3.scaleLinear([0, 1], [margin.left, width - margin.right])
	var y = d3.scaleBand()
		.domain(d3.range(n + 1))
		.rangeRound([margin.top, margin.top + barSize * (n + 1 + 0.1)])
		.padding(0.1)
		
	function procData(category) {
		data = rawData.map(d => ({
			year: d.year,
			name: d.name,
			value: d[category]
		}))
		return data
	}

	export default {
		name: 'RaceChart',
		data() {
			return {};
		},
		methods: {
			init: function() {
				gnameMap = this.GLOBAL.gnameMap
				rawData = this.getRaceChartData()
				names = new Set(rawData.map(d => d.name))
				svg = d3.select('#race-chart-graph')
				.append("svg")
							.attr("width", width + margin.left + margin.right)
							.attr("height", height + margin.top + margin.bottom)
			},
			play: async function(data) {
				const updateBars = bars(svg);
				const updateAxis = axis(svg);
				const updateLabels = labels(svg);
				const updateTicker = ticker(svg);
				
				for (const keyframe of keyframes()) {
						const transition = svg.transition()
								.duration(duration)
								.ease(d3.easeLinear);
						// Extract the top bar’s value.
						x.domain([0, keyframe[1][0].value+500]);
						
						updateAxis(keyframe, transition);
						updateBars(keyframe, transition);
						updateLabels(keyframe, transition);
						updateTicker(keyframe, transition);
						
						await transition.end();
				}
			},
			onGenerate: function() {
				let category = d3.select(this.$el)
					.select('#category').node().value
				procData(category)
				datevalues = Array.from(d3.rollup(data, ([d]) => d.value, d => d.year, d => d.name))
					.map(([date, data]) => [new Date(date), data])
					.sort(([a], [b]) => d3.ascending(a, b))
				nameframes = d3.groups(keyframes().flatMap(([, data]) => data), d => d.name)
				prev = new Map(nameframes.flatMap(([, data]) => d3.pairs(data, (a, b) => [b, a])))
				next = new Map(nameframes.flatMap(([, data]) => d3.pairs(data)))
				this.play(data)
			}
		}
	}
	
	function bars(svg) {
		let bar = svg.append("g")
				.attr("fill-opacity", 0.6)
			.selectAll("rect");
		
		return ([date, data], transition) => bar = bar
			.data(data.slice(0, n), d => d.name)
			.join(
				enter => enter.append("rect")
					.attr("fill", (d,i) => d3.schemeTableau10[d3.randomInt(10)()])
					.attr("height", y.bandwidth())
					.attr("x", x(0))
					.attr("y", d => y((prev.get(d) || d).rank))
					.attr("width", d => x((prev.get(d) || d).value) - x(0)),
				update => update,
				exit => exit.transition(transition).remove()
					.attr("y", d => y((next.get(d) || d).rank))
					.attr("width", d => x((next.get(d) || d).value) - x(0))
			)
			.call(bar => bar.transition(transition)
				.attr("y", d => y(d.rank))
				.attr("width", d => x(d.value) - x(0)));
	}
	
	function labels(svg) {
		let label = svg.append("g")
				.style("font", "bold 12px var(--Helvetica)")
				.style("font-variant-numeric", "tabular-nums")
				.attr("text-anchor", "end")
			.selectAll("text");
	
		return ([date, data], transition) => label = label
			.data(data.slice(0, n), d => d.name)
			.join(
				enter => enter.append("text")
					.attr("transform", d => `translate(${x((prev.get(d) || d).value)},${y((prev.get(d) || d).rank)})`)
					.attr("y", y.bandwidth() / 2)
					.attr("x", -6)
					.attr("dy", "0.18em")
					.text(d => gnameMap[d.name])
					.call(text => text.append("tspan")
						.attr("fill-opacity", 1)
						.attr("font-weight", "normal")
						.attr("x", 46)
						.attr("dy", "0.15em")
						),
				update => update,
				exit => exit.transition(transition).remove()
					.attr("transform", d => `translate(${x((next.get(d) || d).value)},${y((next.get(d) || d).rank)})`)
					.call(g => g.select("tspan").tween("text", d => textTween(d.value, (next.get(d) || d).value)))
			)
			.call(bar => bar.transition(transition)
				.attr("transform", d => `translate(${x(d.value)},${y(d.rank)})`)
				.call(g => g.select("tspan").tween("text", d => textTween((prev.get(d) || d).value, d.value))));
	}
	
	function textTween(a, b) {
		const i = d3.interpolateNumber(a, b);
		return function(t) {
			this.textContent = formatNumber(i(t));
		};
	}
	
	var formatNumber = d3.format(",d")
	
	function axis(svg) {
		const g = svg.append("g")
				.attr("transform", 'translate(0,16)')
				.style('font-size', '15px');
	
		const axis = d3.axisTop(x)
				.ticks(width / 160)
				.tickSizeOuter(0)
				.tickSizeInner(-barSize * (n + y.padding()));
	
		return (_, transition) => {
			g.transition(transition).call(axis);
			g.select(".tick:first-of-type text").remove();
			g.selectAll(".tick:not(:first-of-type) line").attr("stroke", "white");
			g.select(".domain").remove();
		};
	}
	
	var formatDate = d3.utcFormat("%Y")
	
	function ticker(svg) {
		const now = svg.append("text")
				.style("font-size", '40px')
				.style("font-weight", 'bold')
				.style("font-variant-numeric", "tabular-nums")
				.attr("text-anchor", "end")
				.attr("x", width - 6)
				.attr("y", margin.top + barSize * (n - 0.45))
				.attr("dy", "0.32em")
	
		return ([date], transition) => {
			transition.end().then(() => now.text(formatDate(date)));
		};
	}
	
</script>

<style>
	#selectSection{
		margin-top: 1.25rem;
		margin-bottom: 1.25rem;
	}
	#category{
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
	button{
		color: #273747;
		margin-left: 0.625rem;
		font-family: helvetica;
		font-size: 0.875rem;
		width: 5.625rem;
		height: 1.75rem;
		border: 0.125rem solid rgb(247, 105, 25);
		appearance: none;
		background-color: rgb(235, 239, 242);
		padding-left: 0.3125rem;
	}
	#category:hover{
		background-color: rgba(189, 196, 202,70%);
	}
	button:hover{
		background-color: rgba(189, 196, 202,70%);
	}
</style>
