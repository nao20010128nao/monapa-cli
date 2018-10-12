export default interface Command {
    execute(args: string[]): void | Promise<void>;
    description(): string;
}