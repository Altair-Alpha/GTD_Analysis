<template>
	<div id='maincontent' >
		<div id="LineChart" class="chartBlock">
			<h2 style="margin: 1.25rem;">1970~2018 恐怖袭击伤亡人数折线图</h2>
			<p style="margin: 0.625rem;">统计了1970至2018年全球、各个地区、各个国家 因恐怖袭击而伤亡的人数</p>
			<LineChart ref='LineChart'></LineChart>
			<ul>
				<li><p>世界范围内总体恐怖活动数量增长明显，2014年袭击发生次数为1971年的30多倍</p></li>
				<li><p>总体上伤亡人数与恐怖袭击次数发展趋势相近，但存在例外，主要体现为性质特别恶劣的事件，如美国911事件</p></li>
				<li><p>不同地区发展趋势区别很大（中东 VS. 西欧）</p></li>
			</ul>
		</div>
		
		<div id = 'WordCloud' class="chartBlock">
			<h2 style="margin: 1.25rem;">恐怖袭击相关关键词词云图</h2>
			<p style="margin: 0.625rem;">选择相关方面（攻击类型、目标类型、袭击类型）、年份区间和度量值（发生次数、死亡人数）以生成词云图</p>
			<WordCloud ref='WordCloud'></WordCloud>
			<ul>
				<li><p>攻击、武器、目标类型排行均比较稳定，随年份变化不大</p></li>
				<li><p>袭击数量多的关键词：爆炸物、针对政府目标、爆破袭击</p></li>
			</ul>
		</div>
		
		<div id='RaceChart' class="chartBlock">
			<h2 style="margin: 1.25rem;">1970~2018 恐怖袭击组织动态排行图</h2>
			<p style="margin: 0.625rem;">选择恐怖组织排行的度量方式（袭击次数、死亡人数）以生成动态排行图</p>
			<RaceChart ref='RaceChart'></RaceChart>
			<ul>
				<li><p>爱尔兰共和军(IRA): 70年代兴盛，80年代遭撒切尔夫人镇压。</p></li>
				<li><p>光辉道路(SL): 80年代，在秘鲁的活动颇为活跃。1992年该组织领袖古兹曼被俘，被判处终身监禁。</p></li>
				<li><p>2010年后兴起的塔利班和ISIL(ISIS)。</p></li>
			</ul>
		</div>
		
		<div id="DonutChart" class="chartBlock">
			<h2 style="margin: 1.25rem;">1970~2018 影响恶劣的十个恐怖组织详细信息</h2>
			<p style="margin: 0.625rem;">选择恐怖组织以查看其相关的比例图<br>（从左至右，从上至下四个图分别为：袭击类型比例图、目标人群比例图、袭击武器比例图、袭击国家比例图）</p>
			<DonutChart ref='DonutChart'></DonutChart>
		</div>
		
		<div id="Choropleth" class="chartBlock">
			<h2 style="margin: 1.25rem;">1970~2018 全球恐怖袭击次数/死亡人数地图分布图</h2>
			<p style="margin: 0.625rem;">选择分布的度量方式（袭击次数、死亡人数）以生成地图分布图</p>
			<Choropleth ref='Choropleth'></Choropleth>
			<ul>
				<li><p>全球范围内恐怖活动的分布极为不平均</p></li>
				<li><p>南亚、中东、南美部分地区是恐怖袭击的“重灾区”</p></li>
			</ul>
		</div>
	</div>
</template>

<script>
	import LineChart from './LineChart.vue'
	import WordCloud from './WordCloud.vue'
	import RaceChart from './RaceChart.vue'
	import Choropleth from './Choropleth.vue'
	import DonutChart from './DonutChart.vue'

	export default {
		name: 'MainContent',
		components: {
			LineChart,
			WordCloud,
			RaceChart,
			Choropleth,
			DonutChart
		},
		methods: {
			// 负责调用所有图组件的初始化绘制
			renderLineChart: function() {
				this.$refs.LineChart.init()
			},
			renderWordCloud: function() {
				this.$refs.WordCloud.init()
			},
			renderRaceChart: function() {
				this.$refs.RaceChart.init()
			},
			renderChoropleth: function() {
				this.$refs.Choropleth.init()
			},
			renderDonutChart: function() {
				this.$refs.DonutChart.init()
			}
		}
	}
</script>

<style scoped>
	.chartBlock{
		margin-top: 9.375rem;
		padding-top: 3.125rem;
	}
	#DonutChart{
		margin: 11.25rem;
		padding-top: 1.25rem;
	}
	#maincontent {
		display: block;
		align-items: center;
		text-align: center;
	}
	ul {
		width: 100%;
		text-align: center;
		padding-top: 3.125rem;
		padding-left: 25%;
	}
	ul li {
		text-align: left;
		margin-bottom: 0.625rem;
	}
	p {
		font-size: 1.125rem;
		font-family: "microsoft yahei";
	}
</style>
