<h1>Welcome to Vyxapedia!</h1>

<p>
    <a href="https://github.com/Vyxal/Vyxal/">Vyxal</a> is a
    <a href="https://en.wikipedia.org/wiki/Stack-oriented_programming">stack-based</a>
    recreational programming language created by <a href="https://github.com/Lyxal">lyxal</a> and
    maintained by the <a href="https://github.com/Vyxal/">Vyxal team</a> for code golf, a competition
    to write the shortest code to complete a certain task.
</p>

<p>
    Vyxal uses a custom
    <a href="https://en.wikipedia.org/wiki/SBCS">Single Byte Character Set (SBCS)</a>, so each of
    its characters count as one byte (this is important, as code golf is usually scored in bytes as
    opposed to characters). You can run Vyxal on the official
    <a href="https://vyxal.pythonanywhere.com/">online interpreter</a>, or the interface on this
    site <a href="/tio">here</a>, which uses the official site's API.
</p>

<hr />

<h2>How to get started</h2>

<p>
    Vyxal is easier to get into than most golfing languages, as its design philosophy values
    elegance and readability and includes components from practical languages. However, mastering it
    requires just as much skill and experience as any other language.
</p>

<p>
    If you are completely new to stack-based programming and Vyxal, a good place to start is the <a
        href="/beginners">beginners' page</a
    >
    under the resources tab. There are other resources available for documentation and lessons ranging
    from introductory to more advanced. Finally, you can find help in the
    <a href="https://chat.stackexchange.com/transcript/106764/vyxal"
        >Vyxal chat room on Stack Exchange</a
    >, but you will need a Stack Exchange account with 20 reputation to send messages in that room.
</p>

<hr />

<h2>Installation</h2>

<p>
    You don't need to install Vyxal if you just want to use it - there is an
    <a href="https://vyxal.pythonanywhere.com">official online interpreter</a> and an interpreter on
    this website <a href="/tio">here</a>. Both should work exactly the same, as the latter calls the
    former's API.
</p>

<p>If you are just running Vyxal, you can install it with</p>

<pre>pip install vyxal</pre>

<p>
    If you are working on Vyxal, install <a href="https://python-poetry.org/">Poetry</a>, clone
    <a href="https://github.com/Vyxal/Vyxal">the repository</a>, and run
</p>

<pre>poetry install</pre>

<hr />

<h2>Usage</h2>

<p>To run using the script:</p>

<pre>{"vyxal <file> <flags (single string of flags)> <input(s)>"}</pre>

<p>Using Poetry:</p>

<pre>{"poetry run vyxal <file> <flags (single string of flags)> <input(s)>"}</pre>
