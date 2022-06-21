// --------------------------------------------------------------------------------------------
// Author: Johnathan Chivington
// Project: chivington.github.io
// Description: Demo Unity UI web app.
// Version: 1.0.0 - (production - see README.md)
// License: None
// --------------------------------------------------------------------------------------------

// --------------------------------------------------------------------------------------------
//  Unity - A minimal state/UI framework for building complex "native-like" web applications.
// --------------------------------------------------------------------------------------------
const Unity = {
  reducer: function(defaultState,map) {
    return function(state = defaultState, action) {
      return map[action.type] ? map[action.type](state, action) : state;
    }
  },
  combine: function(reducers) {
    return function(state, action) {
      return Object.keys(reducers).reduce((combined, k) => {
        combined[k] = reducers[k](state[k], action);
        return combined;
      }, {});
    }
  },
  store: function(rootReducer,middlewares={},history_length) {
    const { logActions, listenerBypass, cacheChat } = middlewares;
    let state = {}, listeners = [], history = [];

    function getState() { return state; }
    function getHistory() { return history; }

    function dispatch(action) {
      if (logActions) logActions('before', state, action);
      if (!!history_length) history = (history.length == history_length) ? [...history.slice(1), state] : [...history, state];
      state = rootReducer(state, action);
      if (logActions) logActions('after', state, action);

      if (listenerBypass && listenerBypass(action.type)[0])
        listeners.forEach(listener => listenerBypass(action.type).forEach(bypassName => {
          if (bypassName != listener.name) listener.function(...listener.params);
        }));
      else listeners.forEach(listener => listener.function(...listener.params));
    }

    function subscribe(listener) {
      listeners.push(listener);
      return () => { listeners = listeners.filter(l => l !== listener); }
    }

    dispatch({type:'@@INIT'});
    return { getState, getHistory, dispatch, subscribe };
  },
  middlewares: {
    logActions: function(initAction = '') {
      return function(stage, state, action) {
        if  (action.type != initAction) {
          if (stage == 'before') {
            console.log('\n%cPrevious State: ', 'font-weight: bold; color: #0b0;', state);
            console.log(`Action Dispatched: %c'${action.type}'`, 'color: #e00;');
            console.log(`Action Payload: `, action.payload);
          }
          if (stage == 'after')
            console.log('%cUpdated State: ', 'font-weight: bold; color: #0b0;', state);
        }
      }
    },
    listenerBypass: function(bypassActions = {}) {
      return function(actionType) {
        return bypassActions[actionType] || [];
      }
    }
  },
  element: function(elem,attrs,children) {
    const element = document.createElement(elem);
    if (attrs) Object.keys(attrs).forEach(k => element.setAttribute(k, attrs[k]));
    if (children.length >= 1) children.forEach(child => element.appendChild((typeof child == 'string')
      ? document.createTextNode(child) : ((child.elem) ? child.elem(child.props, child.dispatch, child.children) : child)
    ));
    return element;
  },
  render: function(component,store,root) {
    while (root.lastChild) root.lastChild.remove();
    root.appendChild(component(store));
  },
  initialize: function(app_root,load_screen_root,blueprint,reducers,middlewares) {
    const app_title = blueprint.app.title ? blueprint.app.title : 'Unity Application';
    document.title = `${app_title} | Home`;
    if (!app_root) Unity.terminate(app_root,`No Application Root supplied...`);
    if (!blueprint) Unity.terminate(app_root,`No Blueprint supplied...`);
    if (!!load_screen_root) {console.log(`${app_title} | Killing load screen...`);load_screen_root.style.display='none';};
    console.log(`${app_title} | Killing static application...`);
    app_root.firstElementChild.style.display = 'none';
    const init_state = Unity.combine(reducers);
    const UnityStore = Unity.store(init_state, middlewares);
    Unity.render(Modules.App, UnityStore, App_Root);
    UnityStore.subscribe({name:'Render_App',function:Unity.render,params:[Modules.App,UnityStore,App_Root]});
  },
  terminate: function(app_root,msg) {
    while (app_root.lastChild) app_root.lastChild.remove();
    app_root.appendChild(Unity.element('div',{position:`absolute`,left:0,top:0,bottom:0,right:0,index:1000,background:`linear-gradient(#fff,#eee)`},[msg]));
    throw `[Unity] - ${msg}`;
  }
};

