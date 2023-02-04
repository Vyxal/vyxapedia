<script context="module" lang="ts">
    import { codepage } from "../../lib/data.js";

    const digits = "0123456789ABCDEF";

    function copy_codepage() {
        navigator.clipboard.writeText(codepage);
    }
</script>

<h1>Code Page</h1>

<p>
    Vyxal uses a custom
    <a href="https://en.wikipedia.org/wiki/SBCS">Single Byte Character Set (SBCS)</a>, so each
    character is one byte. The interpreter can accept a file in UTF-8 encoding as a file containing
    raw bytes that it decodes according to this codepage. You can click on a character for more
    information about it, as well as links to built-ins and other components that use that
    character.
</p>

<div class="center-box">
    <table>
        <tr>
            <td />

            {#each digits as digit}
                <td><b><code class="plain">_{digit}</code></b></td>
            {/each}
        </tr>

        {#each digits as digit, row}
            <tr>
                <td><b><code class="plain">{digit}_</code></b></td>
                {#each digits as _, col}
                    {@const index = row * 16 + col}
                    {@const char = codepage[index]}

                    <td>
                        <a href="/codepage/{index}">
                            <code>
                                {@html char === " " ? "&nbsp;" : char === "\n" ? "⏎" : char}
                            </code>
                        </a>
                    </td>
                {/each}
            </tr>
        {/each}
    </table>
</div>

<button on:click={copy_codepage}>Copy Codepage</button>

<style lang="scss">
    a {
        color: unset;
    }

    table {
        border-collapse: collapse;
    }

    td {
        border: 1px solid rgb(var(--accent-6-rgb), 40%);
        padding: 0.5em;
        text-align: center;
    }
</style>
