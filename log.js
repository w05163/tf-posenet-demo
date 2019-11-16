// 输出日志

const view = document.querySelector('.logView');

/**
 * 
 * @param {string} tag 
 */
function html(tag) {
	return document.createElement(tag);
}

function log(...args){
	const div = html('div');
	args.forEach(t => {
		const p = html('p');
		p.innerText = JSON.stringify(t);
		div.appendChild(p);
	});
	view.appendChild(div);
}