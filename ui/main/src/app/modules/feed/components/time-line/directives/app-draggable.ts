import {Directive, EventEmitter, HostListener, Output} from '@angular/core';

@Directive({
  selector: '[appDraggable]'
})
export class DraggableDirective {
  @Output() dragStart = new EventEmitter<PointerEvent>();
  @Output() dragMove = new EventEmitter<PointerEvent>();
  @Output() dragEnd = new EventEmitter<PointerEvent>();

  private dragging = false;

  /**
   * if drag is true emit drag start event
   * @param event
   */
  @HostListener('pointerdown', ['$event'])
  onPointerDown(event: PointerEvent): void {
    this.dragging = true;
    this.dragStart.emit(event);
  }

  /**
   * if drag is true emit drag move event
   * @param event
   */
  @HostListener('pointermove', ['$event'])
  onPointerMove(event: PointerEvent): void {
    if (!this.dragging) {
      return;
    }
    this.dragMove.emit(event);
  }

  /**
   * if drag is true emit drag end event
   * @param event
   */
  @HostListener('pointerup', ['$event'])
  onPointerUp(event: PointerEvent): void {
    if (!this.dragging) {
      return;
    }
    this.dragging = false;
    this.dragEnd.emit(event);
  }

  // Uncomment if you delete the unselection set inside css,
  // this code will block the movement when u select some text
  // !!! a little movement still appear !!!
  /* @HostListener('document:dragstart', ['$event'])
   onDragEnd(event: DragEvent): void {
     if (!this.dragging) {
       return;
     }
     this.dragging = false;
   }*/

}
