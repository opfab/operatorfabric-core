

export abstract class EventListener {

    abstract onConnection() : void;
    abstract onDisconnection(error: any) : void;
    abstract onMessage(message: any) : void;
}