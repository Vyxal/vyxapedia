<script lang="ts">
    import { page } from "$app/stores";
    import Navbar from "../lib/Navbar.svelte";
</script>

<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        <link rel="shortcut icon" type="image/png" href="/favicon.png" />
        <link rel="stylesheet" type="text/css" href="/styles/stylesheet.css" />
        <link
            rel="stylesheet"
            type="text/css"
            href="https://fonts.googleapis.com/icon?family=Material+Icons"
        />

        <title>Vyxapedia</title>
    </head>

    <body>
        <Navbar />

        <main>
            <div class="container">
                <slot />
            </div>
        </main>

        {#if $page.route.id !== "/tio"}
            <footer>
                &copy; 2023 Vyxal/hyper-neutrino -
                <a href="https://github.com/Vyxal/vyxapedia">GitHub repository</a>
                -
                <a href="https://github.com/Vyxal/vyxapedia/issues/new">Report a Bug</a>
            </footer>
        {/if}
    </body>
</html>

<style lang="scss">
    .container {
        padding-top: 5vh;
        padding-bottom: 10vh;
    }
</style>
