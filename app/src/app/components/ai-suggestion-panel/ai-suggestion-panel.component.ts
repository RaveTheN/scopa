import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AISuggestionService } from '../../services/ai-suggestion.service';
import { GameStateService } from '../../services/game-state.service';

@Component({
  selector: 'app-ai-suggestion-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ai-suggestion-panel.component.html',
  styleUrls: ['./ai-suggestion-panel.component.scss']
})
export class AISuggestionPanelComponent {
  readonly aiSuggestion$ = this.gameStateService.aiSuggestion;
  readonly aiLoading$ = this.gameStateService.aiLoading;

  constructor(
    private readonly gameStateService: GameStateService,
    private readonly aiSuggestionService: AISuggestionService
  ) {}

  get apiConfigured(): boolean {
    return this.aiSuggestionService.isApiConfigured();
  }

  manualQuery(): void {
    this.aiSuggestionService.manualQuery();
  }
}