// --------------------------------------------------------------------------------------------
//  Modules - Important/reused widgets, UI, etc.
// --------------------------------------------------------------------------------------------
const Modules = {
  Router: function(store) {
    const [state,dispatch] = [store.getState(),store.dispatch];
    const {mapState,viewState} = state.uiState;
    const {current,previous} = viewState;
    const sameView = viewState.current==viewState.previous;
    const lastAction = state.appState.historyState.actions.slice(-1)[0];
    const st = {router: `position:fixed; top:0; right:0; bottom:0; left:0; overflow:hidden; z-index:5;`};
    const selected = mapState[current]?mapState[current]:mapState['DEFAULT'];
    const animation = (lastAction=='NAV_TO' && !sameView) ? `animation:viewSlideIn 250ms 1 forwards;` : ``;
    document.title = `Unity Web App | ${selected.title}`;
    return Unity.element('div', {style: st.router}, [Modules.View(store, selected.view, animation)]);
  },
  Header: function(store) {
    const [ state, dispatch ] = [ store.getState(), store.dispatch ];
    const { uiState } = state;
    const { viewState, menuState, windowState } = uiState;
    const { icons } = Assets.imgs;
    const { current, previous } = menuState;
    const dark_theme = uiState.themeState.selected == 'dark';
    const icon_img = icons.manifest.redux_no_bg;
    const menu_img = dark_theme ? (current == 'OPEN' ? icons.btns.close_wht : icons.btns.menu_wht)  : (current == 'OPEN' ? icons.btns.close_blk : icons.btns.menu_blk);
    const last_action = state.appState.historyState.actions.slice(-1)[0];
    const open_action = !!(previous == 'CLOSED' && current == 'OPEN');
    const close_action = !!(previous == 'OPEN' && current == 'CLOSED');
    const menu_action = !!(last_action == 'OPEN_MENU' || last_action == 'CLOSE_MENU' || last_action == 'TOGGLE_MENU');
    const lg_dev = (windowState.mode == 'pc' || windowState.mode == 'lg_tab');
    const theme = uiState.themeState[uiState.themeState.selected];
    const E = Unity.element;

    const st = {
      header: `
        position: fixed; top: 0; left: 0; width: 100%; height: ${lg_dev?'5':'4'}em; margin: 0; padding: 0; z-index: 90;
        display: flex; flex-direction: row; justify-content: space-between; align-items: center;
        background-color: ${theme.header}; border-bottom: 1pt solid ${theme.header_bdr}; -webkit-box-shadow: 1pt 1pt ${dark_theme?'2':'5'}pt 0 ${theme.header_bdr};
      `,
      header_left: `display: flex; flex-direction: row; justify-content: flex-start; align-items: center;`,
      header_right: `display: flex; flex-direction: row; justify-content: flex-end; align-items: center;`,
      icon: `margin: 0 0 0 1em; padding: 0; height: 4em; width: 4em; cursor:pointer;`,
      super: `font-size: 0.9em; color: ${theme.header_txt}; margin: -1.25em 0 0 0.25em;`,
      menu_btn: `margin: 1em 1.5em; height: 2.5em; width: 2.5em; cursor:pointer; ${open_action ? `animation: menu_btn_opening 300ms ease-in-out 1 forwards;` : (close_action ? (last_action==`REFRESH_THREADS`?``:`animation: menu_btn_closing 300ms ease-in-out 1 forwards;`) : ``)}`,
      header_menu: `display: flex; flex-direction: row; justify-content: center; align-items: center; flex-wrap: wrap; margin: 0; padding: 0;`,
      header_btn: `margin: 0 0.25em; padding: 0.5em 1em; font-size: 1em; text-align: center; color: ${theme.view_txt}; cursor: pointer;`,
      header_qt: `margin: 0 0.25em; padding: 0.5em 1.25em; font-size: 1em; text-align: center; color: ${theme.menu_txt}; background-color: ${theme.btn}; border: 1pt solid ${theme.menu_bdr}; cursor: pointer;`
    };

    const header_icon = E('img', {style: st.icon, src: icon_img, alt: `Header Icon`}, []);
    header_icon.addEventListener('click', function(event) {
      if (viewState.current != 'HOME') dispatch({type:'NAV_TO',payload:'HOME'});
      if (viewState.current == 'HOME' && current == 'OPEN') dispatch({type:'CLOSE_MENU'});
    });

    const superscript = E('sup', {style: st.super}, [state.uiState.mapState[viewState.current].title]);

    const routes = Object.keys(state.uiState.mapState).filter(k => !['HOME','ABOUT','CONTACT','DEFAULT'].includes(k));
    const header_menu = E('div', {style: st.header_menu}, routes.map((route, i, arr) => {
      const map_route = state.uiState.mapState[route];
      const btn = E('h2', {style: st.header_btn}, [map_route.title]);
      btn.addEventListener('click', () => { if (viewState.current != route) dispatch({type:'NAV_TO',payload:route}); });
      return btn;
    }));

    const menu_btn = E('img', {style: st.menu_btn, src: menu_img, alt: 'Menu Button Icon'}, []);
    menu_btn.addEventListener('click', function(event) { dispatch({type:'TOGGLE_MENU'}); });

    return E('div', {style: st.header}, [
      E('div', {style: st.header_left}, [ header_icon, superscript ]),
      E('div', {style: st.header_right}, windowState.mode == 'pc' ? [header_menu, menu_btn] : [menu_btn]),
    ]);
  },
  Menu: function(store) {
    const [state,dispatch] = [store.getState(),store.dispatch];
    const {menuState,windowState,themeState,mapState} = state.uiState;
    const dark_theme = themeState.selected=='dark';
    const {icons} = Assets.imgs;
    const menuWidth = ((windowState.mode=='pc')||(windowState.mode=='lg_tab'))?`35%`:`100%`;
    const current_view = state.uiState.viewState.current;
    const theme = state.uiState.themeState[state.uiState.themeState.selected];
    const last_action = state.appState.historyState.actions.slice(-1);
    const closed_menu_last = !!(last_action=='CLOSE_MENU'||last_action=='TOGGLE_MENU');
    const landscape = state.uiState.windowState.orientation == 'LANDSCAPE' ? true : false;
    const E = Unity.element;

    const st = {
      menu: `
        position:fixed; top:${landscape?'5':'4'}em; left:0; bottom:0; width:${menuWidth}; padding:0; z-index:80; background-color:${theme.menu}; overflow-y:scroll; ${landscape?`border-right:1pt solid ${theme.menu_bdr};`:''}
        ${(menuState.current=='OPEN')?(menuState.previous=='OPEN'?``:`animation:menu_opening 300ms ease-in-out 1 forwards;`):(closed_menu_last?`animation:menu_closing 300ms ease-in-out 1 forwards;`:`display:none;`)}
      `,
      submenu: `display:flex; flex-direction:column; justify-content:flex-start; align-items:stretch; margin:2em 0 0; padding:0;`,
      route: `display:flex; flex-direction:row; justify-content:center; align-items:center; margin:1em; padding:0; color:${theme.lt_txt};`,
      route_title: `margin:0; padding:0; font-size:1.5em; color:${theme.lt_txt}; border-bottom:1pt solid ${theme.menu_bdr};`,
      toggle: `display:flex; flex-direction:row; justify-content:center; align-items:center; margin:2em; padding:0;`,
      tg_txt: `margin:0; padding:0; color:${theme.lt_txt}`,
      tg_btn: `margin:1em; padding:${dark_theme?'0 1.5em 0 0':'0 0 0 1.5em'}; background-color:${theme.panel}; border:1.25pt solid ${dark_theme?theme.success:theme.menu_bdr}; border-radius:1.5em; cursor:pointer;`,
      slider: `height:1.5em; width:1.5em; margin:0; padding:0; background-color:${dark_theme?theme.success:theme.btn}; border-radius:100%;`,
      copy: `
        display:flex; flex-direction:column; justify-content:space-between; align-items:stretch; text-align:center; color:${theme.menu_bdr};
        border-top:1px solid ${theme.menu_bdr}; margin:1em ${landscape?'5em 5':'2em 2em 1'}em; padding:1.5em; font-size:${landscape?'1':'0.9'}em;
      `,
      usa: `height:1.5em; margin:0.25em; font-size:1.1em; color:${theme.menu_txt};`,
      copy_txt: `font-size:1.1em; margin:0; color:${theme.menu_txt};`
    };

    const routes = Object.keys(state.uiState.mapState).filter(k => !['HOME','DEFAULT'].includes(k));
    const submenu = E('div', {style: st.submenu}, routes.map(r => {
      const route = E('div', {style: st.route}, [E('h2', {style: st.route_title}, [state.uiState.mapState[r].title])]);
      route.addEventListener('click', e => dispatch({type:'NAV_TO', payload:r}));
      return route;
    }));

    const copy = E('div', {style: st.copy}, [
      E('img',{src:icons.app.usa,alt:`USA Icon`,style: st.usa},[]),
      E('p',{style: st.usa},['United States']),
      E('p',{style: st.copy_txt},['Copyright © 2021 chivington.net']),
    ]);

    const toggle = E('div',{style: st.toggle},[E('h4',{style: st.tg_txt},[`Toggle dark mode`]),E('div',{style: st.tg_btn},[E('div',{style: st.slider},[])])]);
    toggle.lastChild.addEventListener('click',()=>dispatch({type:'TOGGLE_THEME',payload:store.getState().uiState.menuState.scrollTop}));

    const Menu = Unity.element('div',{style: st.menu},[submenu,toggle,copy]);
    setTimeout(event=>Menu.scrollTo({top:menuState.scrollTop,left:0,behavior:'auto'}),50);

    let scroll_ctr = 0;
    Menu.addEventListener('scroll', function(event) {
      const [current_st,event_st] = [menuState.scrollTop,event.target.scrollTop];
      const diff = (event_st-current_st)<0?-(event_st-current_st):(event_st-current_st);
      if (scroll_ctr++ %2==0 && diff>5) dispatch({type:'UPDATE_MENU_SCROLL',payload:event_st});
    },false);

    return Menu;
  },
  View: function(store,view,animation) {
    const [state,dispatch] = [store.getState(),store.dispatch];
    const {windowState,viewState,menuState,themeState} = state.uiState;
    const theme = themeState[themeState.selected];
    const {width,height,mode} = windowState;

    const st = {
      view:`
        position:fixed; top:0; right:0; bottom:0; left:0; margin:0; padding:0; overflow-x:hidden; overflow-y:scroll; z-index:10;
        background:linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.8)), url('${themeState.wp.view}'); background-position:center; background-size:cover; background-repeat:no-repeat;
        ${menuState.current=='OPEN'?'filter:blur(5pt);':''} -webkit-overflow-scrolling:touch; background-color:${theme.view}; ${animation}
      `
    };

    const View = Unity.element('div', {style: st.view,content:`minimal-ui`}, [view(store), Modules.Footer(store)]);
    setTimeout(event=>View.scrollTo({top:viewState.scrollTop,left:0,behavior:'auto'}),50);

    let scroll_ctr = 0;
    View.addEventListener('scroll', function(event) {
      const [ current_st, event_st ] = [ viewState.scrollTop, event.target.scrollTop ];
      const diff = (event_st - current_st) < 0 ? -(event_st - current_st) : (event_st - current_st);
      if (scroll_ctr++ % 2 == 0 && diff > 5) dispatch({type:'UPDATE_VIEW_SCROLL',payload:event_st});
    },false);

    View.addEventListener('click', function(event) { if (menuState.current=='OPEN') dispatch({type:'CLOSE_MENU'}); });
    return View;
  },
  Footer: function(store) {
    const [state,dispatch] = [store.getState(),store.dispatch];
    const {footerState,windowState,mapState} = state.uiState;
    const theme = state.uiState.themeState[state.uiState.themeState.selected];
    const lg_dev = (windowState.mode == 'lg_tab' || windowState.mode == 'pc');
    const {icons,wp} = Assets.imgs;
    const E = Unity.element;

    const st = {
      footer: `display:flex; flex-direction:column; justify-content:flex-start; align-items:stretch; padding:0; margin:0; z-index:75; background-color:${theme.footer}; border-top:1pt solid ${theme.footer_bdr};`,
      msg: `
        display:flex; flex-direction:column; justify-content:flex-start; align-items:stretch; background-color:${theme.panel};
        margin:1em 1em 0; padding:${lg_dev?'2':'1'}em; border:solid ${theme.footer_bdr}; border-width:1pt 0; font-size:1.25em; font-weight:700; text-align:center; color:${theme.menu_txt};
        background:linear-gradient(${theme.panel},${theme.panel}), url('${wp.net}'); background-position:center; background-size:cover; background-repeat:no-repeat;
      `,
      quote_btn: `margin:1em auto 0; padding:0.5em 1em; background-color:${theme.btn}; border:1pt solid ${theme.menu_bdr}; color:${theme.menu_txt}; cursor:pointer;`,
      submenus: `margin:1em; padding:0.5em;`,
      copy: `display:flex; flex-direction:row; justify-content:space-between; align-items:center; text-align:center; border-top:1px solid ${theme.footer_bdr}; margin:0; padding:2em; font-size:1em;`,
      copy_left: `display:flex; flex-direction:row; justify-content:flex-start; align-items:flex-start; padding:0; margin:0;`,
      copy_right: `display:flex; flex-direction:row; justify-content:flex-end; align-items:flex-start; padding:0; margin:0;`,
      usa: `height:1.25em; margin:0; color:${theme.footer_txt};`,
      copy_txt: `font-size:1em; margin:0; color:${theme.footer_txt};`
    };

    const copy = E('div', {style: st.copy}, [
      E('div', {style: st.copy_left}, [E('p', {style: st.copy_txt}, [`Copyright © 2021 chivington.net`])]),
      E('div', {style: st.copy_right}, [E('img', {src:icons.app.usa,alt:`USA Icon`,style: st.usa}, ['United States'])])
    ]);

    return E('div', {style: st.footer}, [copy]);
  },
  App: function(store) {
    const [ state, dispatch ] = [ store.getState(), store.dispatch ];
    const { width, height, mode } = state.uiState.windowState;

    const st = {
      app: `position: fixed; top: 0; left: 0; height: 0%; width: 100%; margin: 0; padding: 0; z-index: 0;`
    };

    let resizeCtr = 0;
    window.addEventListener('resize', function(event) {
      if (resizeCtr++ % 5 == 0) {
        const [nw,nh] = [window.innerWidth,window.innerHeight];
        const nm = nw<600?'mb':(nw<700?'sm_tab':(nw<800?'md_tab':(nw<900?'lg_tab':'pc')))
        if (nm!=mode) dispatch({type:'RESIZE',payload:{width:nw,height:nh,mode:nm}});
      }
    });

    return Unity.element('div', {style: st.app}, [
      Modules.Header(store), Modules.Menu(store), Modules.Router(store)
    ]);
  }
};

