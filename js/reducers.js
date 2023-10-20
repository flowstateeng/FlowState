
const Reducers = {
	appState: function(state=Blueprint.app, action) {
		const addAction = (s,a) => s.actions.length==s.actions_length ? [...s.actions.slice(1), a.type] : [...s.actions, a.type]
		const addView = (s,a) => s.views.length==s.views_length ? [...s.views.slice(1), a.payload] : [...s.views, a.payload]
		return FlowState.combine({
			history: FlowState.reducer(Blueprint.app.history, {
				'UPDATE_VIEW_SCROLL': (s,a) => Object.assign(s, {actions:addAction(s,a)}),
				'NAV_TO': (s,a) => Object.assign(s, {actions:addAction(s,a), views:addView(s,a)}),
				'TOGGLE_MENU': (s,a) => Object.assign(s, {actions:addAction(s,a)}),
				'OPEN_MENU': (s,a) => Object.assign(s, {actions:addAction(s,a)}),
				'CLOSE_MENU': (s,a) => Object.assign(s, {actions:addAction(s,a)}),
				'RESIZE': (s,a) => Object.assign(s, {actions:addAction(s,a)}),
				'ADD_NOTIFICATION': (s,a) => Object.assign(s, {actions:addAction(s,a)}),
				'CLEAR_NOTIFICATION': (s,a) => Object.assign(s, {actions:addAction(s,a)})
			}),
		})(state, action)
	},
	infoState: function(state=Blueprint.info, action) {
		return FlowState.combine({
			first_name: FlowState.reducer(Blueprint.info.first_name, {}),
			last_name: FlowState.reducer(Blueprint.info.last_name, {}),
			title: FlowState.reducer(Blueprint.info.title, {}),
			business_name: FlowState.reducer(Blueprint.info.business_name, {}),
			tagline: FlowState.reducer(Blueprint.info.tagline, {}),
			short_name: FlowState.reducer(Blueprint.info.short_name, {}),
			address: FlowState.reducer(Blueprint.info.address, {}),
			emails: FlowState.reducer(Blueprint.info.emails, {}),
			phones: FlowState.reducer(Blueprint.info.phones, {}),
			hours: FlowState.reducer(Blueprint.info.hours, {}),
			website: FlowState.reducer(Blueprint.info.website, {}),
			mission_statement: FlowState.reducer(Blueprint.info.mission_statement, {}),
			products: FlowState.reducer(Blueprint.info.products, {}),
			services: FlowState.reducer(Blueprint.info.services, {}),
			openings: FlowState.reducer(Blueprint.info.openings, {}),
		})(state, action)
	},
	userState: function(state=Blueprint.user, action) {
		return FlowState.combine({
			user: FlowState.reducer(Blueprint.user, {
				'LOGIN': (s,a) => a.payload,
				'LOGOUT': (s,a) => Blueprint.user,
				'UPDATE_USER': (s,a) => a.payload,
				'CHANGE_THEME': (s,a) => Object.assign(s, {theme: a.payload})
			})
		})(state, action)
	},
	uiState: function (state=Blueprint.ui, action) {
		return FlowState.combine({
			map: FlowState.reducer(Blueprint.ui.map, {
				'ENABLE_VIEW': (s,a) => {
					s[a.payload].status = 'ENABLED'
					return s
				},
				'DISABLE_VIEW': (s,a) => {
					s[a.payload].status = 'DISABLED'
					return s
				}
			}),
			menu: FlowState.reducer(Blueprint.ui.menu, {
				'NAV_TO': (s,a) => ({current: 'CLOSED', previous: s.current, scrollTop: 0}),
				'TOGGLE_MENU': (s,a) => ({current: s.current === 'OPEN' ? 'CLOSED' : 'OPEN', previous: s.current, scrollTop: 0}),
				'OPEN_MENU': (s,a) => ({current: 'OPEN', previous: s.current, scrollTop: 0}),
				'CLOSE_MENU': (s,a) => ({current: 'CLOSED', previous: s.current, scrollTop: 0}),
			}),
			theme: FlowState.reducer(Blueprint.ui.theme, {
				'CHANGE_THEME': (s,a) => Object.assign(s, {selected:a.payload}),
				'LOGIN': (s,a) => Object.assign(s, {selected:a.payload.theme}),
				'LOGOUT': (s,a) => Blueprint.ui.theme
			}),
			view: FlowState.reducer(Blueprint.ui.view, {
				'LOGIN': (s,a) => ({current:'CONTROL_PANEL', previous:s.current, scrollTop:0}),
				'LOGOUT': (s,a) => ({current:'LOGIN', previous:s.current, scrollTop:0}),
				'NAV_TO': (s,a) => ({current:a.payload, previous:s.current, scrollTop:0}),
				'UPDATE_VIEW_SCROLL': (s,a) => Object.assign(s, {scrollTop: a.payload})
			}),
			window: FlowState.reducer(Blueprint.ui.window, {
				'RESIZE': (s,a) => a.payload
			}),
			header: FlowState.reducer(Blueprint.ui.header, {
				'DISABLE_VIEW': (s,a) => Object.assign(s, {routes: s.routes.filter(r => r !== a.payload)}),
				'UPDATE_HEADER_ROUTES': (s,a) => Object.assign(s, {routes: a.payload})
			}),
			font: FlowState.reducer(Blueprint.ui.font, {}),
			imgs: FlowState.reducer(Blueprint.ui.imgs, {})
		})(state, action);
	}
}
