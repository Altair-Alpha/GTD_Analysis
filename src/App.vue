<template>
	<div id="app">
		<div>
			<transition name="fade">
				<Loading v-if="isLoading" ref="Loading"></Loading>
			</transition>
		</div>
		<Title></Title>
		<NavBar></NavBar>
		<MainContent ref="MainContent"></MainContent>
	</div>
</template>

<script>
	import Loading from './components/Loading.vue'
	import Title from './components/Title.vue'
	import NavBar from './components/NavBar.vue'
	import MainContent from './components/MainContent.vue'

	export default {
		name: 'App',
		components: {
			Loading,
			Title,
			NavBar,
			MainContent
		},
		data() {
			return {
				isLoading: false
			}
		},
		mounted() {
			this.loadData(this.onLineChartDataReady,
				this.onWordCloudDataReady,
				this.onRaceChartDataReady,
				this.onChoroplethDataReady,
				this.onDonutChartDataReady);
	},
	methods: {
		onLineChartDataReady: function() {
			this.$refs.MainContent.renderLineChart()
			this.isLoading = false;
			//console.log(this.getRawData());
		},
		onWordCloudDataReady: function() {
			this.$refs.MainContent.renderWordCloud()
			//console.log(this.getWordCloudData());
		},
		onRaceChartDataReady: function() {
			this.$refs.MainContent.renderRaceChart()
		},
		onChoroplethDataReady: function() {
			this.$refs.MainContent.renderChoropleth()
		},
		onDonutChartDataReady: function() {
			this.$refs.MainContent.renderDonutChart()
		}
	}
	}
</script>

<style>
	* {
		margin: auto 0;
	}

	#app {
		font-family: Avenir, Helvetica, Arial, sans-serif;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
		text-align: center;
		color: #2c3e50;
	}

	.fade-enter,
	.fade-leave-active {
		opacity: 0;
	}

	.fade-enter-active,
	.fade-leave-active {
		transition: opacity 0.5s;
	}
</style>
