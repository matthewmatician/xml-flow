import {Readable} from "stream";
import {EventEmitter} from "events";

export as namespace flow;

export = flow;

declare function flow(infile: Readable, options: flow.parserOptions): EventEmitter;

declare namespace flow {

    export enum frequency {
        NEVER = -1,
        SOMETIMES = 0,
        ALWAYS = 1
    }

    export interface parserOptions {
        preserveMarkup?: frequency,
        simplifyNodes?: boolean,
        useArrays?: frequency,
        lowercase?: boolean,
        trim?: boolean,
        normalize?: boolean,
        cdataAsText?: boolean,
        strict?: boolean
    }

    export interface toXmlOptions {
        indent: string,
        selfClosing: boolean,
        escape: Function
    }

    export function toXml(obj: object, options: flow.toXmlOptions): string;
} 
