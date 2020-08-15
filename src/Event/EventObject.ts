import { PageFlip } from '../PageFlip';

/**
 * Data type passed to the event handler
 */
export type DataType = number | string | boolean | object;

/**
 * Type of object in event handlers
 */
export interface WidgetEvent {
    data: DataType;
    object: PageFlip;
}

type EventCallback = (e: WidgetEvent) => void;

/**
 * A class implementing a basic event model
 */
export abstract class EventObject {
    private events = new Map<string, EventCallback[]>();

    /**
     * Add new event handler
     *
     * @param {string} eventName
     * @param {EventCallback} callback
     */
    public on(eventName: string, callback: EventCallback): EventObject {
        if (!this.events.has(eventName)) {
            this.events.set(eventName, [callback]);
        } else {
            this.events.get(eventName).push(callback);
        }

        return this;
    }

    /**
     * Removing all handlers from an event
     *
     * @param {string} event - Event name
     */
    public off(event: string): void {
        this.events.delete(event);
    }

    protected trigger(eventName: string, app: PageFlip, data: DataType = null): void {
        if (!this.events.has(eventName)) return;

        for (const callback of this.events.get(eventName)) {
            callback({ data, object: app });
        }
    }
}
