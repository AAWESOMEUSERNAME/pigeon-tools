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
					<view :class="n.getClass()" />
				</view>
				<view class="note-index" :class="stress[index]? 'stress': ''" @click="() => handleStressChange(index)">
					{{index + 1}}
				</view>
			</view>
		</view>
		<view class="operate-area">
			<label class="row">
				<view class="title">
					BPM:
				</view>
				<uni-number-box v-model="bpm" :max="300" :min="10" background="#FF7530"></uni-number-box>
			</label>
			<button class="play-btn" @click="handlePlay">Play</button>
		</view>
	</PageContent>
</template>

<script setup lang="ts">
	import PageContent from '@/components/PageContent/index.vue'
	import { SoundEffectPlayer, type NoteType } from '@/utils/audio';
	import { reactive, ref, shallowReadonly, watch } from 'vue';

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
	const player = shallowReadonly(new SoundEffectPlayer())
	const stress = reactive<Record<number, boolean | undefined>>({ 0: true })

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

	const handlePlay = () => {
		player.play(noteArr.value.map(n => n.value), stress, bpm.value)
	}
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

	.stress {
		color: red;
	}

	.row {
		display: flex;
		align-items: center;
		justify-content: flex-start;
	}

	.title {
		width: 6em;
	}
	
	.play-btn {
		background-color: #000;
		color: #fff;
		width: 100%;
	}
</style>