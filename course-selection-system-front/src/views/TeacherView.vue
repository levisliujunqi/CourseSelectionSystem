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
                <Button type="primary" @click="onAddCourse">添加课程</Button>
            </Space>

            <Table :columns="courseColumns" :data="filteredCourses" row-key="id" stripe>
                <template #teacher="{ row }">
                    {{ row.teacherId.name }}
                </template>
                <template #college="{ row }">
                    {{ row.teacherId.college }}
                </template>
                <template #time="{ row }">
                        {{ row.startDate }} - {{ row.endDate }}
                        {{ row.startTime }} - {{ row.endTime }}
                        周{{ ['一','二','三','四','五','六','日'][row.dayOfWeek - 1] }}
                </template>
                <template #students="{ row }">
                    <Button type="default" @click="onShowStudents(row.id)">
                        查看
                    </Button>
                </template>
                <template #operation="{ row }">
                    <Button type="info" @click="onEditCourse(row)">编辑</Button>
                    <Button type="error" @click="onDeleteCourse(row.id)" style="margin-left:8px">删除</Button>
                </template>
            </Table>

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

            <Modal v-model="showCourseModal" title="课程信息">
                <Form :model="courseForm" label-width="80px">
                    <FormItem label="课程名">
                        <Input v-model="courseForm.name" placeholder="请输入课程名" />
                    </FormItem>
                    <FormItem label="描述">
                        <Input v-model="courseForm.description" placeholder="请输入描述" />
                    </FormItem>
                    <FormItem label="开始日期">
                        <Input v-model="courseForm.startDate" type="date" placeholder="请选择开始日期" />
                    </FormItem>
                    <FormItem label="结束日期">
                        <Input v-model="courseForm.endDate" type="date" placeholder="请选择结束 日期" />
                    </FormItem>
                    <FormItem label="开始时间">
                        <TimePicker style="width:100%" type="time" v-model="courseForm.startTime" placeholder="请选择开始时间" format="HH:mm"/>
                    </FormItem>
                    <FormItem label="结束时间">
                        <TimePicker style="width:100%" type="time" v-model="courseForm.endTime" placeholder="请选择结束时间" format="HH:mm"/>
                    </FormItem>
                    <FormItem label="上课星期">
                        <Select v-model="courseForm.dayOfWeek" placeholder="请选择上课星期">
                            <Option value='1'>星期一</Option>
                            <Option value='2'>星期二</Option>
                            <Option value='3'>星期三</Option>
                            <Option value='4'>星期四</Option>
                            <Option value='5'>星期五</Option>
                            <Option value='6'>星期六</Option>
                            <Option value='7'>星期日</Option>
                        </Select>
                    </FormItem>
                    <FormItem label="上课地点">
                        <Input v-model="courseForm.location" placeholder="请输入上课地点" />
                    </FormItem>
                    <FormItem label="人数限制">
                        <InputNumber v-model="courseForm.capacity" :min="1" placeholder="请输入人数上限" />
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
import { ref, reactive, onMounted, computed } from 'vue'
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
  InputNumber,
  TimePicker
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
    startDate: string
    endDate: string
    startTime: string
    endTime: string
    dayOfWeek: number
    location: string
    capacity: number
    selectionCount: number
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
const courseForm = reactive({ id: 0, name: '', description: '', teacherId: 0,startDate: '', endDate: '', startTime: '', endTime: '', dayOfWeek: 1, location: '', capacity: 30 })
const showStudentModal = ref(false)
const currentCourseId = ref(0)

const userColumns = [
    { title: 'ID', key: 'id' },
    { title: '用户名', key: 'name' },
    { title: '角色', key: 'usertype' },
    { title: '操作', slot: 'operation' }
]

const courseColumns = [
    { title: '课程名', key: 'name' },
    { title: '描述', key: 'description' },
    { title: '教师', slot: 'teacher' },
    { title: '学院', slot: 'college'},
    { title: '选课学生', slot: 'students' },
    { title: '上课时间', slot: 'time' },
    { title: '上课地点', key: 'location' },
    { title: '人数限制', key: 'capacity' },
    { title: '已选人数', key: 'selectedCount' },
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
        const res = await api.get('/courses', {
                params: {
                    username: store.state.name,
                    userpassword: store.state.password
                }
            })
        const data=res.data
        const data1=data.filter((c: Course) => {
            return c.teacherId.id == store.state.userid
        })
        Message.success('获取课程列表成功')
        courses.value = data1
    } catch {
        Message.error('获取课程列表失败')
    }
}

const filteredCourses = computed(() =>
  courses.value.filter(c => c.name.includes(searchName.value.trim()))
)

function onAddCourse() {
    isEditCourse.value = false
    Object.assign(courseForm, { id: 0, name: '', description: '', teacherId: store.state.userid,
        startDate: '', endDate: '', startTime: '', endTime: '', dayOfWeek: '1', location: '', capacity: 30 })
    showCourseModal.value = true
}

function onEditCourse(row: Course) {
    isEditCourse.value = true
    Object.assign(courseForm, {id:row.id, name: row.name, description: row.description, teacherId: row.teacherId.id,
        startDate: row.startDate, endDate: row.endDate, startTime: row.startTime, endTime: row.endTime, dayOfWeek: String(row.dayOfWeek),location: row.location, capacity: row.capacity })
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
        Message.error('课程操作失败,请检查是否所有字段都非空')
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