import { createStore } from 'vuex'

export default createStore({
    state: {
        name: '',
        password: '',
        userid: '',
        usertype: '',
        isloggedIn: false
    },
    mutations: {
        setCredentials(state, payload: { username: string; password: string; userid: number; usertype: string }) {
            state.name = payload.username
            state.password = payload.password
            state.userid = payload.userid.toString()
            state.usertype = payload.usertype
            state.isloggedIn = true
        },
        clearCredentials(state) {
            state.name = ''
            state.password = ''
            state.userid = ''
            state.usertype = ''
            state.isloggedIn = false
        }
    }
})