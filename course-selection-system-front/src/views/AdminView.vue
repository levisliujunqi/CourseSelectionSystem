<template>
    <div>
        <Menu mode="horizontal" theme="light" :active-name="activeMenu" @on-select="onselect">
            <MenuItem name="user">
            <Icon type="ios-person" />
            用户管理
            </MenuItem>
            <MenuItem name="course">
            <Icon type="ios-book" />
            课程管理
            </MenuItem>
            <Submenu name="me">
                <template #title>
                    <Icon type="ios-settings" />
                    {{ store.state.name }}
                </template>
                <MenuItem name="logout">
                <Icon type="ios-log-out" />
                退出登陆
                </MenuItem>
            </Submenu>
        </Menu>

        <div v-if="activeMenu === 'user'" style="margin-top:16px">
            <Space style="margin-bottom:12px">
                <Button type="default" icon="ios-refresh" @click="onRefresh">刷新</Button>
                <Input v-model="searchuserName" placeholder="输入姓名搜索" style="width:200px" />
                <Button type="primary" @click="fetchUsers">搜索</Button>
                <Button type="primary" @click="onAddUser">添加用户</Button>
            </Space>

            <Table :columns="userColumns" :data="users" row-key="id" stripe>
                <template #operation="{ row }">
                    <Button type="info" @click="onEditUser(row)">编辑</Button>
                    <Button type="error" @click="onDeleteUser(row.id)" style="margin-left:8px">
                        删除
                    </Button>
                </template>
            </Table>

            <Modal v-model="showUserModal" title="用户信息">
                <Form :model="userForm" label-width="80px">
                    <FormItem label="用户名">
                        <Input v-model="userForm.name" placeholder="请输入用户名" />
                    </FormItem>
                    <FormItem label="密码">
                        <Input type="password" password v-model="userForm.password" placeholder="请输入密码" />
                    </FormItem>
                    <FormItem label="角色">
                        <Select v-model="userForm.usertype" placeholder="请选择角色">
                            <Option value="student">学生</Option>
                            <Option value="teacher">教师</Option>
                            <Option value="admin">管理员</Option>
                        </Select>
                    </FormItem>
                </Form>
                <template #footer>
                    <Button @click="showUserModal = false">取消</Button>
                    <Button type="primary" @click="submitUser">
                        {{ isEditUser ? '保存' : '添加' }}
                    </Button>
                </template>
            </Modal>
        </div>

        <div v-else-if="activeMenu === 'course'" style="margin-top:16px">
            <Space style="margin-bottom:12px">
                <Button type="default" icon="ios-refresh" @click="onRefresh">刷新</Button>
                <Input v-model="searchName" placeholder="输入课程名搜索" style="width:200px" />
                <Button type="primary" @click="fetchCourses">搜索</Button>
                <Button type="primary" @click="onAddCourse">添加课程</Button>
            </Space>

            <Table :columns="courseColumns" :data="courses" row-key="id" stripe>
                <template #teacherId="{ row }">
                    {{ row.teacherId.id }}
                </template>
                <template #students="{ row }">
                    <Button type="default" @click="onShowStudents(row.id)">
                        查看学生
                    </Button>
                </template>
                <template #operation="{ row }">
                    <Button type="info" @click="onEditCourse(row)">编辑</Button>
                    <Button type="error" @click="onDeleteCourse(row.id)" style="margin-left:8px">删除</Button>
                </template>
            </Table>

            <Modal v-model="showStudentModal" title="选课学生" height="300px">
                <Table :columns="studentColumns" :data="studentList" row-key="id" size="small" />
                <template #footer>
                    <Button @click="showStudentModal = false">关闭</Button>
                </template>
            </Modal>

            <Modal v-model="showCourseModal" title="课程信息">
                <Form :model="courseForm" label-width="80px">
                    <FormItem label="课程名">
                        <Input v-model="courseForm.name" placeholder="请输入课程名" />
                    </FormItem>
                    <FormItem label="描述">
                        <Input v-model="courseForm.description" placeholder="请输入描述" />
                    </FormItem>
                    <FormItem label="教师ID">
                        <Input v-model="courseForm.teacherId" placeholder="请输入教师ID" /> <!-- 普通文本框 -->
                    </FormItem>
                </Form>
                <template #footer>
                    <Button @click="showCourseModal = false">取消</Button>
                    <Button type="primary" @click="submitCourse">
                        {{ isEditCourse ? '保存' : '添加' }}
                    </Button>
                </template>
            </Modal>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import api from '@/api'
import store from '@/store'
import { useRouter } from 'vue-router'
import {
    Space,
    Button,
    Table,
    Modal,
    Form,
    FormItem,
    Input,
    Select,
    Option,
    Message,
    MenuItem,
    InputNumber
} from 'view-ui-plus'

interface User {
    id: number
    name: string
    password: string
    usertype: string
}

interface Course {
    id: number
    name: string
    description: string
    teacherId
}

const router = useRouter()
const activeMenu = ref<'user' | 'course'>('user')

const searchName = ref('')
const searchuserName = ref('')
const users = ref<User[]>([])
const courses = ref<Course[]>([])
const studentList = ref<User[]>([])
const showUserModal = ref(false)
const isEditUser = ref(false)
const userForm = reactive({ id: 0, name: '', password: '', usertype: 'student' })
const showCourseModal = ref(false)
const isEditCourse = ref(false)
const courseForm = reactive({ id: 0, name: '', description: '', teacherId: 0 })
const showStudentModal = ref(false)

