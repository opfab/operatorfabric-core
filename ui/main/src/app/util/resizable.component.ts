import {InitResize} from "./init-resize";

export class ResizableComponent implements ngAfterViewInit {
    constructor() {}

    ngAfterViewInit(): void {
        this.updateAsync();
        this.details.changes.subscribe(
            () => {
                this.updateAsync();
            }
        );

        new InitResize().initResizeHeight();

    }
}
