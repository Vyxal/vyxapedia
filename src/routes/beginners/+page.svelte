<script lang="ts">
    import LinkHeader from "../../lib/LinkHeader.svelte";
    import { link } from "../../lib/util.js";
</script>

<h1>Beginners' Page</h1>

<p>
    Welcome to the landing page for Vyxal beginners! This resource is intended to guide you from
    your very first encounter with Vyxal to a point where you can practice solving problems,
    self-study, and seek help through other channels.
</p>

<br />
<div class="glass">
    <LinkHeader name="conventions" value="Conventions and Terminology" />

    <p>
        A couple of terms and conventions are important to establish and will be used throughout
        much of this page and website.
    </p>

    <ul>
        <li>
            <b>Arity</b> refers to the number of arguments an element takes as input. A
            <i>niladic</i> function (nilad) takes zero (0) arguments, <i>monads</i> take one (1),
            <i>dyads</i> take two (2), and <i>triads</i> take three (3). There are some elements whose
            arity is not fixed, including ones that consume the entire stack or pop a variable number
            of elements depending on the context.
        </li>
        <li>
            <b>Elements</b> are functions that apply to values on the stack. These pop any number of
            arguments (including zero) and push any number of values (including zero) back onto the stack.
            When dealing with multiple values, the first one pushed will be the last one popped (as is
            the case with a stack).
        </li>
        <li>
            <b>Modifiers</b> are prefix operators that modify the next element. These are not to be confused
            with elements that manipulate function objects, as function objects are also values (functions
            are first-class members in Vyxal).
        </li>
        <li>
            <b>Structures</b> are syntax components in Vyxal, such as if-else statements, loops, lambdas,
            etc. These are technically also elements, as they manipulate values on the stack and can
            be modified.
        </li>
    </ul>

    <p>
        Vyxal is 0-indexed, meaning that the first index of a list is <code>0</code> and the last
        index of a list with <code>N</code> values is <code>N - 1</code>. Index access in lists
        wraps around, so <code>-1</code> also refers to the last value, and <code>4</code> in a list
        of 3 values refers to the second value.
    </p>
</div>

<br />

<div class="glass">
    <LinkHeader name="the-stack" value="The Stack" />

    <p>
        Vyxal operates primarily on
        <a href="https://en.wikipedia.org/wiki/Stack_(abstract_data_type)">stacks</a>. The main
        program has a main stack and functions and lambdas have their own sub-stacks. The principle
        of a stack is that it is <b>First-In-Last-Out (FILO)</b> - much like a stack of objects in real
        life, the first item placed onto the stack is the last one retrieved, and retrieving an item
        will yield the most recently placed item.
    </p>

    <p>
        The terms are "push" (push an item: place an item on top of the stack) and "pop" (pop an
        item: remove and retrieve the top of a stack). In Vyxal, the empty stack is popped, it
        attempts to read a line from input and returns <code>0</code> if it cannot.
    </p>
</div>

<br />

<div class="glass">
    <LinkHeader name="syntax" value="Literal Syntax" />

    <p>Vyxal has six types of literals. They are all fairly self-explanatory with some examples.</p>

    <ul>
        <li>
            <b>Number Literals</b> are created with <code>.0123456789</code>. Placing these
            adjacently will create one number literal, exactly as you would expect.
            <ul>
                <li>
                    To push multiple numbers, separate them with spaces or newlines; for example,
                    <code>23 456</code> will push <code>23</code> and then <code>456</code>.
                </li>
                <li>
                    A number cannot have multiple decimal points. As such, <code>123.456.789</code>
                    pushes <code>123.456</code> and then <code>0.789</code>.
                </li>
            </ul>
        </li>
        <li>
            <b>String Literals</b> are delimited by backticks (<code>`content goes here`</code>).
            Unless the <code>D</code> <a href="#flag">flag</a> is specified, if there are non-ASCII
            characters in the string, they will be used for string compression (see
            <a href="#first-program">Your First Program</a> for an example).
        </li>
        <li>
            <b>Base 255 Compressed Number Literals</b> are delimited by <code>»</code>. Each
            character is indexed into the codepage (with <code>»</code> removed) and converted from base
            255.
        </li>
        <li>
            <b>Base 255 Compressed String Literals</b> are delimited by <code>«</code>. The
            characters are converted just like base 255 compressed numbers are (but with
            <code>«</code> removed instead). Then, the number is converted into a base-27 number and
            each digit is indexed into <code>&nbsp;etaoinshrdlcumwfgypbvkjxqz</code> (note the leading
            space).
        </li>
        <li>
            <b>Single-Character Literals</b> are written as <code>\x</code> and push the character
            <code>x</code>. Vyxal does not distinguish between strings of length 1 and characters.
        </li>
        <li>
            <b>Double-Character Literals</b> are written as <code>‛xy</code> and push the string
            <code>xy</code>.
        </li>
    </ul>
