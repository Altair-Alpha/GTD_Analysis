<template>
	<div id="word-cloud">
		<div id="selectSection">
			<select name="" id="category">
				<option value="attacktype">攻击类型</option>
				<option value="targettype">目标类型</option>
				<option value="weapontype">武器类型</option>
			</select>
			<input id="yearbegin" type="number" min="1970" max="2018" value="1970">
			<input id="yearend" type="number" min="1970" max="2018" value="2018">
			<select name="" id="metric">
				<option value="count">发生次数</option>
				<option value="killed">死亡人数</option>
			</select>
			<button @click="onGenerate" >生成</button>
		</div>
		<div id="word-cloud-graph"></div>
	</div>
</template>

<script>
	import * as d3 from 'd3';
	import * as Canvas from 'canvas'
	import * as cloud from "d3-cloud";

	const width = 1024
	const height = 768
	var sizeMap = [100, 60, 60, 50, 50, 40, 40, 30]
	var data = []
	var attackTypeMap = []
	var targetTypeMap = []
	var weaponTypeMap = []
	var myWordCloud
	var svg
	var rot = 0

	function wordCloud(selector) {
		var svg = d3.select(selector).append("svg")
			.attr("width", width)
			.attr("height", height)
			.append("g")
			.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

		var fill = d3.scaleOrdinal(d3.schemeTableau10);
		function draw(words) {
			var cloud = svg.selectAll(".cloud")
				.data(words, d => d.text)

			cloud.enter()
				.append("text")
				.attr("class", "cloud")
				.style("font-family", "Helvetica")
				.style("fill", (d, i) => fill(i))
				.attr("text-anchor", "middle")
				.attr('font-size', 1)
				.text(d => d.text);

			cloud
				.transition()
				.duration(600)
				.attr('font-size', d => d.size + "px")
				.attr("transform", function(d) {
					return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
				})
				.style("fill-opacity", 1);

			cloud.exit()
				.transition()
				.duration(200)
				.style('fill-opacity', 1e-6)
				.attr('font-size', 1)
				.remove();
		}

		return {
			update: function(words) {
				cloud().size([width, height])
					.words(words)
					.padding(5)
					.rotate(() => ~~(Math.random() * 2) * 90 * ((rot++) % 2))
					.font("Helvetica")
					.fontSize(d => d.size)
					.on("end", draw)
					.start();
			}
		}
	}

	function procData(category, yearBegin, yearEnd) {
		// 处理数据
		var filteredData = data.filter(d => d.cat == category)
			.filter(d => d.year >= yearBegin && d.year <= yearEnd)
		var result = Array.from({
			length: 25
		}, (v, i) => 0)
		for (let i in filteredData) {
			result[filteredData[i].type] += (filteredData[i].count + filteredData[i].killed)
		}
		switch (category) {
			case 1:
			case 4:
				result = result.map((d, i) => ({
					text: attackTypeMap[i],
					size: d
				}))
				break;
			case 2:
			case 5:
				result = result.map((d, i) => ({
					text: targetTypeMap[i],
					size: d
				}))
				break;
			case 3:
			case 6:
				result = result.map((d, i) => ({
					text: weaponTypeMap[i],
					size: d
				}))
				break;
		}
		for (let i = result.length - 1; i >= 0; i--) {
			if (typeof(result[i].text) == 'undefined') {
				result.splice(i, 1);
			} else {
				result.splice(i, 1);
				break
			}
		}
		result.splice(0, 1)
		result.sort((d1, d2) => d2.size - d1.size)
		result = result.splice(0, 8)
		for (var i = 0; i < 8; i++) {
			result[i].size = sizeMap[i]
		}
		return result
	}

	export default {
		name: 'WordCloud',
		data() {
			return {};
		},
		methods: {
			init: function() {
				data = this.getWordCloudData()
				attackTypeMap = this.GLOBAL.attackTypeMap;
				targetTypeMap = this.GLOBAL.targetTypeMap;
				weaponTypeMap = this.GLOBAL.weaponTypeMap;
				myWordCloud = wordCloud('#word-cloud-graph');
				this.onGenerate()
			},
			onGenerate: function() {
				let category = d3.select(this.$el)
					.select('#category').node().value
				let yearBegin = d3.select(this.$el)
					.select('#yearbegin')
					.node().value;
				let yearEnd = d3.select(this.$el)
					.select('#yearend')
					.node().value;
				if (yearBegin == '' || yearEnd == '') {
					alert('请输入年份')
					return
				}
				if (yearBegin > yearEnd) {
					alert('结束年份应大于起始年份')
					return
				}
				let metric = d3.select(this.$el)
					.select('#metric').node().value
				let type = 0;
				if (category == 'attacktype') {
					if (metric == 'count') {
						type = 1;
					} else if (metric == 'killed') {
						type = 4;
					}
				} else if (category == 'targettype') {
					if (metric == 'count') {
						type = 2;
					} else if (metric == 'killed') {
						type = 5;
					}
				} else if (category == 'weapontype') {
					if (metric == 'count') {
						type = 3;
					} else if (metric == 'killed') {
						type = 6;
					}
				}
				myWordCloud.update(procData(type, yearBegin, yearEnd))
				myWordCloud.update(procData(type, yearBegin, yearEnd))
			},
		},
	}
</script>

<style scoped>
	#selectSection{
		margin-top:1.25rem;
	}
	#category{
		color: #273747;
		font-family: helvetica;
		font-size: 0.875rem;
		width: 5.625rem;
		height: 2rem;
		border: 0.125rem solid rgb(43, 189, 218);
		appearance: none;
		background-color: rgb(235, 239, 242);
		background: url(../assets/img/down.png) 4.0625rem center  no-repeat;
		padding-left: 0.3125rem;
	}
	#yearbegin{
		color: #273747;
		margin-left: 0.625rem;
		font-family: helvetica;
		font-size: 0.875rem;
		width: 12.5rem;
		height: 1.75rem;
		border: 0.125rem solid rgb(71, 209, 106);
		appearance: none;
		background-color: rgb(235, 239, 242);
		padding-left: 0.3125rem;
	}
	#yearend{
		color: #273747;
		margin-left: 0.625rem;
		font-family: helvetica;
		font-size: 0.875rem;
		width: 12.5rem;
		height: 1.75rem;
		border: 0.125rem solid rgb(71, 209, 106);
		appearance: none;
		background-color: rgb(235, 239, 242);
		padding-left: 0.3125rem;
	}
	#metric{
		color: #273747;
		margin-left: 0.625rem;
		font-family: helvetica;
		font-size: 0.875rem;
		width: 5.625rem;
		height: 2rem;
		border: 0.125rem solid rgb(247, 105, 25);
		appearance: none;
		background-color: rgb(235, 239, 242);
		background: url(../assets/img/down.png) 4.0625rem center no-repeat;
		padding-left: 0.3125rem;
	}
	#category:hover{
		background-color: rgba(189, 196, 202,70%);
	}
	#yearbegin:hover{
		background-color: rgba(189, 196, 202,70%);
	}
	#yearend:hover{
		background-color: rgba(189, 196, 202,70%);
	}
	#metric:hover{
		background-color: rgba(189, 196, 202,70%);
	}
	button:hover{
		background-color: rgba(189, 196, 202,70%);
	}
	button{
		color: #273747;
		margin-left: 0.625rem;
		font-family: helvetica;
		font-size: 0.875rem;
		width: 5.625rem;
		height: 2rem;
		border: 0.125rem solid rgb(255, 85, 127);
		appearance: none;
		background-color: rgb(235, 239, 242);
		padding-left: 0.3125rem;
	}
</style>