const userColumns = [
    { title: 'ID', key: 'id' },
    { title: '用户名', key: 'name' },
    { title: '角色', key: 'usertype' },
    { title: '操作', slot: 'operation' }
]

const courseColumns = [
    { title: 'ID', key: 'id' },
    { title: '课程名', key: 'name' },
    { title: '描述', key: 'description' },
    { title: '教师ID', slot: 'teacherId' },
    { title: '选课学生', slot: 'students' },
    { title: '操作', slot: 'operation' }
]

const studentColumns = [
    { title: '学生ID', key: 'id' },
    { title: '学生姓名', key: 'name' }
]

onMounted(() => {
    if (!store.state.isloggedIn) {
        router.push('/login')
        return
    }
    fetchUsers()
    fetchCourses()
})

async function fetchUsers() {
    try {
        let res
        if (searchuserName.value.trim()) {
            res = await api.get(`/users/search/${searchuserName.value}`, {
                params: {
                    username: store.state.name,
                    userpassword: store.state.password
                }
            })
        } else {
            res = await api.get('/users', {
                params: {
                    username: store.state.name,
                    userpassword: store.state.password
                }
            })
        }
        const data = res.data
        users.value = data
        Message.success('获取用户列表成功')
    } catch {
        Message.error('获取用户列表失败')
    }
}

async function fetchCourses() {
    try {
        let res
        if (searchName.value.trim()) {
            res = await api.get(`/courses/search/${searchName.value}`, {
                params: {
                    username: store.state.name,
                    userpassword: store.state.password
                }
            })
        } else {
            res = await api.get('/courses', {
                params: {
                    username: store.state.name,
                    userpassword: store.state.password
                }
            })
        }
        const data = res.data
        Message.success('获取课程列表成功')
        courses.value = data
    } catch {
        Message.error('获取课程列表失败')
    }
}

function onAddUser() {
    isEditUser.value = false
    Object.assign(userForm, { id: 0, name: '', password: '', usertype: 'student' })
    showUserModal.value = true
}

function onEditUser(row: User) {
    isEditUser.value = true
    Object.assign(userForm, { id: row.id, name: row.name, password: row.password, usertype: row.usertype })
    showUserModal.value = true
}

async function submitUser() {
    try {
        if (isEditUser.value) {
            await api.put(`/users/${userForm.id}`, {
                username: store.state.name,
                userpassword: store.state.password,
                ...userForm
            })
            Message.success('修改用户成功')
        } else {
            await api.post('/users', {
                username: store.state.name,
                userpassword: store.state.password,
                ...userForm
            })
            Message.success('添加用户成功')
        }
        showUserModal.value = false
        onRefresh()
    } catch {
        Message.error('用户操作失败')
    }
}

async function onDeleteUser(id: number) {
    try {
        await api.delete(`/users/${id}`, {
            data: {
                username: store.state.name,
                userpassword: store.state.password
            }
        })
        Message.success('删除用户成功')
        fetchUsers()
    } catch {
        Message.error('删除用户失败')
    }
}

function onAddCourse() {
    isEditCourse.value = false
    Object.assign(courseForm, { id: 0, name: '', description: '', teacherId: 0 })
    showCourseModal.value = true
}

function onEditCourse(row: Course) {
    isEditCourse.value = true
    Object.assign(courseForm, { id: row.id, name: row.name, description: row.description, teacherId: row.teacherId.id })
    showCourseModal.value = true
}

async function submitCourse() {
    try {
        const { id, ...payload } = courseForm
        if (isEditCourse.value) {
            await api.put(
                `/courses/${id}`,
                {
                    ...payload,
                    username: store.state.name,
                    userpassword: store.state.password
                }
            )
            Message.success('修改课程成功')
        } else {
            await api.post(
                '/courses',
                {
                    ...payload,
                    username: store.state.name,
                    userpassword: store.state.password
                }
            )
            Message.success('添加课程成功')
        }
        showCourseModal.value = false
        fetchCourses()
    } catch {
        Message.error('课程操作失败')
    }
}

async function onDeleteCourse(id: number) {
    try {
        await api.delete(`/courses/${id}`, {
            data: {
                username: store.state.name,
                userpassword: store.state.password
            }
        })
        Message.success('删除课程成功')
        fetchCourses()
    } catch {
        Message.error('删除课程失败')
    }
}

async function onShowStudents(courseId: number) {
    try {
        const { data } = await api.get(`/selections/course/${courseId}`, {
            params: {
                username: store.state.name,
                userpassword: store.state.password
            }
        })
        studentList.value = data.map((sel: any) => sel.user)
        showStudentModal.value = true
    } catch {
        Message.error('获取学生列表失败')
    }
}

function onselect(name: string) {
    switch (name) {
        case 'user':
            activeMenu.value = 'user'
            break
        case 'course':
            activeMenu.value = 'course'
            break
        case 'logout':
            store.commit('clearCredentials')
            router.push('/login')
            Message.success('已退出登录')
            break
        default:
            break
    }
}

function onRefresh() {
    if (activeMenu.value === 'user') {
        fetchUsers()
    } else if (activeMenu.value === 'course') {
        fetchCourses()
    }
}
</script>