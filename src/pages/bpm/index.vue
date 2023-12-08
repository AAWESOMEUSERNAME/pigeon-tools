<template>
	<PageContent additional-cls="'bpm_content'">
		<view class="bpm-area">
			<view class="bpm">
				{{bpm}}
			</view>
			<view class="bpm-list">
				<view v-for="(item,index) in hisList" :key="index">
					<view class="pre-bpm">
						{{item}}
					</view>
				</view>
			</view>
		</view>
		<view class="hit" @click="hit">
			<view>Hit Me!</view>
			<view>(￣ε(#￣)</view>
		</view>
		<view class="clear" @click="clear">重置</view>
		<view class="base-area">
			<radio-group @change="onBaseChange">
				<label class="base-label" v-for="(item, index) in baseList" :key="item">
					<view>
						<radio color="#FF7530" :value="item" :checked="index === avgBase" />
					</view>
					<view>求{{item}}次平均</view>
				</label>
			</radio-group>
		</view>
	</PageContent>
</template>

<script setup lang="ts">
	import PageContent from '@/components/PageContent/index.vue'
	import { getBpmByTwoBeat } from '@/utils/bpm';
	import { ref, computed } from 'vue'

	const preTime = ref<Date | undefined>(undefined)
	const baseList = [1, 5, 10, 15]
	const bpmList = ref<number[]>([])
	const hisList = ref<number[]>([])
	const avgBase = ref<number>(1)

	const bpm = computed(() => {
		const arr = bpmList.value
		return Math.round(arr.reduce((pre, cur) => pre + cur, 0) / (arr.length || 1))
	})

	const addToList = (newV : number) => {
		const base = avgBase.value
		const arr = bpmList.value
		if (arr.length === base) {
			arr.shift()
		}
		hisList.value.unshift(newV)
		arr.push(newV)
	}

	const hit = () => {
		const current = new Date()
		const pre = preTime.value
		if (pre) {
			const currentBpm = getBpmByTwoBeat(pre, current)
			addToList(currentBpm)
		}
		preTime.value = current
	}

	const clear = () => {
		bpmList.value = []
		hisList.value = []
	}

	const onBaseChange = (e : Event) => {
		const ele = e.target as HTMLInputElement | undefined
		avgBase.value = parseInt(ele?.value ?? "1")
	}
</script>

<style>
	.bpm_content {
		row-gap: 0.5em;
	}

	.bpm-area {
		border-radius: 8px;
		height: 30vh;
		display: flex;
		justify-content: space-between;
		column-gap: 4rpx;
		background-color: #FFF;
		width: 100%;
		overflow: hidden;
	}

	.bpm {
		font-size: 90px;
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.bpm-list {
		display: flex;
		flex-direction: column;
		width: max-content;
		color: #999;
	}

	.hit {
		width: 100%;
		border-radius: 8px;
		padding: 1.5em 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		color: #FFF;
		background-color: #010101;
	}

	.clear {
		width: 100%;
		border: 2px solid #010101;
		border-radius: 8px;
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 0.5em 0;
	}

	.base-label {
		margin-bottom: 0.5em;
		display: flex;
	}
</style>