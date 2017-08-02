//xukaiwen@baixing.com
/*
  使用方法：
  在需要监听的滚动模块上绑定指令 v-scroll-spy="xxx"
  在菜单中的a上绑定监听事件     @click="scrollTo(index)"
  在菜单中的li上绑定            :class="{active: xxx==index}"
  组件的data()中需要赋予xxx初值0

  注意事项：
  如果使用bootstrap，可能需要修改.nav-pills > li > a:focus的样式
  滚动模块需要设置position: relative
 */
let scrollSections;

/*
  初始化section offset
 */
function init(el) {
	scrollSections = [];
	const sections = el.children;

	let offset = sections[0].offsetTop;

	for (let i = 0; i < sections.length; i++) {
		if (sections[i].offsetTop >= 0) {
			scrollSections.push(sections[i].offsetTop-offset);
		}
	}
}

/*  挂载字段名称  */
const SCROLL_SPY_METHOD = ' scrollSpyMethod';
const FORCE_SELECT = 'forceSelect';

try {
	var Vue = require('vue');
} catch (e) {
}

var directive = Vue.directive('scroll-spy', {
	bind: function(el, binding, vnode) {
		/*
		 滚动监听事件
		 forceSelect用于确保数据单向流通，防止最后一项高度不够，无法滚动到时出现显示错误
		 */
		function onScroll() {
			const expression = binding.expression;
			let forceSelectIndex = vnode.context.$data[FORCE_SELECT];
			const pos = el.scrollTop;
			let i;

			if (forceSelectIndex > -1) {
				i = forceSelectIndex;
				vnode.context.$data[FORCE_SELECT] = -1;
			} else {
				i = 0;
				while (pos >= scrollSections[i]) {
					i++;
				}
				i--;
			}
			vnode.context.$data[expression] = i;
		}

		/*
		 菜单项点击事件
		 */
		function scrollTo(index) {
			const expression = binding.expression;
			vnode.context.$data[FORCE_SELECT] = index;
			vnode.context.$data[expression] = index;
			el.scrollTop = scrollSections[index]
		}

		vnode.context.scrollTo = scrollTo;

		el[SCROLL_SPY_METHOD] = {
			onScroll,
		};

	},
	inserted: function (el) {
		init(el);

		const { onScroll } = el[SCROLL_SPY_METHOD];
		el.addEventListener('scroll', onScroll);
	},
	componentUpdated: function(el) {
		init(el);
	},
	unbind: function(el) {
		const { onScroll } = el[SCROLL_SPY_METHOD];
		el.removeEventListener('scroll', onScroll);
	}
});

module.exports = directive;