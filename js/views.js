
const Views = {
	Home: function(E, api, state, dispatch) {
		const theme = state.uiState.theme[state.uiState.theme.selected]
		const {views, actions} = state.appState.history
		const landing = (actions.at(-2) === '@@INITIALIZE_STATE') && (actions.at(-1) === 'RESIZE')

		const styles = {
			Home: `
				display:flex; flex-direction:column; justify-content:flex-start; align-items:stretch; min-height:95%; color:${theme.light_text};
				background-color: rgba(25,25,25,0.5);
			`,
			greeting: `display:flex; flex-direction:column; justify-content:flex-start; align-items:stretch; margin:11em auto 2em;`,
			title: `margin:0 auto 0.25em; font-size:3.25em; font-weight:400; text-align:center;`,
			sentence: `margin: 0.25em auto 0; width:90%; font-size:1.25em; font-weight:400; text-align:center;`,
			testing: `width:80%; margin: 1em auto; padding:1em; box-sizing:border-box; border:2px solid ${theme.alert_error_bg};`
		}

		const greeting = E('div',{style: styles.greeting},[
			E('h1',{style: styles.title},[state.infoState.business_name]),
			E('h2',{style: styles.sentence},[state.infoState.tagline])
		])

		// widescreen services slideshow - autoplay
		// links / icons to (top) services
		// (top) service cards
		// widescreen featured service
		// top feature cards
		// widescreen feature slideshow

		const HomeView = E('div', {style: styles.Home}, [ greeting ])

		if (landing) HomeView.animate([
			{ transform: "translateY(65%)", backgroundColor: "rgba(0,0,0,0.5)" },
			{ transform: "translateY(0)", backgroundColor: "rgba(0,0,0,0)" },
		],{ duration: 451, iterations: 1, easing: "cubic-bezier(0.42, 0, 0.58, 1)" })

		return HomeView
	},
	About: function(E, api, state, dispatch) {
		const theme = state.uiState.theme[state.uiState.theme.selected]
		const fonts = state.uiState.font.available

		const mission_statement = state.infoState.mission_statement

		const styles = {
			About: `display:flex; flex-direction:column; justify-content:flex-start; align-items:stretch; min-height:95%;`,
			landing: `
				margin:0 auto; width:100%; height:30em; overflow-y:hidden;
				background: url('${state.uiState.map.ABOUT.wp}'); background-position:top; background-size:cover; background-repeat:no-repeat;
			`,
			shadow: `display:flex; flex-direction:column; justify-content:flex-end; align-items:stretch; width:100%; height:30em; background-color:${theme.shadow};`,
			tagline: `margin:1em; font-size:1.5em; font-weight:heavy; color:${theme.light_text};`,
			statement: `
				display:flex; flex-direction:column; justify-content:flex-start; align-items:stretch; margin:0 auto; padding:1em 0;
				width:100%; background-color:${theme.bg}; box-sizing:border-box;
			`,
			sentence: `margin: 0.3em auto; width:93%; font-family:${fonts[3]}; font-size:1.3em; font-weight:300; text-align:center; color:${theme.dark_text};`
		}

		const landing = E('div', {style:styles.landing}, [
			E('div', {style:styles.shadow}, [
				E('p', {style:styles.tagline}, [`Empowering Your Business, Elevating Automation.`])
			])
		])

		const statement = E('div', {style:styles.statement}, mission_statement.map(sentence =>
			E('p', {style: styles.sentence}, [sentence]))
		)

		const AboutView = E('div', {style: styles.About}, [landing, statement])

		return AboutView
	},
	Blog: function(E, api, state, dispatch) {
		const theme = state.uiState.theme[state.uiState.theme.selected]
		const fonts = state.uiState.font.available

		const styles = {
			Blog: `display:flex; flex-direction:column; justify-content:flex-start; align-items:stretch; min-height:95%;`,
			landing: `
				margin:0 auto; width:100%; height:30em; overflow-y:hidden;
				background: url('${state.uiState.map.BLOG.wp}'); background-position:top; background-size:cover; background-repeat:no-repeat;
			`,
			shadow: `display:flex; flex-direction:column; justify-content:flex-end; align-items:stretch; width:100%; height:30em; background-color:${theme.shadow};`,
			tagline: `margin:1em; font-size:1.5em; font-weight:heavy; color:${theme.light_text};`,
			statement: `
				display:flex; flex-direction:column; justify-content:flex-start; align-items:stretch; margin:0 auto; padding:1em 0;
				width:100%; background-color:${theme.bg}; box-sizing:border-box; min-height:35em;
			`,
			sentence: `margin: 0.3em auto; width:93%; font-family:${fonts[3]}; font-size:1.3em; font-weight:300; text-align:center; color:${theme.dark_text};`
		}

		const landing = E('div', {style:styles.landing}, [
			E('div', {style:styles.shadow}, [
				E('p', {style:styles.tagline}, [`Keep up with us.`])
			])
		])

		const blog_statement = [
			`Blog coming soon.`,
			`This is where you'll find our latest articles, podcasts, and videos.`
		]

		const statement = E('div', {style:styles.statement}, blog_statement.map(sentence =>
			E('p', {style: styles.sentence}, [sentence]))
		)

		const BlogView = E('div', {style: styles.Blog}, [landing, statement])

		return BlogView
	},
	Shop: function(E, api, state, dispatch) {
		const theme = state.uiState.theme[state.uiState.theme.selected]
		const landscape = state.uiState.window.orientation === 'LANDSCAPE'
		const lg = landscape || ['SM_TAB', 'LG_TAB', 'PC'].includes(state.uiState.window.device)

		const product_width = {
			'MOB': {'PORTRAIT': 93, 'LANDSCAPE': 47},
			'LG_MOB': {'PORTRAIT': 93, 'LANDSCAPE': 47},
			'SM_TAB': {'PORTRAIT': 47, 'LANDSCAPE': 31},
			'LG_TAB': {'PORTRAIT': 47, 'LANDSCAPE': 31},
			'PC': {'PORTRAIT': 31, 'LANDSCAPE': 24}
		}[state.uiState.window.device][state.uiState.window.orientation]

		const styles = {
			Shop: `display:flex; flex-direction:column; justify-content:flex-start; align-items:stretch; min-height:95%; background-color:#eee;`,
			landing: `
				margin:0 auto; width:100%; height:30em; overflow-y:hidden;
				background: url('${state.uiState.map.SHOP.wp}'); background-position:top; background-size:cover; background-repeat:no-repeat;
			`,
			shadow: `display:flex; flex-direction:column; justify-content:flex-end; align-items:stretch; width:100%; height:30em; background-color:${theme.shadow};`,
			tagline: `margin:1em; font-size:1.5em; font-weight:heavy; color:${theme.light_text};`,
			sentence: `margin: 0.25em auto 0; font-size:${landscape?1.25:1}em; font-weight:100;`,
			products: `display:flex; flex-wrap:wrap; flex-direction:${lg?'row':'column'}; justify-content:${lg?'stretch':'flex-start'}; align-items:stretch; margin:0 auto 2em; padding:1em 0; width:100%;`,
			loader: `display:flex; margin:0.5em 0; width:2em; height:2em;`,
			error_message: `margin:1em; font-size:1.5em; font-weight:heavy; color:${theme.shadow};`
		}

		const landing = E('div', {style:styles.landing}, [
			E('div', {style:styles.shadow}, [
				E('p', {style:styles.tagline}, ['Durable, long-lasting products you can trust.'])
			])
		])

		const loader = UIComponents.Loader(E, api, state, dispatch, {
			height: '2.5em',
			width: '2.5em',
			margin: '2.5em',
			accent: theme.main_accent,
			thickness: '4px',
			default: 'show'
		})

		const products = E('div', {style:styles.products}, [loader])

		const ShopView = E('div', {style: styles.Shop}, [landing, products])

		api.post_req({type:'GET_PRODUCTS', data:{prop:null}}).then(api_response => {
			loader.hide()
			if (api_response.status === 'GOOD') Object.keys(api_response.data).forEach(pid => {
				const product = api_response.data[pid]
				api.post_req({type:'GET_PRODUCT_IMG', data:{uuid:pid}}, blob=true).then(img_data => {
					products.appendChild(ToolUI.Product(E, api, state, dispatch, {
						bg: theme.bg,
						accent: theme.main_accent,
						width: product_width,
						editing: false,
						product: Object.assign(product, {img_data})
					}))
				})
			})
			else products.appendChild(E('p', {style:styles.error_message}, [
				api_response.type === 'NO_PRODUCTS'
					? `We don't currently have any products. Please check back with us soon.`
					: `Unable to load products. Please check back with us soon.`
			]))
		})

		return ShopView
	},
	Services: function(E, api, state, dispatch) {
		const theme = state.uiState.theme[state.uiState.theme.selected]
		const landscape = state.uiState.window.orientation === 'LANDSCAPE'
		const lg = landscape || ['SM_TAB', 'LG_TAB', 'PC'].includes(state.uiState.window.device)

		const service_width = {
			'MOB': {'PORTRAIT': 93, 'LANDSCAPE': 47},
			'LG_MOB': {'PORTRAIT': 93, 'LANDSCAPE': 47},
			'SM_TAB': {'PORTRAIT': 47, 'LANDSCAPE': 31},
			'LG_TAB': {'PORTRAIT': 47, 'LANDSCAPE': 31},
			'PC': {'PORTRAIT': 31, 'LANDSCAPE': 24}
		}[state.uiState.window.device][state.uiState.window.orientation]

		const styles = {
			Services: `display:flex; flex-direction:column; justify-content:flex-start; align-items:stretch; min-height:95%; background-color:#eee;`,
			landing: `
				margin:0 auto; width:100%; height:30em; overflow-y:hidden;
				background: url('${state.uiState.map.SERVICES.wp}'); background-position:top; background-size:cover; background-repeat:no-repeat;
			`,
			shadow: `display:flex; flex-direction:column; justify-content:flex-end; align-items:stretch; width:100%; height:30em; background-color:${theme.shadow};`,
			tagline: `margin:1em; font-size:1.5em; font-weight:heavy; color:${theme.light_text};`,
			sentence: `margin: 0.25em auto 0; font-size:${landscape?1.25:1}em; font-weight:100;`,
			services: `display:flex; flex-wrap:wrap; flex-direction:${lg?'row':'column'}; justify-content:${lg?'stretch':'flex-start'}; align-items:stretch; margin:0 auto 2em; padding:1em 0; width:100%;`,
			loader: `display:flex; margin:0.5em 0; width:2em; height:2em;`,
			error_message: `margin:1em; font-size:1.5em; font-weight:heavy; color:${theme.shadow};`
		}

		const landing = E('div', {style:styles.landing}, [
			E('div', {style:styles.shadow}, [
				E('p', {style:styles.tagline}, [`Expert services that unlock your business's potential.`])
			])
		])

		const loader = UIComponents.Loader(E, api, state, dispatch, {
			height: '2.5em',
			width: '2.5em',
			margin: '2.5em',
			accent: theme.main_accent,
			thickness: '4px',
			default: 'show'
		})

		const services = E('div', {style:styles.services}, [loader])

		const ServicesView = E('div', {style: styles.Services}, [landing, services])

		api.post_req({type:'GET_SERVICES', data:{prop:null}}).then(api_response => {
			loader.hide()
			if (api_response.status === 'GOOD') Object.keys(api_response.data).forEach(pid => {
				const service = api_response.data[pid]
				const img_request = {type:'GET_SERVICE_IMG', data:{uuid:pid}}
				api.post_req(img_request, blob=true).then(img_data => {
					services.appendChild(ToolUI.Service(E, api, state, dispatch, {
						bg: theme.bg,
						accent: theme.main_accent,
						width: service_width,
						editing: false,
						service: Object.assign(service, {img_data})
					}))
				})
			})
			else services.appendChild(E('p', {style:styles.error_message}, [
				api_response.type === 'NO_SERVICES'
					? `We don't currently have any services. Please check back with us soon.`
					: `Unable to load services. Please check back with us soon.`
			]))
		})

		return ServicesView
	},
	Contact: function(E, api, state, dispatch) {
		const theme = state.uiState.theme[state.uiState.theme.selected]
		const imgs = state.uiState.imgs
		const landscape = state.uiState.window.orientation === 'LANDSCAPE'

		const {address, emails, phones, hours} = state.infoState

		const styles = {
			Contact: `display:flex; flex-direction:column; justify-content:flex-start; align-items:stretch; min-height:95%;`,
			wrapper: `display:flex; flex-direction:column; justify-content:flex-start; align-items:stretch; margin:0 auto 2em; padding:0.75em 0 0; width:${landscape?75:95}%; background-color:${theme.bg}; border-radius:5px; box-shadow:0 2px 4px rgba(0,0,0,0.5);`,
			section: `display:flex; flex-direction:column; justify-content:flex-start; align-items:stretch; margin:1.5em auto 0; padding:0 0 0.5em; width:90%; border-bottom:1pt solid ${theme.light_text};`,
			section_title: `margin:0.5em 0.5em 0.25em; text-decoration:underline; font-size:1em; font-weight:100; text-align:left;`,
			sentence: `margin:0 0.5em; font-size:1em; font-weight:100; text-align:left;`,
			link: `margin:0 1em; text-decoration:underline; font-size:${landscape?1.25:1}em; font-weight:400; color:${theme.link}`,
			info_row: `display:flex; flex-direction:row; justify-content:flex-start; align-items:center; margin:0; width:100%;`,
			info_col: `display:flex; flex-direction:column; justify-content:flex-start; align-items:stretch; margin:0; width:100%;`,
			map_frame: `margin:0 auto 1em; width:100%; height:25em; border:none; border:1pt solid ${theme.main_accent};`
		}

		const loader = UIComponents.Loader(E, api, state, dispatch, {
			height: '1.5em',
			width: '1.5em',
			margin: '0.5em',
			accent: theme.main_accent,
			thickness: '4px',
			default: 'hide'
		})

		const button = UIComponents.TextBtn(E, api, state, dispatch, {
			bg: theme.button_bg,
			accent: theme.button_accent,
			width: '3em',
			margin: 0,
			label: 'send',
			cb: null
		})

		const selector = UIComponents.IconSelector(E, api, state, dispatch, {
			width: 97,
			margin: '0.5em auto 0.25em',
			accent: theme.button_bg,
			bg: theme.bg,
			border: theme.bg,
			selections: [ 'Appointments', 'Support', 'Billing' ]
		})

		const form = UIComponents.Form(E, api, state, dispatch, {
			bg: theme.bg,
			border: theme.bg,
			accent: theme.header_bg,
			title: '',
			title_align: 'center',
			margin: '0 auto',
			width: 97,
			btn: button,
			sections: [
				{title: '', fields: {
					first_name: {type:'name', data:'First Name'},
					last_name: {type:'name', data:'Last Name'},
					phone: {type:'phone', data:'Phone Number'},
					email: {type:'email', data:'Email Address'},
					inquiry: {type:'textarea', data:'What can we help you with today?'}
				}}
			],
			components: []
		})

		const contact_panel = UIComponents.MessagePanel(E, api, state, dispatch, {
			width: landscape ? 75 : 95,
			margin: '7em auto 1em',
			text: theme.main_accent,
			bg: theme.bg,
			border: theme.main_accent,
			component: E('div', {style: 'margin:0 auto; width:100%;'}, [
				selector,
				form,
				E('div', {style: styles.section}, [ button, loader ])
			])
		})

		button.addEventListener('click', e => {
			loader.show()
			const api_request = {
				type: 'ADD_INQUIRY',
				data: {
					reason: selector.status(),
					...form.get_input()[0]
				}
			}
			api.post_req(api_request).then(response => {
				loader.hide()
				const confirmation_message = response.status === 'GOOD'
					? `Thank you for reaching out. We'll reach out as soon as possible.`
					: `Unable to submit inquiry. Please contact support if problem persists.`
				contact_panel.show(confirmation_message)
			})
		})

		const contact_info = E('div', {style:styles.section}, [
			E('h2', {style: styles.section_title}, ['Reach Us At']),
			...phones.map(phone => E('div', {style:styles.info_row}, [
				E('p', {style:styles.sentence + 'width:7%;'}, [`${phone.type}:`]),
				E('a', {style:styles.link, href:`tel:${phone.number}`}, [phone.number])
			])),
			...emails.map(email => E('div', {style:styles.info_row}, [
				E('p', {style:styles.sentence + 'width:7%;'}, [`${email.type}:`]),
				E('a', {style:styles.link, href:`mailto:${email.address}`}, [email.address])
			]))
		])

		const hours_of_operation = E('div', {style: styles.section}, [
			E('h2', {style: styles.section_title}, ['Hours of Operation']),
			...Object.keys(hours).filter(k => k !== 'Holidays').map(day => {
				const hrs = day.open === "" ? "closed" : `${hours[day].open} - ${hours[day].close}`
				return E('div', {style:styles.info_row}, [
					E('p', {style:styles.sentence + 'width:13%;'}, [`${day}:`]),
					E('p', {style:styles.sentence}, [hrs])
				])
			}),
			E('h2', {style: styles.section_title}, ['Holiday Hours']),
			...hours.Holidays.map(holiday => {
				const holiday_hrs = holiday.open === "" ? "closed" : `${holiday.open} - ${holiday.close}`
				const day = E('div', {style:styles.info_row}, [
					E('p', {style:styles.sentence + 'width:14%;'}, [`${holiday.name}:`]),
					E('p', {style:styles.sentence}, [holiday_hrs])
				])
				return day
			})
		])

		const map_section = E('div', {style: styles.section + 'border:none;'}, [
			E('h2', {style: styles.section_title}, ['Visit Us']),
			E('iframe', {src:address.map, style: styles.map_frame, allowfullscreen:'', loading:'lazy', referrerpolicy:'no-referrer-when-downgrade'}, [])
		])

		const ContactView = E('div', {style: styles.Contact}, [
			contact_panel,
			E('div', {style:styles.wrapper}, [contact_info, hours_of_operation, map_section])
		])

		return ContactView
	},
	Careers: function(E, api, state, dispatch) {
		const theme = state.uiState.theme[state.uiState.theme.selected]
		const landscape = state.uiState.window.orientation === 'LANDSCAPE'

		const styles = {
			Careers: `display:flex; flex-direction:column; justify-content:flex-start; align-items:stretch; min-height:95%; background-color:#eee;`,
			landing: `
				margin:0 auto; width:100%; height:30em; overflow-y:hidden;
				background: url('${state.uiState.map.CAREERS.wp}'); background-position:top; background-size:cover; background-repeat:no-repeat;
			`,
			shadow: `display:flex; flex-direction:column; justify-content:flex-end; align-items:stretch; width:100%; height:30em; background-color:${theme.shadow};`,
			tagline: `margin:1em; font-size:1.5em; font-weight:heavy; color:${theme.light_text};`,
			openings: `margin:0 auto 2em; padding:1em 0; width:100%;`,
			loader: `display:none; margin:0.5em 0; width:2em; height:2em;`,
			error_message: `margin:1em; font-size:1.5em; font-weight:heavy; color:${theme.shadow};`
		}

		const loader = UIComponents.Loader(E, api, state, dispatch, {
			height: '2.5em',
			width: '2.5em',
			margin: '2.5em',
			accent: theme.main_accent,
			thickness: '4px',
			default: 'show'
		})

		const landing = E('div', {style:styles.landing}, [
			E('div', {style:styles.shadow}, [
				E('p', {style:styles.tagline}, ['You can value a career with us, because we value you.'])
			])
		])

		const openings = E('div', {style:styles.openings}, [loader])

		api.post_req({type:'GET_OPENINGS', data:{prop:null}}).then(response => {
			loader.hide()
			if (response.status === 'GOOD') Object.keys(response.data).forEach(oid => {
				const opening = response.data[oid]
				openings.appendChild(
					UIComponents.CollapsePanel(E, api, state, dispatch, {
						default: 'closed',
						title: opening.title,
						bg: theme.bg,
						accent: theme.main_accent,
						text: theme.dark_text,
						border: theme.main_accent_transparent,
						width: 95,
						margin: '1em auto 0',
						component: ToolUI.JobOpening(E, api, state, dispatch, {
							bg: theme.bg,
							accent: theme.main_accent,
							text: theme.dark_text,
							border: theme.main_accent,
							opening
						})
					})
				)
			})
			else openings.appendChild(E('p', {style:styles.error_message}, [
				response.type === 'NO_OPENINGS'
					? `We don't currently have any open positions. Please check back with us soon.`
					: `Unable to load open positions. Please check back with us soon.`
			]))
		})

		const CareersView = E('div', {style: styles.Careers}, [landing, openings])

		return CareersView
	},
	Login: function(E, api, state, dispatch) {
		const theme = state.uiState.theme[state.uiState.theme.selected]
		const dev = state.uiState.window.device
		const module_width = ['SM_TAB', 'LG_TAB'].includes(dev) ? 57 : (dev === 'PC' ? 37 : 93)

		const styles = {
			LoginView: `display:flex; flex-direction:column; justify-content:flex-start; align-items:stretch; min-height:95%;`,
			auth_module: `width:${module_width}%; margin:9em auto 2em;`
		}

		const LoginView = E('div', {style: styles.LoginView}, [
			E('div', {style:styles.auth_module}, [
				Tools.Authenticate(E, api, state, dispatch)
			])
		])

		return LoginView
	},
	ControlPanel: function(E, api, state, dispatch) {
		const landscape = state.uiState.window.orientation === 'LANDSCAPE'
		const lg = landscape || ['SM_TAB', 'LG_TAB', 'PC'].includes(state.uiState.window.device)
		const theme = state.uiState.theme[state.uiState.theme.selected]

		const styles = {
			ControlPanelView: `
				display:flex; flex-direction:column; justify-content:flex-start; align-items:stretch;
				min-height:95%; background-color:#eee;
			`,
			cpanel_view: `
				display:flex; flex-direction:column; justify-content:flex-start; align-items:stretch;
				margin:13em auto; width:${lg?80:99}%; padding:1em; box-sizing:border-box;
			`
		}

		const bypassed_tools = ['Authenticate', 'UserManager', 'ServicesManager', 'InventoryManager', 'MenuManager']

		const user_tools = state.userState.user.tools[0] === 'ALL'
			? Object.keys(Tools).filter(t => !bypassed_tools.includes(t))
			: state.userState.user.tools

		const tool_names = user_tools.map(n => n === 'UIManager' ? 'UI Manager' : n.match(/[A-Z][a-z]*/g).join(' '))

		let current_view = ''
		const ControlPanelView = E('div', {style: styles.ControlPanelView}, [])
		const cpanel_view = E('div', {style: styles.cpanel_view}, [])

		const show_dashboard = () => {
			if (current_view === 'DASH') return
			if (!!cpanel_view.firstChild) cpanel_view.firstChild.remove()
			const dash_tools = user_tools.filter(t => t !== 'AccountManager')
			const dash_names = tool_names.filter(t => t !== 'Account Manager')
			cpanel_view.appendChild(E('div', {style: styles.tools_view},
				dash_tools.map((tool, i) =>
					UIComponents.CollapsePanel(E, api, state, dispatch, {
						default: 'open',
						title: dash_names[i],
						margin: '0 auto 1em',
						bg: theme.header_transparent,
						accent: theme.header_text,
						btn_size: '1.25em',
						fnt_size: '1.25em',
						component: Tools[tool](E, api, state, dispatch)
					})
				)
			))
			current_view = 'DASH'
		}

		const show_tool = (tool, idx) => {
			if (current_view === tool) return
			if (!!cpanel_view.firstChild) cpanel_view.firstChild.remove()
			cpanel_view.appendChild(
				UIComponents.CollapsePanel(E, api, state, dispatch, {
					default: 'open',
					title: tool_names[idx],
					margin: '0 auto 1em',
					bg: theme.header_transparent,
					accent: theme.header_text,
					btn_size: '1.25em',
					fnt_size: '1.25em',
					component: Tools[tool](E, api, state, dispatch)
				})
			)
			current_view = tool
		}

		const menu = ToolUI.ControlPanelMenu(E, api, state, dispatch, [
			{name: 'Dashboard', callback: show_dashboard},
			...user_tools.map((t, i) => ({name:tool_names[i], callback: () => show_tool(t, i)}))
		])
		cpanel_view.addEventListener('click', e => menu.toggle())

		ControlPanelView.appendChild(menu)
		ControlPanelView.appendChild(cpanel_view)
		show_dashboard()

		return ControlPanelView
	}
}
