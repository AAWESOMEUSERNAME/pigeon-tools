import { getSecondsIntervalByBpm } from "./bpm"

class BeatPlayerPool {
	private stressPool : BeatPlayer[] = Array.from({ length: 5 }, () => {
		const player = new BeatPlayer("/static/audio/cowbell_stress.mp3", () => {
			this.stressPool.push(player)
		})
		return player
	})
	private normalPool : BeatPlayer[] = Array.from({ length: 5 }, () => {
		const player = new BeatPlayer("/static/audio/cowbell_normal.mp3", () => {
			this.normalPool.push(player)
		})
		return player
	})

	play(isStress ?: boolean) {
		const player = isStress ? this.stressPool.shift() : this.normalPool.shift()
		if (player) {
			player.play()
		} else {
			console.error('播放器不足', isStress, this.stressPool, this.normalPool)
		}
	}
}

class BeatPlayer {
	constructor(src : string, onPlayed : () => void) {
		this.context = uni.createInnerAudioContext()
		this.context.src = src
		this.context.playbackRate = 2
		this.context.onCanplay(() => {
			this.context.volume = 0.1
			this.context.play()
			this.context.volume = 1
			this.context.onEnded(onPlayed)
		})
	}

	private context : UniApp.InnerAudioContext

	play() {
		this.context.play()
	}
}

export type NoteType =
	0 // 普通音
	| 1 // 切分音
	| 2 // 休止音

export class SoundEffectPlayer {
	private pool : BeatPlayerPool = new BeatPlayerPool()
	private currentTaskTimers : number[] = []

	private playStress() {
		this.pool.play(true)
	}

	private playNormal() {
		this.pool.play()
	}

	play({
		notes,
		stressMap,
		bpm,
		onPlay,
		onEnd,
		loop
	} : {
		notes : NoteType[],
		stressMap : Record<number, boolean | undefined>,
		bpm : number,
		onPlay : (inx : number) => void,
		onEnd : () => void,
		loop ?: boolean
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

		const runLoop = (loop ?: boolean) => {
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
				loop ? runLoop(loop) : onEnd()
			}, currentDelay * 1000)
			this.currentTaskTimers.push(endTimerId)
		}

		runLoop(loop)
	}

	stop() {
		this.currentTaskTimers.forEach(t => clearTimeout(t))
	}
}