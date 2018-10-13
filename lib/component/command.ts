import { PromiseOrNot } from "../misc/extratypes";

export default interface Command {
    execute(args: string[]): PromiseOrNot<void> | PromiseOrNot<number>;
    description(): string;
}