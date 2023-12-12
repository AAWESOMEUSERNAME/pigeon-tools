<template>
	<view :class="`PageContent_container ${props.additionalCls ?? ''}`">
		<slot>
			empty
		</slot>
	</view>
</template>

<script setup lang="ts">
	const props = defineProps<{
		additionalCls?: string
	}>()
</script>

<style>
	.PageContent_container {
		box-sizing: border-box;
		padding: 1em;
		min-height: 100vh;
		height: max-content;
		width: 100vw;
		background-color: #FED480;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}
</style>