// --------------------------------------------------------------------------------------------
//  Views - Groups Modules together to fit device.
// --------------------------------------------------------------------------------------------
const Views = {
	Home: function(store) {
		const [state, dispatch] = [store.getState(),store.dispatch];
		const {appState, uiState} = state;
		const {windowState, mapState} = uiState;
		const landscape = state.uiState.windowState.orientation == 'LANDSCAPE' ? true : false;
		const landing = ((appState.historyState.views.slice(-1)=='@@INIT')&&(appState.historyState.actions.slice(-1)=='@@INIT'))?true:false;
		const theme = uiState.themeState[uiState.themeState.selected];
		const E = Unity.element;

		const st = {
			view:`display:flex; flex-direction:column; justify-content:flex-start; align-items:stretch; min-height:92%;`,
			home: `display:flex; flex-direction:column; justify-content:flex-start; align-items:stretch; padding:0; width:100%; text-align:center; ${landing?'animation: app_fade_in 1000ms ease-in-out 1 forwards;':''}`,
			intro: `display:flex; flex-direction:column; justify-content:flex-start; align-items:stretch; margin:${landscape?'13em 1em 2':'7em 1em 2'}em;`,
			name: `margin:0 auto; color:${theme.lt_txt}; font-size:4em; font-weight:400;`,
			title: `margin:0.25em; color:${theme.lt_txt}; font-size:${landscape?1.5:1.3}em; font-weight:300;`,
			actions: `display:flex; flex-direction:${landscape?'row':'column'}; justify-content:center; align-items:${landscape?'center':'stretch'}; margin:0 auto; padding:0; width:90%;`,
			btn: `margin:0.5em ${landscape?'':'auto'}; padding:0.4em 0.6em; width:${landscape?23:80}%; background-color:${theme.btn}; border:1pt solid ${theme.btn_bdr}; color:${theme.lt_txt}; cursor:pointer;`,
			bio: `margin:${landscape?2:1}em; padding:${landscape?`1`:`0.25`}em; border:1px solid ${theme.view_bdr}; background-color:${theme.well};`,
			sentence: `color:${theme.view_txt}; font-size:${landscape?1.25:1}em; font-weight:700; margin:0.5em;`,
			highlights: `display:flex; flex-direction:column; justify-content:flex-start; align-items:stretch; margin:2em 0;`,
			highlight: `display:flex; flex-direction:column; justify-content:flex-start; align-items:stretch; margin:${landscape?2:1}em auto; width:${landscape?70:95}%; background-coulor:#252525; border:1pt solid ${theme.view_bdr}; cursor:pointer;`,
			highlight_img: `margin:0; width:100%; border-bottom:1pt solid ${theme.view_bdr};`,
			highlight_title: `color:${theme.lt_txt}; font-size:${landscape?1.25:1}em; text-align:center;`
		};

		const intro = E('div',{style: st.intro},[
			E('h1',{style: st.name},['Unity Web App']),
			E('h2',{style: st.title},[`Welcome to my new Unity web app.`])
		]);

		const actions = E('div',{style: st.actions},['CONTACT','ABOUT'].map((b,i,arr) => {
			const btn = E('h2', {style: st.btn}, [`${b[0]}${b.slice(1).toLowerCase()}`]);
			btn.addEventListener('click', (event)=>dispatch({type:'NAV_TO', payload:b}));
			return btn;
		}));

		const HomeView = E('div', {style: st.view}, [
			E('div',{style: st.home},[intro, actions])
		]);

		return HomeView;
	},
	About: function(store) {
		const [ state, dispatch ] = [ store.getState(), store.dispatch ];
		const { wp, thumbs } = Assets.imgs;
		const theme = state.uiState.themeState[state.uiState.themeState.selected];
		const { bio } = state.userState.infoState;
		const E = Unity.element;
		const lg_dev = ((state.uiState.windowState.mode=='pc')||(state.uiState.windowState.mode=='lg_tab'))?true:false;

		const st = {
			view: `display:flex; flex-direction:column; justify-content:flex-start; align-items:stretch; min-height:75%; margin:${lg_dev?7:6}em 0 3em;`,
			about: `margin:${lg_dev?'1em 2em':'0.5em 1em'} auto; padding:${lg_dev?1:0.25}em; background-color:${theme.well};`,
			title: `margin:${lg_dev?3:2.5}em auto 0.25em; padding:${lg_dev?0.25:0.15}em; border-bottom:1pt solid ${theme.view_bdr}; text-align:center; color:${theme.menu_txt};`,
			intro: `margin:0.5em; padding:0; text-align:center; color:${theme.view_txt};`,
			bio: `margin:1em 0 0; padding:0;`,
			section: `margin:1.5em 1em 1em; padding:0;`,
			sec_ttl: `margin:0 0 0.5em; padding:0 1em 0.5em; font-size:1em; color:${theme.view_txt}; border-bottom:1pt solid ${theme.menu_bdr};`,
			txt: `margin:0 0.5em; padding:0; color:${theme.view_txt};`,
			sentence: `margin:0.25em; color:${theme.view_txt};`,
		};

		const full_bio = E('div', {style: st.bio}, Object.keys(bio).map(section =>
			E('div', {style: st.section}, [
				E('h2', {style: st.sec_ttl}, [section.toUpperCase()]),
		  		...bio[section].map((sentence, i) => E('span', {style: `${st.sentence} ${i==0?'margin-left:1em;':''}`}, [sentence]))
			])
		));

		const AboutView = E('div', {style: st.view}, [
			E('div', {style: st.about}, [ full_bio ])
		]);

		return AboutView;
	},
	Contact: function(store) {
		const [state,dispatch] = [store.getState(),store.dispatch];
		const {wp,thumbs} = Assets.imgs;
		const {personal,work,social} = state.userState.infoState;
		const {mode} = state.uiState.windowState;
		const lg_dev = ((mode=='pc')||(mode=='lg_tab'))?true:false;
		const theme = state.uiState.themeState[state.uiState.themeState.selected];
		const E = Unity.element;

		const st = {
			view:`display:flex; flex-direction:column; justify-content:flex-start; align-items:stretch; min-height:92%;`,
			contact:`margin:${mode=="pc"?'9em 7em 5':(mode==lg_tab?'7em 5em 5':'5em 1em 3')}em; padding:1em; background-color:${theme.well}; display:flex; flex-direction:column; justify-content:flex-start; align-items:stretch;`,
			title:`margin:0 1em; padding:0 0.5em; border-bottom:1pt solid ${theme.view_bdr}; text-align:center; color:${theme.view_txt};`,
			intro:`margin:0; padding:0; text-align:center; color:${theme.view_txt};`,
			sections:`display:flex; flex-direction:column; justify-content:${lg_dev?'space-around':'flex-start'};`,
			section:`margin:${lg_dev?'1':'0.25'}em; padding:0; text-align:center; display:flex; flex-direction:column; justify-content:space-around; align-items:center; color:${theme.view_txt}; font-weight:bold; margin:${lg_dev?1:0.5}em;`,
			row:`display:flex; flex-direction:${lg_dev?'row':'column'}; justify-content:${lg_dev?'center':'flex-start'}; align-items:stretch;`,
			sec_ttl:`margin:${lg_dev?`0 0.5em 0 0`:`0.5em 0 0 0`}; padding:0; font-weight:bold; font-size:1em; color:${theme.view_txt};`,
			wrp:`display:flex; flex-direction:${lg_dev?`row`:`column`}; margin:0;`,
			lnk: `color:#09f; margin: 0 0.5em; text-decorate:underline;`,
			btn: `margin:0.5em auto 2em; padding:0.5em 1em; background-color:${theme.btn}; border:1pt solid ${theme.btn_bdr}; color:${theme.lt_txt}; cursor:pointer; text-align:center;`,
			map:`border:1px solid ${theme.footer_bdr}; margin:1em auto; width:95%; height:250pt;`
		};

		const phone = E(`div`, {style: st.section}, [
			`Phone`,
			E(`div`,{style: st.wrp},[
				E(`a`,{href:`tel:${personal.phone}`, target:`_blank`, style: st.lnk},[ personal.phone ])
			])
		]);

		const email = E(`div`, {style: st.section}, [
			`Email`,
			E(`div`, {style: st.wrp}, [
				E(`a`,{href:`mailto:${personal.email}`, target:`_blank`, style: st.lnk},[ personal.email ])
			])
		]);

		const map = E('iframe',{frameborder:'0',style: st.map,src:work.address[1]},[]);

		const ContactView = E('div', {style: st.view}, [
			E('div',{style: st.contact},[
			E('h1',{style: st.title},['Get In Touch']),
				E('div',{style: st.sections},[ phone, email, map ])
			])
		]);

		return ContactView;
	}
};

