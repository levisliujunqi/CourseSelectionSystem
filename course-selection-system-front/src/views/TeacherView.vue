<template>
    <div>
        <!-- 顶部菜单… -->
        <Menu mode="horizontal" theme="light" :active-name="activeMenu" @on-select="onselect">
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

        <div v-if="activeMenu === 'course'" style="margin-top:16px">
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

            <!-- 学生列表弹窗 -->
            <Modal v-model="showStudentModal" title="选课学生" height="300px">
                <Table :columns="studentColumns" :data="studentList" row-key="id" size="small" />
                <template #footer>
                    <Button @click="showStudentModal = false">关闭</Button>
                </template>
            </Modal>

            <!-- 新增：添加/编辑课程 Modal -->
            <Modal v-model="showCourseModal" title="课程信息">
                <Form :model="courseForm" label-width="80px">
                <FormItem label="课程名">
                    <Input v-model="courseForm.name" placeholder="请输入课程名" />
                </FormItem>
                <FormItem label="描述">
                    <Input v-model="courseForm.description" placeholder="请输入描述" />
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
const activeMenu = ref('course')

const searchName = ref('') 
const users = ref<User[]>([])
const courses = ref<Course[]>([])
const studentList = ref<User[]>([])
const showUserModal = ref(false)
const isEditUser = ref(false)
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
    fetchCourses()
})

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
        const data=res.data
        const data1=data.filter((c: Course) => {
            const tid = c.teacherId.id
            return tid == store.state.userid
        })
        Message.success('获取课程列表成功')
        courses.value = data1
    } catch {
        Message.error('获取课程列表失败')
    }
}

function onAddCourse() {
    isEditCourse.value = false
    Object.assign(courseForm, { id: 0, name: '', description: '', teacherId: store.state.userid })
    showCourseModal.value = true
}

function onEditCourse(row: Course) {
    isEditCourse.value = true
    Object.assign(courseForm, {id:row.id, name: row.name, description: row.description, teacherId: row.teacherId.id})
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
    if (activeMenu.value === 'course') {
        fetchCourses()
    }
}
</script>