
const ToolUI = {
	LoginSelector: function(E, api, state, dispatch, config) {
		const theme = state.uiState.theme[state.uiState.theme.selected]

		const styles = {
			LoginSelector: `
				display:flex; flex-direction:column; justify-content:flex-start; align-items:stretch;
				width:${config.width}%; margin:${config.margin}; background-color:${config.bg};
				border:1pt solid ${config.border}; border-radius:7px;
			`,
			users_container: `
				display:flex; flex-direction:column; justify-content:flex-start; align-items:stretch;
				width:91%; margin:0.5em auto;
			`,
			user_container: `
				display:flex; flex-direction:column; justify-content:flex-start; align-items:stretch;
				width:97%; margin:0.5em auto; border:1pt solid ${config.accent}; border-radius:7px;
				box-shadow:1px 2px 5px ${theme.shadow};
			`,
			user_row: `
				display:flex; flex-direction:row; justify-content:space-between; align-items:center; height:3.8em;
				width:100%; margin:0 auto;
			`,
			name: `margin:0 1em; flex:1; color:${theme.dark_text};`,
			img: `width:2.75em; margin:0 1em; border:1pt solid ${theme.main_accent}; border-radius:100%; box-shadow:0 1px 3px ${theme.main_accent_transparent};`,
			pin_row: `
				display:none; flex-direction:row; justify-content:center; align-items:center; height:3em;
				width:100%; margin:0 auto;
			`,
			pin_field: `
				margin:0 0.5em; padding:0.15em 0; width:3em; font-size:1em; color:${theme.light_text}; text-align:center;
				border:none; border-radius:5px; background-color:${theme.field}; border-bottom:1pt solid ${theme.main_accent};
				box-sizing:border-box;
			`,
			error_message: `display:none; margin:0 auto 0.5em; text-align:center; font-size:0.9em; color:${theme.alert_error_bg};`
		}

		const LoginSelector = E('div', {style: styles.LoginSelector}, [
			E('h2', {style: styles.title}, [config.title]),
			E('div', {style: styles.users_container}, config.users.map(user => {
				const user_row = E('div', {style: styles.user_row}, [
					E('h3', {style: styles.name}, [user.name]),
					E('img', {style: styles.img, src:''}, [])
				])
				api.post_req({type:'GET_USER_IMG', key:user.key}, 'blob').then(img_data => {
					user_row.lastChild.src = URL.createObjectURL(img_data)
				})

				const loader = UIComponents.Loader(E, api, state, dispatch, {
					height: '1em',
					width: '1em',
					margin: '0 0 0 0.5em',
					accent: theme.main_accent,
					thickness: '4px',
					default: 'hide'
				})

				const pin_row = E('div', {style: styles.pin_row}, [
					E('input', {style: styles.pin_field, placeholder:'1234', type:'password'}, []),
					UIComponents.TextBtn(E, api, state, dispatch, {
						bg: theme.button_bg,
						accent: theme.button_accent,
						label: 'login',
						margin: '0 0.5em',
						width: '3em'
					}),
					loader
				])
				pin_row.firstChild.addEventListener('keyup', e => {
					if (e.key === 'Enter' || e.keyCode === 13) pin_row.children[1].click()
				})

				const error_message = E('h3', {style: styles.error_message}, [''])
				const display_message = (msg, cb=null) => {
					error_message.innerText = msg
					error_message.style.display = 'flex'
					setTimeout(() => {
						error_message.style.display = 'none'
						if (cb) cb()
					}, 1751)
				}

				pin_row.children[1].addEventListener('click', e => {
					loader.show()
					const pin_val = pin_row.firstChild.value
					const valid_pin = /^(?=.*[0-9])[0-9]{4}$/.test(pin_val)
					if (!valid_pin) {
						loader.hide()
						pin_row.firstChild.style.borderBottom = `1pt solid ${theme.alert_error_bg}`
						return
					}
					pin_row.firstChild.style.borderBottom = `1pt solid ${theme.main_accent}`
					api.post_req({type: 'CHECK_PIN', key:user.key, data:pin_val}).then(response => {
						loader.hide()
						if (response.type === 'KEY_EXPIRED') {
							localStorage.removeItem(user.ls_key)
							display_message('Login expired.', () => dispatch({type:'LOGOUT'}))
							return
						}
						if (response.type === 'PIN_MISMATCH') {
							localStorage.removeItem(user.ls_key)
							display_message('PIN not recognized. Please login again.', () => dispatch({type:'LOGOUT'}))
							return
						}
						if (response.status === 'BAD') {
							localStorage.removeItem(user.ls_key)
							console.log(' LOGIN SELECTOR  - PIN CHECK RESPONSE: ', response)
							display_message('System error. Please refresh & contact support if problem persists.', () => dispatch({type:'LOGOUT'}))
							return
						}
						dispatch({type: 'LOGIN', payload: user})
					})
				})
				return E('div', {style: styles.user_container}, [ user_row, pin_row, error_message ])
			}))
		])
		if (config.title === '') LoginSelector.firstChild.style.display = 'none'
		const user_rows = LoginSelector.lastChild.children

		for (let i = 0; i < config.users.length; i++) {
			user_rows[i].addEventListener('click', e => {
				for (let j = 0; j < user_rows.length; j++) {
					if (user_rows[j] === user_rows[i]) {
						user_rows[j].children[1].style.display = 'flex'
						user_rows[j].children[1].firstChild.focus()
						user_rows[j].firstChild.style.color = theme.light_text
						return
					}
					user_rows[j].children[1].style.display = 'none'
					user_rows[j].firstChild.style.color = theme.dark_text
				}
			})
		}

		return LoginSelector
	},
	ControlPanelMenu: function(E, api, state, dispatch, menu_routes) {
		const theme = state.uiState.theme[state.uiState.theme.selected]

		const specs = {
			'MOB': [100],
			'LG_MOB': [100],
			'SM_TAB': [31],
			'LG_TAB': [29],
			'PC': [23],
		}[state.uiState.window.device]

		const styles = {
			ControlPanelMenu: `
				display:flex; flex-direction:column; justify-content:flex-start; align-items:stretch; font-size:1em;
				width:100%; margin:0 auto; padding:0;
			`,
			header: `
				display:flex; flex-direction:row; justify-content:space-between; align-items:center;
				position:fixed; top:5.5em; width:100%; height:4em; background-color:${theme.header_bg}; z-index:1000;
				box-shadow:0 2px 4px ${theme.main_accent};
			`,
			greeting: `margin:1em; flex:1; font-size:1em; color:${theme.header_text};`,
			profile_img: `margin:1em; width:2.75em; border:1pt solid ${theme.main_accent}; border-radius:100%; box-shadow:0 1px 3px ${theme.main_accent_transparent};`,
			menu: `
				display:flex; flex-direction:column; justify-content:flex-start; align-items:stretch;
				position:fixed; top:9.55em; right:0; width:${specs[0]}%; margin:0 auto; padding:0.5em 0 0; z-index:1000;
				background-color:${theme.menu_bg}; transform:translateX(100%); color:${theme.menu_text};
			`,
			logout_btns: `display:flex; flex-direction:row; justify-content:center; align-items:center; margin-top:2.25em;`,
			logout_btn: `width:49.5%; margin:0 auto; padding:0.5em 0; font-size:1em; text-align:center; color:${theme.button_accent}; background-color:${theme.button_bg}; border-top:1pt solid ${theme.menu_accent};`,
			menu_route: `
				width:90%; margin:0 auto; padding:0.5em 0.75em; font-size:1em; text-align:right; color:${theme.menu_text}; border-bottom:1pt solid ${theme.menu_accent}; box-sizing:border-box;
			`
		}

		let menu_is_open = false
		const toggle_menu = (m) => {
			if (menu_is_open) {
				menu_is_open = false
				m.animate([
					{ transform: `translateX(0%)`, opacity: 1 },
					{ transform: `translateX(100%)`, opacity: 0 },
				],{ duration: 171, iterations: 1, easing: 'cubic-bezier(0.42, 0, 0.58, 1)', fill: 'forwards' })
			}
			else {
				menu_is_open = true
				m.animate([
					{ transform: `translateX(100%)`, opacity: 0 },
					{ transform: `translateX(0%)`, opacity: 1 },
				],{ duration: 171, iterations: 1, easing: 'cubic-bezier(0.42, 0, 0.58, 1)', fill: 'forwards' })
			}
		}

		const hours = new Date().getHours()
		const time_of_day = hours < 12 ? 'morning' : (hours < 18 ? 'afternoon' : 'evening')
		const greeting = E('p', {style:styles.greeting}, [`Good ${time_of_day}, ${state.userState.user.name}`])

		const profile_img = E('img', {style:styles.profile_img, src:'', alt:`${state.userState.user.name} Profile Image`}, [])
		api.post_req({type:'GET_USER_IMG', key:state.userState.user.key}, 'blob').then(img_data => {
			profile_img.src = URL.createObjectURL(img_data)
		})

		const header = E('div', {style: styles.header}, [ greeting, profile_img ])

		const menu = E('div', {style: styles.menu}, [
			...menu_routes.map(route => {
				// const route_name = route.name === 'UIManager' ? 'UI Manager' : route.name.match(/[A-Z][a-z]*/g).join(' ')
				const route_btn = E('h2', {style: styles.menu_route}, [route.name])
				route_btn.addEventListener('click', e => route.callback())
				return route_btn
			}),
			E('div', {style: styles.logout_btns}, ['lock', 'logout'].map(btn_type => {
				const btn = E('h3', {style: styles.logout_btn}, [btn_type])
				if (btn_type === 'logout') {
					btn.style.backgroundColor = theme.alert_error_transparent
					btn.style.borderLeft = `1pt solid ${theme.menu_accent}`
				}
				btn.addEventListener('click', e => {
					if (btn_type === 'logout') {
						localStorage.removeItem(`${state.userState.user.name} - ${state.userState.user.key}`)
						api.post_req({type:'LOGOUT', key:state.userState.user.key})
					}
					dispatch({type: 'LOGOUT'})
				})
				return btn
			}))
		])

		header.addEventListener('click', e => toggle_menu(menu))
		for (let i = 0; i < Object.keys(menu.children).length - 1; i++)
			menu.children[i].addEventListener('click', e => toggle_menu(menu))

		const ControlPanelMenu = E('div', {style: styles.ControlPanelMenu}, [ header, menu ])
		ControlPanelMenu.toggle = () => {
			if (menu_is_open) toggle_menu(menu)
		}

		return ControlPanelMenu
	},
	JobOpening: function(E, api, state, dispatch, config) {
		const styles = {
			JobOpening: `
				display:flex; flex-direction:column; justify-content:flex-start; align-items:stretch;
				width:99%; margin:0 auto; padding:0; box-sizing:border-box;
			`
		}

		const JobOpening = E('div', {style: styles.JobOpening}, [
			UIComponents.CollapsePanel(E, api, state, dispatch, {
				default:'closed',
				title: 'Job Description',
				bg: config.bg,
				accent: config.accent,
				text: config.text,
				border: config.border,
				width: 97,
				margin: '0.5em auto',
				component: ToolUI.JobDescription(E, api, state, dispatch, {
					bg: config.bg,
					accent: config.accent,
					border: config.bg,
					margin: '0 auto',
					opening: config.opening
				})
			}),
			UIComponents.CollapsePanel(E, api, state, dispatch, {
				default:'closed',
				title: 'Application',
				bg: config.bg,
				accent: config.accent,
				text: config.text,
				border: config.border,
				width: 97,
				margin: '0.5em auto 0.75em',
				component: ToolUI.JobApplication(E, api, state, dispatch, {
					bg: config.bg,
					accent: config.accent,
					border: config.border,
					margin: '0 auto',
					opening: config.opening
				})
			})
		])

		return JobOpening
	},
	JobDescription: function(E, api, state, dispatch, config) {
		const styles = {
			JobDescription: `
				display:flex; flex-direction:column; justify-content:flex-start; align-items:stretch;
				width:99%; margin:0 auto; padding:0; box-sizing:border-box;
				background-color:${config.bg}; border:1pt solid ${config.border}; border-radius:7px; box-shadow:1px 1px 3px ${config.border};
			`,
			row: `display:flex; flex-direction:row; justify-content:flex-start; align-items:center; margin:0.25em 0 0;`,
			label: `margin:0 0 0.15em 1em; font-weight:bold; color:${config.text};`,
			info: `flex:1; margin:0 0 0.15em 1em; color:${config.text};`,
			list: `display:flex; flex-direction:column; justify-content:flex-start; align-items:stretch;`,
			bullet: `margin:0.5em auto; width:90%; font-size:1em; color:${config.text};`
		}

		const salary = config.opening.pay !== '' ? config.opening.pay : 'TBD'

		const JobDescription = E('div', {style: styles.JobDescription}, [
			E('p', {style: styles.label}, ['Summary: ']),
			E('p', {style: styles.info}, [config.opening.description]),
			E('div', {style: styles.row}, [
				E('p', {style: styles.label}, ['Salary: ']),
				E('p', {style: styles.info}, [salary])
			]),
			UIComponents.CollapsePanel(E, api, state, dispatch, {
				default:'closed',
				title: 'Responsibilities',
				bg: config.bg,
				accent: config.accent,
				text: config.text,
				border: config.bg,
				width: 99,
				margin: '0 auto',
				component: E('div', {style: styles.list}, config.opening.responsibilities.map(r =>
					E('h4', {style: styles.bullet}, [` - ${r}`])
				))
			}),
			UIComponents.CollapsePanel(E, api, state, dispatch, {
				default:'closed',
				title: 'Qualifications',
				bg: config.bg,
				accent: config.accent,
				text: config.text,
				border: config.bg,
				width: 99,
				margin: '0 auto',
				component: E('div', {style: styles.list}, config.opening.qualifications.map(q =>
					E('h4', {style: styles.bullet}, [` - ${q}`])
				))
			})
		])

		return JobDescription
	},
	JobDescriptionEditor: function(E, api, state, dispatch, config) {
		const theme = state.uiState.theme[state.uiState.theme.selected]

		const styles = {
			JobDescriptionEditor: `
				display:flex; flex-direction:column; justify-content:flex-start; align-items:stretch;
				width:99%; margin:0 auto; padding:0; box-sizing:border-box; background-color:${config.bg};
			`,
			edit_btns_container: `display:flex; flex-direction:row; justify-content:center; align-items:center; width:97%; margin:0 auto;`
		}

		const loader = UIComponents.Loader(E, api, state, dispatch, {
			height: '1em',
			width: '1em',
			margin: '0 0 0 0.5em',
			accent: config.accent,
			thickness: '4px',
			default: 'hide'
		})
		const edit_btn = UIComponents.TextBtn(E, api, state, dispatch, {
			bg: theme.button_bg,
			accent: theme.button_accent,
			width: '2em',
			margin: '0 0.5em 0.75em',
			label: 'edit',
			cb: null
		})
		const delete_btn = UIComponents.TextBtn(E, api, state, dispatch, {
			bg: theme.alert_error_bg,
			accent: theme.button_accent,
			width: '3em',
			margin: '0 0.5em 0.75em',
			label: 'delete',
			cb: null
		})
		const save_btn = UIComponents.TextBtn(E, api, state, dispatch, {
			bg: theme.button_bg,
			accent: theme.button_accent,
			width: '2em',
			margin: '0 0.5em 0.75em',
			label: 'save',
			cb: null
		})
		const cancel_btn = UIComponents.TextBtn(E, api, state, dispatch, {
			bg: theme.button_bg,
			accent: theme.button_accent,
			width: '3em',
			margin: '0 0.5em 0.75em',
			label: 'cancel',
			cb: null
		})
		const edit_btns = E('div', {style: styles.edit_btns_container}, [
			edit_btn, delete_btn, save_btn, cancel_btn, loader
		])
		save_btn.style.display = 'none'
		cancel_btn.style.display = 'none'

		const description = ToolUI.JobDescription(E, api, state, dispatch, {
			bg: config.bg,
			accent: config.accent,
			border: config.bg,
			margin: '0 auto',
			opening: config.opening
		})
		const editor = UIComponents.Form(E, api, state, dispatch, {
			bg: config.bg,
			border: config.bg,
			accent: config.accent,
			title: '',
			title_align: 'center',
			width: 99,
			margin: '0 auto',
			btn: null,
			sections: [{
				title: '',
				fields: {
					title: {type:'name', data:config.opening.title, populate:true, label:'Title'},
					description: {type:'textarea', data:config.opening.description, populate:true, label:'Description'},
					pay: {type:'text', data:config.opening.pay || 'TBD', populate:true, label:'Pay'},
					responsibilities: {type:'textarea', data:config.opening.responsibilities.join('\n\n'), populate:true, label:'Responsibilities'},
					qualifications: {type:'textarea', data:config.opening.qualifications.join('\n\n'), populate:true, label:'Qualifications'}
				}
			}],
			components: []
		})
		const editor_panel = UIComponents.MessagePanel(E, api, state, dispatch, {
			width: 97,
			margin: '0 auto 0.25em',
			text: config.text,
			bg: config.bg,
			border: config.bg,
			component: E('div', {style: styles.JobDescriptionEditor}, [ description, editor, edit_btns ])
		})
		const JobDescriptionEditor = UIComponents.CollapsePanel(E, api, state, dispatch, {
			default:'closed',
			title: config.opening.title,
			bg: theme.bg,
			accent: theme.main_accent,
			text: theme.dark_text,
			border: theme.main_accent_transparent,
			width: 97,
			margin: '0.5em auto',
			component: editor_panel
		})

		editor.style.display = 'none'

		edit_btn.addEventListener('click', e => {
			description.style.display = 'none'
			editor.style.display = 'flex'
			save_btn.style.display = 'flex'
			cancel_btn.style.display = 'flex'
		})

		cancel_btn.addEventListener('click', e => {
			description.style.display = 'flex'
			editor.style.display = 'none'
			save_btn.style.display = 'none'
			cancel_btn.style.display = 'none'
		})

		save_btn.addEventListener('click', e => {
			loader.show()
			const form_data = editor.get_input()[0]
			form_data.responsibilities = form_data.responsibilities.split('\n\n')
			form_data.qualifications = form_data.qualifications.split('\n\n')

			const save_request = {
				type: 'UPDATE_OPENING',
				key: state.userState.user.key,
				data: {
					uuid: config.opening.uuid,
					...form_data
				}
			}
			api.post_req(save_request).then(response => {
				loader.hide()
				if (response.status !== 'GOOD') {
					console.log(' UPDATE RESPONSE ', response)
					editor_panel.show(`Unable to update opening. Error: ${response.type}`)
					return
				}
				editor_panel.show('Updated, reloading...', () => dispatch({type: 'NAV_TO', payload: 'CONTROL_PANEL'}))
			})
		})

		delete_btn.addEventListener('click', e => {
			loader.show()
			const delete_request = {
				type: 'DELETE_OPENING',
				key: state.userState.user.key,
				data: { uuid: config.opening.uuid }
			}
			api.post_req(delete_request).then(response => {
				loader.hide()
				if (response.status !== 'GOOD') {
					editor_panel.show(`Unable to delete opening. Error: ${response.type}`)
					return
				}
				editor_panel.show('Deleted...', () => JobDescriptionEditor.remove())
			})
		})

		return JobDescriptionEditor
	},
	JobDescriptionCreator: function(E, api, state, dispatch, config) {
		const theme = state.uiState.theme[state.uiState.theme.selected]

		const styles = {
			creator_panel: `
				display:flex; flex-direction:column; justify-content:flex-start; align-items:stretch;
				width:99%; margin:0 auto; padding:0.5em; box-sizing:border-box; background-color:${config.bg};
				border:1pt solid ${config.border}; border-radius:7px; box-shadow:1px 1px 3px ${config.border};
			`,
			edit_btns_container: `
				display:flex; flex-direction:row; justify-content:center; align-items:center; width:97%; margin:0 auto;
			`
		}

		const loader = UIComponents.Loader(E, api, state, dispatch, {
			height: '1em',
			width: '1em',
			margin: '0 0 0 0.5em',
			accent: config.accent,
			thickness: '4px',
			default: 'hide'
		})
		const add_btn = UIComponents.TextBtn(E, api, state, dispatch, {
			bg: theme.button_bg,
			accent: theme.button_accent,
			width: '2em',
			margin: '0 0.5em 0.75em',
			label: 'save',
			cb: null
		})
		const cancel_btn = UIComponents.TextBtn(E, api, state, dispatch, {
			bg: theme.button_bg,
			accent: theme.button_accent,
			width: '3em',
			margin: '0 0.5em 0.75em',
			label: 'cancel',
			cb: null
		})
		const edit_btns = E('div', {style: styles.edit_btns_container}, [ add_btn, cancel_btn, loader ])

		const editor = UIComponents.Form(E, api, state, dispatch, {
			bg: config.bg,
			border: config.bg,
			accent: config.accent,
			title: '',
			title_align: 'center',
			width: 99,
			margin: '0 auto',
			btn: null,
			sections: [{
				title: '',
				fields: {
					title: {type:'name', data:'Title', label:'Title'},
					description: {type:'textarea', data:'Description', label:'Description'},
					pay: {type:'text', data:'Pay', label:'Pay'},
					responsibilities: {type:'textarea', data:'Responsibilities', label:'Responsibilities'},
					qualifications: {type:'textarea', data:'Qualifications', label:'Qualifications'}
				}
			}],
			components: []
		})

		const creator_panel = E('div', {style: styles.creator_panel}, [ editor, edit_btns ])

		const JobDescriptionCreator = UIComponents.MessagePanel(E, api, state, dispatch, {
			width: 97,
			margin: '0 auto 0.25em',
			text: config.text,
			bg: config.bg,
			border: config.bg,
			component: creator_panel
		})

		cancel_btn.addEventListener('click', e => {
			JobDescriptionCreator.remove()
		})

		add_btn.addEventListener('click', e => {
			loader.show()
			const form_data = editor.get_input()[0]
			form_data.responsibilities = form_data.responsibilities.split('\n\n')
			form_data.qualifications = form_data.qualifications.split('\n\n')

			const add_request = {
				type: 'ADD_OPENING',
				key: state.userState.user.key,
				data: form_data
			}
			api.post_req(add_request).then(response => {
				loader.hide()
				if (response.status !== 'GOOD') {
					JobDescriptionCreator.show(`Unable to add opening. Error: ${response.type}`)
					return
				}
				JobDescriptionCreator.show('Added opening, reloading...', () => dispatch({type: 'NAV_TO', payload: 'CONTROL_PANEL'}))
			})
		})

		return JobDescriptionCreator
	},
	JobApplication: function(E, api, state, dispatch, config) {
		const theme = state.uiState.theme[state.uiState.theme.selected]

		const styles = {
			JobApplication: `
				display:flex; flex-direction:column; justify-content:flex-start; align-items:stretch;
				width:99%; margin:0 auto; padding:0.5em; box-sizing:border-box;
				background-color:${config.bg}; border:1pt solid ${config.bg}; border-radius:7px; box-shadow:1px 1px 3px ${config.bg};
			`,
			error_message: `display:none; margin:0.1em auto; font-size:1em; color:${theme.alert_error_bg};`,
			row: `
				display:flex; flex-direction:row; justify-content:flex-start; align-items:center;
				margin:1em auto; width:97%;
			`,
			doc_label: `margin:0 1em;`,
			doc_input: `margin:0;`
		}

		const personal_info = UIComponents.Form(E, api, state, dispatch, {
			bg: config.bg,
			border: config.bg,
			accent: config.accent,
			title: '',
			width: 97,
			margin: '0 auto',
			btn: null,
			sections: [{
				title: '',
				fields: {
					first_name: {type:'name', data:'Legal First Name'},
					last_name: {type:'name', data:'Legal Last Name'},
					email: {type:'email', data:'Email Address'},
					phone: {type:'phone', data:'Phone Number'}
				}
			}],
			components: []
		})

		const work_history = UIComponents.CollapsePanel(E, api, state, dispatch, {
			default:'closed',
			title: 'Work History',
			bg: config.bg,
			accent: config.accent,
			text: config.text,
			border: config.border,
			width: 97,
			margin: '1em auto 0',
			component: E('div', {style: styles.section},
				[1,2,3,4,5].map(job_idx => UIComponents.CollapsePanel(E, api, state, dispatch, {
					default:'closed',
					title: `Previous Job #${job_idx}`,
					bg: config.bg,
					accent: config.accent,
					margin: '0.5em 0 0',
					btn_size: config.btn_size,
					fnt_size: config.fnt_size,
					component: UIComponents.Form(E, api, state, dispatch, {
						bg: config.bg,
						bdr: config.accent,
						accent: config.accent,
						title: '',
						shadow: config.accent,
						btn: null,
						sections: [
							{title: '', fields: {
								job_idx,
								company: {type: 'text', data:'Company Name'},
								title: {type: 'name', data:'Job Title'},
								city: {type: 'city', data:'City'},
								state: {type: 'state', data:'State'},
								phone: {type: 'phone', data:'Phone Number'},
								email: {type: 'email', data:'Email Address'},
								start_date: {type: 'date', data:'Start Date'},
								end_date: {type: 'date', data:'End Date'},
								responsibilities: {type: 'textarea', data:'Describe your responsibilities...'}
							}}
						],
						components: []
					})
				})
			))
		})

		const references = UIComponents.CollapsePanel(E, api, state, dispatch, {
			default:'closed',
			title: 'References',
			bg: config.bg,
			accent: config.accent,
			text: config.text,
			border: config.border,
			width: 97,
			margin: '1em auto 0',
			component: E('div', {style: styles.section},
				[1,2,3,4,5].map(ref_idx => UIComponents.CollapsePanel(E, api, state, dispatch, {
					default:'closed',
					title: `Reference #${ref_idx}`,
					bg: config.bg,
					accent: config.accent,
					margin: '0.5em 0 0',
					btn_size: config.btn_size,
					fnt_size: config.fnt_size,
					component: UIComponents.Form(E, api, state, dispatch, {
						bg: config.bg,
						bdr: config.accent,
						accent: config.accent,
						title: '',
						shadow: config.accent,
						btn: null,
						sections: [
							{title: '', fields: {
								first_name: {type: 'name', data: 'Reference First Name'},
								last_name: {type: 'name', data: 'Reference Last Name'},
								phone: {type: 'phone', data: 'Reference Phone'},
								email: {type: 'email', data: 'Reference Email'}
							}}
						],
						components: []
					})
				})
			))
		})

		const documents = UIComponents.CollapsePanel(E, api, state, dispatch, {
			default:'closed',
			title: 'Documents',
			bg: config.bg,
			accent: config.accent,
			text: config.text,
			border: config.border,
			width: 97,
			margin: '1em auto 0',
			component: UIComponents.Form(E, api, state, dispatch, {
				bg: config.bg,
				bdr: config.accent,
				accent: config.accent,
				title: '',
				shadow: config.accent,
				btn: null,
				sections: [
					{title: '', fields: {
						resume: {type: 'pdf', label: 'Resume', data: 'NO ATTACHMENT'},
						cover: {type: 'pdf', label: 'Cover Letter', data: 'NO ATTACHMENT'}
					}}
				],
				components: []
			})
		})

		const loader = UIComponents.Loader(E, api, state, dispatch, {
			height: '1em',
			width: '1em',
			margin: '0 0 0 0.5em',
			accent: config.accent,
			thickness: '4px',
			default: 'hide'
		})

		const button = UIComponents.TextBtn(E, api, state, dispatch, {
			bg: config.accent,
			accent: config.bg,
			width: '3em',
			margin: 0,
			label: 'apply',
			cb: null
		})

		const btn_row = E('div', {style: styles.row}, [ button, loader ])

		const application_panel = UIComponents.MessagePanel(E, api, state, dispatch, {
			width: 97,
			margin: '0 auto 0.25em',
			text: config.text,
			bg: config.bg,
			border: config.bg,
			component: E('div', {style: 'margin:0 auto; width:100%;'}, [
				personal_info,
				work_history,
				references,
				documents,
				btn_row
			])
		})

		const JobApplication = E('div', {style: styles.JobApplication}, [ application_panel ])

		button.addEventListener('click', e => {
			loader.show()
			const personal_data = personal_info.get_input()[0]
			const work_data = []
			const ref_data = []

			let passed = true
			for (let i = 0; i < 5; i++) {
				const job_form = work_history.lastChild.firstChild.children[i].lastChild.firstChild
				const ref_form = references.lastChild.firstChild.children[i].lastChild.firstChild

				const job = job_form.get_input()[0]
				const ref = ref_form.get_input()[0]

				work_data.push(job)
				ref_data.push(ref)

				if (!job_form.form_passed()) passed = false
				if (!ref_form.form_passed()) passed = false
			}

			if (!passed) {
				loader.hide()
				application_panel.show('Check application for errors and try again.')
				return
			}

			const applicant_data = {
				position: config.opening.title,
				personal_info: personal_data,
				work_history: work_data,
				references: ref_data,
				documents: documents.lastChild.firstChild.get_input()[0]
			}
			console.log(' SENDING: ', applicant_data)
			api.post_req({type: 'ADD_APPLICATION', data:applicant_data}).then(apply_response => {
				loader.hide()
				if (apply_response.status !== 'GOOD') application_panel.show('Application unsuccessful. Please try again. If problem persists, contact support.')
				else application_panel.show('Thank you for applying. We will reach out soon if your skills and experience align with our needs.')
			})
		})

		return JobApplication
	},
	ApplicantDisplay: function(E, api, state, dispatch, config) {
		const theme = state.uiState.theme[state.uiState.theme.selected]

		const styles = {
			ApplicantDisplay: `display:flex; flex-direction:column; justify-content:flex-start; align-items:stretch;`,
			applicant_panel: `
				display:flex; flex-direction:column; justify-content:flex-start; align-items:stretch;
				width:100%; margin:0.75em auto; padding:0.75em; background-color:${config.bg}; border:1pt solid ${config.accent};
				border-radius:5px; box-sizing:border-box;
			`,
			position_title: `margin:0.5em 0.25em 0.25em 0.5em; color:${config.accent}; font-size:1em;`,
			applicant_name: `margin:0.25em 0.25em 0.25em 0.5em; color:${config.accent}; font-size:1em;`,
			applicant_info: `margin:0.25em 0.25em 0.25em 0.5em;`,
			applicant_info_label: `margin:0 0.5em; color:${config.accent}; font-size:1em;`,
			applicant_data: `margin:0; color:${config.accent}; font-size:1em;`,
			applicant_info_row: `
				display:flex; flex-direction:row; justify-content:flex-start; align-items:center;
				margin:0.25em 0; width:100%;
			`,
			section: `margin:0.1em; width:100%;`,
			subsection: `margin:0.1em; width:100%;`,
			btn_row: ``
		}

		const {uuid, position, personal_info, work_history, references, documents} = config.application

		const applicant_panel = E('div', {style: styles.applicant_panel}, [
			E('h2', {style: styles.position_title}, [ position ]),
			E('h3', {style: styles.applicant_name}, [`${personal_info.first_name} ${personal_info.last_name}`]),
			E('div', {style: styles.applicant_info},
				Object.keys(personal_info).filter(k => (k !== 'first_name' && k !== 'last_name')).map(info => {
					const label = E('h4', {style: styles.applicant_info_label}, [`${info}:`])
					const applicant_data = E('h4', {style: styles.applicant_data}, [personal_info[info]])
					return E('div', {style: styles.applicant_info_row}, [label, applicant_data])
				})
			),
			UIComponents.CollapsePanel(E, api, state, dispatch, {
				default:'closed',
				title: 'Work History',
				bg: config.bg,
				accent: config.accent,
				margin: '0.25em auto 0',
				component: E('div', {style: styles.section},
					work_history.map(job => E('div', {style: styles.subsection}, [
						UIComponents.CollapsePanel(E, api, state, dispatch, {
							default:'closed',
							title: job.title,
							bg: config.bg,
							accent: config.accent,
							margin: '0.25em auto 0',
							component: E('div', {style: styles.subsection},
								Object.keys(job).filter(k => k !== 'idx').map(info => {
									const label = E('h4', {style: styles.applicant_info_label}, [`${info.replace('_', ' ')}:`])
									const applicant_data = E('h4', {style: styles.applicant_data}, [`${job[info]}`])
									return E('div', {style: styles.applicant_info_row}, [label, applicant_data])
								})
							)
						})
					])
				))
			}),
			UIComponents.CollapsePanel(E, api, state, dispatch, {
				default:'closed',
				title: 'References',
				bg: config.bg,
				accent: config.accent,
				margin: '0.25em auto 0',
				component: E('div', {style: styles.section},
					references.map(ref => E('div', {style: styles.subsection}, [
						UIComponents.CollapsePanel(E, api, state, dispatch, {
							default:'closed',
							title: `${ref.first_name} ${ref.last_name}`,
							bg: config.bg,
							accent: config.accent,
							margin: '0.25em auto 0',
							component: E('div', {style: styles.subsection},
								Object.keys(ref).filter(k => k !== 'idx').map(info => {
									const label = E('h4', {style: styles.applicant_info_label}, [`${info.replace('_', ' ')}:`])
									const applicant_data = E('h4', {style: styles.applicant_data}, [`${ref[info]}`])
									return E('div', {style: styles.applicant_info_row}, [label, applicant_data])
								})
							)
						})
					])
				))
			}),
			UIComponents.CollapsePanel(E, api, state, dispatch, {
				default:'closed',
				title: 'Documents',
				bg: config.bg,
				accent: config.accent,
				margin: '0.25em auto 0',
				component: E('div', {style: styles.section},
					Object.keys(documents).map(doc_key =>
						UIComponents.CollapsePanel(E, api, state, dispatch, {
							default:'closed',
							title: doc_key,
							bg: config.bg,
							accent: config.accent,
							margin: '0.25em auto 0',
							component: E('iframe', {
								src: documents[doc_key],
								style: styles.subsection,
								allowfullscreen:'',
								loading:'lazy'
							}, [])
						})
					)
				)
			})
		])

		const ApplicantDisplay = UIComponents.MessagePanel(E, api, state, dispatch, {
			width: 97,
			margin: '0 auto 0.25em',
			text: config.text,
			bg: config.bg,
			border: config.bg,
			component: applicant_panel
		})

		const loader = UIComponents.Loader(E, api, state, dispatch, {
			height: '1em',
			width: '1em',
			margin: '0 0 0 0.5em',
			accent: config.accent,
			thickness: '4px',
			default: 'hide'
		})

		const delete_application = () => {
			loader.show()
			const api_request = {
				type: 'DELETE_APPLICATION',
				key: state.userState.user.key,
				data: { uuid }
			}
			api.post_req(api_request).then(api_response => {
				loader.hide()
				if (api_response.status === 'GOOD') ApplicantDisplay.show('Deleted application.', () => ApplicantDisplay.remove())
				else ApplicantDisplay.show('Unable to delete application. Please contact support if problem persists.')
			})
		}

		const button = UIComponents.TextBtn(E, api, state, dispatch, {
			bg: theme.button_bg,
			accent: theme.button_accent,
			width: '3em',
			margin: '0.75em 0.5em 0.5em',
			label: 'delete',
			cb: delete_application
		})

		ApplicantDisplay.appendChild(
			E('div', {style: styles.btn_row}, [ button, loader ])
		)

		return ApplicantDisplay
	},
	Inquiry: function(E, api, state, dispatch, config) {
		const theme = state.uiState.theme[state.userState.user.theme]

		const styles = {
			Inquiry: `display:flex; flex-direction:column; justify-content:flex-start; align-items:stretch;`,
			inquiry_panel: `
				display:flex; flex-direction:column; justify-content:flex-start; align-items:stretch; font-size:1em;
				width:99%; margin:0.75em auto; padding:0; background-color:${config.bg}; border:1pt solid ${config.accent};
				border-radius:5px; box-sizing:border-box;
			`,
			info_label: `margin:0.1em 0.5em 0.1em 0.1em; font-size:1em; color:${config.accent};`,
			info_data: `margin:0.1em; font-size:1em; color:${config.accent};`,
			info_row: `display:flex; flex-direction:row; justify-content:flex-start; align-items:center; margin:0.1em 0.75em;`,
			btn_row: `display:flex; flex-direction:row; justify-content:flex-start; align-items:center; margin:0.5em; 0.75em`,
			section: `margin:0.1em; width:95%;`
		}

		const {uuid, first_name, last_name, reason, phone, email, inquiry} = config.inquiry

		const inquiry_panel = UIComponents.CollapsePanel(E, api, state, dispatch, {
			default:'closed',
			title: `${first_name} - ${reason}`,
			bg: config.bg,
			accent: config.accent,
			margin: 0,
			component: E('div', {style: styles.section}, Object.keys(config.inquiry).filter(k => k !== 'uuid').map(label_text => {
				const formatted_label = label_text.split('_').map(w => `${w[0].toUpperCase()}${w.slice(1)}`).join(' ')
				const label = E('h3', {style: styles.info_label}, [formatted_label])
				const data = E('h4', {style: styles.info_data}, [config.inquiry[label_text]])
				return E('div', {style: styles.info_row}, [label, data])
			}))
		})

		const Inquiry = UIComponents.MessagePanel(E, api, state, dispatch, {
			width: 97,
			margin: '0.5em auto',
			text: config.text,
			bg: config.bg,
			border: config.bg,
			component: inquiry_panel
		})

		const loader = UIComponents.Loader(E, api, state, dispatch, {
			height: '1em',
			width: '1em',
			margin: '0 0 0 0.5em',
			accent: config.accent,
			thickness: '4px',
			default: 'hide'
		})

		const delete_inquiry = () => {
			loader.show()
			const api_request = {
				type: 'DELETE_INQUIRY',
				key: state.userState.user.key,
				data: { uuid }
			}
			api.post_req(api_request).then(api_response => {
				loader.hide()
				if (api_response.status === 'GOOD') Inquiry.show('Deleted inquiry.', () => Inquiry.remove())
				else Inquiry.show('Unable to delete inquiry. Please contact support if problem persists.')
			})
		}

		const button = UIComponents.TextBtn(E, api, state, dispatch, {
			bg: theme.button_bg,
			accent: theme.button_accent,
			label: 'delete',
			width: '3em',
			margin: '0.5em 0',
			cb: delete_inquiry
		})

		inquiry_panel.lastChild.firstChild.appendChild(
			E('div', {style: styles.btn_row}, [ button, loader ])
		)

		return Inquiry
	},
	Product: function(E, api, state, dispatch, config) {
		const theme = state.uiState.theme[state.uiState.theme.selected]

		const styles = {
			Product: `
				display:flex; flex-direction:column; justify-content:flex-start; align-items:stretch;
				width:${config.width}%; margin:0.5em auto; padding:0.5em; box-sizing:border-box;
				background-color:${config.bg}; border:1pt solid ${config.accent}; border-radius:5px; box-shadow:1px 1px 3px ${config.accent};
			`,
			product_img: `width:100%; margin:0 auto;`,
			product_name: `margin:0.25em auto; font-size:1em; font-weight:100; text-decoration:underline; width:100%;`,
			product_description: `margin:0 auto; font-size:1em; font-weight:100; width:100%; overflow-y:scroll;`,
		}

		const {name, description, img_data} = config.product

		const Product = E('div', {style:styles.Product}, [
			E('img', {style: styles.product_img, src:URL.createObjectURL(img_data), alt:`${name} Image`}, []),
			E('h2', {style: styles.product_name}, [name]),
			E('p', {style: styles.product_description}, [description]),
			UIComponents.TextBtn(E, api, state, dispatch, {
				bg: theme.button_bg,
				accent: theme.button_accent,
				width: '2.5em',
				margin: '0.5em auto',
				label: 'shop',
				cb: null
			})
		])

		if (!config.editing) Product.lastChild.addEventListener('click', e => dispatch({type:'NAV_TO', payload:'CONTACT'}))

		return Product
	},
	Service: function(E, api, state, dispatch, config) {
		const theme = state.uiState.theme[state.uiState.theme.selected]

		const styles = {
			Service: `
				display:flex; flex-direction:column; justify-content:flex-start; align-items:stretch;
				width:${config.width}%; margin:0.5em auto; padding:0.5em; box-sizing:border-box;
				background-color:${config.bg}; border:1pt solid ${config.accent}; border-radius:5px; box-shadow:1px 1px 3px ${config.accent};
			`,
			service_img: `width:100%; margin:0 auto;`,
			service_name: `margin:0.25em auto; font-size:1em; font-weight:100; text-decoration:underline; width:100%;`,
			service_description: `margin:0 auto; font-size:1em; font-weight:100; width:100%; overflow-y:scroll;`,
		}

		const {name, description, img_data} = config.service

		const Service = E('div', {style:styles.Service}, [
			E('img', {style: styles.service_img, src:URL.createObjectURL(img_data), alt:`${name} Image`}, []),
			E('h2', {style: styles.service_name}, [name]),
			E('p', {style: styles.service_description}, [description]),
			UIComponents.TextBtn(E, api, state, dispatch, {
				bg: theme.button_bg,
				accent: theme.button_accent,
				width: '5em',
				margin: '0.5em auto',
				label: 'contact us',
				cb: null
			})
		])

		if (!config.editing) Service.lastChild.addEventListener('click', e => dispatch({type:'NAV_TO', payload:'CONTACT'}))

		return Service
	},
	ThemeSelector: function(E, api, state, dispatch) {
		const theme = state.uiState.theme[state.uiState.theme.selected]

		const styles = {
			ThemeSelector: `
				display:flex; flex-direction:column; justify-content:flex-start; align-items:stretch;
				width:95%; margin:0.5em auto; padding:0.25em;
			`,
			selector_title: `margin:0 0 0.2em; font-size:1em; text-decoration:underline; color:${theme.dark_text};`,
			theme_list: `height:10em; overflow-y:scroll; border:1pt solid ${theme.main_accent};`,
			theme_bar: `margin:0 auto; padding:0.75em; border-bottom:1px solid ${theme.menu_accent};`,
			theme_name: `margin:0 1em; font-size:1em;`,
			save_theme_row: `display:flex; flex-direction:row; justify-content:flex-start; align-items:center; margin:0 auto; width:100%;`
		}

		const loader = UIComponents.Loader(E, api, state, dispatch, {
			height: '1em',
			width: '1em',
			margin: '0 0 0 0.5em',
			accent: theme.main_accent,
			thickness: '4px',
			default: 'hide'
		})

		const available_themes = Object.keys(state.uiState.theme).filter(k => k !== 'selected')
		const theme_names = available_themes.map(t => t.split('_').map(w => w[0] + w.slice(1).toLowerCase()).join(' '))

		const user_save_btn = UIComponents.TextBtn(E, api, state, dispatch, {
			bg: theme.button_bg,
			accent: theme.button_accent,
			width: '5em',
			margin: '0.75em 0 0',
			label: 'save user',
			cb: null
		})

		const selector_panel = E('div', {style:styles.ThemeSelector}, [
			E('h2', {style: styles.selector_title}, ['Theme Selector']),
			E('div', {style: styles.theme_list}, theme_names.map((name, i) => {
				const theme_choice = state.uiState.theme[available_themes[i]]
				const theme_bar = E('div', {style:`${styles.theme_bar} background-color:${theme_choice.header_bg};`}, [
					E('h3', {style:`${styles.theme_name} color:${theme_choice.header_text}`}, [name])
				])
				theme_bar.addEventListener('click', e => dispatch({type: 'CHANGE_THEME', payload: available_themes[i]}))
				return theme_bar
			})),
			E('div', {style:styles.save_theme_row}, [ user_save_btn, loader ])
		])

		const ThemeSelector = UIComponents.MessagePanel(E, api, state, dispatch, {
			width: 97,
			margin: '0.25em auto',
			text: theme.dark_text,
			bg: theme.bg,
			border: theme.main_accent,
			component: selector_panel
		})

		user_save_btn.addEventListener('click', e => {
			loader.show()
			const update_user_request = {
				type: 'UPDATE_USER',
				key: state.userState.user.key,
				data: {
					lookup_key: state.userState.user.key,
					property: 'theme',
				  	new_data: state.uiState.theme.selected
				}
			}
			api.post_req(update_user_request).then(update_response => {
				loader.hide()
				if (update_response.status !== 'GOOD') {
					ThemeSelector.show('Could not save theme.')
					return
				}
				const key_name = `${state.userState.user.name} - ${state.userState.user.key}`
				const ls_key = JSON.parse(localStorage.getItem(key_name))
				ls_key.theme = state.uiState.theme.selected
				localStorage.removeItem(key_name)
				localStorage.setItem(key_name, JSON.stringify(ls_key))
				ThemeSelector.show('Theme updated.')
			})
		})

		if (state.userState.user.type === 'OWNER') {
			const app_save_btn = UIComponents.TextBtn(E, api, state, dispatch, {
				bg: theme.button_bg,
				accent: theme.button_accent,
				width: '5em',
				margin: '0.75em 0.5em 0',
				label: 'save app',
				cb: null
			})
			app_save_btn.addEventListener('click', e => {
				loader.show()
				const update_app_request = {
					type: 'UPDATE_APPLICATION',
					key: state.userState.user.key,
					data: {
					  property: 'THEME',
					  new_data: state.uiState.theme.selected
					}
				}
				api.post_req(update_app_request).then(response => {
					loader.hide()
					if (response.status !== 'GOOD') ThemeSelector.show('Could not save application theme.')
					else ThemeSelector.show('Application theme updated.')
				})
			})
			ThemeSelector.lastChild.lastChild.insertBefore(app_save_btn, loader)
		}

		return ThemeSelector
	},
	ViewManager: function(E, api, state, dispatch) {
		const theme = state.uiState.theme[state.uiState.theme.selected]

		const styles = {
			ViewManager: `
				display:flex; flex-direction:column; justify-content:flex-start; align-items:stretch;
				width:97%; margin:0.5em auto; padding:1em 0; background-color:${theme.bg}; box-sizing:border-box;
				border:1pt solid ${theme.main_accent}; border-radius:7px; box-shadow:1px 1px 3px ${theme.main_accent};
			`,
			title: `width:91%; margin:0 auto; font-size:1em; text-decoration:underline; color:${theme.dark_text};`,
			switch_row: `
				display:flex; flex-direction:row; justify-content:space-between; align-items:center;
				width:91%; margin:0.25em auto; padding:0;
			`,
			switch_label: `font-size:1.1em; margin:0; color:${theme.dark_text};`
		}

		const mutable_views = Object.keys(state.uiState.map).filter(k => !['HOME', 'LOGIN', 'CONTROL_PANEL'].includes(k))
		const view_switches = mutable_views.map(view => {
			const switch_label = `${view[0]}${view.slice(1).toLowerCase()}`
			const default_status = state.uiState.map[view].status === 'ENABLED' ? 'ON' : 'OFF'

			const switch_loader = UIComponents.Loader(E, api, state, dispatch, {
				height: '1em',
				width: '1em',
				margin: '1em',
				accent: theme.main_accent,
				thickness: '4px',
				default: 'hide'
			})

			const switch_row = E('div', {style: styles.switch_row}, [
				E('h2', {style: styles.switch_label}, [`Display ${switch_label}:`]), switch_loader
			])

			const view_toggle = UIComponents.MessagePanel(E, api, state, dispatch, {
				width: 97,
				margin: '0 auto',
				text: theme.dark_text,
				bg: theme.clear,
				border: theme.clear,
				component: switch_row
			})

			const on_callback = () => {
				console.log(` SHOW >> ${switch_label}`)
				switch_loader.show()
				const update_request = {
					type: 'UPDATE_APPLICATION',
					key: state.userState.user.key,
					data: {
						property: 'VIEW',
						new_data: view
					}
				}
				api.post_req(update_request).then(update_response => {
					switch_loader.hide()
					if (update_response.status === 'GOOD') view_toggle.show(`Enabled ${switch_label} view. Reloading...`, () => dispatch({type:'ENABLE_VIEW', payload:view}))
					else view_toggle.show(`Couldn't enable ${switch_label} view. Please contact support if problem persists.`)
				})
			}

			const off_callback = () => {
				console.log(` HIDE >> ${switch_label}`)
				switch_loader.show()
				const update_request = {
					type: 'UPDATE_APPLICATION',
					key: state.userState.user.key,
					data: {
						property: 'VIEW',
						new_data: view
					}
				}
				api.post_req(update_request).then(update_response => {
					switch_loader.hide()
					if (update_response.status === 'GOOD') view_toggle.show(`Disabled ${switch_label} view. Reloading...`, () => dispatch({type:'DISABLE_VIEW', payload:view}))
					else view_toggle.show(`Couldn't disable ${switch_label} view. Please contact support if problem persists.`)
				})
			}

			const toggle_switch = UIComponents.ToggleSwitch(E, api, state, dispatch, {
				default: default_status,
				margin: '0',
				bg: theme.shadow,
				border: theme.dark_text,
				on: {
					name: 'enable',
					color: theme.alert_success_bg,
					callback: on_callback
				},
				off: {
					name: 'disable',
					color: theme.shadow,
					callback: off_callback
				}
			})

			switch_row.insertBefore(toggle_switch, switch_loader)

			return view_toggle
		})

		const ViewManager = E('div', {style: styles.ViewManager}, [
			E('h2', {style: styles.title}, ['View Manager']),
			...view_switches
		])

		return ViewManager
	},
	HeaderManager: function(E, api, state, dispatch) {
		const theme = state.uiState.theme[state.uiState.theme.selected]

		const styles = {
			HeaderManager: `
				display:flex; flex-direction:column; justify-content:flex-start; align-items:stretch;
				width:97%; margin:0.5em auto; padding:0;
			`,
			title: `width:97%; margin:0.25em auto; font-size:1em; text-decoration:underline; color:${theme.dark_text};`,
			button_row: `
				display:flex; flex-direction:row; justify-content:flex-start; align-items:stretch;
				width:99%; margin:0.5em auto; padding:0;
			`
		}

		const available_routes = Object.keys(state.uiState.map).filter(r =>
			!['HOME', 'LOGIN', 'CONTROL_PANEL'].includes(r) && state.uiState.map[r].status === 'ENABLED'
		)

		const route_selector = UIComponents.MultiSelector(E, api, state, dispatch, {
			width: 97,
			margin: '0 auto',
			justification: 'flex-start',
			text: theme.dark_text,
			bg: theme.clear,
			border: theme.clear,
			limit: 4,
			selections: available_routes.map(route => ({
				name: route,
				selected: state.uiState.header.routes.includes(route)
			})),
			selected: {
				bg: theme.main_accent_transparent,
				border: theme.link
			},
			unselected: {
				bg: theme.clear,
				border: theme.shadow
			}
		})

		const HeaderManager = UIComponents.MessagePanel(E, api, state, dispatch, {
			width: 97,
			margin: '0 auto',
			text: theme.dark_text,
			bg: theme.bg,
			border: theme.main_accent,
			component: E('div', {style: styles.HeaderManager}, [
				E('h2', {style: styles.title}, ['Header Manager']),
				route_selector
			])
		})

		const loader = UIComponents.Loader(E, api, state, dispatch, {
			height: '1em',
			width: '1em',
			margin: '0 0 0 0.5em',
			accent: theme.main_accent,
			thickness: '4px',
			default: 'hide'
		})

		const button = UIComponents.TextBtn(E, api, state, dispatch, {
			bg: theme.button_bg,
			accent: theme.button_accent,
			width: '3em',
			margin: '0.25em',
			label: 'save',
			cb: () => {
				const selected_routes = route_selector.status().filter(r => r.selected).map(r => r.name)
				const update_request = {
					type: 'UPDATE_APPLICATION',
					key: state.userState.user.key,
					data: {
						property: 'HEADER',
						new_data: selected_routes
					}
				}
				console.log(' sending >> ', update_request)
				api.post_req(update_request).then(update_response => {
					if (update_response.status !== 'GOOD') {
						HeaderManager.show('Unable to update header routes. Please contact support if problem persists.')
						return
					}
					HeaderManager.show('Header routes updated. Reloading...', () => dispatch({type:'UPDATE_HEADER_ROUTES', payload: selected_routes}))
				})
			}
		})

		HeaderManager.lastChild.appendChild(E('div', {style: styles.button_row}, [ button, loader ]))

		return HeaderManager
	}
}

