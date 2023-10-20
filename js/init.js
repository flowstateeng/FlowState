

Blueprint.ui.window = {
	"width": window.innerWidth,
	"height": window.innerHeight,
	"device": (window.innerWidth < 600) ? "MOB" :
			(window.innerWidth < 700 ? "LG_MOB" :
				(window.innerWidth < 800 ? "SM_TAB" :
					(window.innerWidth < 900 ? "LG_TAB" : "PC")
				)
			),
	"orientation": window.innerWidth > window.innerHeight ? "LANDSCAPE": "PORTRAIT"
}

console.log(`FlowState Engineering | Initializing UI...`)
const App_Root = document.getElementById('App_Root')
const Load_Screen = document.getElementById('Load_Screen')
const RootReducer = FlowState.combine(Reducers)
FlowState.initialize(AppComponents.App, App_Root, Load_Screen, RootReducer, FlowState.api(), log_actions=true)

