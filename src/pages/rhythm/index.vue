<template>
	<PageContent additional-cls="rhythm-content">
		<view class="time-signature">
			<view class="time-signature-opt" :class="timeSignature === item.value? 'checked':''"
				v-for="(item) in timeSignatureOpt" :key="item.value"
				@click="() => handleTimeSignatureChange(item.value)">
				{{item.label}}
			</view>
		</view>
		<view class="notes">
			<view class="note-wrapper" v-for="(n,index) in noteArr" :key="index">
				<view class="note-hit-area" @click=" ()=> handleNoteChange(index)">
					<view :class="`${n.getClass()} ${currentPlayIndex === index? 'current':''}`" />
				</view>
				<view class="note-index" :class="stress[index]? 'stress': ''" @click="() => handleStressChange(index)">
					{{index + 1}}
				</view>
			</view>
		</view>
		<view class="operate-area">
			<label class="row">
				<view class="title">
					BPM(100 ~ 180):
				</view>
				<view class="field">
					<uni-number-box v-model="bpm" :max="180" :min="100" background="#FF7530"></uni-number-box>
				</view>
			</label>
			<!-- <label class="row">
				<view class="title">
					循环播放:
				</view>
				<switch :checked="loop" @change="handleLoopChange" color="#FF7530" style="transform:scale(0.7)" />
			</label> -->
			<button class="play-btn" @click="handlePlay">播放</button>
			<view class="desc">
				使用说明：<br />
				点击竖线切换拍型<br />
				点击数字切换重音<br />
				<view class="split"></view>
				本页面目前面临一些技术问题，如果你有办法解决：<br />
				1. uniapp或小程序多次setTimeout执行难以保证实际播放间隔<br />
				2. uniapp的InnerAudioContext无法频繁重复播放（本应用暂时使用资源池的方式解决）<br />
				3. InnerAudioContext首次播放存在延迟，且播放音量调节无效<br />
				请联系作者😄<br />
			</view>
		</view>
	</PageContent>
</template>

<script setup lang="ts">
	import PageContent from '@/components/PageContent/index.vue'
	import { SoundEffectPlayer, type NoteType } from '@/utils/audio';
	import { useShare } from '@/utils/share';
	import { onHide } from '@dcloudio/uni-app';
	import { reactive, ref, shallowReadonly, watch } from 'vue';

	const { onShareTimeline, onShareAppMessage } = useShare()

	enum TIME_SIGNATURE {
		EIGHT_EIGHT, EIGHT_SIX
	}

	class Note {
		value : NoteType = 0

		change() {
			this.value = (this.value + 1) % 3 as NoteType
			return this
		}

		getClass() {
			switch (this.value) {
				case 0: return "note"
				case 1: return "note-with-syn"
				case 2: return "note-mute"
			}
		}
	}

	const timeSignatureOpt = [
		{
			value: TIME_SIGNATURE.EIGHT_EIGHT,
			label: "8/8"
		}, {
			value: TIME_SIGNATURE.EIGHT_SIX,
			label: "8/6"
		}
	]

	const defaultArrMap = {
		[TIME_SIGNATURE.EIGHT_EIGHT]: Array.from({ length: 8 }, () => new Note()),
		[TIME_SIGNATURE.EIGHT_SIX]: Array.from({ length: 6 }, () => new Note()),
	}

	const timeSignature = ref<TIME_SIGNATURE>(TIME_SIGNATURE.EIGHT_EIGHT)
	const noteArr = ref<Note[]>(defaultArrMap[timeSignature.value])
	const bpm = ref(100)
	const loop = ref(false)
	const player = shallowReadonly(new SoundEffectPlayer())
	const stress = reactive<Record<number, boolean | undefined>>({ 0: true })
	const currentPlayIndex = ref<number | undefined>()

	watch(timeSignature, () => {
		noteArr.value = defaultArrMap[timeSignature.value]
	})

	const handleTimeSignatureChange = (v : TIME_SIGNATURE) => {
		timeSignature.value = v
	}

	const handleNoteChange = (inx : number) => {
		noteArr.value = Array.from(noteArr.value, (v, i) => {
			if (i === inx) {
				return v.change()
			}
			return v
		})
	}

	const handleStressChange = (inx : number) => {
		stress[inx] = !stress[inx]
	}

	const handleLoopChange = (e : any) => {
		loop.value = e.detail.value
	}

	const handlePlay = () => {
		currentPlayIndex.value = undefined
		player.play({
			notes: noteArr.value.map(n => n.value),
			stressMap: stress,
			bpm: bpm.value,
			onPlay: (i) => currentPlayIndex.value = i,
			onEnd: () => currentPlayIndex.value = undefined,
			loop: loop.value
		})
	}

	onHide(() => {
		currentPlayIndex.value = undefined
		player.stop()
	})
</script>

<style>
	.rhythm-content {
		row-gap: 1em;
		justify-content: flex-start !important;
	}

	.operate-area {
		width: 100%;
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		row-gap: 1em;
	}

	.time-signature {
		display: flex;
		width: 100%;
		justify-content: flex-start;
		column-gap: 0.5em;
	}

	.time-signature-opt {
		padding: 2px 4px;
		background-color: #FF7530;
		border-radius: 4px;
		opacity: 0.5;
	}

	.time-signature-opt.checked {
		opacity: 1;
	}

	.notes {
		display: flex;
		justify-content: space-evenly;
		align-items: center;
		width: 100%;
		padding: 1em 0;
		background-color: rgba(0, 0, 0, 0.3);
	}

	.note-wrapper {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}

	.note-hit-area {
		height: 3em;
		width: 40rpx;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}

	.note-index {
		font-size: 2em;
		line-height: 100%;
		margin-top: 0.5em;
		font-weight: bold;
	}

	.note,
	.note-with-syn {
		height: 3em;
		width: 15rpx;
		background-color: #000;
		position: relative;
	}

	.note-with-syn::before {
		position: absolute;
		left: -25rpx;
		top: 50%;
		content: "";
		height: 20rpx;
		width: 20rpx;
		border-radius: 100%;
		background-color: #000;
	}

	.note-mute {
		width: 30rpx;
		height: 15rpx;
		background-color: #000;
	}

	.current,
	.current::before {
		background-color: #FF7530;
	}

	.stress {
		color: #FF7530;
	}

	.row {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.title {
		width: max-content;
	}
	
	.play-btn {
		background-color: #000;
		color: #fff;
		width: 100%;
	}

	.desc {
		color: #7A7E83;
		font-size: 0.9em;
	}

	.split {
		width: 100%;
		height: 1px;
		margin: 0.5em 0;
	}
</style>