// --------------------------------------------------------------------------------------------
//  Asset Manifest - Everything needed to cache app.
// --------------------------------------------------------------------------------------------
const Assets = {
	css: {
		fonts: {
			Avenir_Book:'/css/fonts/Avenir-Free/Avenir-Book.otf',
			Avenir_Book:'/css/fonts/Avenir-Free/Avenir-Light.otf',
			Avenir_Book:'/css/fonts/Avenir-Free/Avenir-Roman.otf'
		},
		only_css_file:'/css/only.css'
	},
	imgs: {
		icons: {
			app: {
				email_blk:'/imgs/icons/app/email-blk.svg',
				email_wht:'/imgs/icons/app/email-wht.svg',
				git_blk:'/imgs/icons/app/git-blk.svg',
				git_wht:'/imgs/icons/app/git-wht.svg',
				app_blk:'/imgs/icons/app/app-blk.svg',
				app_wht:'/imgs/icons/app/app-wht.svg',
				phone_blk:'/imgs/icons/app/phone-blk.svg',
				phone_wht:'/imgs/icons/app/phone-wht.svg',
				usa:'/imgs/icons/app/united-states.svg',
				web_blk:'/imgs/icons/app/web-blk.svg',
				web_wht:'/imgs/icons/app/web-wht.svg'
			},
			btns: {
				close_wht:'/imgs/icons/btns/close-wht.svg',
				close_blk:'/imgs/icons/btns/close-blk.svg',
				scroll:'/imgs/icons/btns/scroll.svg',
				menu_wht:'/imgs/icons/btns/menu-wht.svg',
				menu_blk:'/imgs/icons/btns/menu-blk.svg',
				caret_wht:'/imgs/icons/btns/caret-wht.svg',
				caret_blk:'/imgs/icons/btns/caret-blk.svg',
				left_arrow:'/imgs/icons/btns/left-arrow.svg',
				right_arrow:'/imgs/icons/btns/right-arrow.svg',
			},
			manifest: {
				android_192:'/imgs/icons/manifest/android-chrome-192x192.png',
				android_512:'/imgs/icons/manifest/android-chrome-512x512.png',
				apple_touch:'/imgs/icons/manifest/apple-touch-icon.png',
				favicon_16:'/imgs/icons/manifest/favicon-16x16.png',
				favicon_32:'/imgs/icons/manifest/favicon-32x32.png',
				favicon:'/imgs/icons/manifest/favicon.ico',
				redux:'/imgs/icons/manifest/redux.jpg',
				redux_no_bg:'/imgs/icons/manifest/redux-no-bg.png',
				mstile_150:'/imgs/icons/manifest/mstile-150x150.png',
				safari_pinned_tab:'/imgs/icons/manifest/safari-pinned-tab.svg'
			}
		},
		me: {
	  		stock:'/imgs/me/stock.png',
		},
		wp: {
	  		fragmented:'/imgs/wp/fragmented.jpg',
		},
		thumbs: {
			placeholder: '/imgs/thumbs/placeholder.jpg',
			placeholder: '/imgs/thumbs/placeholder.png',
			placeholder: '/imgs/thumbs/placeholder.svg'
		}
	},
	js: {
		app:'/js/app.js'
	},
	browserconfig:'/browserconfig.xml',
	favicon:'/favicon.ico',
	index:'/index.html',
	license:'/LICENSE',
	webmanifest:'/site.webmanifest'
};

