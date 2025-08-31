import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-dropdown',
  standalone: true,
  templateUrl: './dropdown.component.html',
  styleUrl: './dropdown.component.scss'
})
export class DropdownComponent {
  @Input() value: string | number | null = null;
  @Input() disabled: boolean = false;
  @Output() valueChange = new EventEmitter<string | number>();

  onChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.valueChange.emit(String(select.value));
  }
}
