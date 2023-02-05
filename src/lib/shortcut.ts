import { shortcut_list, shortcut_map } from "./data.js";

export default function (update: (out: string) => void) {
    return (event: CustomEvent<any>) => {
        if (event.detail.altKey && event.detail.key === "Enter") {
            event.preventDefault();

            const element = event.detail.target;
            if (element.readonly || element.selectionStart !== element.selectionEnd) return;

            const pos = element.selectionStart;
            let mx = "";

            for (const [di] of shortcut_list)
                if (pos >= di.length && element.value.substring(pos - di.length, pos) === di)
                    mx = mx.length > di.length ? mx : di;

            if (mx.length) {
                const out = shortcut_map[mx];

                update(
                    (element.value =
                        element.value.substring(0, pos - mx.length) +
                        out +
                        element.value.substring(pos))
                );

                element.selectionStart = element.selectionEnd = pos - mx.length + out.length;
            }
        }
    };
}
