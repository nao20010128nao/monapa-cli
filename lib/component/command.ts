export default interface Command {
    execute(args: string[]): void;
    description(): string;
}