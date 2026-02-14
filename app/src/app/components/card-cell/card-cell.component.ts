import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Card, CardState } from '../../models/card.model';

@Component({
  selector: 'app-card-cell',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card-cell.component.html',
  styleUrls: ['./card-cell.component.scss']
})
export class CardCellComponent {
  @Input({ required: true }) card!: Card;
  @Input({ required: true }) state!: CardState;
  @Input() probability: number | null = null;
  @Input() mode: 'table' | 'hand' = 'table';
  @Input() selectable = true;

  @Output() clicked = new EventEmitter<void>();

  protected readonly cardState = CardState;

  onClick(): void {
    if (this.state === CardState.PLAYED) {
      return;
    }

    if (!this.selectable) {
      return;
    }

    this.clicked.emit();
  }

  get mainText(): string {
    if (this.state === CardState.PLAYED) {
      return 'âœ“';
    }

    return `${this.card.rank}`;
  }

  get subText(): string {
    if (this.state === CardState.IN_MY_HAND) {
      return 'mia';
    }

    if (this.state === CardState.UNKNOWN && this.mode === 'table' && this.probability !== null) {
      return `${Math.round(this.probability * 100)}%`;
    }

    return '';
  }

  get showSubText(): boolean {
    if (this.state === CardState.IN_MY_HAND) {
      return true;
    }

    return this.state === CardState.UNKNOWN && this.mode === 'table' && this.probability !== null;
  }
}
