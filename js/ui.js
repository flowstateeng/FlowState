
const UIComponents = {
	Slideshow: function(E, api, state, dispatch, config) {
		const styles = {
			Slideshow: `
				display:flex; flex-direction:column; justify-content:flex-start; align-items:stretch;
				width:100%; margin:0 auto; background-color:${config.background}; border:1px 0 1px 0 solid ${config.accents};
				box-shadow:1px 1px 3px ${config.accents};
			`,
			display: `display:flex; flex-direction:column; justify-content:center; align-items:stretch; margin:0 auto; width:100%;`,
			img: `margin:0 auto; width:100%;`,
			buttons: `
				display:flex; flex-direction:row; justify-content:flex-start; align-items:center; margin:0.2em auto; width:98%;
			`,
			btn_wrap: `margin:0.15em; cursor:pointer; user-select:none;`,
			btn: `
				display:flex; flex-direction:column; justify-content:center; align-items:center; margin:0 auto; height:1em; width:1em;
				border:1px solid ${config.accents}; border-radius:25%;
			`,
			btn_img: `height:0.75em; margin:3px;`
		}

		const imgs = config.list.map(img => {
			return E('img', {style:styles.img, src:img.link, alt:`${img.name} Image`}, [])
		})

		let current = 0
		let autoplay = true
		const display = E('div', {style:styles.display}, [ imgs[current] ])

		const pause_play_btn = E('p', {style:styles.btn}, [
			E('img', {style:styles.btn_img, src:config.pause, alt:`Pause Button Image`}, []),
			E('img', {style:`${styles.btn_img} display:none;`, src:config.play, alt:`Play Button Image`}, [])
		])
		pause_play_btn.addEventListener('click', e => {
			if (autoplay) {
				autoplay = false
				pause_play_btn.firstChild.style.display = 'none'
				pause_play_btn.lastChild.style.display = 'flex'
			} else {
				autoplay = true
				pause_play_btn.firstChild.style.display = 'flex'
				pause_play_btn.lastChild.style.display = 'none'
			}
		})

		const left_btn = E('p', {style:styles.btn}, [
			E('img', {style:styles.btn_img, src:config.left, alt:`Left Button Image`}, [])
		])
		left_btn.addEventListener('click', e => {
			current = current==0 ? imgs.length-1 : current-1
			display.firstChild.remove()
			display.appendChild(imgs[current])
			autoplay = false
		})

		const right_btn = E('p', {style:styles.btn}, [
			E('img', {style:styles.btn_img, src:config.right, alt:`Right Button Image`}, [])
		])
		right_btn.addEventListener('click', e => {
			current = current==imgs.length-1 ? 0 : current+1
			display.firstChild.remove()
			display.appendChild(imgs[current])
			autoplay = false
		})

		const buttons = E('div', {style:styles.buttons}, [
			E('div', {style:styles.btn_wrap}, [ pause_play_btn ]),
			E('div', {style:styles.btn_wrap}, [ left_btn ]),
			E('div', {style:styles.btn_wrap}, [ right_btn ])
		])

		setInterval(e => {
			if (autoplay) {
				current = current==imgs.length-1 ? 0 : current+1
				display.firstChild.remove()
				display.appendChild(imgs[current])
			}
		}, config.delay)

		const Slideshow = E('div', {style:styles.Slideshow}, [ display, buttons ])

		return Slideshow
	},
	Loader: function(E, api, state, dispatch, config) {
		const theme = state.uiState.theme[state.uiState.theme.selected]

		const styles = {
			Loader: `
				display:${config.default === 'show' ? 'flex' : 'none'}; flex-direction:column; justify-content:center; align-items:center; background-color:${config.bg};
				height:${config.height}; width:${config.width}; margin:${config.margin}; padding:0; overflow:hidden; box-shadow:1px 1px 3px ${config.bg};
			`,
			background: `
				height:${config.height}; width:${config.width}; margin:0; padding:0; overflow:hidden;
				display:flex; flex-direction:column; justify-content:center; align-items:center; background-color:${theme.clear};
			`,
			ring: `height:${config.height}; width:${config.width};`,
			piece: `
				box-sizing:border-box; height:${config.height}; width:${config.width}; margin:0;
				border:${config.thickness} solid ${config.accent}; border-radius:50%; border-color:${config.accent} transparent transparent transparent;
			`
		}

		const Loader = E('div', {style:styles.Loader}, [
			E('div', {style:styles.background}, [
				E('div', {style:styles.ring}, [0,2,3,4].map(delay => {
					const piece = E('div', {style:`${styles.piece} animation-delay: -0.${delay}s;`}, [])
					piece.animate([
						{ transform: "rotate(0)" },
						{ transform: "rotate(360deg)" },
					],{ duration: 1501, iterations: 1000 })
					return piece
				}))
			])
		])

		Loader.show = () => Loader.style.display = 'flex'
		Loader.hide = () => Loader.style.display = 'none'

		return Loader
	},
	ToggleSwitch: function(E, api, state, dispatch, config) {
		let status = ['ON', 'OFF'].includes(config.default) ? config.default : 'OFF'
		const default_justification = status === 'ON' ? 'flex-start' : 'flex-end'
		const default_color = status === 'ON' ? config.on.color : config.off.color

		const styles = {
			ToggleSwitch: `display:flex; flex-direction:row; justify-content:center; align-items:center; user-select: none; margin:${config.margin};`,
			label: `font-size:0.9em; margin:0 0.75em;`,
			toggle: `
				display:flex; flex-direction:row; justify-content:${default_justification}; align-items:center;
				width:2.5em; height:1.2em; margin:0 auto; background-color:${config.bg}; border:1pt solid ${config.border}; border-radius:1.2em;
				box-shadow:1px 1px 3px ${config.border};
			`,
			slider: `width:1em; height:1em; margin:0.1em; border-radius:100%; background-color:${default_color};`
		}

		const on_label = E('h3', {style: styles.label}, [ config.on.name ? `(${config.on.name})` : '' ])
		if (!config.on.name) on_label.style.display = 'none'

		const off_label = E('h3', {style: styles.label}, [ config.off.name ? `(${config.off.name})` : '' ])
		if (!config.off.name) off_label.style.display = 'none'

		const slider = E('div', {style: styles.slider}, [])
		const toggle = E('div', {style: styles.toggle}, [ slider ])

		const ToggleSwitch = E('div', {style: styles.ToggleSwitch}, [ on_label, toggle, off_label ])

		toggle.addEventListener('click', e => {
			if (status === 'OFF') {
				status = 'ON'
				slider.animate([
					{ backgroundColor: config.off.color, transform: `translateX(0%)` },
					{ backgroundColor: config.on.color, transform: `translateX(-131%)` },
				],{ duration: 181, iterations: 1, easing: 'cubic-bezier(0.42, 0, 0.58, 1)', fill: 'forwards' })
				if (config.on.callback) config.on.callback()
			}
			else {
				status = 'OFF'
				slider.animate([
					{ backgroundColor: config.on.color, transform: `translateX(-131%)` },
					{ backgroundColor: config.off.color, transform: `translateX(0%)` },
				],{ duration: 181, iterations: 1, easing: 'cubic-bezier(0.42, 0, 0.58, 1)', fill: 'forwards' })
				if (config.off.callback) config.off.callback()
			}
		})

		return ToggleSwitch
	},
	DotSelector: function(E, api, state, dispatch, config) {
		const theme = state.uiState.theme[state.uiState.theme.selected]

		const specs = {
			row: {
				container: ['row', 'center', 'center'],
				btn: ['column', 'center', 'center'],
				label: ['0.1em 0 0', `border-top:1pt solid ${theme.shadow};`]
			},
			column: {
				container: ['column', 'flex-start', 'flex-start'],
				btn: ['row', 'flex-start', 'center'],
				label: ['0 0 0 0.2em', `border-left:1pt solid ${theme.shadow};`]
			},
		}[config.orientation]

		const styles = {
			DotSelector: `
				display:flex; flex-direction:row; justify-content:center align-items:center;
				margin:0; user-select:none;
			`,
			title: `margin:0.25em; font-size:1em; color:${config.accent};`,
			selection_container: `
				display:flex; flex-direction:${specs.container[0]}; justify-content:${specs.container[1]};
				align-items:${specs.container[2]}; margin:${config.margin};
			`,
			selection_btn: `
				display:flex; flex-wrap:wrap; flex-direction:${specs.btn[0]}; justify-content:${specs.btn[1]};
				align-items:${specs.btn[2]}; margin:${config.margin};
			`,
			dot: `
				width:${config.size}; height:${config.size}; margin:0.15em; border:1pt solid ${theme.shadow}; border-radius:100%;
				background-color:${theme.shadow};
			`,
			label: `margin:0.1em; padding:${specs.label[0]}; font-size:0.8em; color:${theme.shadow}; ${specs.label[1]}`
		}

		const update_status = (btn, status, idx) => {
			if (status === 'selected') selected = idx
			const status_styles = {
				selected: [`1pt solid ${theme.success}`, config.accent],
				unselected: [`1pt solid ${theme.shadow}`, theme.shadow]
			}
			const dot = btn.firstChild
			dot.style.border = status_styles[status][0]
			dot.style.backgroundColor = status_styles[status][1]

			const label = btn.lastChild
			if (config.orientation === 'column') label.style.borderLeft = status_styles[status][0]
			else label.style.borderTop = status_styles[status][0]
			label.style.color = status_styles[status][1]
		}

		const DotSelector = E('div', {style:styles.DotSelector}, [
			E('h2', {style:styles.title}, [config.title]),
			E('div', {style:styles.selection_container}, config.selections.map((selection, i) =>
				E('div', {style:styles.selection_btn}, [
					E('div', {style:styles.dot}, []),
					E('h3', {style:styles.label}, [selection.label])
				])
			))
		])
		let selected = config.def_idx && config.selections[config.def_idx] ? config.def_idx : 0
		const selection_btns = DotSelector.lastChild.children

		for (let b = 0; b < selection_btns.length; b++) {
			const clicked_btn = selection_btns[b]
			clicked_btn.addEventListener('click', e => {
				for (let i = 0; i < selection_btns.length; i++) {
					update_status(selection_btns[i], selection_btns[i] === clicked_btn ? 'selected' : 'unselected', i)
				}
			})
		}

		if (!config.title) DotSelector.firstChild.remove()
		update_status(selection_btns[selected], 'selected', selected)

		DotSelector.get_status = () => config.selections[selected].value

		return DotSelector
	},
	PlaceholderPic: function(E, api, state, dispatch, config) {
		const theme = state.uiState.theme[state.uiState.theme.selected]

		const styles = {
			PlaceholderPic: `
				display:flex; flex-direction:column; justify-content:center; align-items:center;
				width:${config.width}; height:${config.height}; margin:0; background-color:${theme.clear};
				border:2px solid ${config.color}; border-radius:5px; user-select: none; overflow:hidden;
			`,
			inner_border: `margin:0; padding:0; background-color:${theme.clear}; border:13px solid ${config.color}; border-radius:5px;`,
			sun: `margin:1em 1em 1em 5em; background-color:${theme.clear}; border:5px solid ${config.color}; border-radius:100%;`,
			mountains: `
				display:flex; flex-direction:row; justify-content:center; align-items:flex-start;
				margin:0; padding:0; background-color:${theme.clear};
			`,
			m1: `margin:0; padding:0; background-color:${config.color}; border-radius:13px; transform:rotate(45deg);`,
			m2: `margin-left:-3em; padding:0; background-color:${config.color}; border-radius:13px; transform:rotate(45deg);`,
		}

		const PlaceholderPic = E('div', {style:styles.PlaceholderPic}, [
			E('div', {style:styles.inner_border}, [
				E('div', {style:styles.sun}, []),
				E('div', {style:styles.mountains}, [
					E('div', {style:styles.m1}, []),
					E('div', {style:styles.m2}, [])
				])
			])
		])

		return PlaceholderPic
	},
	MenuToggle: function(E, api, state, dispatch, config) {
		let orientation = ['horizontal', 'vertical'].includes(config.default) ? config.default : 'horizontal'

		const styles = {
			MenuToggle: `
				display:flex; flex-direction:column; justify-content:center; align-items:center;
				width:${config.width}; height:${config.height}; margin:0; color:${config.color}; background-color:rgba(0,0,0,0);
				border:2px solid ${config.color}; border-radius:100%; cursor:pointer; user-select: none; box-shadow:0 0 4px ${config.color};
				transform:rotate(${orientation === 'horizontal' ? 0 : '90deg'});
			`,
			line: `height:2px; margin:1.5px auto; background-color:${config.color};`
		}

		const MenuToggle = E('div', {style:styles.MenuToggle}, [
			E('div', {style:styles.line + 'width:45%;'}, []),
			E('div', {style:styles.line + 'width:65%;'}, []),
			E('div', {style:styles.line + 'width:45%;'}, [])
		])

		MenuToggle.addEventListener('click', e => {
			orientation = orientation === 'horizontal' ? 'vertical' : 'horizontal'
			const [start, end] = orientation === 'horizontal' ? ['90deg', 0] : [0, '90deg']
			MenuToggle.animate([
				{ transform: `rotate(${start})` },
				{ transform: `rotate(${end})` },
			],{ duration: 151, iterations: 1, easing: "cubic-bezier(0.42, 0, 0.58, 1)", fill: 'forwards' })
		})

		return MenuToggle
	},
	TextBtn: function(E, api, state, dispatch, config) {
		const theme = state.uiState.theme[state.uiState.theme.selected]

		const width = config.width ? `width:${config.width};` : ''

		const styles = {
			TextBtn: `
				${width} margin:${config.margin||0}; padding:0.23em 0.71em; border:1pt solid ${config.accent}; border-radius:7px;
				background-color:${config.bg}; text-align:center; color:${config.accent}; cursor:pointer; user-select:none; box-shadow:1px 1px 3px ${config.bg};
			`
		}

		const TextBtn = E('h3', {style:styles.TextBtn}, [ config.label ])
		if (config.cb) TextBtn.addEventListener('click', e => config.cb())

		return TextBtn
	},
	CloseBtn: function(E, api, state, dispatch, config) {
		const theme = state.uiState.theme[state.uiState.theme.selected]

		const styles = {
			CloseBtn: `
				display:flex; flex-direction:column; justify-content:center; align-items:center;
				width:${config.width}; height:${config.height}; margin:0; color:${config.color};
				background-color:rgba(0,0,0,0); cursor:pointer; user-select: none;
			`,
			line: `position:absolute; height:3px; width:${config.width}; margin:0 auto; background-color:${config.color};`
		}

		const CloseBtn = E('div', {style:styles.CloseBtn}, [
			E('div', {style:styles.line + 'transform:rotate(-45deg);'}, []),
			E('div', {style:styles.line + 'transform:rotate(45deg);'}, [])
		])
		if (config.cb) CloseBtn.addEventListener('click', e => config.cb())

		return CloseBtn
	},
	OrSeparator: function(E, api, state, dispatch, config) {
		const theme = state.uiState.theme[state.uiState.theme.selected]

		const specs = {
			'row': ['row', 'height:1px; width:30%;'],
			'column': ['column', 'height:30%; width:1px;']
		}[config.orientation]

		const styles = {
			OrSeparator: `
				display:flex; flex-direction:${specs[0]}; justify-content:center; align-items:center;
				width:100%; margin:0; background-color:rgba(0,0,0,0); user-select: none;
			`,
			or: `margin:0.5em; font-size:0.9em; color:${config.accent};`,
			line: `${specs[1]} margin:0.5em; background-color:${config.accent};`
		}

		const OrSeparator = E('div', {style:styles.OrSeparator}, [
			E('div', {style:styles.line}, []),
			E('h3', {style:styles.or}, ['or']),
			E('div', {style:styles.line}, [])
		])

		return OrSeparator
	},
	CollapsePanel: function(E, api, state, dispatch, config) {

		const styles = {
			CollapsePanel: `
				display:flex; flex-direction:column; justify-content:flex-start; align-items:stretch;
				width:${config.width||99}%; margin:${config.margin}; padding:0.15em 0.5em 0.25em; border-radius:7px; box-sizing:border-box;
				background-color:${config.bg}; border:1pt solid ${config.border}; box-shadow:1px 1px 3px ${config.border};
			`,
			header: `
				display:flex; flex-direction:row; justify-content:space-between; align-items:center; color:${config.text};
				margin:0.45em auto; padding:0.25em; width:97%; border-bottom:1pt solid ${config.accent};
			`,
			title: `margin:0 0.5em; flex:1; font-size:1.1em;`,
			body: `display:${config.default==='closed'?'none':'flex'}; flex-direction:column; justify-content:flex-start; align-items:stretch; width:99%; margin:0 auto; padding:0; box-sizing:border-box;`
		}

		const CollapsePanel = E('div', {style:styles.CollapsePanel}, [
			E('div', {style:styles.header}, [
				E('h3', {style:styles.title}, [config.title]),
				UIComponents.MenuToggle(E, api, state, dispatch, {
					color: config.accent,
					width: '1.25em',
					height: '1.25em',
					default: config.default === 'closed' ? 'horizontal' : 'vertical'
				})
			]),
			E('div', {style:styles.body}, [ config.component ])
		])
		let is_open = config.default === 'open'
		const panel_btn = CollapsePanel.firstChild.lastChild
		const panel_body = CollapsePanel.lastChild

		panel_btn.addEventListener('click', e => {
			if (is_open) {
				is_open = false
				panel_body.style.display = 'none'
			}
			else {
				is_open = true
				panel_body.style.display = 'flex'
			}
		})

		return CollapsePanel
	},
	Form: function(E, api, state, dispatch, config) {
		const theme = state.uiState.theme[state.uiState.theme.selected]

		const styles = {
			Form: `
				display:flex; flex-direction:column; justify-content:flex-start; align-items:stretch;
				width:${config.width}%; margin:${config.margin}; padding:0; background-color:${config.bg}; box-sizing:border-box;
				border:1pt solid ${config.border}; border-radius:7px; box-shadow:1px 1px 3px ${config.border};
			`,
			title: `margin:0 auto 0.25em; font-size:1.1em; color:${config.text};`,
			sections_container: `display:flex; flex-direction:column; justify-content:flex-start; align-items:stretch; margin:0 auto; width:97%;`,
			section: `display:flex; flex-direction:column; justify-content:flex-start; align-items:stretch; margin:0 auto; width:99%;`,
			section_title: `margin:0.25em; font-size:1em; color:${config.text}; border-bottom:1pt solid ${config.accent};`,
			field_box: `
				display:flex; flex-direction:column; justify-content:flex-start; align-items:center;
				margin:0 auto 0.57em; width:97%; border-bottom:1px solid ${config.accent};
			`,
			label: `margin:0.5em 0 0; text-align:left; width:99%; font-size:1em; color:${config.text};`,
			field: `
				margin:0.25em auto 0 -2%; padding:0.3em 0.75em; width:104%; font-size:1em; color:${config.accent}; box-sizing:border-box;
				border:none; border-radius:5px; background-color:${theme.field}; border-bottom:1pt solid ${config.accent};
			`,
			rules: `margin:0.25em 0.5em; text-align:left; width:95%; font-size:0.7em; color:${config.text};`,
			components: `
				display:flex; flex-direction:row; justify-content:space-between; align-items:center;
				width:90%; margin:1em auto 0; padding:0.75em 0.5em 0; border-top:1pt solid ${config.accent}; box-sizing:border-box;
			`
		}

		const input_types = {
			name: {
				rules: /^[a-zA-Z\s]{1,50}$/,
				message: 'Must be 1-50 letters only.',
				type: 'text',
				inputmode: 'text'
			},
			password: {
				rules: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*+=-])[A-Za-z\d!@#$%^&*+=-]{8,25}$/,
				message: 'Must be 8-25 characters long, 1 uppercase, 1 lowercase, one of the following: !@#$%^&*+=- and no others.',
				type: 'password',
				inputmode: 'text'
			},
			email: {
				rules: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
				message: 'Must be in (user@mail.com) format.',
				type: 'email',
				inputmode: 'email'
			},
			date: {
				rules: /^\d{4}-\d{2}-\d{2}$/,
				message: 'Must be in (MM/DD/YYYY) format.',
				type: 'date',
				inputmode: 'numeric'
			},
			phone: {
				rules: /^\d{3}-\d{3}-\d{4}$/,
				message: 'Must be in (123-456-7890) format.',
				type: 'text',
				inputmode: 'tel'
			},
			pin: {
				rules: /^(?=.*[0-9])[0-9]{4}$/,
				message: 'Must be a 4-digit PIN.',
				type: 'password',
				inputmode: 'text'
			},
			code: {
				rules: /^(?=.*[0-9])[0-9]{6}$/,
				message: 'Must be a 6-digit code.',
				type: 'text',
				inputmode: 'numeric'
			},
			city: {
				rules: /^[a-zA-Z\s]{1,50}$/,
				message: 'Must be 1-50 letters only.',
				type: 'text',
				inputmode: 'text'
			},
			state: {
				rules: /^[a-zA-Z\s]{2}$/,
				message: 'Must be in (FL) format.',
				type: 'text',
				inputmode: 'text'
			},
			zip: {
				rules: /^(?=.*[0-9])[0-9]{5}$/,
				message: 'Must be a 5-digit zip code.',
				type: 'text',
				inputmode: 'numeric'
			},
			text: {
				rules: /^[a-zA-Z0-9\s.,!?@#$%^&*()_+-=;:'"<>\/\\|`~[\]{}]{1,50}$/,
				message: 'Must be 1-50 characters.',
				type: 'text',
				inputmode: 'text'
			},
			textarea: {
				rules: /^[a-zA-Z0-9\s.,!?@#$%^&*()_+-=;:'"<>\/\\|`~[\]{}]{1,1000}$/,
				message: 'Must be 1-1000 characters.',
				type: 'text',
				inputmode: 'text'
			},
			pdf: {
				rules: '',
				message: 'Must be a pdf file.',
				type: 'file',
				inputmode: 'none'
			},
			image: {
				rules: '',
				message: 'Must be one of the following types: .jpg, .jpeg, .png',
				type: 'file',
				inputmode: 'none'
			}
		}

		const set_error = (field, rules) => {
			field.style.border = `none`
			field.style.border = `1pt solid ${theme.alert_error_bg}`
			field.style.color = theme.alert_error_bg
			field.style.boxShadow = `0 0 1px ${theme.alert_error_bg}`
			rules.style.color = theme.alert_error_bg
		}

		const set_focus = (field, rules) => {
			field.style.border = `none`
			field.style.color = config.accent
			field.style.border = `1pt solid ${config.accent}`
			field.style.boxShadow = `0 0 1px ${config.accent}`
			rules.style.color = config.accent
		}

		const set_default = (field, rules) => {
			field.style.border = `none`
			field.style.borderBottom = `1pt solid ${config.accent}`
			field.style.color = config.accent
			field.style.boxShadow = `none`
			rules.style.color = config.accent
		}

		const Form = E('div', {style:styles.Form}, [
			E('h1', {style: styles.title}, [config.title]),
			E('div', {style: styles.sections_container}, config.sections.map((section_data, sec_idx) => {
				const fields = Object.keys(section_data.fields).filter(k => !k.includes('idx')).map((fkey, fidx) => {
					const fdata = section_data.fields[fkey]
					const field_specs = input_types[fdata.type]

					const label = E('h3', {style: styles.label}, [`${fdata.label}`])
					if (!fdata.label) label.style.display = 'none'

					const element_type = fdata.type === 'textarea' ? 'textarea' : 'input'

					const field = E(element_type, {
						style: styles.field,
						name: fkey,
						type: field_specs.type,
						inputmode: field_specs.inputmode,
						placeholder: fdata.data,
						'data-placeholder-color': theme.link,
						autocomplete: true
					}, [])

					if (fdata.type === 'pdf' || fdata.type === 'image') {
						field.setAttribute('accept', fdata.type === 'pdf' ? 'application/pdf' : '.jpg, .jpeg, .png')
						field.addEventListener('change', () => {
							const reader = new FileReader()
							reader.onload = () => config.sections[sec_idx].fields[fkey].data = reader.result
							reader.readAsDataURL(field.files[0])
						})
					}
					if (!!fdata.populate) field.value = `${fdata.data}`
					if (element_type === 'textarea') field.rows = 7

					const rules = E('p', {style: styles.rules}, [field_specs.message])
					const field_box = E('div', {style: styles.field_box}, [label, field, rules])

					field.addEventListener('focus', e => set_focus(field, rules))
					field.addEventListener('keyup', e => {
						if (config.btn && (e.key === 'Enter' || e.keyCode === 13)) config.btn.click()
						else config.sections[sec_idx].fields[fkey].data = field.value
					})
					if (fdata.type !== 'pdf' && fdata.type !== 'image') field.addEventListener('blur', e => {
						config.sections[sec_idx].fields[fkey].data = field.value
						if (field_specs.rules.test(field.value)) set_default(field, rules)
						else set_error(field, rules)
					})

					if (fidx === section_data.fields.length - 1) field_box.style.margin = '0 auto'
					return E('div', {style: styles.field_box}, [label, field, rules])
				})

				const section = E('div', {style: styles.section}, [
					E('h2', {style: styles.section_title}, [section_data.title]),
					...fields
				])
				if (section_data.title === '') section.firstChild.style.display = 'none'
				if (section_data.title === '_') section.firstChild.innerText = ''
				return section
			}))
		])
		if (config.title === '') Form.firstChild.style.display = 'none'
		if (config.title === '_') Form.firstChild.innerText = ''

		if (config.components.length > 0) {
			Form.appendChild(E('div', {style: styles.components}, config.components))
		}

		Form.get_input = () => config.sections.map(sec =>
			Object.keys(sec.fields).filter(f => !f.includes('idx')).reduce((fdata, fkey) => {
				fdata[fkey] = sec.fields[fkey].data
				return fdata
			}, {})
		)

		Form.form_passed = () => {
			let passed = true
			for (let sec = 0; sec < config.sections.length; sec++) {
				const section = config.sections[sec]
				const fkeys = Object.keys(section.fields).filter(k => !k.includes('idx'))
				for (let fld = 0; fld < fkeys.length; fld++) {
					const fkey = fkeys[fld]
					const fdata = section.fields[fkey].data
					const ftype = section.fields[fkey].type
					const rules = input_types[ftype].rules
					if (ftype !== 'image' && ftype !== 'pdf' && !rules.test(fdata)) {
						const form_field = Form.lastChild.children[sec].children[fld+1].firstChild
						const form_rules = Form.lastChild.children[sec].children[fld+1].lastChild
						set_error(form_field, form_rules)
						passed = false
					}
				}
			}
			return passed
		}

		return Form
	},
	Alert: function(E, api, state, dispatch, config) {
		const styles = {
			Alert: `width:90%; margin:0.25em auto; font-size:1em; color:${config.accent};`
		}

		const Alert = E('h3', {style: styles.Alert}, [''])

		Alert.show = (message, callback=null) => {
			Alert.innerText = message
			Alert.style.display = 'flex'
			setTimeout(() => {
				Alert.innerText = ''
				Alert.style.display = 'none'
				if (callback) callback()
			}, 751)
		}

		return Alert
	},
	MessagePanel: function(E, api, state, dispatch, config) {
		const styles = {
			MessagePanel: `
				display:flex; flex-direction:column; justify-content:center; align-items:center;
				width:${config.width}%; height:100%; margin:${config.margin}; padding:0; background-color:${config.bg}; box-sizing:border-box;
				border:1pt solid ${config.border}; border-radius:7px; box-shadow:1px 1px 3px ${config.border};
			`,
			message_pane: `display:none; margin:auto; text-align:center; color:${config.text}; transform:translateY(40%);`
		}

		const message_pane = E('h2', {style: styles.message_pane}, [''])
		const component_pane = config.component

		const MessagePanel = E('div', {style: styles.MessagePanel}, [ message_pane, component_pane ])

		const horizontal_swap = (incoming, outgoing) => {
			outgoing.animate([
				{ transform: `translateX(0%)`, opacity: 1 },
				{ transform: `translateX(100%)`, opacity: 0 },
			],{ duration: 171, iterations: 1, easing: 'cubic-bezier(0.42, 0, 0.58, 1)', fill: 'forwards' })

			incoming.animate([
				{ transform: `translateX(-100%)`, opacity: 0 },
				{ transform: `translateX(0%)`, opacity: 1 },
			],{ duration: 171, iterations: 1, easing: 'cubic-bezier(0.42, 0, 0.58, 1)', fill: 'forwards' })
		}

		MessagePanel.show = (message, callback=null) => {
			message_pane.innerText = message
			message_pane.style.display = 'flex'
			horizontal_swap(message_pane, component_pane)
			setTimeout(() => {
				horizontal_swap(component_pane, message_pane)
				message_pane.innerText = ''
				message_pane.style.display = 'none'
				if (callback) callback()
			}, 1151)
		}

		return MessagePanel
	},
	TabsPanel: function(E, api, state, dispatch, config) {
		const theme = state.uiState.theme[state.uiState.theme.selected]

		const styles = {
			TabsPanel: `
				display:flex; flex-direction:column; justify-content:flex-start; align-items:stretch;
				width:${config.width}%; margin:${config.margin}; padding:0; background-color:${config.bg}; box-sizing:border-box;
				border:1pt solid ${config.border}; border-radius:7px; box-shadow:1px 1px 3px ${config.border};
			`,
			switcher: `display:flex; flex-direction:column; justify-content:flex-start; align-items:stretch; box-sizing:border-box;`,
			tab_name: `font-size:1em;`,
			tab_pane: `display:flex; flex-direction:column; justify-content:flex-start; align-items:stretch; box-sizing:border-box;`,
			tab_buttons: `display:flex; flex-direction:row; justify-content:flex-start; align-items:center; width:100%; overflow-x:scroll; box-sizing:border-box;`,
			button: `margin:0 1px 0 0; padding:0.25em 0.5em; font-size:1em; color:${config.accent}; border-top:1pt solid ${config.border};`
		}

		const horizontal_swap = (incoming, outgoing) => {
			incoming.style.display = 'flex'

			outgoing.animate([
				{ transform: `translateX(0%)`, opacity: 1 },
				{ transform: `translateX(100%)`, opacity: 0 },
			],{ duration: 171, iterations: 1, easing: 'cubic-bezier(0.42, 0, 0.58, 1)', fill: 'forwards' })

			incoming.animate([
				{ transform: `translateX(-100%)`, opacity: 0 },
				{ transform: `translateX(0%)`, opacity: 1 },
			],{ duration: 171, iterations: 1, easing: 'cubic-bezier(0.42, 0, 0.58, 1)', fill: 'forwards' })

			setTimeout(() => outgoing.style.display = 'none', 173)
		}

		const set_colors = (buttons, idx) => {
			buttons.forEach((btn, i) => {
				if (i === idx) btn.style.backgroundColor = config.selected
				else btn.style.backgroundColor = config.unselected
			})
		}

		let current_tab = 0
		const switcher = E('div', {style: styles.switcher}, config.tabs.map((tab, i) => {
			const tab_pane = E('div', {style: styles.tab_pane}, [tab.component])
			if (i !== current_tab) tab_pane.style.display = 'none'
			return tab_pane
		}))

		const tab_buttons = E('div', {style: styles.tab_buttons}, config.tabs.map((tab, i) => {
			const button = E('h2', {style: styles.button}, [tab.name])
			button.addEventListener('click', e => {
				if (i === current_tab) return
				horizontal_swap(switcher.children[i], switcher.children[current_tab])
				set_colors(tab_buttons.childNodes, i)
				current_tab = i
			})
			return button
		}))

		set_colors(tab_buttons.childNodes, current_tab)

		const TabsPanel = E('div', {style: styles.TabsPanel}, [ switcher, tab_buttons ])

		return TabsPanel
	},
	IconSelector: function(E, api, state, dispatch, config) {
		const btn_width = Math.floor(100 / config.selections.length) - 1

		const styles = {
			IconSelector: `
				display:flex; flex-direction:row; justify-content:center; align-items:center;
				width:${config.width}%; margin:${config.margin}; padding:1.1em 1em 1em; background-color:${config.bg}; box-sizing:border-box;
				border:1pt solid ${config.border}; border-radius:5px; box-shadow:1px 1px 3px ${config.border};
			`,
			option_btn: `
				display:flex; flex-direction:column; justify-content:flex-start; align-items:stretch;
				margin:0 auto; width:${btn_width}%; cursor:pointer; user-select:none;
			`,
			selection_icon: `max-height:1.5em; margin:0 auto;`,
			selection_title: `font-size:1em; text-align:center; margin:0.25em auto;`
		}

		let reason = 'NOTHING SELECTED'
		const selection_options = {
			'Appointments': state.uiState.imgs.icons.person_blk,
			'Support': state.uiState.imgs.icons.phone_blk,
			'Billing': state.uiState.imgs.icons.dollar_blk,
			'Contact': state.uiState.imgs.icons.email_blk
		}

		const IconSelector = E('div', {style: styles.IconSelector}, config.selections.map(option => {
			const option_btn = E('div', {style: styles.option_btn}, [
				E('img', {src: selection_options[option], style: styles.selection_icon}, []),
				E('h2', {style: styles.selection_title}, [ option ])
			])
			option_btn.addEventListener('click', e => {
				reason = option
				IconSelector.childNodes.forEach(btn => {
					btn.style.borderBottom = `2pt solid ${btn === option_btn ? config.accent : config.bg}`
				})
			})
			return option_btn
		}))

		IconSelector.status = () => reason

		return IconSelector
	},
	MultiSelector: function(E, api, state, dispatch, config) {
		const styles = {
			MultiSelector: `
				display:flex; flex-direction:row; justify-content:${config.justification}; align-items:center; flex-wrap:wrap;
				width:${config.width}%; margin:${config.margin}; padding:0; background-color:${config.bg}; box-sizing:border-box;
				border:1pt solid ${config.border}; border-radius:7px; box-shadow:1px 1px 3px ${config.border};
			`,
			selection_button: `font-size:1em; text-align:center; margin:1px; padding:0.25em 0.5em;`
		}

		const set_colors = (selection_buttons) => {
			config.selections.forEach((selection, i) => {
				const button = selection_buttons[i]
				if (selection.selected) {
					button.style.backgroundColor = config.selected.bg
					button.style.borderBottom = `1pt solid ${config.selected.border}`
					return
				}
				button.style.backgroundColor = config.unselected.bg
				button.style.borderBottom = `1pt solid ${config.unselected.border}`
			})
		}

		const MultiSelector = E('div', {style: styles.MultiSelector}, config.selections.map((selection, sidx) => {
			const selection_btn = E('h2', {style: styles.selection_button}, [ selection.name ])
			selection_btn.addEventListener('click', e => {
				if (selection.selected) {
					config.selections[sidx].selected = false
					set_colors(MultiSelector.children)
					return
				}
				const count = config.selections.reduce((c, s) => s.selected ? c + 1 : c, 0)
				if (count >= config.limit) return
				config.selections[sidx].selected = true
				set_colors(MultiSelector.children)
			})
			return selection_btn
		}))

		set_colors(MultiSelector.children)

		MultiSelector.status = () => config.selections

		return MultiSelector
	}
}
