<script lang="ts">
    import { codepage, elements, shortcut_list } from "$lib/data.js";

    export let data: { codepoint: number };

    let codepoint: number;
    let char: string;
    let shortcuts: string[];

    $: codepoint = data.codepoint;
    $: char = codepage[codepoint];
    $: shortcuts = shortcut_list.filter(([, value]) => value === char).map(([key]) => key);
</script>

{#if codepoint === 10}
    <h2>Character Page - Newline</h2>

    <p>
        Outside of literals, newlines function identically to spaces and do not carry any special
        meaning. However, they can make your code more readable. They can also be used to separate
        tokens like spaces; for example, <code>12</code> is the literal number twelve, but
        <code>1 2</code> is two literals, one and two.
    </p>
{:else if codepoint === 32}
    <h2>Character Page - <code>&nbsp;</code></h2>

    <p>
        Outside of literals, spaces do not carry any particular meaning. However, they can be used
        to separate tokens; for example, <code>12</code> is the literal number twelve, but
        <code>1 2</code> is two literals, one and two.
    </p>
{:else}
    <h2>Character Page - <code>{char}</code></h2>

    {#if shortcuts?.length}
        <p>
            This character has <a href="/misc/char-combos">character combinations</a>
            available (press <b>ALT-ENTER</b> after the combo to enter the character):
            {#each shortcuts as shortcut, index}{#if index !== 0},{/if}
                <code>{shortcut}</code>{/each}.
        </p>
    {/if}

    <h3>Occurrences</h3>

    <ul>
        {#each elements as element}
            {@const symbol = element.element ?? element.modifier}

            {#if symbol.includes(char)}
                <li>
                    <a href="/elements/{encodeURIComponent(symbol)}">
                        <code>{symbol}</code> - {element.name}
                    </a>
                </li>
            {/if}
        {/each}
    </ul>
{/if}