// --------------------------------------------------------------------------------------------
//  Blueprint - Specifies inital app state.
// --------------------------------------------------------------------------------------------
const Blueprint = {
	app: {
		title: 'Unity Web App',
		about: {},
		history: {
			actions: ['@@INIT'],
			actions_length: 5,
			views: ['@@INIT'],
			views_length: 5
		}
	},
	user: {
		name: 'FirstName LastName',
		employer: `Employer`,
		title: `Title`,
		school: `School`,
		major: `Major`,
		work: {
			address: [
				'123 Street City, ST',
				'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3125.5626505717646!2d-75.05884758462358!3d38.4284708796457!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89b8d41c953bb713%3A0x5a3c6d658c0bb2e3!2s123rd%20St%2C%20Ocean%20City%2C%20MD%2021842!5e0!3m2!1sen!2sus!4v1655770755373!5m2!1sen!2sus'
			],
			email: 'me@workemail.com',
			phone: '123.456.7890',
			web: 'https://www.my-job.com/'
		},
		personal: {
			address: [
				'123 Street City, ST',
				'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3125.5626505717646!2d-75.05884758462358!3d38.4284708796457!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89b8d41c953bb713%3A0x5a3c6d658c0bb2e3!2s123rd%20St%2C%20Ocean%20City%2C%20MD%2021842!5e0!3m2!1sen!2sus!4v1655770755373!5m2!1sen!2sus'
			],
			email: 'me@personalemail.com',
			phone: '123.456.7890',
			web: 'https://www.my-site.com/',
			git: 'https://github.com/username'
		},
		bio:{
			work: [
				`My work experience is...`
			],
			education: [
				`My academis experience is...`
			],
			personal: [
				`In my personal life, I enjoy...`
			]
		}
	},
	ui: {
		map: {
			'HOME': {view:Views.Home, title:'Home', icon:Assets.imgs.me.win},
			'ABOUT': {view:Views.About, title:'About', icon:Assets.imgs.me.win},
			'CONTACT': {view:Views.Contact, title:'Contact', icon:Assets.imgs.me.win},
			'DEFAULT': {view:Views.Home, title:'Home', icon:Assets.imgs.me.win}
		},
		theme: {
			selected: 'dark',
			blue: {
				header: `rgba(21,32,43,1)`,
				header_txt: `rgba(255,255,255,1)`,
				header_bdr: `rgba(70,122,194,0.7)`,
				menu: `rgba(21,32,43,0.9)`,
				menu_bdr: `rgba(70,122,194,0.9)`,
				menu_btn: `rgba(21,32,43,0.9)`,
				menu_sub: `rgba(70,87,117,0.5)`,
				menu_txt: `rgba(255,255,255,1)`,
				view: `rgba(70,77,97,0.9)`,
				view_bdr: `rgba(70,122,194,0.9)`,
				view_txt: `rgba(255,255,255,1)`,
				lt_txt: `rgba(255,255,255,1)`,
				dk_txt: `rgba(25,25,25,1)`,
				well: `rgba(70,87,117,0.9)`,
				panel_lt: `rgba(35,43,59,0.5)`,
				panel: `rgba(35,43,59,0.7)`,
				panel_drk: `rgba(50,50,75,0.7)`,
				btn: `rgba(53,92,146,1)`,
				btn_lt: `rgba(70,122,194,1)`,
				btn_bdr: `rgba(70,122,194,0.9)`,
				footer: `rgba(21,32,43,0.9)`,
				footer_bdr: `rgba(70,122,194,0.9)`,
				footer_txt: `rgba(255,255,255,1)`,
				shadow: `rgba(50,50,50,0.9)`,
				success: '#4e4',
				error: '#e44',
				link: '#09f',
				clear: `rgba(0,0,0,0)`
			},
			dark: {
				header: `rgba(19,19,19,1)`,
				header_txt: `rgba(255,255,255,1)`,
				header_bdr: `rgba(255,255,255,0.6)`,
				menu: `rgba(21,32,43,0.9)`,
				menu_bdr: `rgba(255,255,255,0.9)`,
				menu_btn: `rgba(21,32,43,0.9)`,
				menu_sub: `rgba(70,87,117,0.5)`,
				menu_txt: `rgba(255,255,255,1)`,
				view: `rgba(70,77,97,0.9)`,
				view_bdr: `rgba(255,255,255,0.9)`,
				view_txt: `rgba(255,255,255,1)`,
				lt_txt: `rgba(255,255,255,1)`,
				dk_txt: `rgba(25,25,25,1)`,
				well: `rgba(70,87,117,0.9)`,
				panel_lt: `rgba(61,61,61,0.5)`,
				panel: `rgba(33,33,33,0.7)`,
				panel_drk: `rgba(11,11,11,0.7)`,
				btn: `rgba(53,92,146,1)`,
				btn_lt: `rgba(70,77,97,1)`,
				btn_bdr: `rgba(70,122,194,0.9)`,
				footer: `rgba(33,33,33,0.9)`,
				footer_bdr: `rgba(70,122,194,0.9)`,
				footer_txt: `rgba(255,255,255,1)`,
				shadow: `rgba(50,50,50,0.9)`,
				success: '#4e4',
				link: '#09f',
				error: '#e44',
				clear: `rgba(0,0,0,0)`
			},
			light: {
				header: `rgba(255,255,255,1)`,
				header_txt: `rgba(55,55,75,0.9)`,
				header_bdr: `rgba(25,25,25,1)`,
				menu: `rgba(112,140,188,0.9)`,
				menu_bdr: `rgba(35,45,75,0.9)`,
				menu_btn: `rgba(66,103,178,1)`,
				menu_sub: `rgba(120,160,195,1)`,
				menu_txt: `rgba(255,255,255,1)`,
				view: `rgba(255,255,255,1)`,
				view_bdr: `rgba(75,75,75,0.9)`,
				view_txt: `rgba(55,55,75,0.9)`,
				lt_txt: `rgba(255,255,255,1)`,
				dk_txt: `rgba(25,25,25,1)`,
				well: `rgba(255,255,255,1)`,
				panel_lt: `rgba(112,140,200,0.3)`,
				panel: `rgba(112,140,188,0.5)`,
				panel_drk: `rgba(50,50,75,0.7)`,
				btn: `rgba(81,128,193,1)`,
				btn_lt: `rgba(105,155,225,1)`,
				btn_bdr: `rgba(25,25,25,0.9)`,
				footer: `rgba(255,255,255,1)`,
				footer_bdr: `rgba(25,25,25,0.9)`,
				footer_btn: `rgba(70,87,117,0.4)`,
				footer_txt: `rgba(55,55,75,0.9)`,
				shadow: `rgba(50,50,75,0.7)`,
				success: '#4e4',
				error: '#e44',
				link: '#09f',
				clear: `rgba(0,0,0,0)`
			},
			wp: {
				view:Assets.imgs.wp.fragmented
			}
		},
		window: {
			width: window.innerWidth,
			height: window.innerHeight,
			mode: (window.innerWidth < 600) ? 'mb' :
					(window.innerWidth < 700 ? 'sm_tab' :
						(window.innerWidth < 800 ? 'md_tab' :
							(window.innerWidth < 900 ? 'lg_tab' : 'pc')
						)
					),
			orientation: window.innerWidth > window.innerHeight ? 'LANDSCAPE' : 'PORTRAIT'
		},
		header:{
			icon: Assets.imgs.icons.manifest.favicon,
			alt: 'Unity Web App Icon',
			menu_btn: Assets.imgs.icons.btns.menu
		},
		menu:{
			current: 'CLOSED',
			previous: 'CLOSED',
			scrollTop: 0
		},
		view:{
			current: 'HOME',
			previous: '@@INIT',
			scrollTop: 0
		},
		imgs: Assets.imgs
	}
};

