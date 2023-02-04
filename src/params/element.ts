import type { ParamMatcher } from "@sveltejs/kit";
import { elements } from "../lib/data.js";

export const match: ParamMatcher = (x) =>
    elements.some((element) => x === (element.element ?? element.modifier));
