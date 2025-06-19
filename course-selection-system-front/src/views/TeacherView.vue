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
                <MenuItem name="changePwd">
                <Icon type="ios-key" />
                修改密码
                </MenuItem>
                <MenuItem name="logout">
                <Icon type="ios-log-out" />
                退出登陆
                </MenuItem>
            </Submenu>
        </Menu>

        <Modal v-model="showChangePwdModal" title="修改密码">
            <Form :model="changePwdForm" label-width="100px">
                <FormItem label="旧密码">
                    <Input v-model="changePwdForm.oldPwd" type="password" placeholder="请输入旧密码" />
                </FormItem>
                <FormItem label="新密码">
                    <Input v-model="changePwdForm.newPwd" type="password" placeholder="请输入新密码" />
                </FormItem>
                <FormItem label="确认密码">
                    <Input v-model="changePwdForm.confirmPwd" type="password" placeholder="请确认新密码" />
                </FormItem>
            </Form>
            <template #footer>
                <Button @click="showChangePwdModal = false">取消</Button>
                <Button type="primary" @click="submitChangePwd">保存</Button>
            </template>
        </Modal>

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
                <Table :columns="studentColumns" :data="studentList" row-key="id" size="small">
                    <template #operation="{ row }">
                        <Button type="error" @click="onDeleteSelection(row.selectionId)">退选</Button>
                    </template>
                </Table>
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
const showChangePwdModal = ref(false)
const changePwdForm = reactive({
    oldPwd:'',
  newPwd: '',
  confirmPwd: ''
})
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
const studentList = ref<{ selectionId: number; studentName: string }[]>([])
const showUserModal = ref(false)
const isEditUser = ref(false)
const showCourseModal = ref(false)
const isEditCourse = ref(false)
const courseForm = reactive({ id: 0, name: '', description: '', teacherId: 0 })
const showStudentModal = ref(false)
const currentCourseId = ref(0)

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
    { title: '学生姓名', key: 'studentname' },
    { title: '操作', slot: 'operation' }
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
        currentCourseId.value = courseId
        const { data } = await api.get(`/selections/course/${courseId}`, {
            params: {
                username: store.state.name,
                userpassword: store.state.password
            }
        })
        studentList.value = data.map((sel: any) => ({
            studentname: sel.user.name,
            selectionId: sel.id
        }))
        showStudentModal.value = true
    } catch {
        Message.error('获取学生列表失败')
    }
}

async function submitChangePwd() {
  if (changePwdForm.newPwd !== changePwdForm.confirmPwd) {
    Message.error('两次输入的密码不一致')
    return
  }
  try {
    await api.put(
      `/users/${store.state.userid}`,
      {
        password: changePwdForm.newPwd,
        username: store.state.name,
        userpassword: changePwdForm.oldPwd
      }
    )
    Message.success('密码修改成功')
    showChangePwdModal.value = false
    store.commit('setPassword', changePwdForm.newPwd)
    changePwdForm.oldPwd = ''
    changePwdForm.newPwd = ''
    changePwdForm.confirmPwd = ''
    store.commit('clearCredentials')
    router.push('/login')
    Message.success('请重新登陆')
  } catch {
    Message.error('密码修改失败')
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
        case 'changePwd':
            showChangePwdModal.value=true
            return
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

async function onDeleteSelection(id: number) {
    try {
        await api.delete(`/selections/${id}`, {
            data: { username: store.state.name, userpassword: store.state.password }
        })
        onShowStudents(currentCourseId.value);
        Message.success('退选成功')
    } catch {
        Message.error('退选失败')
    }
}
</script>