import axios from 'axios'
export default axios.create({
    baseURL:'http://127.0.0.1:3000',
    timeout:5000,
    headers: {
        'Content-Type': 'application/json'
    }
})