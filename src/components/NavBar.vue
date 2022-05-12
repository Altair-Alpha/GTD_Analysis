<template>
	<div id='navbar'>
		<ul>
			<li><a href="#LineChart">恐怖伤亡统计</a></li>
			<li><a href="#WordCloud">恐袭关键词云</a></li>
			<li><a href="#RaceChart">恐怖组织排行</a></li>
			<li><a href="#Choropleth">高发地区图示</a></li>
			<li><a href="#DonutChart">恐怖组织研究</a></li>
			<li><a href="#title">Top</a></li>
		</ul>
	</div>
</template>

<script>
export default {
	name: 'NavBar'
}
</script>

<style scoped>
#navbar {
	position: fixed;
	right: 0;
	top: 30rem;
	width: 10.5rem;
	height: 27%;
	border: 0;
	box-sizing: 0;
	padding: 0;
	margin: 0;
	border-radius: 0.3125rem;
	background-color: rgba(189, 196, 202,70%);
}
ul li {
	list-style: none;
	margin-top: 0.625rem;
	margin-right: 1.25rem;
}
ul li a{
	color: rgb(41, 187, 213);
	text-decoration: none;
}
ul li a:hover{
	color: rgb(247, 105, 25);
	text-decoration: none;
}
ul li:hover{
	font-size: 1.125rem;
}
</style>

