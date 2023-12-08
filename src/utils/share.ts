export const useShare = () => {

	const getCurrentPath = () => {
		const pages = getCurrentPages()
		return `/${pages[pages.length - 1].route}`;
	}

	function onShareAppMessage(res){
		return {
			title: '发送给朋友',
			path: getCurrentPath()
		}
	}
	//分享到朋友圈
	function onShareTimeline(res){
		return {
			title: '分享到朋友圈',
			path: getCurrentPath()
		}
	}
	
	return {
		onShareAppMessage, onShareTimeline
	}
}