const Tools = {
	Authenticate: function(E, api, state, dispatch) {
		const theme = state.uiState.theme[state.uiState.theme.selected]

		const styles = {
			AuthenticateTool: `display:flex; flex-direction:column; justify-content:flex-start; align-items:stretch;`,
			tool_container: `
				display:flex; flex-direction:column; justify-content:flex-start; align-items:stretch;
				margin:0 auto; width:97%; padding:0; box-sizing:border-box;
				background-color:${theme.bg}; border:1pt solid ${theme.main_accent}; border-radius:5px;
			`,
			submit_section: `display:flex; flex:1; flex-direction:row; justify-content:space-between; align-items:center; width:83%; margin:0 auto 0.75em;`
		}

		const loader = UIComponents.Loader(E, api, state, dispatch, {
			height: '1em',
			width: '1em',
			margin: '0 0 0 0.5em',
			accent: theme.main_accent,
			thickness: '4px',
			default: 'hide'
		})

		const button = UIComponents.TextBtn(E, api, state, dispatch, {
			bg: theme.button_bg,
			accent: theme.button_accent,
			label: 'login',
			width: '3em'
		})

		const selector = UIComponents.DotSelector(E, api, state, dispatch, {
			def_idx: 0,
			size: '0.5em',
			margin: '0.1em',
			orientation: 'column',
			title: 'Trust device:',
			bg: theme.button_bg,
			accent: theme.main_accent,
			selections: [
				{label: 'hour', value: 0.0415},
				{label: 'day', value: 1},
				{label: 'week', value: 7}
			]
		})

		const form = UIComponents.Form(E, api, state, dispatch, {
			bg: theme.bg,
			border: theme.bg,
			accent: theme.header_bg,
			title: 'Sign into your account',
			title_align: 'center',
			margin: '0.75em auto 0.25em',
			width: 91,
			btn: button,
			sections: [
				{title: '', fields: {
					email: {type:'email', data:'Email Address'},
					password: {type:'password', data:'Password'}
				}}
			],
			components: []
		})

		const tool_container = E('div', {style: styles.tool_container}, [
			form,
			E('div', {style:styles.submit_section}, [ button, loader, selector ]),
		])
		const AuthenticateTool = E('div', {style: styles.AuthenticateTool}, [ tool_container ])

		const logged_in = Object.keys(localStorage).map(key => Object.assign(JSON.parse(localStorage[key]), {ls_key: key}))

		if (logged_in.length > 0) {
			logged_in.forEach((login, i) => {
				api.post_req({type:'CHECK_KEY', key:login.key}).then(response => {
					if (response.status === 'BAD') {
						logged_in[i] = 'BAD_KEY'
						localStorage.removeItem(login.ls_key)
					}
					if (i === logged_in.length - 1) {
						const valid_logins = logged_in.filter(l => l !== 'BAD_KEY')
						if (!valid_logins.length > 0) return
						const login_selector = ToolUI.LoginSelector(E, api, state, dispatch, {
							title: '',
							width: 99,
							margin: '0.5em auto',
							bg: theme.bg,
							border: theme.clear,
							accent: theme.main_accent,
							selected: theme.shadow,
							unselected: theme.clear,
							users: valid_logins
						})
						const separator = UIComponents.OrSeparator(E, api, state, dispatch, {
							orientation: 'row',
							accent: theme.main_accent
						})
						tool_container.insertBefore(login_selector, form)
						tool_container.insertBefore(separator, form)
					}
				})
			})
		}

		button.addEventListener('click', e => {
			if (!form.form_passed()) return
			loader.show()
			const {email, password} = form.get_input()[0]
			const days = selector.get_status()
			api.post_req({type:'LOGIN', data:{email, password, days}}).then(response => {
				loader.hide()
				if (response.status === 'GOOD') {
					const {key, name, type, tools, theme} = response.data
					localStorage.setItem(`${name} - ${key}`, JSON.stringify({key, name, type, tools, theme}))
					dispatch({type: 'LOGIN', payload: {key, name, type, tools, theme}})
				}
				else dispatch({type: 'LOGOUT'})
			})
		})

		return AuthenticateTool
	},
	Inquiries: function(E, api, state, dispatch) {
		const theme = state.uiState.theme[state.uiState.theme.selected]

		const styles = {
			Inquiries: `
				display:flex; flex-direction:column; justify-content:flex-start; align-items:stretch;
				width:99%; margin:0 auto; padding:0; box-sizing:border-box;
			`,
			error_message: `font-size:1em; margin:0.25em auto; width:90%; color:${theme.dark_text};`
		}

		const loader = UIComponents.Loader(E, api, state, dispatch, {
			height: '1em',
			width: '1em',
			margin: '0 0 0 0.5em',
			accent: theme.main_accent,
			thickness: '4px',
			default: 'show'
		})

		const Inquiries = E('div', {style:styles.Inquiries}, [ loader ])

		api.post_req({type: 'GET_INQUIRIES', key:state.userState.user.key}).then(api_response => {
			loader.hide()
			if (api_response.status !== 'GOOD') {
				Inquiries.appendChild(E('h2', {style: styles.error_message}, ['Unable to retrieve inquiries.']))
				return
			}
			const stored_inquiries = Object.keys(api_response.data).map(uuid => api_response.data[uuid])
			if (!stored_inquiries.length > 0) {
				Inquiries.appendChild(E('h2', {style: styles.error_message}, ['No saved inquiries.']))
				return
			}
			stored_inquiries.forEach(inquiry => Inquiries.appendChild(
				ToolUI.Inquiry(E, api, state, dispatch, {
					bg: theme.bg,
					accent: theme.link,
					inquiry
				})
			))
		})

		return Inquiries
	},
	JobsManager: function(E, api, state, dispatch) {
		const {key, name, type, tools} = state.userState.user
		const theme = state.uiState.theme[state.uiState.theme.selected]

		const styles = {
			JobsManager: `
				display:flex; flex-direction:column; justify-content:flex-start; align-items:stretch;
				width:99%; margin:0 auto; padding:0;
			`,
			section: `display:flex; flex-direction:column; justify-content:flex-start; align-items:stretch; width:98%; margin:0 auto;`,
			container: `display:flex; flex-direction:column; justify-content:flex-start; align-items:stretch; width:98%; margin:0.5em auto;`,
			error_message: `font-size:1em; margin:0.25em auto; width:90%; color:${theme.dark_text};`
		}

		const applications_loader = UIComponents.Loader(E, api, state, dispatch, {
			height: '1em',
			width: '1em',
			margin: '0 0 0 0.5em',
			accent: theme.main_accent,
			thickness: '4px',
			default: 'show'
		})

		const openings_loader = UIComponents.Loader(E, api, state, dispatch, {
			height: '1em',
			width: '1em',
			margin: '0 0 0 0.5em',
			accent: theme.main_accent,
			thickness: '4px',
			default: 'show'
		})

		const applications = UIComponents.CollapsePanel(E, api, state, dispatch, {
			default:'closed',
			title: 'Applications',
			bg: theme.bg,
			accent: theme.link,
			btn_size: '1.25em',
			fnt_size: '1.25em',
			margin: '0.25em auto',
			component: E('div', {style:styles.section}, [ applications_loader ])
		})

		const add_opening_btn = UIComponents.TextBtn(E, api, state, dispatch, {
			bg: theme.button_bg,
			accent: theme.button_accent,
			width: '3em',
			margin: '0.5em auto',
			label: 'new',
			cb: null
		})

		const openings = UIComponents.CollapsePanel(E, api, state, dispatch, {
			default:'closed',
			title: 'Current Openings',
			bg: theme.bg,
			accent: theme.link,
			btn_size: '1.25em',
			fnt_size: '1.25em',
			margin: '0.25em auto',
			component: E('div', {style:styles.section}, [ openings_loader, add_opening_btn ])
		})

		api.post_req({type: 'GET_APPLICATIONS', key}).then(response => {
			applications_loader.hide()
			if (response.status !== 'GOOD') {
				applications.lastChild.firstChild.appendChild(E('h2', {style: styles.error_message}, ['Unable to retrieve applications.']))
				return
			}
			const stored_applications = Object.keys(response.data).map(a => response.data[a])
			if (!stored_applications.length > 0) {
				applications.lastChild.firstChild.appendChild(E('h2', {style: styles.error_message}, ['No saved applications.']))
				return
			}
			stored_applications.forEach(application => {
				applications.lastChild.firstChild.appendChild(
					ToolUI.ApplicantDisplay(E, api, state, dispatch, {
						bg: theme.bg,
						accent: theme.main_accent,
						application
					})
				)
			})
		})

		api.post_req({type: 'GET_OPENINGS'}).then(response => {
			openings_loader.hide()
			if (response.status === 'BAD') {
				openings.lastChild.firstChild.appendChild(E('h2', {style: styles.error_message}, ['Unable to retrieve openings.']))
				return
			}
			const stored_openings = Object.keys(response.data).map(o => response.data[o])
			if (!stored_openings.length > 0) {
				openings.lastChild.firstChild.appendChild(E('h2', {style: styles.error_message}, ['No saved openings.']))
				return
			}
			stored_openings.forEach(opening => {
				openings.lastChild.firstChild.insertBefore(
					ToolUI.JobDescriptionEditor(E, api, state, dispatch, {
						bg: theme.bg,
						accent: theme.link,
						text: theme.dark_text,
						border: theme.main_accent_transparent,
						margin: '0 auto',
						opening
					}),
					add_opening_btn
				)
			})
		})

		add_opening_btn.addEventListener('click', e => {
			const creator = ToolUI.JobDescriptionCreator(E, api, state, dispatch, {
				bg: theme.bg,
				accent: theme.link,
				text: theme.dark_text,
				border: theme.main_accent,
				margin: '0 auto'
			})
			openings.lastChild.firstChild.insertBefore(creator, add_opening_btn)
		})

		const JobsManager = E('div', {style: styles.JobsManager}, [
			E('div', {style: styles.container}, [ applications, openings ])
		])

		return JobsManager
	},
	UIManager: function(E, api, state, dispatch) {
		const theme = state.uiState.theme[state.uiState.theme.selected]

		const styles = {
			UIManager: `
				display:flex; flex-direction:column; justify-content:flex-start; align-items:stretch;
				width:97%; margin:0.5em auto; padding:0;
			`
		}

		const UIManager = E('div', {style: styles.UIManager}, [
			ToolUI.ThemeSelector(E, api, state, dispatch)
		])

		if (state.userState.user.type === 'OWNER') {
			UIManager.appendChild(ToolUI.ViewManager(E, api, state, dispatch))
			UIManager.appendChild(ToolUI.HeaderManager(E, api, state, dispatch))
		}

		return UIManager
	},
	AccountManager: function(E, api, state, dispatch) {
		const theme = state.uiState.theme[state.userState.user.theme]

		const styles = {
			AccountManager: `
				display:flex; flex-direction:column; justify-content:flex-start; align-items:stretch;
				width:100%; margin:0.5em auto; padding:0.5em; box-sizing:border-box;
			`,
			info_container: `
				display:flex; flex-direction:column; justify-content:flex-start; align-items:stretch;
				width:91%; margin:0.5em auto;
			`,
			user_details: `margin:0.25em auto;`,
			info_section: `
				display:flex; flex-direction:column; justify-content:flex-start; align-items:stretch;
				width:97%; margin:0.5em auto; border:1pt solid ${theme.main_accent}; border-radius:7px;
				box-shadow:1px 2px 5px ${theme.shadow};
			`,
			info_row: `
				display:flex; flex-direction:row; justify-content:flex-start; align-items:flex-start; height:3.8em;
				width:100%; margin:0 auto;
			`,
			info_label: `margin:0 1em; color:${theme.dark_text};`,
			info_data: `margin:0 1em; flex:1; color:${theme.dark_text}; overflow-y:scroll;`,
			pin_row: `
				display:none; flex-direction:row; justify-content:center; align-items:center; height:3em;
				width:100%; margin:0 auto;
			`,
			pin_field: `
				margin:0 0.5em; padding:0.3em 0.75em; width:27%; font-size:1em; color:${theme.light_text}; text-align:center;
				border:none; border-radius:5px; background-color:${theme.field}; border-bottom:1pt solid ${theme.main_accent};
				box-sizing:border-box;
			`,
			error_message: `display:none; margin:0 auto 0.5em; text-align:center; font-size:0.9em; color:${theme.alert_error_bg};`
		}

		const AccountManager = E('div', {style: styles.AccountManager}, [])

		api.post_req({type:'GET_USER', key:state.userState.user.key, data:{prop:null}}).then(api_response => {
			if (api_response.status !== 'GOOD') {
				AccountManager.appendChild(E('h3', {style: styles.error_message}, [
					'Unable to retrieve keys. Please contact support if problem persists.'
				]))
				return
			}
			const bypass = ['uuid', 'password', 'lookup_key', 'pin', 'dt_ms', 'dt_str', 'tools', 'session_keys']
			AccountManager.appendChild(E('div', {style: styles.user_details},
				Object.keys(api_response.data).filter(k => !bypass.includes(k)).map(user_prop => {
					const prop_name = user_prop.split('_').map(w => `${w[0].toUpperCase()}${w.slice(1)}`).join(' ')
					const label = E('h3', {style: styles.info_label}, [`${prop_name}:`])
					const info = user_prop === 'emails' || user_prop === 'phones'
						? JSON.stringify(api_response.data[user_prop], null, 4)
						: api_response.data[user_prop]
					const data = E('h3', {style: styles.info_data}, [`${info}`])
					return E('div', {style: styles.info_row}, [label, data])
				})
			))
		})

		return AccountManager
	},
	UserManager: function(E, api, state, dispatch) {
		const {key, name, type, tools} = state.userState.user
		const theme = state.uiState.theme[state.userState.user.theme]

		const styles = {
			UserManager: `
				display:flex; flex-direction:column; justify-content:flex-start; align-items:stretch;
				width:97%; margin:0.5em auto; padding:0.5em; background-color:${theme.bg}; box-sizing:border-box;
				border:1pt solid ${theme.main_accent}; border-radius:7px; box-shadow:1px 1px 3px ${theme.main_accent};
			`
		}

		const loader = UIComponents.Loader(E, api, state, dispatch, {
			height: '1em',
			width: '1em',
			margin: '0 0 0 0.5em',
			accent: theme.main_accent,
			thickness: '4px',
			default: 'hide'
		})

		const button = UIComponents.TextBtn(E, api, state, dispatch, {
			bg: theme.button_bg,
			accent: theme.button_accent,
			label: 'login',
			width: '3em'
		})

		const form = UIComponents.Form(E, api, state, dispatch, {
			title: '',
			bg: theme.bg,
			border: theme.bg,
			accent: theme.header_bg,
			shadow: theme.bg,
			btn: button,
			sections: [
				{title: '', fields: {
					first_name: {type: 'name', data:"Client First Name"},
					last_name: {type: 'name', data:"Client Last Name"},
					title: {type: 'name', data:"Client Title"},
					business_name: {type: 'text', data:"Business Name"},
					tagline: {type: 'text', data:"Business Tagline"},
					short_name: {type: 'text', data:"Business Short Name"},
					personal_email: {type: 'email', data:"Personal Email"},
					personal_phone: {type: 'phone', data:"Personal Phone"},
					website: {type: 'text', data:"Business Website"},
					street: {type: 'text', data:"Business Street"},
					city: {type: 'city', data:"Business City"},
					zip: {type: 'zip', data:"Business Zipcode"},
					map: {type: 'text', data:"Business Map Link"},
					password: {type: 'password', data:"Client Default Password"}
				}}
			],
			components: [
				E('div', {style:styles.btn_section}, [ button, loader ])
			]
		})

		const create_account = () => {
			console.log(' SENDING >> ', form.get_input())
			// if (!form.form_passed()) return
			// loader.show()
			// const [email, password] = form.get_input()[0]
			// let empty = false
			// for (let i = 0; i < form_fields.length; i++) {
			// 	if (form_fields[i].value === '') {
			// 		empty = true
			// 		set_error(form_fields[i])
			// 	} else set_default(form_fields[i])
			// }
			// if (!empty) {
			// 	console.log(' CREATING NEW CLIENT ACCOUNT...', client_data)
			// 	loader.show()
			// 	api.post_req({type: 'CREATE_ACCOUNT', data: {key: user_key, client_data}}).then(response => {
			// 		console.log(' ACCOUNT CREATION RESPONSE ', response)
			// 		loader.hide()
			// 	})
			// }
		}

		button.addEventListener('click', e => create_account())

		const UserManager = E('div', {style:styles.UserManager}, [ form ])

		return UserManager
	},
	InventoryManager: function(E, api, state, dispatch) {
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
			InventoryManager: `display:flex; flex-direction:column; justify-content:flex-start; align-items:stretch;`,
			products: `
				display:flex; flex-wrap:wrap; flex-direction:${lg?'row':'column'}; justify-content:${lg?'stretch':'flex-start'}; align-items:stretch;
				margin:0.25em auto; padding:0.25em 0; width:99%; height:15em; overflow-y:scroll; border-bottom:1pt solid ${theme.main_accent_transparent};
			`,
			add_product: `
				display:flex; flex-direction:column; justify-content:flex-start; align-items:stretch;
				margin:0.25em auto; padding:0.25em 0; width:99%; border-bottom:1pt solid ${theme.main_accent_transparent};
			`,
			error_message: `margin:1em; font-size:1.5em; font-weight:heavy; color:${theme.shadow};`
		}

		const products_loader = UIComponents.Loader(E, api, state, dispatch, {
			height: '2.5em',
			width: '2.5em',
			margin: '2.5em',
			accent: theme.main_accent,
			thickness: '4px',
			default: 'show'
		})

		const products = E('div', {style: styles.products}, [ products_loader ])

		const add_loader = UIComponents.Loader(E, api, state, dispatch, {
			height: '1.5em',
			width: '1.5em',
			margin: '1.5em',
			accent: theme.main_accent,
			thickness: '4px',
			default: 'hide'
		})

		const add_button = UIComponents.TextBtn(E, api, state, dispatch, {
			bg: theme.button_bg,
			accent: theme.button_accent,
			width: '6.5em',
			margin: '0.25em 0.5em',
			label: 'add product',
			cb: null
		})

		const add_form = UIComponents.Form(E, api, state, dispatch, {
			title: '',
			bg: theme.bg,
			border: theme.bg,
			accent: theme.header_bg,
			shadow: theme.bg,
			btn: add_button,
			sections: [
				{title: '', fields: {
					name: {type: 'name', data: 'Product Name'},
					description: {type: 'name', data: 'Product Description'},
					price: {type: 'name', data: 'Product Price'},
					image: {type: 'image', label: 'Product Image', data: 'NO ATTACHMENT'}
				}}
			],
			components: []
		})

		const add_product = E('div', {style: styles.add_product}, [
			add_form,
			E('div', {style: styles.add_row}, [ add_button, add_loader ])
		])

		const InventoryManager = UIComponents.TabsPanel(E, api, state, dispatch, {
			width: 97,
			margin: '0.25em auto',
			bg: theme.bg,
			border: theme.main_accent,
			selected: theme.main_accent_transparent,
			unselected: theme.shadow,
			tabs: [
				{name: 'Inventory', component: products},
				{name: 'New Product', component: add_product}
			]
		})

		api.post_req({type:'GET_PRODUCTS', data:{prop:null}}).then(api_response => {
			products_loader.hide()
			if (api_response.status === 'GOOD') Object.keys(api_response.data).forEach(uuid => {
				const product = api_response.data[uuid]
				api.post_req({type:'GET_PRODUCT_IMG', data:{uuid}}, blob=true).then(img_data => {
					products.appendChild(ToolUI.Product(E, api, state, dispatch, {
						bg: theme.bg,
						accent: theme.main_accent,
						height: 10,
						width: product_width,
						editing: false,
						product: Object.assign(product, {img_data})
					}))
				})
			})
			else products.appendChild(E('p', {style:styles.error_message}, [
				response.type === 'NO_PRODUCTS'
					? `You don't currently have any products.`
					: `Unable to load products. Please contact support if problem persists.`
			]))
		})

		return InventoryManager
	},
	ServicesManager: function(E, api, state, dispatch) {
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
			ServicesManager: `display:flex; flex-direction:column; justify-content:flex-start; align-items:stretch;`,
			services: `
				display:flex; flex-wrap:wrap; flex-direction:${lg?'row':'column'}; justify-content:${lg?'stretch':'flex-start'}; align-items:stretch;
				margin:0.25em auto; padding:0.25em 0; width:99%; height:15em; overflow-y:scroll; border-bottom:1pt solid ${theme.main_accent_transparent};
			`,
			add_service: `
				display:flex; flex-direction:column; justify-content:flex-start; align-items:stretch;
				margin:0.25em auto; padding:0.25em 0; width:99%; border-bottom:1pt solid ${theme.main_accent_transparent};
			`,
			error_message: `margin:1em; font-size:1.5em; font-weight:heavy; color:${theme.shadow};`
		}

		const services_loader = UIComponents.Loader(E, api, state, dispatch, {
			height: '2.5em',
			width: '2.5em',
			margin: '2.5em',
			accent: theme.main_accent,
			thickness: '4px',
			default: 'show'
		})

		const services = E('div', {style: styles.services}, [ services_loader ])

		const add_loader = UIComponents.Loader(E, api, state, dispatch, {
			height: '1.5em',
			width: '1.5em',
			margin: '1.5em',
			accent: theme.main_accent,
			thickness: '4px',
			default: 'hide'
		})

		const add_button = UIComponents.TextBtn(E, api, state, dispatch, {
			bg: theme.button_bg,
			accent: theme.button_accent,
			width: '6.5em',
			margin: '0.25em 0.5em',
			label: 'add service',
			cb: null
		})

		const add_form = UIComponents.Form(E, api, state, dispatch, {
			title: '',
			bg: theme.bg,
			border: theme.bg,
			accent: theme.header_bg,
			shadow: theme.bg,
			btn: add_button,
			sections: [
				{title: '', fields: {
					name: {type: 'name', data: 'Service Name'},
					description: {type: 'name', data: 'Service Description'},
					price: {type: 'name', data: 'Service Price'},
					image: {type: 'image', label: 'Service Image', data: 'NO ATTACHMENT'}
				}}
			],
			components: []
		})

		const add_service = E('div', {style: styles.add_service}, [
			add_form,
			E('div', {style: styles.add_row}, [ add_button, add_loader ])
		])

		const ServicesManager = UIComponents.TabsPanel(E, api, state, dispatch, {
			width: 97,
			margin: '0.25em auto',
			bg: theme.bg,
			border: theme.main_accent,
			selected: theme.main_accent_transparent,
			unselected: theme.shadow,
			tabs: [
				{name: 'Services', component: services},
				{name: 'New Service', component: add_service}
			]
		})

		api.post_req({type:'GET_SERVICES', data:{prop:null}}).then(api_response => {
			services_loader.hide()
			if (api_response.status === 'GOOD') Object.keys(api_response.data).forEach(uuid => {
				const service = api_response.data[uuid]
				api.post_req({type:'GET_SERVICE_IMG', data:{uuid}}, blob=true).then(img_data => {
					services.appendChild(ToolUI.Service(E, api, state, dispatch, {
						bg: theme.bg,
						accent: theme.main_accent,
						height: 10,
						width: service_width,
						editing: false,
						service: Object.assign(service, {img_data})
					}))
				})
			})
			else services.appendChild(E('p', {style:styles.error_message}, [
				response.type === 'NO_SERVICES'
					? `You don't currently have any services.`
					: `Unable to load services. Please contact support if problem persists.`
			]))
		})

		return ServicesManager
	}
}
