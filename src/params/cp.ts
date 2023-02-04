import type { ParamMatcher } from "@sveltejs/kit";

export const match: ParamMatcher = (x) => !!x.match(/^(1?[0-9]{1,2}|2([0-4][0-9]|5[0-5]))$/);
