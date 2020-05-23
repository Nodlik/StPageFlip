import {PageFlip} from "../PageFlip";

export type DataType = number | string | boolean;

export interface WidgetEvent {
    data: DataType;
    object: PageFlip;
}

type EventCallback = (e: WidgetEvent) => any;

export abstract class EventObject {
    private events: { [name: string]: EventCallback[] } = {};

    public on(eventName: string, callback: EventCallback): EventObject {
        if (!(eventName in this.events)) {
            this.events[eventName] = [callback];
        }
        else {
            this.events[eventName].push(callback);
        }

        return this;
    }

    public off(event: string): void {
        delete this.events[event]
    }

    protected trigger(eventName: string, app: PageFlip, data: DataType = null): void {
        if (eventName in this.events) {
            this.events[eventName].forEach((callback) => {
                callback({
                    data: data,
                    object: app
                })
            });
        }
    }
}