<template>
    <div id="empNew">
        <div class="row-fluid">
            <div class="span6">
                <div class="widget-box">
                    <div class="widget-title"> <span class="icon"> <i class="icon-align-justify"></i> </span>
                        <h5>Employee New</h5>
                    </div>
                    <div class="widget-content nopadding">
                        <form action="#" method="get" class="form-horizontal">
                            <div class="control-group">
                                <label class="control-label">Select Office:</label>
                                <div class="controls">
                                    <select name="type_emp" id="type_emp" v-if="emps.items">
                                        <option v-for="item in emps.items" :value="item.id">{{item.name}}</option>
                                    </select>
                                </div>
                            </div>
                            <div class="control-group">
                                <label class="control-label">Image:</label>
                                <div class="controls">
                                    <input type="file" name="image" />
                                </div>
                            </div>
                            <div class="control-group">
                                <label class="control-label">First Name:</label>
                                <div class="controls">
                                    <input type="text" name="firstName" id="firstName" />
                                </div>
                            </div>
                            <div class="control-group">
                                <label class="control-label">Last Name:</label>
                                <div class="controls">
                                    <input type="text" name="lastName" id="lastName" />
                                </div>
                            </div>
                            <div class="control-group">
                                <label class="control-label">Gender:</label>
                                <div class="controls">
                                    <label>
                                        <input type="radio" name="male" />
                                        Male</label>
                                    <label>
                                        <input type="radio" name="female" />
                                        Female</label>
                                </div>
                            </div>
                            <div class="control-group">
                                <label class="control-label">Email:</label>
                                <div class="controls">
                                    <input type="text" name="email" id="email">

                                </div>
                            </div>
                            <div class="control-group">
                                <label class="control-label">Phone:</label>
                                <div class="controls">
                                    <input type="number" name="phone" id="phone" />
                                </div>
                            </div>
                            <div class="form-actions">
                                <button type="submit" name="saveEmp" id="saveEmp" class="btn btn-success">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
    import Vue from 'vue'
    import axios from 'axios'
    export default
    {

        data () {
            return {
                emps: {
                    items: [],
                    loading: false,
                    errors: []
                }
            }
        },
        created: function ()
        {
            this.getTypeEmp();
        },
        methods: {
            getTypeEmp()
            {
                this.$Progress.start();
                this.emps.items = [];
                this.loading = true;
                axios.get('/api/type-employee')
                    .then(response => {
                    this.emps.items = response.data;
                    this.loading = false;
                    this.$Progress.finish();
                    })
                    .catch (err => {
                    this.loading = false;
                    this.errors.push(err);
                    this.$Progress.fail();
                })
            }
        }
    }
</script>