// --------------------------------------------------------------------------------------------
//  Reducers - Functions that initialize state & reduce it on each state change.
// --------------------------------------------------------------------------------------------
const Reducers = {
  appState: function(state=Blueprint.app, action) {
    return Unity.combine({
      aboutState: Unity.reducer(Blueprint.app.about, {}),
      historyState: Unity.reducer(Blueprint.app.history, {
        'NAV_TO': (s,a) => ({
          actions: s.actions.length == Blueprint.app.history.actions_length ? [...s.actions.slice(1), a.type] : [...s.actions, a.type],
          views: s.views.length == Blueprint.app.history.views_length ? [...s.views.slice(1), a.payload] : [...s.views, a.payload]
        }),
        'TOGGLE_MENU': (s,a) => ({actions: s.actions.length == Blueprint.app.history.actions_length ? [...s.actions.slice(1), a.type] : [...s.actions, a.type], views: s.views}),
        'OPEN_MENU': (s,a) => ({actions: s.actions.length == Blueprint.app.history.actions_length ? [...s.actions.slice(1), a.type] : [...s.actions, a.type], views: s.views}),
        'CLOSE_MENU': (s,a) => ({actions: s.actions.length == Blueprint.app.history.actions_length ? [...s.actions.slice(1), a.type] : [...s.actions, a.type], views: s.views}),
        'CHANGE_THEME': (s,a) => ({actions: s.actions.length == Blueprint.app.history.actions_length ? [...s.actions.slice(1), a.type] : [...s.actions, a.type], views: s.views}),
        'RESIZE': (s,a) => ({actions: s.actions.length == Blueprint.app.history.actions_length ? [...s.actions.slice(1), a.type] : [...s.actions, a.type], views: s.views})
      })
    })(state, action);
  },
  userState: function(state=Blueprint.user, action) {
    return Unity.combine({
      infoState: Unity.reducer(Blueprint.user, {})
    })(state, action);
  },
  uiState: function (state=Blueprint.ui, action) {
    return Unity.combine({
      mapState: Unity.reducer(Blueprint.ui.map, {}),
      menuState: Unity.reducer(Blueprint.ui.menu, {
        'UPDATE_MENU_SCROLL': (s,a) => ({current: s.current, previous: s.previous, scrollTop: a.payload}),
        'NAV_TO': (s,a) => ({current: 'CLOSED', previous: s.current, scrollTop: 0}),
        'TOGGLE_MENU': (s,a) => ({current: s.current == 'OPEN' ? 'CLOSED' : 'OPEN', previous: s.current, scrollTop: 0}),
        'OPEN_MENU': (s,a) => ({current: 'OPEN', previous: s.current, scrollTop: 0}),
        'CLOSE_MENU': (s,a) => ({current: 'CLOSED', previous: s.current, scrollTop: 0}),
        'TOGGLE_THEME': (s,a) => ({current: 'OPEN', previous: s.current, scrollTop: a.payload})
      }),
      themeState: Unity.reducer(Blueprint.ui.theme, {
        'TOGGLE_THEME': (s,a) => Object.assign({}, s, {selected: s.selected == 'dark' ? 'light' : 'dark'})
      }),
      viewState: Unity.reducer(Blueprint.ui.view, {
        'NAV_TO': (s,a) => ({current: a.payload, previous: s.current, scrollTop: 0}),
        'UPDATE_VIEW_SCROLL': (s,a) => ({current: s.current, previous: s.previous, scrollTop: a.payload})
      }),
      windowState: Unity.reducer(Blueprint.ui.window, {
        'RESIZE': (s,a) => a.payload
      }),
      imgState: Unity.reducer(Blueprint.ui.imgs, {})
    })(state, action);
  }
};

// --------------------------------------------------------------------------------------------
//  Middlewares - Functions that intercept state changes.
// --------------------------------------------------------------------------------------------
const Middlewares = {
  logActions: Unity.middlewares.logActions('@@INIT'),
  listenerBypass: Unity.middlewares.listenerBypass({
    'UPDATE_VIEW_SCROLL': ['Render_App'],
    'UPDATE_MENU_SCROLL': ['Render_App'],
  })
};

// --------------------------------------------------------------------------------------------
//  Initialization - Initialize application with Blueprint & Asset Manifest.
// --------------------------------------------------------------------------------------------
const App_Root = document.getElementById('App_Root');
const Load_Screen_Root = document.getElementById('Load_Screen_Root');
Unity.initialize(App_Root,Load_Screen_Root,Blueprint,Reducers,Middlewares);
