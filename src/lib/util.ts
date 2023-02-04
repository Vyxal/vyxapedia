import { elements } from "./data.js";

export function try_to_parse(string: string) {
    try {
        return JSON.parse(string);
    } catch {
        return null;
    }
}

export function unparse_object(object: any): string {
    if (typeof object === "string") return `\`${object.replaceAll("`", "\\`")}\``;
    else if (typeof object === "number") return object.toString();
    else if (Array.isArray(object)) return `⟨${object.map((x) => unparse_object(x)).join("|")}⟩`;

    return object.toString();
}

export function link(symbol: string) {
    const element = elements.find((element) => symbol === (element.element ?? element.modifier));
    if (!element) throw new Error(`No element found with symbol: ${symbol}`);

    return `<a href="/elements/${encodeURIComponent(symbol)}"><code>${symbol}</code> (${
        element.name
    })</a>`;
}
