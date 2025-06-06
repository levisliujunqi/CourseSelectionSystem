<script setup lang="ts">
const LoginSubmit=(valid,{username, password}) => {
    if (valid) {

    }
}
</script>

<template>
    <div class="login">
        <div class="loginborder">
            <h1 style="color:black">学生选课系统</h1>
            <Login @on-submit="LoginSubmit">
                <UserName name="username" />
                <Password name="password" />
                <Submit />
            </Login>
        </div>
    </div>
</template>
<style scoped>
.login{
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    width: 100vw;
    background-image: url('@/assets/loginbackground.png');
    background-size: cover;
}
.loginborder{
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 20px;
    padding: 40px;
    background-color: rgba(255, 255, 255, 0.5);
}
</style>