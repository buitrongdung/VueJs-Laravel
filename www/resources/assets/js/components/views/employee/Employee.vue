<template>
    <div id="employee">
        <router-view></router-view>
    </div>
</template>
<script>
    export default {
        beforeRouteEnter(to, from, next)
        {
            next();
        }
    }
</script>