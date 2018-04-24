<template>
    <div class="widget-box">
        <div class="widget-title">
            <span class="icon"><i class="icon-th"></i></span>
            <h5>Employee</h5>
        </div>
        <div class="widget-content nopadding">
            <table class="table table-bordered data-table">
                <thead>
                <tr>
                    <th>Office</th>
                    <th>Name</th>
                    <th class="td-10">Gender</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th class="td-10"><router-link :to="{name: 'employee-new'}" active-class="is-active">New</router-link></th>
                </tr>
                </thead>
                <tbody>
                <tr class="gradeX" v-for="emp in emps.items">
                    <td v-text="emp.type_name"></td>
                    <td v-text="emp.name"></td>
                    <td v-text="emp.gender" class="td-10"></td>
                    <td v-text="emp.email"></td>
                    <td v-text="emp.phone"></td>
                    <td class="td-10">
                        <router-link :to="{name: 'employee-detail', params: {idEmp: emp.id}}" active-class="is-active" class="tip-top" data-toggle="tooltip" title="View"><i class="icon-search"></i></router-link>
                        <a href="#" class="tip-top" data-toggle="tooltip" title="Edit"><i class="icon-edit"></i></a>
                        <a href="#" class="tip-top" data-toggle="tooltip" title="Delete"><i class="icon-remove-circle"></i></a>
                    </td>
                </tr>

                </tbody>
            </table>
        </div>
    </div>
</template>
<script>
    import Vue from 'vue'
    import axios from 'axios'

    export default {
        data: function ()
        {
            return {
                emps: {
                    items: [],
                    errors: [],
                    loading: false
                },

            }
        },
        created: function ()
        {
            this.getList()
        },
        methods: {
            getList () {
                this.$Progress.start();
                this.emps.items = [];
                this.loading = true;
                axios.get('/api/employee')
                    .then((response) => {
                        this.emps.items = response.data;
                        this.loading = false;
                        this.$Progress.finish();
                    })
                    .catch(err => {
                        this.loading = false;
                        this.errors.push(err);
                        this.$Progress.fail();
                    })
            }
        }
    }
</script>