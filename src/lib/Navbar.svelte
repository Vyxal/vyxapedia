<script lang="ts">
    import { Navbar } from "@daedalus-discord/webkit";

    let width: number = 1000;
    let open: boolean = false;
    let mobile: boolean;

    $: mobile = width < 600;
</script>

<svelte:window bind:innerWidth={width} />

<Navbar
    background="var(--accent-1)"
    foreground="white"
    sticky
    height={[75, 50]}
    opacity={[100, 100]}
>
    {#if mobile}
        <div id="navcontainer">
            <span>
                <a href={"javascript:void(0)"} on:click={() => (open = true)}>
                    <i class="material-icons">menu</i>
                </a>
            </span>
        </div>
    {/if}

    <div
        id={mobile ? "sidebar" : "navcontainer"}
        style={open || !mobile
            ? ""
            : "background-color: transparent; transform: translateX(-80%); pointer-events: none;"}
        on:click={() => (open = false)}
        on:keydown={() => (open = false)}
    >
        <div on:click={(e) => e.stopPropagation()} on:keydown={(e) => e.stopPropagation()}>
            {#if mobile}
                <span>
                    <a href={"javascript:void(0)"} on:click={() => (open = false)}>
                        <i class="material-icons">close</i>
                    </a>
                </span>
            {/if}
            <span><a href="/"><b>home</b></a></span>
            <span><a href="/codepage">code page</a></span>
            <span><a href="/elements">elements</a></span>
            <span><a href="/resources">resources</a></span>
            <span><a href="/tio">try it online</a></span>
        </div>
    </div>
</Navbar>

<style lang="scss">
    a {
        display: flex;
        flex-direction: row;
        align-items: center;

        height: 100%;

        text-decoration: none;
        color: white;

        padding: 0 1em;

        transition: 200ms ease-in-out;

        &:hover {
            background-color: #00000030;
        }
    }

    #navcontainer {
        height: 100%;

        div {
            display: flex;
            flex-direction: row;
            align-items: center;
            height: 100%;

            span {
                height: 100%;
            }
        }
    }

    #sidebar {
        background-color: #00000080;
        position: fixed;
        inset: 0;

        transition: 200ms ease-in-out;

        div {
            background-color: var(--accent-1);
            height: 100%;
            width: 80%;

            display: flex;
            flex-direction: column;

            a {
                padding: 0.75em 2em;
            }
        }
    }
</style>
