import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { createCardId, Suit } from '../../models/card.model';
import { AISuggestionService } from '../../services/ai-suggestion.service';
import { CardTrackerService } from '../../services/card-tracker.service';
import { GameStateService } from '../../services/game-state.service';
import { LocalStorageService } from '../../services/local-storage.service';
import { OpenAiModelSelection, OpenAiReasoningMode } from '../../services/openai.service';
import { StatsPanelComponent } from './stats-panel.component';

class AISuggestionServiceStub {
  private readonly autoQueryEnabledSubject = new BehaviorSubject<boolean>(true);
  private readonly modelSelectionSubject = new BehaviorSubject<OpenAiModelSelection>('gpt-5-mini');
  private readonly reasoningModeSubject = new BehaviorSubject<OpenAiReasoningMode>('auto');
  readonly autoQueryEnabled$ = this.autoQueryEnabledSubject.asObservable();
  readonly modelSelection$ = this.modelSelectionSubject.asObservable();
  readonly reasoningMode$ = this.reasoningModeSubject.asObservable();

  setAutoQueryEnabled(enabled: boolean): void {
    this.autoQueryEnabledSubject.next(enabled);
  }

  setModelSelection(selection: OpenAiModelSelection): void {
    this.modelSelectionSubject.next(selection);
  }

  getReasoningMode(): OpenAiReasoningMode {
    return this.reasoningModeSubject.value;
  }

  setReasoningMode(mode: OpenAiReasoningMode): void {
    this.reasoningModeSubject.next(mode);
  }
}

describe('StatsPanelComponent', () => {
  let fixture: ComponentFixture<StatsPanelComponent>;
  let component: StatsPanelComponent;
  let gameStateService: GameStateService;

  beforeEach(async () => {
    localStorage.removeItem('scopa_ng_state');

    await TestBed.configureTestingModule({
      imports: [StatsPanelComponent],
      providers: [
        GameStateService,
        CardTrackerService,
        LocalStorageService,
        { provide: AISuggestionService, useClass: AISuggestionServiceStub }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(StatsPanelComponent);
    component = fixture.componentInstance;
    gameStateService = TestBed.inject(GameStateService);
    gameStateService.reset();
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.removeItem('scopa_ng_state');
  });

  it('starts from 40/40 remaining cards when no cards are tracked', async () => {
    const stats = await firstValueFrom(component.stats$);

    expect(stats.remainingCards).toBe(40);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Carte rimaste: 40/40');
  });

  it('counts my hand, table cards and opponent hand as cards outside the deck', async () => {
    gameStateService.clickHandCard(createCardId(Suit.Denari, 1));
    gameStateService.clickHandCard(createCardId(Suit.Coppe, 2));
    gameStateService.clickHandCard(createCardId(Suit.Spade, 3));

    gameStateService.clickTableCard(createCardId(Suit.Bastoni, 4));
    gameStateService.clickTableCard(createCardId(Suit.Denari, 5));
    gameStateService.clickTableCard(createCardId(Suit.Coppe, 6));
    gameStateService.clickTableCard(createCardId(Suit.Spade, 7));

    const stats = await firstValueFrom(component.stats$);

    expect(stats.remainingCards).toBe(30);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Carte rimaste: 30/40');
  });
});
