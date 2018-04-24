<template>
    <div id="sidebar"> <a href="#" class="visible-phone"><i class="icon icon-th-list"></i> Tables</a>
        <ul>
            <li class="active"><router-link :to="{name: 'home'}"><i class="icon icon-home"></i> <span>Dashboard</span></router-link></li>
            <li class="active" v-if="menus"><i class="icon icon-th-list"></i> <span>Menu</span><span class="label label-important">{{menus.length}}</span>
                <ul>
                    <li v-for="menu in menus">
                        <span>{{menu.name}}</span>
                    </li>
                </ul>
            </li>
            <li class="active"><router-link :to="{name: 'employee-list'}"><span>Employee</span></router-link>
            </li>
        </ul>
    </div>
</template>
<script>
    import Vue from 'vue'
    import axios from 'axios'
    export default {
        name: 'sidebar',
        data () {
            return {
                menus: [],
                errors: []
            }
        },
        mounted () {
            axios.get('/api/menu').then(response => {
                this.menus = response.data
            })
            .catch(e => {
                this.errors.push(e)
            });
        }
    }
</script>