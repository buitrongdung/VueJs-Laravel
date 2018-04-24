import Vue from 'vue'
import VueRouter from 'vue-router'

import Home from '../components/views/Home.vue'
import NotFound from '../components/views/NotFound.vue'

import Employee from '../components/views/employee/Employee.vue'
import EmployeeList from '../components/views/employee/ListEmployee.vue'
import EmployeeNew from '../components/views/employee/EmployeeNew.vue'
import EmployeeDetail from '../components/views/employee/EmployeeDetail.vue'

Vue.use(VueRouter);

const routes = [
    {path: '/dashboard', name: 'home', component: Home, meta: {breadcrumb: 'Home'}},
    // {path: '/employee', redirect: '/employee/list'},
    {
        path: '/employee',
        name: 'employee',
        component: Employee,
        redirect: 'employee/',
        meta: {permission: 'any', fail: '/', title: 'Employee', breadcrumb: 'Employee'},
        children: [
            {path: '', name: 'employee-list', component: EmployeeList, meta: {permission: 'any', fail: '/', breadcrumb: 'List'}},
            {path: ':idEmp/detail', name: 'employee-detail', component: EmployeeDetail, meta: {permission: 'any', fail: '/', breadcrumb: 'Detail'}},
            {path: 'new', name: 'employee-new', component: EmployeeNew, meta: {permission: 'any', fail: '/', breadcrumb: 'New'}}
        ]
    },
    {
        path: '/404',
        name: 'notFound',
        component: NotFound
    },
    {path: '*', component: NotFound, meta: {title: 'not found'}}

    // {path: '/menu/:idMenu', name: 'menuDetail', component: MenuDetail, meta: {permission: 'any', fail: '/'}}
];

export default new VueRouter({
    mode: 'history',
    routes,
    redirect:{ '*' : '/'}
})
