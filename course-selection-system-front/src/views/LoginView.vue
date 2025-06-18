<script setup lang="ts">
import api from '@/api'
import { Message } from 'view-ui-plus';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { onMounted } from 'vue';
const store = useStore();
const router = useRouter();
onMounted(() => {
    if (store.state.isloggedIn) {
        api.get('/users/' + store.state.userid, {
            params: {
                username: store.state.name,
                userpassword: store.state.password
            }
        }).then(response => {
            switch (response.data.usertype) {
                case 'student':
                    router.push('/student');
                    break;
                case 'teacher':
                    router.push('/teacher');
                    break;
                case 'admin':
                    router.push('/admin');
                    break;
                default:
                    Message.error("error");
            }
        }).catch(err => {

        })
    }
});
const LoginSubmit = (valid, { name, password }) => {
    if (valid) {
        api.post('/users/login', {
            username: name,
            userpassword: password
        }).then(response => {
            store.commit('setCredentials', {
                userid: response.data.id,
                username: name,
                password: password,
                usertype: response.data.usertype
            });
            Message.success("登陆成功")
            api.get('/users/' + store.state.userid, {
                params: {
                    username: store.state.name,
                    userpassword: store.state.password
                }
            }).then(response => {
                switch (response.data.usertype) {
                    case 'student':
                        router.push('/student');
                        break;
                    case 'teacher':
                        router.push('/teacher');
                        break;
                    case 'admin':
                        router.push('/admin');
                        break;
                    default:
                        Message.error("error");
                }
            }).catch(err => {

            })
        })
            .catch(err => {
                Message.error("登陆失败")
            })
    }
}
</script>

<template>
    <div class="login">
        <div class="loginborder">
            <h1 style="color:black">学生选课系统</h1>
            <Login @on-submit="LoginSubmit">
                <UserName name="name" />
                <Password name="password" />
                <Submit />
            </Login>
        </div>
    </div>
</template>
<style scoped>
.login {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    width: 100vw;
    background-image: url('@/assets/loginbackground.png');
    background-size: cover;
}

.loginborder {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 20px;
    padding: 40px;
    background-color: rgba(255, 255, 255, 0.5);
}
</style>