</div>

<br />

<div class="glass">
    <LinkHeader name="first-program" value="Your First Program" />

    <p>
        Let's start with a very simple program - Hello World. To get started, head over to the
        <a href="/tio">Vyxal interpreter</a> on this site or the
        <a href="https://vyxal.pythonanywhere.com">official online interpreter</a>.
    </p>

    <p>
        As mentioned above, Vyxal's strings are delimited by backticks (<code>`...`</code>). Thus,
        the most basic solution is:
    </p>

    <pre>`Hello, World!`</pre>

    <p>
        If a string is not terminated at the end of the program, is it implicitly closed, so you can
        remove the last<code>`</code>. However, there is a shorter way to output
        <code>Hello, World!</code> using dictionary-compressed strings.
    </p>

    <p>
        There are 95 printable ASCII characters and a newline, so there are 160 other characters. If
        the <code>D</code> flag is specified, the characters are left alone. Otherwise, if these characters
        are present in the string, they will be paired together and indexed into the list of these characters.
        Then, each pair is converted into base 160 and indexed into the dictionary. If the number is
        too large (the dictionary does not contain a word for all 25600 possible indexes), the characters
        stay as-is.
    </p>

    <p>
        <code>Hello</code> is at index <code>4539</code> which is <code>28, 59</code> in base 160,
        so it is represented by the characters <code>ƈṡ</code>. Likewise, <code>World</code> is
        <code>ƛ€</code>. This leads to the following solution:
    </p>

    <pre>`ƈṡ, ƛ€!`</pre>

    <p>
        Again, the last <code>`</code> can be removed if this is at the end of the program. Note
        that Vyxal also has the niladic element {@html link("kH")} for this.
    </p>

    <p>
        Be careful! Compression is not always trivial. The string <code>withree</code> can be
        compressed as <code>with</code> + <code>ree</code> which would be <code>`λ»ree`</code>, but
        <code>`wi∧ḭ`</code> is one byte shorter. {@html link("øD")} is guaranteed to find the shortest
        possible form.
    </p>
</div>

<br />

