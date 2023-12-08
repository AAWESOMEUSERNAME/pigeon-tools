import _ from "lodash";

export const getBpmByTwoBeat = (start : Date, end : Date, precision ?: number) : number => {
	const startMs = start.getTime()
	const endMs = end.getTime()
	return getBpmByInterval((endMs - startMs) / 1000, precision)
}
export const getBpmByInterval = (interval : number, precision ?: number) : number => _.round(60 / interval, precision)

export const getSecondsIntervalByBpm = (bpm : number) => 60 / bpm