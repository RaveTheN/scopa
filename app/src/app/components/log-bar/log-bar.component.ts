import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { map } from 'rxjs';
import { GameStateService } from '../../services/game-state.service';

@Component({
  selector: 'app-log-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './log-bar.component.html',
  styleUrls: ['./log-bar.component.scss']
})
export class LogBarComponent {
  readonly logText$ = this.gameStateService.lastPlayLog.pipe(
    map((value) => value || 'Nessuna giocata ancora')
  );

  constructor(private readonly gameStateService: GameStateService) {}
}
