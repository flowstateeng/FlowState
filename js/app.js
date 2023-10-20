
const AppComponents = {
	Router: function(E, api, state, dispatch, header) {
		const current_view = state.uiState.view.current
		const business_name = state.infoState.business_name

		const styles = {
			router: `position:fixed; top:0; right:0; bottom:0; left:0; overflow:hidden; z-index:5;`
		}

		const selected = state.uiState.map[current_view] ? state.uiState.map[current_view] : state.uiState.map['HOME']

		const bypass_uris = ['HOME', 'LOGIN', 'CONTROL_PANEL']
		const uri = bypass_uris.includes(current_view) ? '/' : current_view.toLowerCase()
		window.history.pushState(null, `${business_name} | ${selected.title}`, uri)

		const RouterComponent = E('div', {style: styles.router}, [
			AppComponents.View(E, api, state, dispatch, header)
		])

		return RouterComponent
	},
	Header: function(E, api, state, dispatch) {
		const theme = state.uiState.theme[state.uiState.theme.selected]
		const current_view = state.uiState.view.current
		const landscape = state.uiState.window.orientation === 'LANDSCAPE'
		const shadow = state.uiState.view.current === 'CONTROL_PANEL' ? theme.clear : theme.header_accent

		const include_routes = (landscape && state.uiState.window.device === 'SM_TAB')
			|| state.uiState.window.device === 'LG_TAB'
			|| state.uiState.window.device === 'PC'

		const styles = {
			header: `
				position: fixed; top: 0; left: 0; width: 100%; height: 5.5em; margin: 0; padding: 0; z-index: 90; user-select: none;
				display: flex; flex-direction: row; justify-content: space-between; align-items: center; background-color: ${theme.header_transparent};
				border-bottom: 0.5pt solid ${theme.header_accent}; -webkit-box-shadow: 1pt 1pt 7pt 0 ${shadow}; color:${theme.header_text};
			`,
			header_left: `display: flex; flex-direction: row; justify-content: flex-start; align-items: center;`,
			header_right: `display: flex; flex-direction: row; justify-content: flex-end; align-items: center; margin-right:1.5em;`,
			logo: `margin: 0 0.25em 0 1em; padding: 0; height: 3.25em; width: 3.25em; cursor:pointer;`,
			brand: `font-size: 1.5em; font-weight:444; margin: 0 0 0 0.25em;`,
			header_routes: `display: flex; flex-direction: row; justify-content: center; align-items: center; flex-wrap: wrap; margin: 0; padding: 0;`,
			header_route: `margin: 1em 1em 1em 0; font-size: 1.25em; font-weight:101; cursor:pointer;`,
			header_menu_btn: `margin: 1em; height: 2.5em; width: 2.5em; cursor:pointer;`
		}

		const company_logo = state.uiState.imgs.manifest.android_512
		const logo = E('img', {style:styles.logo, src:company_logo, alt:`${state.infoState.short_name} Header Logo`}, [])

		const brand = E('h1', {style:styles.brand}, [ state.infoState.short_name ])

		const header_routes = E('div', {style: styles.header_routes}, state.uiState.header.routes.map(route => {
			const btn = E('h2', {style: styles.header_route}, [state.uiState.map[route].title])
			btn.addEventListener('click', e => {
				if (current_view !== route) dispatch({type:'NAV_TO', payload:route})
			})
			return btn
		}))

		const menu = AppComponents.Menu(E, api, state, dispatch)
		const header_menu_btn = UIComponents.MenuToggle(E, api, state, dispatch, {
			color: theme.header_text,
			width: '1.5em',
			height: '1.5em',
			default: 'horizontal'
		})

		const HeaderComponent = E('div', {style: styles.header}, [
			E('div', {style: styles.header_left}, [ logo, brand ]),
			E('div', {style: styles.header_right}, include_routes ? [header_routes, header_menu_btn] : [header_menu_btn]),
			menu
		])

		HeaderComponent.set_color = (color) => {
			HeaderComponent.style.backgroundColor = color === 'dark' ? theme.header_bg : theme.header_transparent
		}

		logo.addEventListener('click', e => {
			if (current_view !== 'HOME') dispatch({type:'NAV_TO', payload:'HOME'})
			if (menu.is_open) {
				HeaderComponent.set_color('clear')
				header_menu_btn.click()
				menu.close_menu()
			}
		})

		header_menu_btn.addEventListener('click', e => {
			if (menu.is_open) {
				const current_view_scroll = state.uiState.view.scrollTop.current
				const scrolled_down_10_percent = current_view_scroll / state.uiState.window.height > 0.1
				if (scrolled_down_10_percent) HeaderComponent.set_color('dark')
				else HeaderComponent.set_color('clear')
				menu.close_menu()
			}
			else {
				HeaderComponent.set_color('dark')
				menu.open_menu()
			}
		})

		return HeaderComponent
	},
	Menu: function(E, api, state, dispatch) {
		const theme = state.uiState.theme[state.uiState.theme.selected]
		const landscape = state.uiState.window.orientation === 'LANDSCAPE'

		const menu_width = {'MOB':100, 'LG_MOB':100, 'SM_TAB':31, 'LG_TAB':31, 'PC':19}[state.uiState.window.device]
		const top = state.uiState.view.current === 'CONTROL_PANEL' ? 9.5 : 5.55

		const styles = {
			Menu: `
				position:fixed; top:${top}em; left:0; bottom:0; width:${menu_width}%; z-index:80; background-color:${theme.menu_transparent};
				overflow-y:scroll; ${landscape ? `border-right:1pt solid ${theme.menu_accent};` : ''} user-select: none;
				display:none; flex-direction:column; justify-content:flex-start; align-items:center; color:${theme.menu_text};
			`,
			routes: `display:flex; flex-direction:column; justify-content:flex-start; align-items:left; margin:2em auto 0; width:90%;`,
			route_btn: `margin:0.5em auto 0; width:90%; border-bottom:1pt solid ${theme.menu_accent}; cursor:pointer;`,
			route_text: `margin:0.5em auto 0; width:95%; font-size:${landscape?1.2:1.5}em; font-weight:100;`,
			copy: `
				display:flex; flex-direction:column; justify-content:space-between; align-items:stretch; text-align:center;
				border-top:1px solid ${theme.menu_accent}; margin:4em auto; width:85%; font-size:${landscape?'1':'0.9'}em;
			`,
			usa: `height:1.5em; margin:0.5em;`,
			copy_txt: `font-size:1.05em; margin:1em auto 0;`,
			branding: `display:flex; flex-direction:row; justify-content:center; align-items:center;`,
			link: `margin:1em; text-decoration:underline; font-size:1em; font-weight:200; color:${theme.link}`
		}

		const routes_config = Object.keys(state.uiState.map).filter(k =>
			(k !== 'CONTROL_PANEL' && state.uiState.map[k].status === 'ENABLED')
		)
		const routes = E('div', {style: styles.routes}, routes_config.map(route => {
			const route_btn = E('div', {style:styles.route_btn}, [
				E('h3', {style:styles.route_text}, [state.uiState.map[route].title])
			])
			route_btn.addEventListener('click', e => dispatch({type:'NAV_TO', payload:route}))
			return route_btn
		}))

		const copy = E('div', {style: styles.copy}, [
			E('div', {style: styles.copy_txt}, [
				E('p', {style: styles.copy_txt}, ['Powered by']),
				E('a', {style:styles.link, href:`https://www.flowstateengineering.com`, target:'_blank'}, ['FlowState Engineering'])
			]),
			E('p', {style: styles.copy_txt}, [`Copyright © 2023`]),
			E('img', {src:state.uiState.imgs.icons.usa, alt:`USA Icon`, style:styles.usa}, [])
		])

		const Menu = FlowState.element('div', {style: styles.Menu}, [routes, copy])

		Menu.is_open = false

		Menu.close_menu = () => {
			Menu.is_open = false
			Menu.animate([
				{ transform: "translateX(0)" },
				{ transform: "translateX(-100%)" },
			],{ duration: 151, iterations: 1 })
			setTimeout(e => Menu.style.display = 'none', 151)
		}

		Menu.open_menu = () => {
			Menu.is_open = true
			Menu.style.display = 'flex'
			Menu.animate([
				{ transform: "translateX(-100%)" },
				{ transform: "translateX(0)" },
			],{ duration: 151, iterations: 1 })
		}

		return Menu
	},
	View: function(E, api, state, dispatch, header) {
		const current_scroll = state.uiState.view.scrollTop.current
		const last_action = state.appState.history.actions.at(-1)

		const current_view = state.uiState.view.current
		const previous_view = state.uiState.view.previous
		const current_config = state.uiState.map[current_view]
		const previous_config = state.uiState.map[previous_view]

		const current_view_component_name = current_view.split('_').map(w => w.at(0) + w.slice(1).toLowerCase()).join('')

		const background_position = state.uiState.window.device === 'PC' ? 'top' : 'center'

		const styles = {
			View:`
				position:fixed; top:0; right:0; bottom:0; left:0; margin:0; padding:0; overflow-x:hidden; overflow-y:scroll; z-index:10;
				background: url('${current_config.wp}'); background-position:${background_position}; background-size:cover; background-repeat:no-repeat;
				${state.uiState.menu.current === 'OPEN' ? 'filter:blur(5pt);' : ''} -webkit-overflow-scrolling:touch;
			`
		}

		const View = FlowState.element('div', {style:styles.View, content:`minimal-ui`}, [
			Views[current_view_component_name](E, api, state, dispatch), AppComponents.Footer(E, api, state, dispatch)
		])

		View.addEventListener('scroll', e => {
			const current_view_scroll = state.uiState.view.scrollTop.current
			const scrolled_down_five_percent = current_view_scroll / state.uiState.window.height > 0.05
			if (scrolled_down_five_percent) header.set_color('dark')
			else header.set_color('clear')
			dispatch({type:'UPDATE_VIEW_SCROLL', payload:{current: e.target.scrollTop, previous: current_view_scroll}})
		})

		setTimeout(e => View.scrollTo({top:current_scroll, left:0, behavior:'auto'}), 5)

		View.addEventListener('click', e => {
			const current_view_scroll = state.uiState.view.scrollTop.current
			const scrolled_down_five_percent = current_view_scroll / state.uiState.window.height > 0.05
			if (scrolled_down_five_percent) header.set_color('dark')
			else header.set_color('clear')

			const menu = header.lastChild
			if (menu.is_open) {
				header.children[1].lastChild.click()
				menu.close_menu()
			}
		})

		const same_view = current_view === previous_view || previous_view === '@@INITIALIZE_STATE'
		const animate = last_action === 'NAV_TO' && !same_view

		if (animate) {
			const direction = current_config.idx > previous_config.idx ? '' : '-'
			View.animate([
				{ transform: `translateX(${direction}100%)` },
				{ transform: `translateX(0)` },
			],{ duration: 151, iterations: 1, easing: "cubic-bezier(0.42, 0, 0.58, 1)" })
		}

		return View
	},
	Footer: function(E, api, state, dispatch) {
		const theme = state.uiState.theme[state.uiState.theme.selected]
		const dev_size = ['SM_TAB', 'LG_TAB', 'PC'].includes(state.uiState.window.device) ? 'large' : 'small'

		const specs = {
			LANDSCAPE: {
				small: {
					links: ['row', 'flex-start', 'flex-start', 75],
					link_box: [''],
					link: [1],
					copy: ['row', 'space-between', 75]
				},
				large: {
					links: ['row', 'flex-start', 'flex-start', 75],
					link_box: [''],
					link: [1],
					copy: ['row', 'space-between', 75]
				}
			},
			PORTRAIT: {
				small: {
					links: ['column', 'flex-start', 'flex-start', 90],
					link_box: ['width:90%;'],
					link: [1],
					copy: ['column', 'flex-start', 90]
				},
				large: {
					links: ['row', 'flex-start', 'flex-start', 75],
					link_box: [''],
					link: [1],
					copy: ['row', 'space-between', 75]
				}
			}
		}[state.uiState.window.orientation][dev_size]

		const styles = {
			Footer: `
				display:flex; flex-direction:column; justify-content:flex-start; align-items:stretch; padding:0; margin:0; z-index:75;
				background-color:${theme.bg}; border-top:1pt solid ${theme.footer_accent}; user-select: none; color:${theme.footer_text};
				box-shadow:-1px 0 3px ${theme.main_accent};
			`,
			links: `
				display:flex; flex-direction:${specs.links[0]}; justify-content:${specs.links[1]}; align-items:${specs.links[2]};
				padding:0; margin:1em auto 0.5em; width:${specs.links[3]}%;
			`,
			link_box: `
				display:flex; flex-direction:column; justify-content:flex-start; align-items:flex-start;
				margin:0 auto; ${specs.link_box[0]}
				`,
			link: `margin:0.5em 0 0; text-align:left; font-size:${specs.link[0]}em; color:${theme.link}; cursor:pointer;`,
			copy: `
				display:flex; flex-direction:${specs.copy[0]}; justify-content:${specs.copy[1]}; align-items:center; padding:0; margin:1em auto;
				width:${specs.copy[2]}%; border-top:1pt solid ${theme.footer_accent};
			`,
			copy_txt: `font-size:1em; margin:0.25em auto; text-align:center;`,
			usa: `height:1.4em; margin:0.5em auto;`
		}

		const link_elements = Object.keys(state.uiState.map).filter(k => (k !== 'CONTROL_PANEL' && state.uiState.map[k].status === 'ENABLED')).map(route => {
			const link = E('h3', {style:styles.link}, [state.uiState.map[route].title])
			link.addEventListener('click', e => dispatch({type: 'NAV_TO', payload:route}))
			return link
		})

		const rows = 2
		const links = E('div', {style:styles.links}, [])
		for (let i = 0; i < link_elements.length; i += rows)
			links.appendChild(E('div', {style:styles.link_box}, link_elements.slice(i, i + rows)))

		const copy = E('div', {style: styles.copy}, [
			E('p', {style: styles.copy_txt}, [state.infoState.business_name]),
			E('p', {style: styles.copy_txt}, [`copyright © ${new Date().getFullYear()}`]),
			E('img', {src:state.uiState.imgs.icons.usa, alt:`USA Icon`, style:styles.usa}, [])
		])

		const Footer = E('div', {style: styles.Footer}, [ links, copy ])

		return Footer
	},
	App: function(store, api) {
		const state = store.getState()
		const dispatch = store.dispatch
		const theme = state.uiState.theme[state.uiState.theme.selected]
		const font = state.uiState.font.selected

		const styles = {
		  app: `position: fixed; top: 0; left: 0; height: 0%; width: 100%; margin: 0; padding: 0; z-index: 0; font-family:${font}; font-weight:100;`
		}

		const get_device_details = () => {
			const [new_width, new_height] = [window.innerWidth, window.innerHeight]
			const new_orientation = new_width > new_height ? 'LANDSCAPE' : 'PORTRAIT'
			const new_device = new_orientation === 'PORTRAIT'
				? (new_width<650 ? 'MOB' : (new_width<750 ? 'LG_MOB' : 'LG_TAB'))
				: (new_width<750 ? 'MOB' : (new_width<850 ? 'LG_MOB' : (new_width<1200 ? 'LG_TAB' : 'PC')))

			dispatch({ type:'RESIZE', payload: {
				width: new_width,
				height: new_height,
				device: new_device,
				orientation: new_orientation
			}})
		}

		let resize_counter = 0
		window.addEventListener('resize', e => {
			if (resize_counter++ % 5 === 0) get_device_details()
		})

		if (state.appState.history.actions.length === 1) get_device_details()

		const header =  AppComponents.Header(FlowState.element, api, state, dispatch)
		const router =  AppComponents.Router(FlowState.element, api, state, dispatch, header)

		const AppComponent = FlowState.element('div', {style: styles.app}, [ header, router ])

		return AppComponent
	}
}
