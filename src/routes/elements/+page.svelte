<script lang="ts">
    import { description_overrides, elements } from "../../lib/data.js";
</script>

<h1>Elements</h1>

<p>
    Click an element's link to see some examples (if any) as well as any additional information that
    isn't part of the official documentation.
</p>

<table>
    <tr>
        <td>Symbol</td>
        <td>Name</td>
        <td>Arity</td>
        <td>Description</td>
    </tr>
    {#each elements as element}
        {@const symbol = element.element ?? element.modifier}
        {@const url = `/elements/${encodeURIComponent(symbol)}`}

        <tr>
            <td><a href={url}><code>{element.element ?? element.modifier}</code></a></td>
            <td><a href={url}>{element.name}</a></td>
            <td>{element.arity ?? ""}</td>
            <td>{element.description}</td>
        </tr>
    {/each}
</table>

<style lang="scss">
    table {
        border-collapse: collapse;
    }

    tr {
        border-bottom: 1px solid rgb(var(--accent-6-rgb), 40%);
    }

    td {
        padding: 0.5em 1em;
    }
</style>