<div class="glass">
    <LinkHeader name="vectorization" value="Vectorization" />

    <p>
        Before we continue, let's introduce vectorization, a common concept in array languages and
        golfing languages. Multiplying two lists together doesn't work in most languages (e.g. in
        Python, <code>[1, 2, 3] * [4, 5, 6]</code> results in an error). Taking the dot product is a
        possible alternative behavior, but a much more commonly useful behavior instead is to
        multiply corresponding pairs of elements, so <code>[1, 2, 3] * [4, 5, 6]</code> gives
        <code>[4, 10, 18]</code>. This is known as vectorization.
    </p>

    <p>
        Try the following online (<code>⟨1|2|3⟩</code> is a list - we'll get into the format later):
    </p>

    <pre>⟨1|2|3⟩ ⟨4|5|6⟩ *</pre>

    <p>
        Many built-ins vectorize in Vyxal. For example, {@html link("†")} will vectorize down to each
        individual value, so <code>⟨-1|0|1⟩ †</code> returns <code>⟨0|1|0⟩</code> and
        <code>⟨⟨1|0⟩|⟨0|1⟩⟩ †</code> yields <code>⟨⟨0|1⟩|⟨1|0⟩⟩</code>. Some elements explicitly
        specify that they do not vectorize; for example, {@html link("∧")}:
        <code>⟨1|0⟩ ⟨2|3⟩ ∧</code> returns <code>⟨2|3⟩</code>, not <code>⟨2|0⟩</code>.
    </p>

    <p>
        Vectorization works relatively intuitively for dyads. If the left and right arguments are
        both single values, it just applies the function to the values. If one argument is a list
        and the other is a single value, it loops over the list side. For example,
        <code>⟨1|2|3⟩ 4 +</code> gives <code>⟨5|6|7⟩</code> and <code>1 ⟨2|3|4⟩ +</code> gives
        <code>⟨3|4|5⟩</code>. If both arguments are lists, then it applies to each corresponding
        pair. if necessary, the shorter list is padded with zeroes on the end. For example,
        <code>⟨4|5|6⟩ ⟨2|3|4|5|6⟩ *</code> gives <code>⟨8|15|24|0|0⟩</code>.
    </p>
</div>

<br />

<div class="glass">
    <LinkHeader name="structures" value="Structures" />

    <p>
        Vyxal has several structures that are very similar to features found in conventional /
        practical programming languages, which was part of its core design philosophy. We've already
        come across a structure, so let's start with that. Note that you don't have to close
        structures if it's at the end of the program.
    </p>

    <ul>
        <li>
            <code>⟨...1 | ...2 | ...3 ...⟩</code> is a list. Formally, it runs each of its
            components (<code>...1</code>, <code>...2</code>, etc.) with an initially empty stack
            and then joins the top of the stack of each item into a list.
            <ul>
                <li>
                    Any expression can be contained in each section, so for example,
                    <code>⟨1 2 + | 3 4 *⟩</code> returns <code>⟨3|12⟩</code>.
                    <code>⟨1 2 | 3 4⟩</code> will return <code>⟨2|4⟩</code> because only the top of the
                    stack is preserved.
                </li>
                <li>
                    These can be nested too; <code>⟨⟨1 | 2⟩ | 3 | ⟨4 | 5⟩⟩</code> works as you would
                    expect.
                </li>
            </ul>
        </li>
        <li>
            <code>[...1 | ...2]</code> is an <b>if</b>-statement. It pops an element off the stack;
            if it is truthy, it runs <code>...1</code> on a stack containing only that item and
            pushes back the top of the sub-stack. If it is falsy, it does the same with
            <code>...2</code> (if the second half is specified). For example,
            <code>[1 2 + | 3 4]</code> will push <code>3</code> if the TOS is truthy and
            <code>4</code> otherwise, and <code>[1]</code> will push <code>1</code> if the TOS is truthy
            and nothing otherwise.
        </li>
        <li>
            <code>(...1 | ...2)</code> is a <b>for</b>-loop statement. It pops an element off the
            stack and then iterates through it each time. Here, <code>...1</code> is optional
            &mdash; if present, the result will be stored in the variable named <code>...1</code>
            each time. The context variable <a href="#context-variable"><code>n</code></a> lets you
            retrieve the current value regardless of if <code>...1</code> is specified.
            <ul>
                <li>
                    For example, <code>⟨⟨1|2⟩|⟨3|4⟩⟩ (n(n,))</code> will output <code>1</code>
                    through <code>4</code> line-by-line - the outer loop first pushes <code>n</code>
                    (<code>[1, 2]</code> in the first run and <code>[3, 4]</code> in the second) and
                    then loops through that, and the inner loop pushes the value and then uses {@html link(
                        ","
                    )} to output it.
                </li>
                <li>
                    <code>⟨⟨1|2⟩|⟨3|4⟩⟩ (a|n(←a,))</code> prints the following:
                    <pre>⟨1|2⟩<br />⟨1|2⟩<br />⟨3|4⟩<br />⟨3|4⟩</pre>
                    Here, the outer for loop names the loop variable<code>a</code>, pushes the
                    context (which is still available even if we specify a name), and runs an inner
                    for loop, which pushes <code>a</code> (the outer sub-list, not the inner value) and
                    prints that instead.
                </li>
            </ul>
        </li>
        <li>
            <code>{"{...1 | ...2}"}</code> is a <b>while</b>-loop statement. Here, <code>...1</code>
            is optional. It is the while loop's condition, and if it is absent, the condition is automatically
            true. So long as the result of <code>...1</code> is truthy,
            <code>...2</code> runs repeatedly.
        </li>
        <li>
            <code>@name:n|...;</code> denotes a user-defined function. This feature is quite unique
            to golfing languages, and is part of Vyxal's design concept. The name of the function
            must be one complete word and not contain any <code>@</code>s. <code>n</code> is the
            arity of the function; that is, how many elements should be popped from the caller's
            stack and put into the function's own stack. If the arity is <code>*</code>, it will pop
            one element and that will be the arity of the function. Finally, <code>...</code> is the
            body of the function. After the function is run, it pushes its entire stack back, not
            just the top value. Functions are called using the syntax <code>@name;</code>.
        </li>
        <li>
            <code>λn|code;</code> is a user-defined lambda. Like lambdas / anonymous functions in
            other languages, this function does not have a name; rather, it pushes a function object
            onto the stack directly. <code>n</code> represents the arity and is <code>1</code> if
            not specified. You can apply a lambda with {@html link("†")}, so
            <code>1 2 3 λ2|*; †</code> results in <code>6</code> on the top of the stack and
            <code>1</code> underneath, whereas <code>1 2 3 λ3|*; †</code> results in <code>2</code> as
            the only element of the stack.
        </li>
    </ul>
</div>

<br />

<div class="glass">
    <LinkHeader name="context-variable" value="Context Variable" />

    <p>
        There is a special variable known as the <i>context variable</i>. More information is
        available on its element page <a href="/elements/n">here</a>. Essentially, <code>n</code>
        pushes a value based on the current context. By default, its value is <code>0</code>. Within
        a function or lambda, its value is the list of arguments. In a <b>for</b>-loop, it is the
        current iteration value. In a <b>while</b>-loop, it is the result of the conditional
        expression.
    </p>
</div>

<br />

<div class="glass">
    <LinkHeader name="variables" value="Variables" />

    <p>
        Unlike most golfing languages, Vyxal supports variable-length, readable variable names. A
        variable name can contain uppercase and lowercase letters and underscores. They are set with {@html link(
            "→"
        )} and retrieved with {@html link("←")}. For example:
    </p>

    <pre>`string a` →a   # a = "string a"<br />`string b` →b   # b = "string b"<br
        />←a →temp        # temp = a<br />←b →a           # a = b<br
        />←temp →b        # b = temp (swapping the values of a and b)</pre>

    <p>
        Notice from this example that Vyxal also supports comments - <code>#</code> will make the rest
        of the line (until the next newline) a comment.
    </p>
</div>

<br />

<div class="glass">
    <LinkHeader name="further-resources" value="Further Resources" />

    <p>
        Congratulations! You've reached the end of the beginners' tutorial page. Hopefully, you
        should have a decent idea of what to expect going forward and the fundamentals of Vyxal's
        structure and functionality. At this point, practice and experience is the best teacher
        &mdash; you can only learn so much from reading. You can also try your hand at solving
        harder problems on
        <a href="https://codegolf.stackexchange.com/">Code Golf Stack Exchange</a>. If you have any
        questions, feel free to ask in the
        <a href="https://chat.stackexchange.com/transcript/106764/vyxal">Vyxal chat room</a>.
    </p>
</div>
