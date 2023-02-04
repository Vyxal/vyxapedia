import { elements } from "../../../lib/data.js";
import type { PageLoad } from "./$types.js";

export const load: PageLoad = ({ params }) => {
    return {
        symbol: params.element,
        element: elements.find(
            (element) => params.element === (element.element ?? element.modifier)
        )
    };
};
