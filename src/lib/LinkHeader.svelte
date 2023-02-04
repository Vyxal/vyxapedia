<script lang="ts">
    export let element: string = "h2";
    export let name: string;
    export let value: string;
</script>

<svelte:element this={element} id={name}>
    <a href="#{name}"><i class="material-icons">link</i></a>
    <span>{value}<span /></span></svelte:element
>

<style lang="scss">
    a {
        float: left;
        padding-right: 0.5em;
    }
</style>
