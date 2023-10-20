
const FlowState = {
	reducer: function(defaultState, map) {
		return function(state = defaultState, action) {
			return map[action.type] ? map[action.type](state, action) : state
		}
	},
	combine: function(reducers) {
		return function(state, action) {
			return Object.keys(reducers).reduce((combined, k) => {
				combined[k] = reducers[k](state[k], action)
				return combined
			}, {})
		}
	},
	create_store: function(rootReducer, log_actions, history_length) {
		let state = {}, listeners = [], history = []

		function getState() { return state }
		function getHistory() { return history }
		function subscribe(listener) { listeners.push(listener) }

		function dispatch(action) {
			const prev_state = Object.assign({}, state)
			state = rootReducer(prev_state, action)
			history = (history.length === history_length) ? [...history.slice(1), state] : [...history, state]

			if (log_actions) {
				console.log('\n%cPrevious State: ', 'font-weight: bold; color: #0b0;', prev_state)
				console.log(`Action Dispatched: %c'${action.type}'`, 'color: #e00;')
				console.log(`Action Payload: `, action.payload)
				console.log('%cUpdated State: ', 'font-weight: bold; color: #0b0;', state)
			}

			listeners.forEach(listener => {
				if (!listener.bypass_list.includes(action.type)) FlowState.render(listener)
			})
		}

		dispatch({type:'@@INITIALIZE_STATE'})
		const FlowStateStore = { getState, getHistory, dispatch, subscribe }
		return FlowStateStore
	},
	element: function(element_type, attributes, children) {
		const element = document.createElement(element_type)

		if (!!attributes) Object.keys(attributes).forEach(k => element.setAttribute(k, attributes[k]))

		if (children.length >= 1) children.forEach(function(child) {
			const child_element = (typeof child === 'string') ? document.createTextNode(child) : child
			element.appendChild(child_element)
		})

		return element
	},
	render: function({component, root, api, store, bypass} = config) {
		while (root.lastChild) root.lastChild.remove()
	    root.appendChild(component(store, api))
	},
	initialize: function(app, root, loader_root, root_reducer, api, log_actions=false) {
		const init_state = root_reducer({}, '')

		const app_title = init_state.infoState.business_name || 'FlowState Application'
		document.title = `${app_title} | Home`

		if (!root) FlowState.terminate(root, `No Application Root supplied...`)
		root.style.margin = 0

		if (!!loader_root) {
			console.log(`FlowState Engineering | Killing load screen...`)
			loader_root.style.display = 'none'
		}

		console.log(`FlowState Engineering | Killing static application...`)
		root.firstElementChild.style.display = 'none'

		const history_length = init_state.appState.history.actions_length || 5
		const FlowStateStore = FlowState.create_store(root_reducer, log_actions, history_length)

		const app_config = {
			component: app,
			root,
			api,
			store: FlowStateStore,
			bypass_list: ['UPDATE_VIEW_SCROLL', 'UPDATE_MENU_SCROLL']
		}

		FlowState.render(app_config)
		FlowStateStore.subscribe(app_config)
	},
	terminate: function(app_root, msg) {
		while (app_root.lastChild) app_root.lastChild.remove()

		const styles = {
			position: `absolute`,
			left: 0,
			top: 0,
			bottom: 0,
			right: 0,
			index: 1000,
			background: `linear-gradient(#fff, #eee)`
		}

		const msg_display = FlowState.element('div', st, [msg])
		app_root.appendChild(msg_display)

		throw `[FlowState] - ${msg}`
	},
	api: function() {
		const mime_types = {
			'html': 'text/html',
			'css': 'text/css',
			'js': 'application/javascript',
			'json': 'application/json',
			'ico': 'image/ico',
			'svg': 'image/svg+xml',
			'jpeg': 'image/jpeg',
			'jpg': 'image/jpeg',
			'png': 'image/png',
			'otf': 'application/x-font-otf'
		}

		async function get_req(uri='') {
			const splt = uri.split('.')
			const filetype = splt[splt.length-1]

			const response = await fetch(uri, {
				method: "GET",
				mode: "cors",
				cache: "no-cache",
				credentials: "same-origin",
				headers: { "Content-Type": mime_types[filetype] || mime_types['html'] },
				redirect: "follow",
				referrerPolicy: "no-referrer",
			})
			return response
		}

		async function post_req(data, blob=false) {
			const response = await fetch('/', {
				method: "POST",
				mode: "cors",
				cache: "no-cache",
				credentials: "same-origin",
				headers: { "Content-Type": "application/json" },
				redirect: "follow",
				referrerPolicy: "no-referrer",
				body: JSON.stringify(data)
			})
			if (blob) return response.blob()
			else return response.json()
		}

		return {get_req, post_req}
	}
}
