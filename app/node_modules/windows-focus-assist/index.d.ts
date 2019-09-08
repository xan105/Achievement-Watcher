
declare module 'windows-focus-assist' {
    export interface focusAssistStatus {
        value: number;
        name: string;
    }

    export function getFocusAssist(): focusAssistStatus;
}
