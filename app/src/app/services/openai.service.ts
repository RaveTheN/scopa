import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface OpenAiQueryInput {
  rules: OpenAiRules;
  myHand: string[];
  cardsOnTable: string[];
  playedCards: string[];
  myCapturedCards: string[];
  opponentCapturedCards: string[];
  unseenCardsCount: number;
  deckCardsRemaining: number;
  isEndgame: boolean;
  opponentHandIsKnown: boolean;
  knownOpponentCards: string[];
  lastCaptureBy: 'ME' | 'OPPONENT' | null;
  probabilitiesByRank: Record<number, number>;
  certainOpponentRanks: number[];
  opponentCardCount: number;
  playsRemainingMe: number;
  playsRemainingOpponent: number;
  pliesToHandEnd: number;
  requestSource: OpenAiRequestSource;
  modelSelection: OpenAiModelSelection;
  reasoningMode: OpenAiReasoningMode;
  opponentModel?: OpenAiOpponentModel;
  legalMoves: OpenAiLegalMove[];
}

export interface OpenAiLegalMove {
  card: string;
  captures: string[][];
}

export interface OpenAiOpponentModel {
  assumePerfectEndgamePlay: boolean;
  countsCardsAndInfersHands: boolean;
  playsToMaximizeOwnOutcome: boolean;
  evaluationMethod: 'maximin';
}

export type OpenAiRequestSource = 'manual' | 'auto';
export type OpenAiModelSelection = 'gpt-4.1-mini' | 'gpt-5-mini' | 'gpt-5.2';
export type OpenAiReasoningMode = 'low' | 'auto' | 'medium';

export interface OpenAiRules {
  mustCaptureIfPlayableCardCanCapture: true;
  mustPlayCapturingCardIfHaveOne: false;
  capturePriority: 'free';
  endOfHandLastTakerGetsTableRemainder: true;
  aceValue: 1;
}

interface SuggestionResponse {
  suggestion?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    reasoningTokens: number;
    cachedPromptTokens: number;
  };
  estimatedCostUsd?: number | null;
  estimatedCostBreakdownUsd?: {
    input: number;
    cachedInput: number;
    output: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class OpenAIService {
  private readonly endpoint = environment.openaiProxyUrl;

  constructor(private readonly http: HttpClient) {}

  queryBestMove(input: OpenAiQueryInput): Observable<string> {
    return this.http.post<SuggestionResponse>(
      this.endpoint,
      input
    ).pipe(
      map((response) => response.suggestion?.trim() || 'Nessun suggerimento disponibile.')
    );
  }
}
