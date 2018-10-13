import BigNumber from "bignumber.js";

export const toBoolean = (a: string) => a == "true";
export const toInteger = (a: string) => parseInt(a);
export const toBigNumber = (a: string) => new BigNumber(a);
