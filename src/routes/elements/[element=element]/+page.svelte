<script lang="ts">
    import { codepage, description_overrides } from "../../../lib/data.js";
    import { try_to_parse, unparse_object } from "../../../lib/util.js";

    export let data: any;
</script>

<h1>
    {"element" in data ? "Element" : "Modifier"} - <code>{data.symbol}</code> - {data.element.name}
</h1>

<p>
    Characters:
    {#each data.symbol as character, index}{#if index !== 0},{/if}
        <a href="/codepage/{codepage.indexOf(character)}"><code>{character}</code></a>{/each}
</p>

<br />
<h2>Description</h2>

<p>{@html description_overrides[data.symbol] ?? data.element.description}</p>

{#if Object.keys(data.element.overloads ?? {}).length}
    <br />
    <h2>Overloads</h2>

    <ul>
        {#each Object.entries(data.element.overloads) as [type, code]}
            <li><code>{type}</code> - <code>{code}</code></li>
        {/each}
    </ul>
{/if}

{#if data.element.tests?.length}
    <br />
    <h2>Examples</h2>

    <ul>
        {#each data.element.tests as test}
            {@const [input, output] = test.split(" : ")}
            {@const input_data = try_to_parse(input)}
            {@const output_data = try_to_parse(output)}

            {#if input_data && output_data}
                <li>
                    <code>{input_data.map(unparse_object).join(" ")} {data.symbol}</code> =
                    <code>{unparse_object(output_data)}</code>
                </li>
            {/if}
        {/each}
    </ul>
{/if}
