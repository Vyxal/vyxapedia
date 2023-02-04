<script lang="ts">
    import { codepage, shortcut_list } from "../../../lib/data.js";
</script>

<h1>Character Combos for TIO</h1>

<p>
    The following is a complete list of all available character combos for the
    <a href="/tio">online interpreter</a>
    on this site. To use one, press <b>ALT-ENTER</b> after a valid combo and it will combine them. If
    you notice a combo is a suffix of another, please open a bug report, as this will prevent the longer
    combo from being used.
</p>

<div class="center-box">
    <table>
        <tr>
            {#each new Array(4) as _}
                <td><b>Combination</b></td>
                <td><b>Result</b></td>
            {/each}
        </tr>
        {#each new Array(Math.ceil(shortcut_list.length / 4)) as _, row}
            <tr>
                {#each [0, 1, 2, 3] as offset}
                    {@const index = row * 4 + offset}
                    {#if index < shortcut_list.length}
                        {@const item = shortcut_list[index]}
                        <td><code>{item[0]}</code></td>
                        <td>
                            <a href="/codepage/{codepage.indexOf(item[1])}">
                                <code>{item[1]}</code>
                            </a>
                        </td>
                    {/if}
                {/each}
            </tr>
        {/each}
    </table>
</div>

<style lang="scss">
    table {
        border-collapse: collapse;
        width: 80%;
    }

    tr {
        border-bottom: 1px solid rgb(var(--accent-6-rgb), 40%);
    }

    td {
        width: 12.5%;
        padding: 0.5em 1em;
    }

    td:nth-child(odd) {
        text-align: right;
    }
</style>
