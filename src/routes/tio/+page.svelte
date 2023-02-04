<script context="module" lang="ts">
    function bc(text: string): string {
        return `${text.length} Byte${text.length === 1 ? "" : "s"}`;
    }
</script>

<script lang="ts">
    import { Collapsable, Textarea } from "@daedalus-discord/webkit";
    import md5 from "js-md5";
    import { onMount } from "svelte";
    import { codepage } from "../../lib/data.js";

    let header: string = "";
    let code: string = "";
    let footer: string = "";
    let flags: string = "";
    let stdin: string = "";

    let stdout: string = "";
    let stderr: string = "";

    let _header: boolean, _footer: boolean, _flags: boolean, _stdin: boolean;

    let _loaded: boolean = false;

    function encode(data: string[]): string {
        return btoa(unescape(encodeURIComponent(JSON.stringify(data))));
    }

    function decode(): any {
        return JSON.parse(decodeURIComponent(escape(atob(window.location.hash.substring(1)))));
    }

    onMount(() => {
        if (!window.location.hash) return (_loaded = true);

        [header, code, footer, flags, stdin] = decode();

        _header = !!header;
        _footer = !!footer;
        _flags = !!flags;
        _stdin = !!stdin;

        _loaded = true;
    });

    let running: boolean = false;
    let disabled: boolean = false;
    let session_id: number = 0;
    const canceled: { [key: number]: boolean } = {};

    let stdout_update: () => void;
    let stderr_update: () => void;

    async function run() {
        if (running) {
            canceled[session_id] = true;
            running = false;
            stdout = "";
            stderr = "request canceled by user";

            disabled = true;
            setTimeout(() => (disabled = false), 1000);

            return;
        }

        running = true;
        session_id++;

        let current_id = session_id;

        const init_req = await fetch("https://vyxal.pythonanywhere.com").catch(() => {});
        if (!init_req?.ok) return alert("Could not connect to vyxal.pythonanywhere.com");
        const init_res = await init_req.text();

        const head = init_res.indexOf("<session-code>");
        const tail = init_res.indexOf("</session-code>");
        const session = init_res.substring(head + 14, tail);

        const req = await fetch("https://vyxal.pythonanywhere.com/execute", {
            method: "post",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ header, code, footer, flags, inputs: stdin, session })
        }).catch(() => {});

        if (!req?.ok) return alert("Could not submit your code to vyxal.pythonanywhere.com");

        if (canceled[current_id]) return;

        ({ stdout, stderr } = await req.json());
        stdout_update();
        stderr_update();

        running = false;
    }

    const update = () =>
        _loaded && (document.location = "#" + encode([header, code, footer, flags, stdin]));

    function show_flags() {
        return flags ? ` \`${flags}\`` : "";
    }

    function code_bc() {
        return `${code.length} byte${code.length === 1 ? "" : "s"}`;
    }

    function select() {
        document.getElementById("stdout")?.scrollIntoView();
    }

    function se_format() {
        stdout = `# [Vyxal]${show_flags()}, ${code_bc()}\n\n${
            code.length
                ? code
                      .split("\n")
                      .map((line) => `    ${line}`)
                      .join("\n")
                : `<pre><code></code></pre>`
        }\n\n[Try It Online!](${document.location})\n\n[Vyxal]: https://github.com/Vyxal/Vyxal`;

        select();
    }

    function cmc_format() {
        const prefix = `Vyxal${show_flags()}, ${code_bc()}: `;

        if (code.indexOf("\n") === -1)
            stdout = `${prefix}\`${code.replaceAll("`", "\\`")}\` ([Try It Online!](${
                document.location
            }))`;
        else stdout = `${prefix}[Try It Online!](${document.location})`;

        select();
    }

    function md5_format() {
        stdout = md5(code);
        select();
    }

    function goto_official() {
        const undone_url = `?flags=${flags}&code=${encodeURIComponent(
            code
        )}&inputs=${encodeURIComponent(stdin)}&header=${encodeURIComponent(
            header
        )}&footer=${encodeURIComponent(footer)}`;

        window.open(
            `https://vyxal.pythonanywhere.com/#${encode([flags, header, code, footer, stdin])}`
        );
    }

    function sync() {
        stdout_update?.();
        stderr_update?.();
        requestAnimationFrame(sync);
    }

    onMount(sync);
</script>

<svelte:window on:keydown={(e) => e.ctrlKey && e.key === "Enter" && run()} />

<button on:click={run} {disabled}>{running ? "Running..." : "Run"}</button>
<button on:click={se_format}>SE Format</button>
<button on:click={cmc_format}>CMC Format</button>
<button on:click={md5_format}>MD5</button>
<button on:click={goto_official}>Try on the official interpreter</button>

<br />
<br />

<Collapsable title="Keyboard" header_color="var(--foreground)" color="transparent" duration={200}>
    <div id="keyboard">
        {#each codepage as char}
            <code class="plain">{char}</code>
        {/each}
    </div>
</Collapsable>

<Collapsable
    title="Header: {bc(header)}"
    header_color="var(--foreground)"
    color="transparent"
    duration={200}
    open={_header}
>
    <Textarea min_height="5em" bind:value={header} on:input={update} />
</Collapsable>

<Collapsable
    title="Code: {bc(code)}"
    header_color="var(--foreground)"
    color="transparent"
    duration={200}
    open={true}
>
    <Textarea min_height="5em" bind:value={code} on:input={update} />
</Collapsable>

<Collapsable
    title="Footer: {bc(footer)}"
    header_color="var(--foreground)"
    color="transparent"
    duration={200}
    open={_footer}
>
    <Textarea min_height="5em" bind:value={footer} on:input={update} />
</Collapsable>

<Collapsable
    title="Flags"
    header_color="var(--foreground)"
    color="transparent"
    duration={200}
    open={_flags}
>
    <Textarea min_height="5em" bind:value={flags} on:input={update} />
</Collapsable>

<Collapsable
    title="STDIN: {bc(stdin)}"
    header_color="var(--foreground)"
    color="transparent"
    duration={200}
    open={_stdin}
>
    <Textarea min_height="5em" bind:value={stdin} on:input={update} />
</Collapsable>

<Collapsable
    title="STDOUT: {bc(stdout)}"
    header_color="var(--foreground)"
    color="transparent"
    duration={200}
    open={true}
>
    <Textarea
        id="stdout"
        min_height="5em"
        bind:value={stdout}
        bind:update={stdout_update}
        readonly
    />
    <button on:click={() => navigator.clipboard.writeText(stdout)}>Copy STDOUT</button>
</Collapsable>

<Collapsable
    title="STDERR: {bc(stderr)}"
    header_color="var(--foreground)"
    color="transparent"
    duration={200}
    open={true}
>
    <Textarea min_height="5em" bind:value={stderr} bind:update={stderr_update} readonly />
    <button on:click={() => navigator.clipboard.writeText(stderr)}>Copy STDERR</button>
</Collapsable>

<p>
    This page's design is heavily inspired by <a href="https://tio.run">Try It Online!</a> and uses
    <a href="https://vyxal.pythonanywhere.com">vyxal.pythonanywhere.com</a>'s API to run code. Full
    credit to Dennis Mitchell for his work on TIO and the Vyxal development team for their work on
    Vyxal and the online interpreter.
</p>

<style lang="scss">
    button {
        margin: 0.25em;
    }

    #keyboard {
        display: grid;
        grid-template-columns: repeat(auto-fill, 1em);

        code {
            user-select: none;
            -moz-user-select: none;
            -webkit-user-select: none;
        }
    }
</style>
