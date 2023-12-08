import type { DateTime } from "luxon";
import _ from "lodash";

export const getBpmByTwoBeat = (start : DateTime, end : DateTime, precision ?: number) : number =>
	getBpmByInterval(start.diff(end, 'second').as('second'), precision)

export const getBpmByInterval = (interval : number, precision ?: number) : number => _.round(60 / interval, precision)

export const getSecondsIntervalByBpm = (bpm: number) => 60 / bpm