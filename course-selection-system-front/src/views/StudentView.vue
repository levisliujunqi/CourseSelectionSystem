<template>
    <div>
        <Menu mode="horizontal" theme="light" :active-name="activeMenu" @on-select="onSelect">
            <MenuItem name="courses">
            <Icon type="ios-book" /> 课程列表
            </MenuItem>
            <MenuItem name="my">
            <Icon type="ios-paper" /> 我的选课
            </MenuItem>
            <Submenu name="me">
                <template #title>
                    <Icon type="ios-settings" /> {{ store.state.name }}
                </template>
                <MenuItem name="changePwd">
                <Icon type="ios-key" />
                修改密码
                </MenuItem>
                <MenuItem name="logout">
                <Icon type="ios-log-out" /> 退出登陆
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

        <div v-if="activeMenu === 'courses'" style="margin-top:16px">
            <Space style="margin-bottom:12px">
                <Button icon="ios-refresh" @click="fetchCourses">刷新</Button>
                <Input v-model="searchName" placeholder="输入课程名搜索" style="width:200px" />
                <Button type="primary" @click="fetchCourses">搜索</Button>
            </Space>
            <Table :columns="courseColumns" :data="courses" row-key="id" stripe>
                <template #operation="{ row }">
                    <Button type="primary" size="small" :disabled="selectedCourseIds.includes(row.id) || row.selectedCount >= row.capacity"
                        @click="onSelectCourse(row.id)">
                        {{ selectedCourseIds.includes(row.id) ? '已选' : (row.selectedCount >= row.capacity?'已满':'选课') }}
                    </Button>
                </template>
                <template #college="{ row }">
                    {{ row.teacherId.college }}
                </template>
                <template #teacher="{ row }">
                    {{ row.teacherId?.name }}
                </template>
                <template #time="{ row }">
                        {{ row.startDate }} - {{ row.endDate }}
                        {{ row.startTime }} - {{ row.endTime }}
                        周{{ ['一','二','三','四','五','六','日'][row.dayOfWeek - 1] }}
                </template>
            </Table>
        </div>

        <div v-else-if="activeMenu === 'my'" style="margin-top:16px">
            <Space style="margin-bottom:12px">
                <Button icon="ios-refresh" @click="fetchSelections">刷新</Button>
                <Input
                    v-model="searchMy"
                    placeholder="输入课程名搜索"
                    style="width:200px"
                />
            </Space>
            <Table
                :columns="selectionColumns"
                :data="filteredSelections"
                row-key="id"
                stripe
            >
                <template #courseId="{ row }">{{ row.course?.id }}</template>
                <template #courseName="{ row }">{{ row.course?.name }}</template>
                <template #courseDesc="{ row }">{{ row.course?.description }}</template>
                <template #teacher="{ row }">{{ row.course?.teacherId.name }}</template>
                <template #college="{ row }">
                    {{ row.course?.teacherId.college }}
                </template>
                <template #time="{ row }">
                        {{ row.course?.startDate }} - {{ row.course?.endDate }}
                        {{ row.course?.startTime }} - {{ row.course?.endTime }}
                        周{{ ['一','二','三','四','五','六','日'][row.course?.dayOfWeek - 1] }}
                </template>
                <template #location="{ row }">{{ row.course?.location }}</template>
                <template #capacity="{ row }">{{ row.course?.capacity }}</template>
                <template #selectedCount="{ row }">{{ row.course?.selectedCount }}</template>
                <template #operation="{ row }">
                    <Button type="error" size="small" @click="onDeleteSelection(row.id)">退选</Button>
                </template>
            </Table>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, computed } from 'vue'
import api from '@/api'
import store from '@/store'
import { useRouter } from 'vue-router'
import {
    Menu,
    MenuItem,
    Submenu,
    Space,
    Button,
    Table,
    Input,
    Icon,
    Message
} from 'view-ui-plus'

const showChangePwdModal = ref(false)
const changePwdForm = reactive({
    oldPwd: '',
    newPwd: '',
    confirmPwd: ''
})

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
interface Selection {
    id: number
    course: Course
}

const router = useRouter()
const activeMenu = ref<'courses' | 'my'>('courses')

const searchName = ref('')
const searchMy = ref('') 
const courses = ref<Course[]>([])
const selections = ref<Selection[]>([])
const selectedCourseIds = ref<number[]>([])

const courseColumns = [
    { title: '课程名', key: 'name' },
    { title: '描述', key: 'description' },
    { title: '老师', slot: 'teacher' },
    { title: '学院', slot: 'college'},
    { title: '上课时间', slot: 'time' },
    { title: '上课地点', key: 'location' },
    { title: '人数限制', key: 'capacity' },
    { title: '已选人数', key: 'selectedCount' },
    { title: '操作', slot: 'operation' }
]
const selectionColumns = [
    { title: '课程名', slot: 'courseName' },
    { title: '描述', slot: 'courseDesc' },
    { title: '老师', slot: 'teacher' },
    { title: '学院', slot: 'college'},
    { title: '上课时间', slot: 'time' },
    { title: '上课地点', slot: 'location' },
    { title: '人数限制', slot: 'capacity' },
    { title: '已选人数', slot: 'selectedCount' },
    { title: '操作', slot: 'operation' }
]

const filteredSelections = computed(() => {
  if (!searchMy.value.trim()) return selections.value
  return selections.value.filter(s =>
    s.course.name.includes(searchMy.value.trim())
  )
})

onMounted(() => {
    if (!store.state.isloggedIn) {
        router.push('/login')
        return
    }
    fetchCourses()
    fetchSelections()
})

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

function onSelect(name: string) {
    if (name === 'logout') {
        store.commit('clearCredentials')
        router.push('/login')
        Message.success('已退出登录')
        return
    }
    if (name === 'changePwd'){
        showChangePwdModal.value=true
        return;
    }
    activeMenu.value = name as any
    if (name === 'courses') fetchCourses()
    else fetchSelections()
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
        courses.value = res.data
        Message.success('获取课程列表成功')
    } catch {
        Message.error('获取课程列表失败')
    }
}

async function fetchSelections() {
    try {
        const { data } = await api.get('/selections/my', {
            params: { username: store.state.name, userpassword: store.state.password }
        })
        selections.value = data
        selectedCourseIds.value = data.map((s: Selection) => s.course.id)
        Message.success('获取我的选课成功')
    } catch {
        Message.error('获取我的选课失败')
    }
}

async function onSelectCourse(courseId: number) {
    try {
        await api.post('/selections', {
            userId: store.state.userid,
            courseId,
            username: store.state.name,
            userpassword: store.state.password
        })
        Message.success('选课成功')
        fetchCourses()
        fetchSelections()
    } catch {
        Message.error('选课失败，请检查是否时间冲突')
    }
}

async function onDeleteSelection(id: number) {
    try {
        await api.delete(`/selections/${id}`, {
            data: { username: store.state.name, userpassword: store.state.password }
        })
        Message.success('退选成功')
        fetchSelections()
    } catch {
        Message.error('退选失败')
    }
}
</script>