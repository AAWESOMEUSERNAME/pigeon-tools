import { getSecondsIntervalByBpm } from "./bpm"

export type NoteType =
	0 // 普通音
	| 1 // 切分音
	| 2 // 休止音

export class SoundEffectPlayer {
	constructor() {
		this.stressContext = uni.createInnerAudioContext()
		this.stressContext.src = "/static/audio/cowbell_stress.mp3"
		this.stressContext.playbackRate = 2
		this.normalContext = uni.createInnerAudioContext()
		this.normalContext.src = "/static/audio/cowbell_normal.mp3"
		this.normalContext.playbackRate = 2

		this.stressContext.onCanplay(() => {
			this.stressContext.volume = 0
			this.stressContext.play()
			this.stressContext.volume = 1
		})
		this.normalContext.onCanplay(() => {
			this.normalContext.volume = 0
			this.normalContext.play()
			this.normalContext.volume = 1
		})
	}

	private stressContext : UniApp.InnerAudioContext
	private normalContext : UniApp.InnerAudioContext
	private currentTaskTimers : number[] = []

	private playStress() {
		this.stressContext.seek(0)
		this.stressContext.play()
	}

	private playNormal() {
		this.normalContext.seek(0)
		this.normalContext.play()
	}

	warmUp() {
		this.normalContext.volume = 0
		this.stressContext.volume = 0

		this.normalContext.play()
		this.stressContext.play()

		this.normalContext.volume = 1
		this.stressContext.volume = 1

	}

	play({
		notes,
		stressMap,
		bpm,
		onPlay,
		onEnd,
	} : {
		notes : NoteType[],
		stressMap : Record<number, boolean | undefined>,
		bpm : number,
		onPlay : (inx : number) => void,
		onEnd : () => void
	}) {
		this.currentTaskTimers.forEach(id => clearTimeout(id))
		this.currentTaskTimers.splice(0, this.currentTaskTimers.length)
		const duration = getSecondsIntervalByBpm(bpm)
		const syncopationDuration = duration * 0.8 / 3
		const taskArr : {
			isStress ?: boolean
			originIndex ?: number
			mute ?: boolean
			duration : number
		}[] = []

		notes.forEach((n, i, arr) => {
			const next = arr[i + 1]
			const isStress = stressMap[i]
			const currentDuration = next === 1 ? duration - syncopationDuration : duration

			switch (n) {
				case 0: {
					taskArr.push({
						isStress: stressMap[i],
						duration: currentDuration, originIndex: i
					})
					break;
				}
				case 1: {
					taskArr.push({
						duration: syncopationDuration
					})
					taskArr.push({
						isStress, duration: currentDuration, originIndex: i
					})
					break
				}
				case 2: {
					taskArr.push({
						mute: true, duration: currentDuration, originIndex: i
					})
					break;
				}
			}
		})

		let currentDelay = 0
		taskArr.forEach((t) => {
			const timerId = setTimeout(() => {
				if (t.originIndex !== undefined) {
					onPlay(t.originIndex)
				}
				if (!t.mute) {
					if (t.isStress) {
						this.playStress()
					} else {
						this.playNormal()
					}
				}
			}, currentDelay * 1000)
			currentDelay += t.duration
			this.currentTaskTimers.push(timerId)
		})
		const endTimerId = setTimeout(() => {
			onEnd()
		}, currentDelay * 1000)
		this.currentTaskTimers.push(endTimerId)
	}
}