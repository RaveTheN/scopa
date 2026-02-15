import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface OpenAiQueryInput {
  myHand: string[];
  cardsOnTable: string[];
  playedCards: string[];
  unknownCardsCount: number;
  probabilitiesByRank: Record<number, number>;
  opponentCardCount: number;
  legalMoves: OpenAiLegalMove[];
}

export interface OpenAiLegalMove {
  card: string;
  captures: string[][];
}

interface SuggestionResponse {
  suggestion?: string;
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
